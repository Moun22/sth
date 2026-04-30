import { Database, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Box, HStack, Stack, styled } from 'styled-system/jsx'
import { ApiMeta } from '~/components/ApiMeta'
import { PageHeader } from '~/components/PageHeader'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui'
import { toaster } from '~/components/ui/toast'
import { api, type ApiResponse, type SeedResult } from '~/lib/api'

export function AdminPage() {
  const [result, setResult] = useState<ApiResponse<SeedResult> | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    const r = await api.seedMongo()
    setResult(r)
    setLoading(false)
    if (r.ok && r.data) {
      toaster.create({
        title: 'Seed terminé',
        description: `${r.data.inserted} offres insérées`,
        type: 'success',
      })
    }
  }

  return (
    <Stack gap="6">
      <PageHeader
        title="Administration"
        description="Outils de démo pour réinitialiser la stack."
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
                Re-seed MongoDB
              </styled.div>
              <styled.p fontSize="sm" color="fg.muted">
                Vide la collection <styled.span fontFamily="mono">offers</styled.span>, insère 45 offres de démo, recrée les index <styled.span fontFamily="mono">from_to_price</styled.span> et <styled.span fontFamily="mono">text_search</styled.span>.
              </styled.p>
              <Button onClick={run} loading={loading} alignSelf="flex-start" mt="2">
                <RefreshCw size={14} />
                Lancer le seed
              </Button>
            </Stack>
          </HStack>
        </Card.Body>
      </Card.Root>

      <ApiMeta endpoint="POST /admin/seed" result={result} />

      {result?.data && (
        <Card.Root bg="green.a2" borderColor="green.a6" border="1px solid">
          <Card.Body p="4">
            <styled.div fontSize="sm">
              ✅ <styled.strong>{result.data.inserted}</styled.strong> offres insérées · index : <styled.span fontFamily="mono">{result.data.indexes.join(', ')}</styled.span>
            </styled.div>
          </Card.Body>
        </Card.Root>
      )}
      {result && !result.ok && (
        <Box p="4" bg="red.a3" borderRadius="md" fontSize="sm" color="red.text">
          {result.error?.error ?? 'Erreur'}
        </Box>
      )}
    </Stack>
  )
}
