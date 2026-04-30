import {
  Activity,
  BarChart3,
  Database,
  FileText,
  Gauge,
  Key,
  Plus,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Box, Flex, HStack, Stack, styled } from 'styled-system/jsx'

export type SectionId =
  | 'search'
  | 'detail'
  | 'create'
  | 'reco'
  | 'stats'
  | 'events'
  | 'login'
  | 'metrics'
  | 'admin'

type Item = {
  id: SectionId
  label: string
  icon: LucideIcon
  badge?: string | number
}

const ITEMS: Item[] = [
  { id: 'search', label: "Recherche d'offres", icon: Search },
  { id: 'detail', label: 'Détail offre', icon: FileText },
  { id: 'create', label: 'Créer une offre', icon: Plus },
  { id: 'reco', label: 'Recommandations', icon: Sparkles },
  { id: 'stats', label: 'Top destinations', icon: BarChart3 },
  { id: 'events', label: 'Événements live', icon: Activity },
  { id: 'login', label: 'Authentification', icon: Key },
  { id: 'metrics', label: 'Métriques', icon: Gauge },
  { id: 'admin', label: 'Administration', icon: Database },
]

type Props = {
  active: SectionId
  onSelect: (id: SectionId) => void
}

export function Sidebar({ active, onSelect }: Props) {
  return (
    <Flex
      direction="column"
      width="240px"
      flexShrink="0"
      borderRight="1px solid"
      style={{
        background: 'var(--sth-surface)',
        borderColor: 'var(--sth-border)',
      }}
      height="100%"
      p="4"
      gap="4"
    >
      <Box px="2" py="1">
        <styled.div
          fontSize="16px"
          fontWeight="semibold"
          style={{ color: 'var(--sth-ink-900)', letterSpacing: '-0.01em' }}
        >
          Travel Hub
        </styled.div>
      </Box>

      <Box>
        <styled.div
          fontSize="10px"
          fontWeight="medium"
          textTransform="uppercase"
          mb="1"
          px="2.5"
          style={{
            letterSpacing: '0.08em',
            color: 'var(--sth-ink-400)',
          }}
        >
          Fonctionnalités
        </styled.div>
        <Stack gap="0.5">
          {ITEMS.map(({ id, label, icon: Icon, badge }) => {
            const isActive = active === id
            return (
              <styled.button
                key={id}
                onClick={() => onSelect(id)}
                type="button"
                position="relative"
                display="flex"
                alignItems="center"
                gap="2.5"
                pl="3.5"
                pr="2.5"
                py="2"
                borderRadius="md"
                fontSize="13px"
                border="0"
                textAlign="left"
                width="100%"
                cursor="pointer"
                style={{
                  background: isActive ? 'var(--sth-amber-tint)' : 'transparent',
                  color: isActive ? 'var(--sth-amber-ink)' : 'var(--sth-ink-700)',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'background 120ms, color 120ms',
                }}
                _hover={
                  isActive
                    ? undefined
                    : { background: 'var(--sth-surface-2) !important', color: 'var(--sth-ink-900) !important' }
                }
              >
                {isActive && (
                  <Box
                    position="absolute"
                    style={{
                      left: '4px',
                      top: '8px',
                      bottom: '8px',
                      width: '3px',
                      borderRadius: '2px',
                      background: 'var(--sth-amber)',
                    }}
                  />
                )}
                <Icon
                  size={16}
                  style={{
                    color: isActive ? 'var(--sth-amber-strong)' : 'var(--sth-ink-400)',
                    flexShrink: 0,
                  }}
                />
                <styled.span flex="1">{label}</styled.span>
                {badge !== undefined && (
                  <styled.span
                    fontSize="10px"
                    px="1.5"
                    borderRadius="full"
                    style={{
                      fontFamily: 'var(--sth-font-mono)',
                      color: isActive ? 'var(--sth-amber-ink)' : 'var(--sth-ink-400)',
                      background: isActive ? 'white' : 'var(--sth-surface-2)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--sth-amber)' : 'var(--sth-border)',
                    }}
                  >
                    {badge}
                  </styled.span>
                )}
              </styled.button>
            )
          })}
        </Stack>
      </Box>

      <HStack
        mt="auto"
        p="2.5"
        borderTop="1px solid"
        gap="2.5"
        style={{
          borderColor: 'var(--sth-border)',
          color: 'var(--sth-ink-500)',
          fontSize: '11px',
          fontFamily: 'var(--sth-font-mono)',
        }}
      >
        <Box
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--sth-green)',
            boxShadow: '0 0 0 3px var(--sth-green-tint)',
          }}
        />
        Redis · Mongo · Neo4j
      </HStack>
    </Flex>
  )
}
