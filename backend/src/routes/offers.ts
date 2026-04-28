import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ObjectId } from 'mongodb';
import type { Sort } from 'mongodb';
import { getOffersCollection } from '../lib/mongo.js';
import { getCachedSearch, setCachedSearch, getCachedOffer, setCachedOffer } from '../lib/redis.js';
import { toOfferSummary, toOfferDetail } from '../models/offer.js';
import type { OfferDocument } from '../models/offer.js';

export const offers = new Hono();

// ──────────────────────────────────────────────
// GET /offers?from=PAR&to=TYO&limit=10&q=hotel
// ──────────────────────────────────────────────
offers.get('/', async (c) => {
  const rawFrom = c.req.query('from');
  const rawTo   = c.req.query('to');
  const rawLimit = c.req.query('limit');
  const rawQ    = c.req.query('q')?.trim() || undefined;

  // Validation
  if (!rawFrom || !rawTo) {
    throw new HTTPException(400, { message: 'Query parameters "from" and "to" are required.' });
  }
  const from = rawFrom.trim().toUpperCase();
  const to   = rawTo.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(from)) throw new HTTPException(400, { message: '"from" must be a 3-letter city code.' });
  if (!/^[A-Z]{3}$/.test(to))   throw new HTTPException(400, { message: '"to" must be a 3-letter city code.' });

  const limit = rawLimit ? Math.min(50, Math.max(1, parseInt(rawLimit, 10) || 10)) : 10;

  // 1. Cache hit ?
  const cached = rawQ ? null : await getCachedSearch(from, to); // pas de cache sur recherche textuelle
  if (cached) {
    c.header('X-Cache', 'HIT');
    c.header('Content-Type', 'application/json; charset=utf-8');
    const parsed = JSON.parse(cached) as unknown[];
    return c.json(parsed.slice(0, limit));
  }

  // 2. MongoDB query
  const col = await getOffersCollection();
  const filter: Record<string, unknown> = { from, to };
  if (rawQ) {
    filter['$text'] = { $search: rawQ };
  }

  const sort: Sort = rawQ
    ? { score: { $meta: 'textScore' }, price: 1 }
    : { price: 1 };

  const projection = rawQ ? { score: { $meta: 'textScore' } } : undefined;

  const cursor = col.find(filter, projection ? { projection } : {}).sort(sort).limit(50);
  const docs = (await cursor.toArray()) as OfferDocument[];
  const summaries = docs.map(toOfferSummary);

  // 3. Mettre en cache (uniquement sans texte)
  if (!rawQ) {
    await setCachedSearch(from, to, summaries).catch(() => {/* non bloquant */});
  }

  c.header('X-Cache', 'MISS');
  c.header('Content-Type', 'application/json; charset=utf-8');
  return c.json(summaries.slice(0, limit));
});

// ──────────────────────────────────────────────
// GET /offers/:id
// ──────────────────────────────────────────────
offers.get('/:id', async (c) => {
  const id = c.req.param('id');

  if (!ObjectId.isValid(id)) {
    throw new HTTPException(400, { message: 'Offer id must be a valid MongoDB ObjectId.' });
  }

  // 1. Cache hit ?
  const cached = await getCachedOffer(id);
  if (cached) {
    c.header('X-Cache', 'HIT');
    c.header('Content-Type', 'application/json; charset=utf-8');
    return c.json(JSON.parse(cached));
  }

  // 2. MongoDB findOne
  const col = await getOffersCollection();
  const doc = (await col.findOne({ _id: new ObjectId(id) })) as OfferDocument | null;

  if (!doc) {
    throw new HTTPException(404, { message: 'Offer not found.' });
  }

  // 3. relatedOffers via Neo4j
  let relatedOffers: string[] = [];
  try {
    const { getRelatedOffers } = await import('../lib/neo4j.js');
    if (typeof getRelatedOffers === 'function') {
      relatedOffers = await getRelatedOffers(doc, 3);
    }
  } catch {
  }

  const detail = toOfferDetail(doc, relatedOffers);

  // 4. Mettre en cache
  await setCachedOffer(id, detail).catch(() => {});

  c.header('X-Cache', 'MISS');
  c.header('Content-Type', 'application/json; charset=utf-8');
  return c.json(detail);
});
