import { Activity } from 'lucide-react'
import { useState } from 'react'
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx'
import { ApiMeta } from '~/components/ApiMeta'
import { PageHeader } from '~/components/PageHeader'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui'
import { Field } from '~/components/ui'
import { Input } from '~/components/ui/input'
import { api, type ApiResponse, type CreateOfferInput, type OfferDetail } from '~/lib/api'
import { RawJson } from '~/components/RawJson'

const todayPlus = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export function CreatePage() {
  const [form, setForm] = useState({
    provider: 'DemoAir',
    from: 'PAR',
    to: 'NYC',
    departDate: todayPlus(30),
    returnDate: todayPlus(37),
    price: '850',
    currency: 'EUR',
    flightNum: 'DA42',
    duration: '480',
  })
  const [result, setResult] = useState<ApiResponse<OfferDetail> | null>(null)
  const [loading, setLoading] = useState(false)

  async function publish() {
    setLoading(true)
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
          duration: Number(form.duration) || 360,
        },
      ],
    }
    const r = await api.createOffer(body)
    setResult(r)
    setLoading(false)
  }

  return (
    <Stack gap="6">
      <PageHeader
        title="Créer une offre"
        techs={[
          { tech: 'mongo', suffix: 'insertOne' },
          { tech: 'redis', suffix: 'PUBLISH offers:new' },
        ]}
        description={
          <>
            <styled.span fontFamily="mono">POST /offers</styled.span> — insère dans MongoDB
            puis publie sur le canal Redis <styled.span fontFamily="mono">offers:new</styled.span>
            {' '}(visible dans l'onglet Événements live).
          </>
        }
      />

      <Card.Root>
        <Card.Body p="5">
          <Grid gridTemplateColumns="1fr 1fr" gap="4">
            <Field.Root>
              <Field.Label>Fournisseur</Field.Label>
              <Input
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Devise</Field.Label>
              <Input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                maxLength={3}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Départ</Field.Label>
              <Input
                value={form.from}
                onChange={(e) => setForm({ ...form, from: e.target.value })}
                maxLength={3}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Arrivée</Field.Label>
              <Input
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                maxLength={3}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Date départ</Field.Label>
              <Input
                type="date"
                value={form.departDate}
                onChange={(e) => setForm({ ...form, departDate: e.target.value })}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Date retour</Field.Label>
              <Input
                type="date"
                value={form.returnDate}
                onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Prix</Field.Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Vol (numéro)</Field.Label>
              <Input
                value={form.flightNum}
                onChange={(e) => setForm({ ...form, flightNum: e.target.value })}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Durée vol (minutes)</Field.Label>
              <Input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </Field.Root>
          </Grid>

          <HStack mt="5" justify="flex-end">
            <Button onClick={publish} loading={loading}>
              <Activity size={14} />
              Publier l'offre
            </Button>
          </HStack>
        </Card.Body>
      </Card.Root>

      <ApiMeta endpoint="POST /offers" result={result} />

      {result?.data && (
        <Card.Root>
          <Card.Body p="4">
            <styled.div fontSize="sm" fontWeight="medium" mb="2">Réponse</styled.div>
            <RawJson value={result.data} />
          </Card.Body>
        </Card.Root>
      )}
      {result && !result.ok && (
        <Box p="4" bg="red.a3" borderRadius="md" fontSize="sm" color="red.text">
          <styled.div fontWeight="medium" mb="1">{result.error?.error ?? 'Erreur'}</styled.div>
          {result.error?.issues && (
            <Stack gap="1" fontSize="xs" mt="2">
              {result.error.issues.map((i, n) => (
                <styled.div key={n} fontFamily="mono">
                  {i.path}: {i.message}
                </styled.div>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Stack>
  )
}
