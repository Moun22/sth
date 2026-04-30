import { Search } from 'lucide-react'
import { useState } from 'react'
import { Box, Flex, Grid, Stack, styled } from 'styled-system/jsx'
import { ApiMeta } from '~/components/ApiMeta'
import { OfferCard } from '~/components/OfferCard'
import { PageHeader } from '~/components/PageHeader'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui'
import { Field } from '~/components/ui'
import { Input } from '~/components/ui/input'
import { api, type ApiResponse, type OfferSummary } from '~/lib/api'

type Props = { onPickOffer: (id: string) => void }

export function SearchPage({ onPickOffer }: Props) {
  const [from, setFrom] = useState('PAR')
  const [to, setTo] = useState('TYO')
  const [limit, setLimit] = useState('5')
  const [q, setQ] = useState('')
  const [result, setResult] = useState<ApiResponse<OfferSummary[]> | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setResult(
      await api.searchOffers({
        from: from.trim().toUpperCase(),
        to: to.trim().toUpperCase(),
        limit: Number(limit) || 10,
        q: q.trim() || undefined,
      }),
    )
    setLoading(false)
  }

  const offers = result?.data ?? []

  return (
    <Stack gap="6">
      <PageHeader
        title="Recherche d'offres"
        techs={[
          { tech: 'mongo', suffix: 'find + sort' },
          { tech: 'redis', suffix: 'cache 60s gzip' },
        ]}
        description={
          <>
            <styled.span fontFamily="mono">GET /offers</styled.span> — MongoDB cataloging,
            Redis cache (TTL 60s, JSON gzip). Premier appel = MISS, second = HIT.
          </>
        }
      />

      <Card.Root>
        <Card.Body p="4">
          <Grid gridTemplateColumns="1fr 1fr 1fr 2fr auto" gap="3" alignItems="end">
            <Field.Root>
              <Field.Label>Départ</Field.Label>
              <Input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                maxLength={3}
                placeholder="PAR"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Arrivée</Field.Label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                maxLength={3}
                placeholder="TYO"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Limit</Field.Label>
              <Input
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                type="number"
                min="1"
                max="50"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Recherche libre (q)</Field.Label>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ex: hotel, food tour..."
              />
            </Field.Root>
            <Button onClick={run} loading={loading}>
              <Search size={14} />
              Rechercher
            </Button>
          </Grid>
        </Card.Body>
      </Card.Root>

      <Flex justify="space-between" align="center">
        <ApiMeta endpoint="GET /offers" result={result} />
        {result?.ok && (
          <styled.span fontSize="xs" color="fg.muted">
            {offers.length} résultat{offers.length > 1 ? 's' : ''} trouvé{offers.length > 1 ? 's' : ''} pour {from.toUpperCase()} → {to.toUpperCase()}
          </styled.span>
        )}
      </Flex>

      {result === null && (
        <Box p="8" bg="bg.subtle" borderRadius="md" textAlign="center" color="fg.muted" fontSize="sm">
          Lance la recherche pour voir les offres ↑
        </Box>
      )}

      {result && !result.ok && (
        <Box p="4" bg="red.a3" borderRadius="md" fontSize="sm" color="red.text">
          {result.error?.error ?? 'Erreur'}
        </Box>
      )}

      {offers.length > 0 && (
        <Grid gridTemplateColumns="repeat(auto-fill, minmax(360px, 1fr))" gap="4">
          {offers.map((o) => (
            <OfferCard
              key={o.id}
              offer={o}
              from={from.toUpperCase()}
              to={to.toUpperCase()}
              onClick={() => onPickOffer(o.id)}
            />
          ))}
        </Grid>
      )}
    </Stack>
  )
}

