import { HStack, styled } from 'styled-system/jsx'
import { Badge } from '~/components/ui/badge'
import type { ApiResponse } from '~/lib/api'

type Props = {
  endpoint: string
  result: ApiResponse<unknown> | null
}

export function ApiMeta({ endpoint, result }: Props) {
  return (
    <HStack gap="2" fontSize="xs" flexWrap="wrap">
      <styled.span
        fontFamily="mono"
        bg="bg.subtle"
        borderRadius="sm"
        px="2"
        py="0.5"
        color="fg.default"
      >
        {endpoint}
      </styled.span>
      {result === null ? (
        <styled.span color="fg.muted">— en attente</styled.span>
      ) : (
        <>
          <Badge
            size="sm"
            variant="solid"
            colorPalette={result.ok ? 'green' : result.status >= 500 ? 'red' : 'orange'}
          >
            {result.status} {result.ok ? 'OK' : 'ERR'}
          </Badge>
          <Badge size="sm" variant="outline">{result.durationMs} ms</Badge>
          {result.cache && (
            <Badge
              size="sm"
              variant="solid"
              colorPalette={result.cache === 'HIT' ? 'amber' : 'gray'}
            >
              cache: {result.cache}
            </Badge>
          )}
        </>
      )}
    </HStack>
  )
}
