import { Database, RefreshCw } from 'lucide-react'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'

type Props = {
  apiUp: boolean
  seeding: boolean
  onSeed: () => void
  activeLabel: string
}

export function TopBar({ apiUp, seeding, onSeed, activeLabel }: Props) {
  return (
    <Flex
      align="center"
      px="6"
      gap="4"
      flexShrink="0"
      borderBottom="1px solid"
      style={{
        height: '56px',
        background: 'var(--sth-surface)',
        borderColor: 'var(--sth-border)',
      }}
    >
      <HStack gap="2.5" alignItems="baseline">
        <styled.h1
          m="0"
          fontSize="14px"
          fontWeight="semibold"
          style={{ color: 'var(--sth-ink-900)', letterSpacing: '-0.005em' }}
        >
          Travel Hub
        </styled.h1>
        <styled.span fontSize="12px" style={{ color: 'var(--sth-ink-300)' }}>
          /
        </styled.span>
        <styled.span fontSize="13px" style={{ color: 'var(--sth-ink-500)' }}>
          Console de démo
        </styled.span>
        <styled.span fontSize="12px" style={{ color: 'var(--sth-ink-300)' }}>
          /
        </styled.span>
        <styled.span
          fontSize="13px"
          fontWeight="medium"
          style={{ color: 'var(--sth-ink-900)' }}
        >
          {activeLabel}
        </styled.span>
      </HStack>

      <Box flex="1" />

      <HStack gap="3">
        <styled.button
          type="button"
          onClick={onSeed}
          disabled={seeding}
          display="inline-flex"
          alignItems="center"
          gap="1.5"
          px="3"
          py="1.5"
          borderRadius="md"
          fontSize="13px"
          fontWeight="medium"
          cursor="pointer"
          style={{
            background: 'white',
            color: 'var(--sth-ink-700)',
            border: '1px solid var(--sth-border-strong)',
            transition: 'background 120ms, border-color 120ms, color 120ms',
            opacity: seeding ? 0.6 : 1,
          }}
        >
          <RefreshCw
            size={14}
            style={seeding ? { animation: 'sth-spin 1s linear infinite' } : undefined}
          />
          {seeding ? 'Reset en cours…' : 'Reset démo'}
        </styled.button>

        <HStack
          gap="2"
          px="2.5"
          py="1"
          borderRadius="full"
          fontSize="12px"
          fontWeight="medium"
          style={{
            background: apiUp ? 'var(--sth-green-tint)' : 'var(--sth-red-tint)',
            color: apiUp ? 'var(--sth-green-ink)' : 'var(--sth-red)',
            border: '1px solid',
            borderColor: apiUp ? 'var(--sth-green-border)' : 'var(--sth-red)',
          }}
        >
          <Box
            position="relative"
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: apiUp ? 'var(--sth-green)' : 'var(--sth-red)',
            }}
          >
            {apiUp && (
              <Box
                position="absolute"
                style={{
                  inset: '-3px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--sth-green)',
                  animation: 'sth-pulse 2s ease-out infinite',
                  opacity: 0,
                }}
              />
            )}
          </Box>
          {apiUp ? 'API connectée' : 'API hors-ligne'}
        </HStack>

        <Box
          title="u42 — Étudiant SupDeVinci"
          display="grid"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, oklch(0.78 0.10 300) 0%, oklch(0.65 0.13 280) 100%)',
            color: 'white',
            fontFamily: 'var(--sth-font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            placeItems: 'center',
            cursor: 'pointer',
            border: '1.5px solid white',
            boxShadow: '0 0 0 1px var(--sth-border-strong)',
          }}
        >
          <Database size={12} />
        </Box>
      </HStack>
    </Flex>
  )
}
