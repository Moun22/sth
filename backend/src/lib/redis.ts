import Redis from 'ioredis';
import { env } from '../config/env.js';

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.redisUrl);
    redisClient.on('connect', () => console.log('[redis] connected'));
    redisClient.on('error', (err) => console.error('[redis] error', err));
  }
  return redisClient;
}

// TTLs
const TTL_SEARCH = 60;   // offers:<from>:<to>
const TTL_DETAIL = 300;  // offers:<id>

/** Cache helpers for offers search results (TTL 60s) */
export async function getCachedSearch(from: string, to: string): Promise<string | null> {
  return getRedis().get(`offers:${from}:${to}`);
}

export async function setCachedSearch(from: string, to: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await getRedis().set(`offers:${from}:${to}`, json, 'EX', TTL_SEARCH);
}

/** Cache helpers for offer detail (TTL 300s) */
export async function getCachedOffer(id: string): Promise<string | null> {
  return getRedis().get(`offers:${id}`);
}

export async function setCachedOffer(id: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await getRedis().set(`offers:${id}`, json, 'EX', TTL_DETAIL);
}

// Named export for compatibility
export const redis = { getRedis, getCachedSearch, setCachedSearch, getCachedOffer, setCachedOffer };
