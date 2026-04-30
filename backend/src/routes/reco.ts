import { getRecommendations } from '../lib/neo4j.js'
import { Hono } from 'hono'

export const reco = new Hono()

reco.get('/', async (c) => {
  const city = String(c.req.query('city') || '').toUpperCase().trim()
  const k = Number(c.req.query('k') || 3)

  if (!city) {
    return c.json({ error: 'city required' }, 400)
  }

  try {
    const result = await getRecommendations(city, k)

    return c.json(result) // ← conforme au sujet
  } catch (err) {
    console.error('Reco error:', err)
    return c.json({ error: 'internal error' }, 500)
  }
})
