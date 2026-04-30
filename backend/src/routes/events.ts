import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { OFFERS_NEW_CHANNEL } from '@/lib/pubsub.js'
import { redis } from '@/lib/redis.js'

export const events = new Hono()

events.get('/offers', (c) => {
  return streamSSE(c, async (stream) => {
    const subscriber = redis.duplicate()
    await subscriber.connect()
    let id = 0

    const cleanup = async () => {
      try {
        await subscriber.unsubscribe(OFFERS_NEW_CHANNEL)
        await subscriber.quit()
      } catch {}
    }

    stream.onAbort(cleanup)

    await subscriber.subscribe(OFFERS_NEW_CHANNEL, async (message) => {
      await stream.writeSSE({
        event: 'offers:new',
        data: message,
        id: String(++id),
      })
    })

    await stream.writeSSE({ event: 'ready', data: 'subscribed' })

    while (!stream.aborted) {
      await stream.sleep(15000)
      if (!stream.aborted) {
        await stream.writeSSE({ event: 'ping', data: String(Date.now()) })
      }
    }

    await cleanup()
  })
})
