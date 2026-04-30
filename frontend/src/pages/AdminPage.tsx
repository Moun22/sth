import { Database, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import { ApiMeta } from '~/components/ApiMeta'
import { PageHeader } from '~/components/PageHeader'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui'
import { api, type ApiResponse, type SeedResult } from '~/lib/api'

export function AdminPage() {
  const [result, setResult] = useState<ApiResponse<SeedResult> | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    const r = await api.seedMongo()
    setResult(r)
    setLoading(false)
  }

  const data = result?.data

  return (
    <Stack gap="6">
      <PageHeader
        title="Administration"
        techs={[
          { tech: 'redis', suffix: 'FLUSHDB' },
          { tech: 'mongo', suffix: 'deleteMany + insertMany' },
          { tech: 'neo4j', suffix: 'DETACH DELETE + seed' },
        ]}
        description="Reset complet de la démo : flush du cache Redis, re-seed Mongo, re-seed Neo4j."
      />

      <Card.Root>
        <Card.Body p="6">
          <HStack gap="4" alignItems="flex-start">
            <Box
              p="3"
              borderRadius="md"
              bg="colorPalette.a3"
              color="colorPalette.text"
              flexShrink="0"
            >
              <Database size={24} />
            </Box>
            <Stack gap="2" flex="1">
              <styled.div fontSize="md" fontWeight="semibold">
                Reset complet de la démo
              </styled.div>
              <styled.p fontSize="sm" color="fg.muted">
                <styled.strong>1.</styled.strong> Flush du cache Redis (toutes les clés <styled.span fontFamily="mono">offers:*</styled.span>, <styled.span fontFamily="mono">stats:*</styled.span>, <styled.span fontFamily="mono">session:*</styled.span>).
                <br />
                <styled.strong>2.</styled.strong> Re-seed Mongo : 45 offres, index <styled.span fontFamily="mono">id_unique</styled.span> + <styled.span fontFamily="mono">from_to_price</styled.span> + <styled.span fontFamily="mono">text_search</styled.span>.
                <br />
                <styled.strong>3.</styled.strong> Re-seed Neo4j : 19 villes, 70 relations <styled.span fontFamily="mono">NEAR</styled.span>, 45 nodes <styled.span fontFamily="mono">Offer</styled.span>.
              </styled.p>
              <Button onClick={run} loading={loading} alignSelf="flex-start" mt="2">
                <RefreshCw size={14} />
                Lancer le reset
              </Button>
            </Stack>
          </HStack>
        </Card.Body>
      </Card.Root>

      <ApiMeta endpoint="POST /admin/seed" result={result} />

      {data && (
        <Grid gridTemplateColumns="repeat(3, 1fr)" gap="3">
          <Card.Root borderTop="3px solid" borderColor="red.default" bg="red.a2">
            <Card.Body p="4">
              <styled.div fontSize="xs" color="red.text" textTransform="uppercase" letterSpacing="wider" mb="1">
                Redis
              </styled.div>
              <styled.div fontSize="lg" fontWeight="bold">
                ✓ Cache flushé
              </styled.div>
              <styled.div fontSize="xs" color="fg.muted" mt="1">FLUSHDB</styled.div>
            </Card.Body>
          </Card.Root>

          <Card.Root borderTop="3px solid" borderColor="green.default" bg="green.a2">
            <Card.Body p="4">
              <styled.div fontSize="xs" color="green.text" textTransform="uppercase" letterSpacing="wider" mb="1">
                MongoDB
              </styled.div>
              <styled.div fontSize="lg" fontWeight="bold">
                {data.mongo.inserted} offres
              </styled.div>
              <styled.div fontSize="xs" color="fg.muted" mt="1" fontFamily="mono">
                {data.mongo.indexes.join(' · ')}
              </styled.div>
            </Card.Body>
          </Card.Root>

          <Card.Root borderTop="3px solid" borderColor="blue.default" bg="blue.a2">
            <Card.Body p="4">
              <styled.div fontSize="xs" color="blue.text" textTransform="uppercase" letterSpacing="wider" mb="1">
                Neo4j
              </styled.div>
              <styled.div fontSize="lg" fontWeight="bold">
                {data.neo4j.cities} villes
              </styled.div>
              <styled.div fontSize="xs" color="fg.muted" mt="1">
                {data.neo4j.nearEdges} NEAR · {data.neo4j.offers} offers
              </styled.div>
            </Card.Body>
          </Card.Root>
        </Grid>
      )}

      {result && !result.ok && (
        <Box p="4" bg="red.a3" borderRadius="md" fontSize="sm" color="red.text">
          {result.error?.error ?? 'Erreur'}
        </Box>
      )}
    </Stack>
  )
}
