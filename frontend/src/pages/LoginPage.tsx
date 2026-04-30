import { Key } from 'lucide-react'
import { useState } from 'react'
import { Box, HStack, Stack, styled } from 'styled-system/jsx'
import { ApiMeta } from '~/components/ApiMeta'
import { PageHeader } from '~/components/PageHeader'
import { RawJson } from '~/components/RawJson'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui'
import { Field } from '~/components/ui'
import { Input } from '~/components/ui/input'
import { api, type ApiResponse, type LoginResponse } from '~/lib/api'

export function LoginPage() {
  const [userId, setUserId] = useState('u42')
  const [result, setResult] = useState<ApiResponse<LoginResponse> | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setResult(await api.login(userId))
    setLoading(false)
  }

  return (
    <Stack gap="6">
      <PageHeader
        title="Authentification"
        description={
          <>
            <styled.span fontFamily="mono">POST /login</styled.span> — Redis stocke
            <styled.span fontFamily="mono"> session:{'<uuid>'} </styled.span>
            avec TTL 900 s.
          </>
        }
      />

      <Card.Root>
        <Card.Body p="5">
          <HStack gap="3" alignItems="end">
            <Field.Root>
              <Field.Label>userId</Field.Label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="u42"
              />
              <Field.HelperText>String non vide. Le serveur retourne un UUID v4 + expires_in 900.</Field.HelperText>
            </Field.Root>
            <Button onClick={run} loading={loading}>
              <Key size={14} />
              Login
            </Button>
          </HStack>
        </Card.Body>
      </Card.Root>

      <ApiMeta endpoint="POST /login" result={result} />

      {result?.data && (
        <Card.Root>
          <Card.Body p="4">
            <styled.div fontSize="sm" fontWeight="medium" mb="2">Token de session</styled.div>
            <RawJson value={result.data} />
            <styled.p fontSize="xs" color="fg.muted" mt="3">
              💡 La session est créée mais aucune route ne la consomme aujourd'hui — elle existe pour démontrer le pattern Redis key-value avec TTL. Une auth réelle viendrait middleware-checker ce token.
            </styled.p>
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
