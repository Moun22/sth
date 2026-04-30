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

type Item = { id: SectionId; label: string; icon: LucideIcon }

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
      bg="bg.default"
      borderRight="1px solid"
      borderColor="border.default"
      height="100%"
    >
      <Box p="5" borderBottom="1px solid" borderColor="border.default">
        <styled.div fontSize="lg" fontWeight="bold" letterSpacing="tight">
          Travel Hub
        </styled.div>
        <styled.div fontSize="xs" color="fg.muted" letterSpacing="widest" textTransform="uppercase" mt="1">
          NoSQL Demo Console
        </styled.div>
      </Box>

      <Stack gap="0.5" p="3" flex="1">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <styled.button
              key={id}
              onClick={() => onSelect(id)}
              type="button"
              display="flex"
              alignItems="center"
              gap="3"
              px="3"
              py="2.5"
              borderRadius="md"
              fontSize="sm"
              fontWeight={isActive ? 'medium' : 'normal'}
              color={isActive ? 'colorPalette.text' : 'fg.muted'}
              bg={isActive ? 'colorPalette.a3' : 'transparent'}
              borderLeft="3px solid"
              borderLeftColor={isActive ? 'colorPalette.default' : 'transparent'}
              cursor="pointer"
              textAlign="left"
              transition="all 120ms"
              _hover={{ bg: isActive ? 'colorPalette.a3' : 'bg.muted' }}
            >
              <Icon size={16} />
              <styled.span flex="1">{label}</styled.span>
            </styled.button>
          )
        })}
      </Stack>

      <HStack p="4" borderTop="1px solid" borderColor="border.default" gap="3">
        <Box
          width="32px"
          height="32px"
          borderRadius="full"
          bg="colorPalette.default"
          color="colorPalette.fg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="xs"
          fontWeight="bold"
        >
          u4
        </Box>
        <Stack gap="0">
          <styled.div fontSize="sm" fontWeight="medium">u42 Admin</styled.div>
          <styled.div fontSize="xs" color="fg.muted">demo@sth.local</styled.div>
        </Stack>
      </HStack>
    </Flex>
  )
}
