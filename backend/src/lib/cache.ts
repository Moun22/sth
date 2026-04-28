import { gzip, gunzip } from 'node:zlib'
import { promisify } from 'node:util'
import { redis } from '@/lib/redis.js'

const gzipAsync = promisify(gzip)
const gunzipAsync = promisify(gunzip)
const GZIP_PREFIX = 'gz:'

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number,
  opts: { compress?: boolean } = {},
): Promise<void> {
  const json = JSON.stringify(value)
  const stored = opts.compress
    ? GZIP_PREFIX + (await gzipAsync(json)).toString('base64')
    : json
  await redis.set(key, stored, {
    expiration: { type: 'EX', value: ttlSeconds },
  })
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key)
  if (!raw) return null
  if (raw.startsWith(GZIP_PREFIX)) {
    const buf = await gunzipAsync(
      Buffer.from(raw.slice(GZIP_PREFIX.length), 'base64'),
    )
    return JSON.parse(buf.toString('utf8')) as T
  }
  return JSON.parse(raw) as T
}
