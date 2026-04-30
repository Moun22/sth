import { Hono } from 'hono'
import { seedMongo } from '@/scripts/seed-mongo.js'

export const admin = new Hono()

admin.post('/seed', async (c) => {
  const result = await seedMongo()
  return c.json(result)
})
