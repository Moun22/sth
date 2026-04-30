import { Plane, Search } from 'lucide-react'
import { useState } from 'react'
import { Box, Flex, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import { ApiMeta } from '~/components/ApiMeta'
import { PageHeader } from '~/components/PageHeader'
import { Badge } from '~/components/ui/badge'
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

function OfferCard({
  offer,
  from,
  to,
  onClick,
}: {
  offer: OfferSummary
  from: string
  to: string
  onClick: () => void
}) {
  const leg = offer.legs[0]
  return (
    <Card.Root>
      <Card.Body p="5">
        <Flex justify="space-between" align="flex-start">
          <Stack gap="0.5">
            <styled.div fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
              Provider
            </styled.div>
            <styled.div fontSize="lg" fontWeight="semibold">{offer.provider}</styled.div>
          </Stack>
          <styled.div fontSize="2xl" fontWeight="bold" color="colorPalette.text">
            {offer.price} {offer.currency === 'EUR' ? '€' : offer.currency}
          </styled.div>
        </Flex>

        <HStack mt="4" justify="space-between" alignItems="center" bg="bg.subtle" p="3" borderRadius="md">
          <styled.div fontSize="sm" fontWeight="medium">{from}</styled.div>
          <Flex direction="column" align="center" flex="1" mx="3">
            <styled.div fontSize="xs" color="fg.muted">{leg.duration} min</styled.div>
            <Box position="relative" width="100%" height="2px" bg="border.default" my="1">
              <Plane
                size={14}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'white',
                  padding: '0 4px',
                }}
              />
            </Box>
            <styled.div fontSize="xs" fontFamily="mono" color="fg.muted">{leg.flightNum}</styled.div>
          </Flex>
          <styled.div fontSize="sm" fontWeight="medium">{to}</styled.div>
        </HStack>

        {(offer.hotel || offer.activity) && (
          <Stack gap="2" mt="3">
            {offer.hotel && (
              <HStack
                p="2"
                px="3"
                bg="bg.subtle"
                borderRadius="sm"
                fontSize="xs"
                gap="2"
              >
                <Badge size="sm" variant="outline">🏨</Badge>
                <styled.span flex="1">
                  {offer.hotel.name} · {offer.hotel.nights} nuits
                </styled.span>
                <styled.span fontWeight="medium">{offer.hotel.price} €</styled.span>
              </HStack>
            )}
            {offer.activity && (
              <HStack
                p="2"
                px="3"
                bg="bg.subtle"
                borderRadius="sm"
                fontSize="xs"
                gap="2"
              >
                <Badge size="sm" variant="outline">🎟</Badge>
                <styled.span flex="1">{offer.activity.title}</styled.span>
                <styled.span fontWeight="medium">{offer.activity.price} €</styled.span>
              </HStack>
            )}
          </Stack>
        )}

        <Flex justify="flex-end" mt="4">
          <Button size="sm" variant="ghost" onClick={onClick}>
            Détails →
          </Button>
        </Flex>
      </Card.Body>
    </Card.Root>
  )
}
