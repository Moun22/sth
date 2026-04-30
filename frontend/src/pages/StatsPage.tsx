import { useEffect, useState } from 'react'
import { Box, Flex, HStack, Stack, styled } from 'styled-system/jsx'
import { ApiMeta } from '~/components/ApiMeta'
import { PageHeader } from '~/components/PageHeader'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui'
import { Field } from '~/components/ui'
import { Input } from '~/components/ui/input'
import { api, type ApiResponse, type StatEntry } from '~/lib/api'

export function StatsPage() {
  const [limit, setLimit] = useState('5')
  const [result, setResult] = useState<ApiResponse<StatEntry[]> | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setResult(await api.getStats(Number(limit) || 5))
    setLoading(false)
  }

  useEffect(() => {
    run()
  }, [])

  const entries = result?.data ?? []
  const max = entries.reduce((m, e) => Math.max(m, e.count), 0) || 1

  return (
    <Stack gap="6">
      <PageHeader
        title="Top destinations"
        techs={[
          { tech: 'mongo', suffix: '$group + $sum' },
          { tech: 'redis', suffix: 'cache 300s' },
        ]}
        description={
          <>
            <styled.span fontFamily="mono">GET /stats/top-destinations</styled.span> — pipeline d'agrégation MongoDB <styled.span fontFamily="mono">$group + $sum</styled.span>, cache Redis (TTL 300 s).
          </>
        }
      />

      <Card.Root>
        <Card.Body p="4">
          <HStack gap="3" alignItems="end">
            <Field.Root width="120px">
              <Field.Label>Limit</Field.Label>
              <Input
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                type="number"
                min="1"
                max="20"
              />
            </Field.Root>
            <Button onClick={run} loading={loading}>Recalculer</Button>
          </HStack>
        </Card.Body>
      </Card.Root>

      <ApiMeta endpoint={`GET /stats/top-destinations?limit=${limit}`} result={result} />

      <Card.Root>
        <Card.Body p="6">
          {entries.length === 0 ? (
            <Box textAlign="center" color="fg.muted" fontSize="sm" py="4">
              {result?.ok ? 'Pas de données. Lance le seed Mongo.' : 'Charge la stat...'}
            </Box>
          ) : (
            <Stack gap="3">
              {entries.map((e, i) => {
                const pct = (e.count / max) * 100
                const rankPalette = i === 0 ? 'amber' : i === 1 ? 'orange' : i === 2 ? 'green' : 'mauve'
                return (
                  <Flex key={e.to} alignItems="center" gap="4">
                    <styled.div
                      width="32px"
                      fontSize="xs"
                      fontWeight="bold"
                      color="fg.muted"
                      textAlign="right"
                    >
                      #{i + 1}
                    </styled.div>
                    <styled.div
                      width="48px"
                      fontFamily="mono"
                      fontWeight="bold"
                      fontSize="sm"
                      color={`${rankPalette}.text`}
                    >
                      {e.to}
                    </styled.div>
                    <Box flex="1" position="relative" height="28px" bg="bg.subtle" borderRadius="sm">
                      <Box
                        position="absolute"
                        inset="0 auto 0 0"
                        width={`${pct}%`}
                        bg={`${rankPalette}.default`}
                        borderRadius="sm"
                        transition="width 400ms"
                      />
                    </Box>
                    <styled.div minWidth="80px" fontSize="sm" color="fg.muted" textAlign="right">
                      {e.count} offres
                    </styled.div>
                  </Flex>
                )
              })}
            </Stack>
          )}
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}
