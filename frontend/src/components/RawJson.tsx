import { Box } from 'styled-system/jsx'

type Props = { value: unknown; maxHeight?: string }

export function RawJson({ value, maxHeight = '320px' }: Props) {
  const text =
    typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return (
    <Box
      as="pre"
      p="3"
      bg="bg.subtle"
      borderRadius="md"
      fontSize="xs"
      fontFamily="mono"
      color="fg.muted"
      overflow="auto"
      maxHeight={maxHeight}
      whiteSpace="pre-wrap"
      wordBreak="break-all"
    >
      {text || '—'}
    </Box>
  )
}
