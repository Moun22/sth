import { ArrowRight, Bed, Compass } from 'lucide-react'
import { Box, Flex, HStack, Stack, styled } from 'styled-system/jsx'
import type { OfferSummary } from '~/lib/api'

const PROVIDER_COLORS: Record<string, { color: string; mark: string }> = {
  AirZen: { color: 'oklch(0.62 0.13 200)', mark: 'AZ' },
  SkyBridge: { color: 'oklch(0.55 0.12 270)', mark: 'SB' },
  FlyNova: { color: 'oklch(0.60 0.15 350)', mark: 'FN' },
  CloudJet: { color: 'oklch(0.62 0.10 230)', mark: 'CJ' },
  OrbitAir: { color: 'oklch(0.58 0.14 30)', mark: 'OA' },
}

function providerVisual(name: string) {
  const known = PROVIDER_COLORS[name]
  if (known) return known
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  const mark = name.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || '??'
  return { color: `oklch(0.6 0.13 ${h})`, mark }
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${String(m).padStart(2, '0')}`
}

type Props = {
  offer: OfferSummary
  from: string
  to: string
  onClick?: () => void
}

export function OfferCard({ offer, from, to, onClick }: Props) {
  const prov = providerVisual(offer.provider)
  const leg = offer.legs[0]

  return (
    <styled.article
      onClick={onClick}
      borderRadius="md"
      cursor="pointer"
      style={{
        background: 'var(--sth-surface)',
        border: '1px solid var(--sth-border)',
        boxShadow: 'var(--sth-shadow-sm)',
        padding: '14px 14px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'border-color 120ms, box-shadow 120ms, transform 120ms',
      }}
      _hover={{
        borderColor: 'var(--sth-ink-300) !important',
        boxShadow: 'var(--sth-shadow-md) !important',
        transform: 'translateY(-1px)',
      }}
    >
      <Flex align="center" justify="space-between" gap="2.5">
        <HStack gap="2.5">
          <Box
            display="grid"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              placeItems: 'center',
              background: prov.color,
              color: 'white',
              fontFamily: 'var(--sth-font-mono)',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {prov.mark}
          </Box>
          <Stack gap="0">
            <styled.div
              fontSize="13px"
              fontWeight="semibold"
              style={{ color: 'var(--sth-ink-900)', letterSpacing: '-0.005em' }}
            >
              {offer.provider}
            </styled.div>
            <styled.div
              fontSize="10px"
              style={{ fontFamily: 'var(--sth-font-mono)', color: 'var(--sth-ink-400)' }}
              truncate
              maxWidth="160px"
            >
              {offer.id}
            </styled.div>
          </Stack>
        </HStack>
        {leg && (
          <styled.span
            fontSize="11px"
            px="1.5"
            py="0.5"
            borderRadius="sm"
            style={{
              fontFamily: 'var(--sth-font-mono)',
              color: 'var(--sth-ink-500)',
              background: 'var(--sth-surface-2)',
              border: '1px solid var(--sth-border)',
            }}
          >
            {formatDuration(leg.duration)}
          </styled.span>
        )}
      </Flex>

      <HStack gap="2.5" pt="1.5" pb="0.5">
        <styled.span
          fontSize="18px"
          fontWeight="semibold"
          style={{
            fontFamily: 'var(--sth-font-mono)',
            color: 'var(--sth-ink-900)',
            letterSpacing: '0.02em',
          }}
        >
          {from}
        </styled.span>
        <Box
          flex="1"
          position="relative"
          style={{
            height: '1px',
            background: 'var(--sth-border-strong)',
          }}
        >
          <Box
            position="absolute"
            style={{
              left: '50%',
              top: '-3px',
              width: '7px',
              height: '7px',
              background: 'var(--sth-surface-2)',
              border: '1px solid var(--sth-border-strong)',
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
          <Box
            position="absolute"
            style={{
              right: '-1px',
              top: '-3px',
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderLeft: '4px solid var(--sth-border-strong)',
            }}
          />
        </Box>
        <styled.span
          fontSize="18px"
          fontWeight="semibold"
          style={{
            fontFamily: 'var(--sth-font-mono)',
            color: 'var(--sth-ink-900)',
            letterSpacing: '0.02em',
          }}
        >
          {to}
        </styled.span>
      </HStack>

      <HStack gap="1.5" flexWrap="wrap" minHeight="22px">
        {offer.hotel ? (
          <Chip>
            <Bed size={12} style={{ color: 'var(--sth-ink-400)' }} />
            {offer.hotel.name} · {offer.hotel.nights} nuits
          </Chip>
        ) : null}
        {offer.activity ? (
          <Chip>
            <Compass size={12} style={{ color: 'var(--sth-ink-400)' }} />
            {offer.activity.title}
          </Chip>
        ) : null}
        {!offer.hotel && !offer.activity && (
          <styled.span
            fontSize="11px"
            style={{ color: 'var(--sth-ink-300)', fontStyle: 'italic' }}
          >
            Vol uniquement
          </styled.span>
        )}
      </HStack>

      <Flex
        align="center"
        justify="space-between"
        pt="2.5"
        style={{ borderTop: '1px dashed var(--sth-border)' }}
      >
        <HStack gap="1" alignItems="baseline">
          <styled.span
            fontSize="19px"
            fontWeight="semibold"
            style={{ color: 'var(--sth-ink-900)', letterSpacing: '-0.02em' }}
          >
            €{offer.price}
          </styled.span>
          <styled.span
            fontSize="11px"
            style={{ color: 'var(--sth-ink-400)', fontFamily: 'var(--sth-font-mono)' }}
          >
            {offer.currency}
          </styled.span>
        </HStack>
        <styled.button
          type="button"
          display="inline-flex"
          alignItems="center"
          gap="1"
          fontSize="12px"
          fontWeight="medium"
          px="2.5"
          py="1.5"
          borderRadius="sm"
          cursor="pointer"
          style={{
            background: 'white',
            border: '1px solid var(--sth-border-strong)',
            color: 'var(--sth-ink-700)',
          }}
        >
          Détails
          <ArrowRight size={12} />
        </styled.button>
      </Flex>
    </styled.article>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <styled.span
      display="inline-flex"
      alignItems="center"
      gap="1.5"
      borderRadius="full"
      style={{
        padding: '3px 8px 3px 6px',
        border: '1px solid var(--sth-border)',
        background: 'var(--sth-surface-2)',
        fontSize: '11.5px',
        color: 'var(--sth-ink-700)',
        maxWidth: '100%',
      }}
    >
      {children}
    </styled.span>
  )
}
