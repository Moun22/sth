import { Network, Plane } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Box, Flex, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import { ApiMeta } from '~/components/ApiMeta'
import { PageHeader } from '~/components/PageHeader'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui'
import { Field } from '~/components/ui'
import { Input } from '~/components/ui/input'
import { api, type ApiResponse, type OfferDetail } from '~/lib/api'

type Props = { initialId?: string; onPickOffer: (id: string) => void }

export function DetailPage({ initialId, onPickOffer }: Props) {
  const [id, setId] = useState(initialId ?? '')
  const [result, setResult] = useState<ApiResponse<OfferDetail> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialId && initialId !== id) {
      setId(initialId)
      run(initialId)
    }
  }, [initialId])

  async function run(target = id) {
    if (!target) return
    setLoading(true)
    setResult(await api.getOffer(target))
    setLoading(false)
  }

  const offer = result?.data

  return (
    <Stack gap="6">
      <PageHeader
        title="Détail d'une offre"
        description={
          <>
            <styled.span fontFamily="mono">GET /offers/{'{id}'}</styled.span> — lookup MongoDB
            par ObjectId, cache Redis (TTL 300 s). Le champ <styled.span fontFamily="mono">relatedOffers</styled.span> vient du graphe Neo4j.
          </>
        }
      />

      <Card.Root>
        <Card.Body p="4">
          <HStack gap="3" alignItems="end">
            <Field.Root>
              <Field.Label>ID de l'offre (ObjectId)</Field.Label>
              <Input
                value={id}
                onChange={(e) => setId(e.target.value)}
                fontFamily="mono"
                placeholder="69f1b07a32a184cf8a143854"
              />
            </Field.Root>
            <Button onClick={() => run()} loading={loading} disabled={!id}>
              Charger
            </Button>
          </HStack>
        </Card.Body>
      </Card.Root>

      <ApiMeta endpoint={`GET /offers/${id || '{id}'}`} result={result} />

      {result === null && (
        <Box p="8" bg="bg.subtle" borderRadius="md" textAlign="center" color="fg.muted" fontSize="sm">
          Colle un ObjectId Mongo (ou clique "Détails →" depuis la page Recherche)
        </Box>
      )}

      {result && !result.ok && (
        <Box p="4" bg="red.a3" borderRadius="md" fontSize="sm" color="red.text">
          {result.error?.error ?? 'Erreur'}
        </Box>
      )}

      {offer && (
        <>
          <Card.Root>
            <Card.Body p="6">
              <Flex justify="space-between" align="flex-start">
                <Stack gap="1">
                  <styled.div fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
                    Provider
                  </styled.div>
                  <HStack gap="3" alignItems="baseline">
                    <styled.div fontSize="2xl" fontWeight="bold">{offer.provider}</styled.div>
                    <Badge variant="subtle" size="sm">{offer.legs[0]?.flightNum}</Badge>
                  </HStack>
                </Stack>
                <styled.div fontSize="3xl" fontWeight="bold" color="colorPalette.text">
                  {offer.price} €
                </styled.div>
              </Flex>

              <Box my="6" p="5" bg="bg.subtle" borderRadius="md">
                <HStack justify="space-between">
                  <Stack gap="0.5" alignItems="center">
                    <styled.div fontSize="2xl" fontWeight="bold">{offer.from}</styled.div>
                    <styled.div fontSize="xs" color="fg.muted">
                      {new Date(offer.departDate).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </styled.div>
                  </Stack>
                  <Stack gap="0.5" alignItems="center" flex="1" mx="6">
                    <styled.div fontSize="xs" color="fg.muted">
                      {offer.legs[0]?.duration} min
                    </styled.div>
                    <Box position="relative" width="100%" height="2px" bg="border.default">
                      <Plane
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: '#fff7ed',
                          padding: '0 6px',
                        }}
                      />
                    </Box>
                    <styled.div fontSize="xs" fontFamily="mono" color="fg.muted">
                      {offer.legs[0]?.flightNum}
                    </styled.div>
                  </Stack>
                  <Stack gap="0.5" alignItems="center">
                    <styled.div fontSize="2xl" fontWeight="bold">{offer.to}</styled.div>
                    <styled.div fontSize="xs" color="fg.muted">
                      {new Date(offer.returnDate).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </styled.div>
                  </Stack>
                </HStack>
              </Box>

              <Grid gridTemplateColumns="1fr 1fr" gap="4">
                <Card.Root bg="bg.subtle">
                  <Card.Body p="4">
                    <styled.div fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider" mb="2">
                      🏨 Hôtel
                    </styled.div>
                    {offer.hotel ? (
                      <Stack gap="0.5">
                        <styled.div fontSize="md" fontWeight="medium">{offer.hotel.name}</styled.div>
                        <HStack gap="3">
                          <styled.span fontSize="xs" color="fg.muted">{offer.hotel.nights} nuits</styled.span>
                          <styled.span fontSize="sm" fontWeight="medium">{offer.hotel.price} €</styled.span>
                        </HStack>
                      </Stack>
                    ) : (
                      <styled.div fontSize="sm" color="fg.muted" fontStyle="italic">
                        Aucun hôtel inclus
                      </styled.div>
                    )}
                  </Card.Body>
                </Card.Root>
                <Card.Root bg="bg.subtle">
                  <Card.Body p="4">
                    <styled.div fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider" mb="2">
                      🎟 Activité
                    </styled.div>
                    {offer.activity ? (
                      <Stack gap="0.5">
                        <styled.div fontSize="md" fontWeight="medium">{offer.activity.title}</styled.div>
                        <styled.span fontSize="sm" fontWeight="medium">{offer.activity.price} €</styled.span>
                      </Stack>
                    ) : (
                      <styled.div fontSize="sm" color="fg.muted" fontStyle="italic">
                        Aucune activité incluse
                      </styled.div>
                    )}
                  </Card.Body>
                </Card.Root>
              </Grid>
            </Card.Body>
          </Card.Root>

          <Card.Root borderTop="3px solid" borderColor="colorPalette.default">
            <Card.Body p="5">
              <HStack gap="2" mb="3">
                <Network size={16} />
                <styled.div fontSize="sm" fontWeight="semibold">
                  Offres liées · via Neo4j
                </styled.div>
                <Badge size="sm" variant="subtle">graphe NEAR</Badge>
              </HStack>
              {offer.relatedOffers.length === 0 ? (
                <Box p="4" bg="bg.subtle" borderRadius="md" fontSize="xs" color="fg.muted">
                  Aucune offre liée pour l'instant. Le graphe Neo4j renverra les villes proches + dates compatibles dès que P3 aura câblé sa logique.
                </Box>
              ) : (
                <Grid gridTemplateColumns="repeat(3, 1fr)" gap="3">
                  {offer.relatedOffers.map((relId) => (
                    <Card.Root key={relId} border="1px solid" borderColor="border.default">
                      <Card.Body p="3">
                        <styled.div fontSize="xs" color="fg.muted" mb="1">
                          ville proche
                        </styled.div>
                        <styled.div
                          fontFamily="mono"
                          fontSize="xs"
                          color="fg.default"
                          truncate
                          mb="2"
                        >
                          {relId}
                        </styled.div>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => onPickOffer(relId)}
                        >
                          Voir →
                        </Button>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </Grid>
              )}
            </Card.Body>
          </Card.Root>
        </>
      )}
    </Stack>
  )
}
