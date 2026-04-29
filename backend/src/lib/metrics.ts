import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client'

export const registry = new Registry()

collectDefaultMetrics({ register: registry })

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds, by method and route template',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
})

export const cacheLookups = new Counter({
  name: 'cache_lookups_total',
  help: 'Cache lookups by outcome (hit or miss)',
  labelNames: ['result'] as const,
  registers: [registry],
})
