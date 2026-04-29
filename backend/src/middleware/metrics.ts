import type { MiddlewareHandler } from 'hono'
import { routePath } from 'hono/route'
import { cacheLookups, httpRequestDuration } from '@/lib/metrics.js'

export const metricsMiddleware: MiddlewareHandler = async (c, next) => {
  if (c.req.path === '/metrics') {
    await next()
    return
  }

  const start = process.hrtime.bigint()
  await next()
  const seconds = Number(process.hrtime.bigint() - start) / 1e9

  const route = routePath(c, -1) || c.req.path
  httpRequestDuration.observe(
    { method: c.req.method, route, status: String(c.res.status) },
    seconds,
  )

  const cacheHeader = c.res.headers.get('X-Cache')
  if (cacheHeader === 'HIT' || cacheHeader === 'MISS') {
    cacheLookups.inc({ result: cacheHeader.toLowerCase() })
  }
}
