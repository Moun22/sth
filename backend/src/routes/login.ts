import { zValidator } from '@hono/zod-validator'
import { randomUUID } from 'node:crypto'
import { Hono } from 'hono'
import { z } from 'zod'
import { redis } from '@/lib/redis.js'

const SESSION_TTL_SECONDS = 900

const loginSchema = z.object({
  userId: z.string().min(1),
})

export const login = new Hono()

login.post(
  '/',
  zValidator('json', loginSchema, (result, c) => {
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        path: i.path.join('.') || '<root>',
        message: i.message,
      }))
      return c.json({ error: 'Validation failed', issues }, 400)
    }
  }),
  async (c) => {
    const { userId } = c.req.valid('json')
    const token = randomUUID()
    await redis.set(`session:${token}`, userId, {
      expiration: { type: 'EX', value: SESSION_TTL_SECONDS },
    })
    return c.json({ token, expires_in: SESSION_TTL_SECONDS })
  },
)
