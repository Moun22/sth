import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { cacheGet, cacheSet } from '@/lib/cache.js'
import { getOffersCollection } from '@/lib/mongo.js'

const STATS_TTL_SECONDS = 300

type TopDestination = { to: string; count: number }

export const stats = new Hono()

stats.get('/top-destinations', async (c) => {
  const rawLimit = c.req.query('limit')
  const limit = rawLimit
    ? Math.min(50, Math.max(1, parseInt(rawLimit, 10) || 10))
    : 10

  if (rawLimit && Number.isNaN(parseInt(rawLimit, 10))) {
    throw new HTTPException(400, { message: '"limit" must be an integer.' })
  }

  const cacheKey = `stats:top-destinations:${limit}`
  const cached = await cacheGet<TopDestination[]>(cacheKey)
  if (cached) {
    c.header('X-Cache', 'HIT')
    c.header('Content-Type', 'application/json; charset=utf-8')
    return c.json(cached)
  }

  const col = await getOffersCollection()
  const result = (await col
    .aggregate<TopDestination>([
      { $group: { _id: '$to', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, to: '$_id', count: 1 } },
    ])
    .toArray()) as TopDestination[]

  await cacheSet(cacheKey, result, STATS_TTL_SECONDS)

  c.header('X-Cache', 'MISS')
  c.header('Content-Type', 'application/json; charset=utf-8')
  return c.json(result)
})
