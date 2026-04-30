import { useEffect, useState } from 'react'
import { Box, Flex } from 'styled-system/jsx'
import { Sidebar, type SectionId } from '~/components/Sidebar'
import { TopBar } from '~/components/TopBar'
import { toaster } from '~/components/ui/toast'
import { api } from '~/lib/api'
import { AdminPage } from '~/pages/AdminPage'
import { CreatePage } from '~/pages/CreatePage'
import { DetailPage } from '~/pages/DetailPage'
import { EventsPage } from '~/pages/EventsPage'
import { LoginPage } from '~/pages/LoginPage'
import { MetricsPage } from '~/pages/MetricsPage'
import { RecoPage } from '~/pages/RecoPage'
import { SearchPage } from '~/pages/SearchPage'
import { StatsPage } from '~/pages/StatsPage'

export function App() {
  const [section, setSection] = useState<SectionId>('search')
  const [pickedOfferId, setPickedOfferId] = useState<string | undefined>()
  const [apiUp, setApiUp] = useState(false)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    let cancelled = false
    const ping = async () => {
      const r = await api.health()
      if (!cancelled) setApiUp(r.ok)
    }
    ping()
    const id = setInterval(ping, 10_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  async function handleSeed() {
    setSeeding(true)
    const r = await api.seedMongo()
    setSeeding(false)
    if (r.ok && r.data) {
      toaster.create({
        title: 'Seed terminé',
        description: `${r.data.inserted} offres insérées`,
        type: 'success',
      })
    } else {
      toaster.create({
        title: 'Seed échoué',
        description: r.error?.error ?? 'Erreur',
        type: 'error',
      })
    }
  }

  function pickOffer(id: string) {
    setPickedOfferId(id)
    setSection('detail')
  }

  return (
    <Flex height="100%" bg="bg.canvas">
      <Sidebar active={section} onSelect={(id) => setSection(id)} />
      <Flex direction="column" flex="1" minWidth="0">
        <TopBar apiUp={apiUp} seeding={seeding} onSeed={handleSeed} />
        <Box flex="1" overflow="auto" p="8">
          <Box maxWidth="1200px" mx="auto">
            {section === 'search' && <SearchPage onPickOffer={pickOffer} />}
            {section === 'detail' && (
              <DetailPage initialId={pickedOfferId} onPickOffer={pickOffer} />
            )}
            {section === 'create' && <CreatePage />}
            {section === 'reco' && <RecoPage />}
            {section === 'stats' && <StatsPage />}
            {section === 'events' && <EventsPage />}
            {section === 'login' && <LoginPage />}
            {section === 'metrics' && <MetricsPage />}
            {section === 'admin' && <AdminPage />}
          </Box>
        </Box>
      </Flex>
    </Flex>
  )
}
