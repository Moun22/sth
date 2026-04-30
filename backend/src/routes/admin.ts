import { Hono } from 'hono'
import { redis } from '@/lib/redis.js'
import { seedMongo } from '@/scripts/seed-mongo.js'
import { seedNeo4j } from '@/scripts/seed-neo4j.js'

export const admin = new Hono()

admin.post('/seed', async (c) => {
  await redis.flushDb()
  const mongo = await seedMongo()
  const neo4j = await seedNeo4j()

  return c.json({
    redis: { flushed: true },
    mongo,
    neo4j,
  })
})
