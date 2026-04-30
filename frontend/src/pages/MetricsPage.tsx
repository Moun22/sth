import { Gauge, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Box, Flex, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import { ApiMeta } from '~/components/ApiMeta'
import { PageHeader } from '~/components/PageHeader'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui'
import { api, type ApiResponse } from '~/lib/api'

type Highlight = { name: string; value: string; help?: string; palette: string }

export function MetricsPage() {
  const [result, setResult] = useState<ApiResponse<string> | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setResult(await api.getMetrics())
    setLoading(false)
  }

  useEffect(() => {
    run()
  }, [])

  const highlights = result?.data ? extractHighlights(result.data) : []

  return (
    <Stack gap="6">
      <PageHeader
        title="Métriques Prometheus"
        techs={[{ tech: 'prom', suffix: 'exposition format' }]}
        description={
          <>
            <styled.span fontFamily="mono">GET /metrics</styled.span> — format exposition Prometheus :
            durée par route + taux de hit cache + métriques Node par défaut.
          </>
        }
      />

      <Flex justify="space-between" alignItems="center">
        <ApiMeta endpoint="GET /metrics" result={result} />
        <Button size="sm" variant="outline" onClick={run} loading={loading}>
          <RefreshCw size={14} />
          Rafraîchir
        </Button>
      </Flex>

      {highlights.length > 0 && (
        <Grid gridTemplateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap="3">
          {highlights.map((h) => (
            <Card.Root
              key={h.name}
              borderTop="3px solid"
              borderColor={`${h.palette}.default`}
              bg={`${h.palette}.a2`}
            >
              <Card.Body p="4">
                <HStack gap="2" mb="1">
                  <Gauge size={14} color={`var(--colors-${h.palette}-text)`} />
                  <styled.div fontSize="xs" fontFamily="mono" color="fg.muted" truncate>
                    {h.name}
                  </styled.div>
                </HStack>
                <styled.div fontSize="xl" fontWeight="bold" color={`${h.palette}.text`}>{h.value}</styled.div>
                {h.help && (
                  <styled.div fontSize="xs" color="fg.muted" mt="1">{h.help}</styled.div>
                )}
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>
      )}

      {result?.data && (
        <Card.Root>
          <Card.Body p="0">
            <Box p="3" borderBottom="1px solid" borderColor="border.default">
              <styled.div fontSize="sm" fontWeight="medium">Sortie brute</styled.div>
            </Box>
            <Box
              as="pre"
              p="4"
              fontSize="sm"
              fontFamily="mono"
              color="fg.muted"
              overflow="auto"
              maxHeight="500px"
              whiteSpace="pre"
              m="0"
            >
              {result.data}
            </Box>
          </Card.Body>
        </Card.Root>
      )}
    </Stack>
  )
}

function extractHighlights(text: string): Highlight[] {
  const out: Highlight[] = []
  const pickFirst = (regex: RegExp): string | null => {
    const m = text.match(regex)
    return m ? m[1] : null
  }

  const hits = Array.from(text.matchAll(/^cache_lookups_total\{result="hit"\} (.+)$/gm))
  const misses = Array.from(text.matchAll(/^cache_lookups_total\{result="miss"\} (.+)$/gm))
  const totalHits = hits.reduce((s, m) => s + Number(m[1]), 0)
  const totalMisses = misses.reduce((s, m) => s + Number(m[1]), 0)
  const total = totalHits + totalMisses

  if (total > 0) {
    const ratio = (totalHits / total) * 100
    out.push({
      name: 'cache hit ratio',
      value: `${ratio.toFixed(1)} %`,
      help: `${totalHits} hits · ${totalMisses} miss`,
      palette: 'amber',
    })
  }

  const reqCount = Array.from(text.matchAll(/^http_request_duration_seconds_count\{[^}]+\} (.+)$/gm))
    .reduce((s, m) => s + Number(m[1]), 0)
  if (reqCount > 0) {
    out.push({
      name: 'http_request_total',
      value: String(reqCount),
      help: 'requêtes observées',
      palette: 'purple',
    })
  }

  const heap = pickFirst(/^process_resident_memory_bytes (.+)$/m)
  if (heap) {
    out.push({
      name: 'process_resident_memory',
      value: `${(Number(heap) / 1024 / 1024).toFixed(0)} MB`,
      help: 'mémoire résidente du process Node',
      palette: 'blue',
    })
  }

  const cpu = pickFirst(/^process_cpu_seconds_total (.+)$/m)
  if (cpu) {
    out.push({
      name: 'process_cpu_seconds_total',
      value: `${Number(cpu).toFixed(2)} s`,
      help: 'CPU cumulé depuis démarrage',
      palette: 'orange',
    })
  }

  return out
}
