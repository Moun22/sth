import { createClient, type RedisClientType } from 'redis';
import { env } from '@/config/env.js';

let redisClient: RedisClientType | null = null;

const TTL_DETAIL = 300;

export function getRedis(): RedisClientType {
  if (!redisClient) {
    redisClient = createClient({ url: env.redisUrl });
    redisClient.on('connect', () => console.log('[redis] connected'));
    redisClient.on('error', (err) => console.error('[redis] error', err));
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedis();
  if (!client.isOpen) {
    await client.connect();
    console.log(`[redis] connected on ${env.redisUrl}`);
  }
}

export async function getCachedOffer(id: string): Promise<string | null> {
  return getRedis().get(`offers:${id}`);
}

export async function setCachedOffer(id: string, data: unknown): Promise<void> {
  await getRedis().setEx(`offers:${id}`, TTL_DETAIL, JSON.stringify(data));
}

export const redis = getRedis();
