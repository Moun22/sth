import { Activity, Plus, Radio } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Box, Flex, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import { ApiMeta } from '~/components/ApiMeta'
import { PageHeader } from '~/components/PageHeader'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui'
import { Field } from '~/components/ui'
import { Input } from '~/components/ui/input'
import { toaster } from '~/components/ui/toast'
import {
  api,
  type ApiResponse,
  type CreateOfferInput,
  type OfferDetail,
  subscribeToOffers,
} from '~/lib/api'

type FeedItem = {
  receivedAt: Date
  offerId: string
  from: string
  to: string
}

const todayPlus = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export function EventsPage() {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [connected, setConnected] = useState(false)
  const subscribedAtRef = useRef<Date | null>(null)

  // form state
  const [form, setForm] = useState({
    provider: 'DemoAir',
    from: 'PAR',
    to: 'NYC',
    departDate: todayPlus(30),
    returnDate: todayPlus(37),
    price: '850',
    currency: 'EUR',
    flightNum: 'DA42',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<ApiResponse<OfferDetail> | null>(null)

  useEffect(() => {
    const close = subscribeToOffers({
      onReady: () => {
        setConnected(true)
        subscribedAtRef.current = new Date()
      },
      onMessage: (payload) => {
        setFeed((prev) => [{ receivedAt: new Date(), ...payload }, ...prev].slice(0, 30))
      },
      onError: () => setConnected(false),
    })
    return close
  }, [])

  async function publish() {
    setSubmitting(true)
    const body: CreateOfferInput = {
      from: form.from.trim().toUpperCase(),
      to: form.to.trim().toUpperCase(),
      departDate: form.departDate,
      returnDate: form.returnDate,
      provider: form.provider.trim(),
      price: Number(form.price),
      currency: form.currency.trim().toUpperCase(),
      legs: [
        {
          flightNum: form.flightNum.trim(),
          dep: form.from.trim().toUpperCase(),
          arr: form.to.trim().toUpperCase(),
          duration: 360,
        },
      ],
    }
    const r = await api.createOffer(body)
    setSubmitResult(r)
    setSubmitting(false)
    if (r.ok) {
      toaster.create({
        title: 'Offre publiée',
        description: `${body.from} → ${body.to} · ${body.price} ${body.currency}`,
        type: 'success',
      })
    } else {
      toaster.create({
        title: 'Échec publication',
        description: r.error?.error ?? 'Erreur',
        type: 'error',
      })
    }
  }

  return (
    <Stack gap="6">
      <PageHeader
        title="Événements live"
        description={
          <>
            Stream SSE depuis <styled.span fontFamily="mono">/events/offers</styled.span>, fan-out
            depuis le canal Redis Pub/Sub <styled.span fontFamily="mono">offers:new</styled.span>.
            Publie une offre ci-dessous → message visible à gauche en temps réel.
          </>
        }
      />

      <Grid gridTemplateColumns="3fr 2fr" gap="4">
        <Card.Root>
          <Card.Body p="0">
            <Flex
              justify="space-between"
              align="center"
              p="4"
              borderBottom="1px solid"
              borderColor="border.default"
            >
              <HStack gap="3">
                <Box position="relative" w="8px" h="8px">
                  <Box
                    position="absolute"
                    inset="0"
                    borderRadius="full"
                    bg={connected ? 'green.default' : 'red.default'}
                  />
                  {connected && (
                    <Box
                      position="absolute"
                      inset="-3px"
                      borderRadius="full"
                      bg="green.a4"
                      animation="pulse 2s ease-out infinite"
                    />
                  )}
                </Box>
                <styled.div fontSize="sm" fontWeight="medium">
                  Flux Pub/Sub Redis
                </styled.div>
                <styled.span fontFamily="mono" fontSize="xs" bg="bg.subtle" px="2" borderRadius="sm">
                  offers:new
                </styled.span>
                <Badge size="sm" variant={connected ? 'solid' : 'outline'} colorPalette={connected ? 'green' : 'red'}>
                  {connected ? 'subscribed' : 'disconnected'}
                </Badge>
              </HStack>
              <styled.span fontSize="xs" color="fg.muted">
                {feed.length} message{feed.length > 1 ? 's' : ''}
              </styled.span>
            </Flex>

            <Stack gap="0" maxHeight="500px" overflow="auto">
              {feed.length === 0 ? (
                <Box p="8" textAlign="center" color="fg.muted" fontSize="sm">
                  <Radio size={20} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  En attente d'événement... Publie une offre →
                </Box>
              ) : (
                feed.map((item, i) => (
                  <HStack
                    key={`${item.offerId}-${i}`}
                    p="3"
                    borderBottom="1px solid"
                    borderColor="border.default"
                    borderLeft="3px solid"
                    borderLeftColor={i === 0 ? 'colorPalette.default' : 'border.default'}
                    gap="3"
                  >
                    <styled.span fontFamily="mono" fontSize="xs" color="fg.muted" minWidth="80px">
                      {item.receivedAt.toLocaleTimeString('fr-FR')}
                    </styled.span>
                    <Stack gap="0.5" flex="1">
                      <HStack gap="2">
                        <styled.span fontSize="sm" fontWeight="medium">Nouvelle offre</styled.span>
                        <Badge size="sm" variant="outline">{item.from}</Badge>
                        <styled.span color="fg.muted">→</styled.span>
                        <Badge size="sm" variant="outline">{item.to}</Badge>
                      </HStack>
                      <styled.span fontFamily="mono" fontSize="xs" color="fg.muted" truncate>
                        id: {item.offerId}
                      </styled.span>
                    </Stack>
                  </HStack>
                ))
              )}
            </Stack>

            <Box p="3" borderTop="1px solid" borderColor="border.default" fontSize="xs" color="fg.muted">
              <styled.span fontFamily="mono">Connexion SSE: /events/offers</styled.span>
              {connected && subscribedAtRef.current && ` · stable depuis ${subscribedAtRef.current.toLocaleTimeString('fr-FR')}`}
            </Box>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body p="5">
            <HStack gap="2" mb="3">
              <Plus size={16} />
              <styled.div fontSize="sm" fontWeight="semibold">
                Publier une nouvelle offre
              </styled.div>
            </HStack>
            <styled.div fontSize="xs" fontFamily="mono" color="fg.muted" mb="4">
              POST /offers
            </styled.div>

            <Stack gap="3">
              <Field.Root>
                <Field.Label>Fournisseur</Field.Label>
                <Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
              </Field.Root>
              <Grid gridTemplateColumns="1fr 1fr" gap="3">
                <Field.Root>
                  <Field.Label>Départ</Field.Label>
                  <Input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} maxLength={3} />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Arrivée</Field.Label>
                  <Input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} maxLength={3} />
                </Field.Root>
              </Grid>
              <Grid gridTemplateColumns="1fr 1fr" gap="3">
                <Field.Root>
                  <Field.Label>Date départ</Field.Label>
                  <Input type="date" value={form.departDate} onChange={(e) => setForm({ ...form, departDate: e.target.value })} />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Date retour</Field.Label>
                  <Input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} />
                </Field.Root>
              </Grid>
              <Grid gridTemplateColumns="1fr 1fr" gap="3">
                <Field.Root>
                  <Field.Label>Prix</Field.Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Devise</Field.Label>
                  <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} maxLength={3} />
                </Field.Root>
              </Grid>
              <Field.Root>
                <Field.Label>Vol</Field.Label>
                <Input value={form.flightNum} onChange={(e) => setForm({ ...form, flightNum: e.target.value })} />
              </Field.Root>
              <Button onClick={publish} loading={submitting}>
                <Activity size={14} />
                Publier l'offre
              </Button>
              <styled.p fontSize="xs" color="fg.muted">
                L'insertion Mongo déclenche un message Pub/Sub visible à gauche.
              </styled.p>
            </Stack>

            {submitResult && (
              <Box mt="3">
                <ApiMeta endpoint="POST /offers" result={submitResult} />
              </Box>
            )}
          </Card.Body>
        </Card.Root>
      </Grid>
    </Stack>
  )
}
