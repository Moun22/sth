import { Hono } from 'hono'
import { registry } from '@/lib/metrics.js'

export const metrics = new Hono()

metrics.get('/', async (c) => {
  c.header('Content-Type', registry.contentType)
  return c.body(await registry.metrics())
})
