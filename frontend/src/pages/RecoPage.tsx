import { Network, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Box, Flex, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import { ApiMeta } from '~/components/ApiMeta'
import { PageHeader } from '~/components/PageHeader'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui'
import { Field } from '~/components/ui'
import { Input } from '~/components/ui/input'
import { api, type ApiResponse, type RecoEntry } from '~/lib/api'

export function RecoPage() {
  const [city, setCity] = useState('PAR')
  const [k, setK] = useState('3')
  const [result, setResult] = useState<ApiResponse<RecoEntry[]> | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setResult(await api.getReco(city.trim().toUpperCase(), Number(k) || 3))
    setLoading(false)
  }

  const recos = result?.data ?? []

  return (
    <Stack gap="6">
      <PageHeader
        title="Recommandations Neo4j"
        description={
          <>
            <styled.span fontFamily="mono">GET /reco</styled.span> — Cypher sur le graphe :
            <styled.span fontFamily="mono"> MATCH (c:City {'{code:$city}'})-[:NEAR]→(n:City) </styled.span>
            ordonné par poids.
          </>
        }
      />

      <Card.Root>
        <Card.Body p="4">
          <HStack gap="3" alignItems="end">
            <Field.Root>
              <Field.Label>Ville source</Field.Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={3}
                placeholder="PAR"
              />
            </Field.Root>
            <Field.Root width="100px">
              <Field.Label>K</Field.Label>
              <Input
                value={k}
                onChange={(e) => setK(e.target.value)}
                type="number"
                min="1"
                max="10"
              />
            </Field.Root>
            <Button onClick={run} loading={loading}>
              <Sparkles size={14} />
              Recommander
            </Button>
          </HStack>
        </Card.Body>
      </Card.Root>

      <ApiMeta endpoint={`GET /reco?city=${city}&k=${k}`} result={result} />

      {result === null && (
        <Box p="8" bg="bg.subtle" borderRadius="md" textAlign="center" color="fg.muted" fontSize="sm">
          Choisis une ville et K, puis "Recommander".
        </Box>
      )}

      {result && !result.ok && (
        <Box p="4" bg="orange.a3" borderRadius="md" fontSize="sm">
          <styled.div fontWeight="medium" mb="1">{result.error?.error ?? 'Erreur'}</styled.div>
          {result.status === 501 && (
            <styled.div color="fg.muted" fontSize="xs">
              La route /reco n'est pas encore implémentée — placeholder en attendant la PR de P3 sur Neo4j.
            </styled.div>
          )}
        </Box>
      )}

      {recos.length > 0 && (
        <Grid gridTemplateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap="4">
          {recos.map((r, i) => (
            <Card.Root
              key={r.city}
              borderTop="3px solid"
              borderColor={i === 0 ? 'colorPalette.default' : 'colorPalette.a6'}
            >
              <Card.Body p="5">
                <HStack gap="2" mb="2">
                  <Network size={14} />
                  <styled.span fontSize="xs" color="fg.muted">via NEAR · graphe Neo4j</styled.span>
                </HStack>
                <Flex justify="space-between" alignItems="baseline">
                  <styled.div fontSize="3xl" fontWeight="bold">{r.city}</styled.div>
                  <Badge size="sm" variant="solid">{r.score?.toFixed(2) ?? '—'}</Badge>
                </Flex>
                <styled.div fontSize="xs" color="fg.muted" mt="1">
                  ville proche de {city.toUpperCase()}
                </styled.div>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>
      )}
    </Stack>
  )
}
