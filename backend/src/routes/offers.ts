import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ObjectId } from 'mongodb';
import type { Sort } from 'mongodb';
import { getOffersCollection } from '@/lib/mongo.js';
import { cacheGet, cacheSet } from '@/lib/cache.js';
import { getCachedOffer, setCachedOffer } from '@/lib/redis.js';
import { toOfferSummary, toOfferDetail } from '@/models/offer.js';
import type { OfferDocument, OfferSummary } from '@/models/offer.js';

export const offers = new Hono();

offers.get('/', async (c) => {
  const rawFrom = c.req.query('from');
  const rawTo = c.req.query('to');
  const rawLimit = c.req.query('limit');
  const rawQ = c.req.query('q')?.trim() || undefined;

  if (!rawFrom || !rawTo) {
    throw new HTTPException(400, { message: 'Query parameters "from" and "to" are required.' });
  }

  const from = rawFrom.trim().toUpperCase();
  const to = rawTo.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(from)) throw new HTTPException(400, { message: '"from" must be a 3-letter city code.' });
  if (!/^[A-Z]{3}$/.test(to)) throw new HTTPException(400, { message: '"to" must be a 3-letter city code.' });

  const limit = rawLimit ? Math.min(50, Math.max(1, parseInt(rawLimit, 10) || 10)) : 10;

  const cacheKey = `offers:${from}:${to}`;
  const cached = rawQ ? null : await cacheGet<OfferSummary[]>(cacheKey);
  if (cached) {
    c.header('X-Cache', 'HIT');
    c.header('Content-Type', 'application/json; charset=utf-8');
    return c.json(cached.slice(0, limit));
  }

  const col = await getOffersCollection();
  const filter: Record<string, unknown> = { from, to };
  if (rawQ) filter['$text'] = { $search: rawQ };

  const sort: Sort = rawQ ? { score: { $meta: 'textScore' }, price: 1 } : { price: 1 };
  const projection = rawQ ? { score: { $meta: 'textScore' } } : undefined;

  const docs = (await col.find(filter, projection ? { projection } : {}).sort(sort).limit(50).toArray()) as OfferDocument[];
  const summaries = docs.map(toOfferSummary);

  if (!rawQ) await cacheSet(cacheKey, summaries, 60, { compress: true }).catch(() => {});

  c.header('X-Cache', 'MISS');
  c.header('Content-Type', 'application/json; charset=utf-8');
  return c.json(summaries.slice(0, limit));
});

offers.get('/:id', async (c) => {
  const id = c.req.param('id');

  if (!ObjectId.isValid(id)) {
    throw new HTTPException(400, { message: 'Offer id must be a valid MongoDB ObjectId.' });
  }

  const cached = await getCachedOffer(id);
  if (cached) {
    c.header('X-Cache', 'HIT');
    c.header('Content-Type', 'application/json; charset=utf-8');
    return c.json(JSON.parse(cached));
  }

  const col = await getOffersCollection();
  const doc = (await col.findOne({ _id: new ObjectId(id) })) as OfferDocument | null;

  if (!doc) throw new HTTPException(404, { message: 'Offer not found.' });

  let relatedOffers: string[] = [];
  try {
    const { getRelatedOffers } = await import('@/lib/neo4j.js');
    if (typeof getRelatedOffers === 'function') {
      relatedOffers = await getRelatedOffers(doc, 3);
    }
  } catch {}

  const detail = toOfferDetail(doc, relatedOffers);
  await setCachedOffer(id, detail).catch(() => {});

  c.header('X-Cache', 'MISS');
  c.header('Content-Type', 'application/json; charset=utf-8');
  return c.json(detail);
});
