import { HStack, styled } from 'styled-system/jsx'

export type Tech = 'redis' | 'mongo' | 'neo4j' | 'prom' | 'sse'

const META: Record<Tech, { label: string; palette: string; dot: string }> = {
  redis: { label: 'Redis', palette: 'red', dot: '🔴' },
  mongo: { label: 'MongoDB', palette: 'green', dot: '🟢' },
  neo4j: { label: 'Neo4j', palette: 'blue', dot: '🔵' },
  prom: { label: 'Prometheus', palette: 'orange', dot: '🟠' },
  sse: { label: 'SSE', palette: 'purple', dot: '🟣' },
}

type Props = { tech: Tech; suffix?: string }

export function TechBadge({ tech, suffix }: Props) {
  const m = META[tech]
  return (
    <HStack
      gap="2"
      px="2.5"
      py="1"
      borderRadius="md"
      fontSize="sm"
      fontWeight="medium"
      bg={`${m.palette}.a3`}
      color={`${m.palette}.text`}
      border="1px solid"
      borderColor={`${m.palette}.a6`}
    >
      <styled.span
        w="8px"
        h="8px"
        borderRadius="full"
        bg={`${m.palette}.default`}
      />
      <styled.span>
        {m.label}
        {suffix && (
          <styled.span color="fg.muted" ml="1.5" style={{ fontFamily: 'var(--sth-font-mono)', fontSize: '12px' }}>
            · {suffix}
          </styled.span>
        )}
      </styled.span>
    </HStack>
  )
}

type RowProps = { items: { tech: Tech; suffix?: string }[] }

export function TechBadgeRow({ items }: RowProps) {
  return (
    <HStack gap="2" flexWrap="wrap">
      {items.map((it) => (
        <TechBadge key={it.tech + (it.suffix ?? '')} {...it} />
      ))}
    </HStack>
  )
}
