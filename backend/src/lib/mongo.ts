import { MongoClient } from 'mongodb';
import type { Db, Collection } from 'mongodb';
import { env } from '../config/env.js';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(env.mongoUrl);
  await client.connect();
  // extract db name from URL or use 'sth' as default
  const dbName = env.mongoUrl.split('/').pop()?.split('?')[0] ?? 'sth';
  db = client.db(dbName);
  console.log('[mongo] connected to', dbName);
  return db;
}

export async function getOffersCollection(): Promise<Collection> {
  const mongoDb = await getMongoDb();
  return mongoDb.collection('offers');
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// Named export for compatibility
export const mongo = { getMongoDb, getOffersCollection, closeMongo };
