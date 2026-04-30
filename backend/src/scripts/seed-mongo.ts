import type { Collection } from 'mongodb';
import { getMongoDb } from '@/lib/mongo.js';
import type { Hotel, Activity, Leg, OfferDocument } from '@/models/offer.js';

const PROVIDERS = ['AirZen', 'SkyBridge', 'FlyNova', 'CloudJet', 'OrbitAir'];

const ROUTES = [
  { from: 'PAR', to: 'TYO', depart: '2026-06-10', ret: '2026-06-17', base: 780 },
  { from: 'PAR', to: 'OSA', depart: '2026-06-10', ret: '2026-06-17', base: 760 },
  { from: 'PAR', to: 'SEL', depart: '2026-06-10', ret: '2026-06-17', base: 690 },
  { from: 'PAR', to: 'SIN', depart: '2026-07-01', ret: '2026-07-08', base: 720 },
  { from: 'PAR', to: 'BKK', depart: '2026-07-01', ret: '2026-07-08', base: 640 },
  { from: 'LON', to: 'TYO', depart: '2026-07-02', ret: '2026-07-10', base: 810 },
  { from: 'LON', to: 'ROM', depart: '2026-07-02', ret: '2026-07-08', base: 190 },
  { from: 'LON', to: 'NYC', depart: '2026-08-05', ret: '2026-08-12', base: 540 },
  { from: 'NYC', to: 'PAR', depart: '2026-08-14', ret: '2026-08-22', base: 640 },
  { from: 'NYC', to: 'BCN', depart: '2026-08-14', ret: '2026-08-22', base: 620 },
  { from: 'DXB', to: 'SIN', depart: '2026-09-01', ret: '2026-09-07', base: 430 },
  { from: 'DXB', to: 'BKK', depart: '2026-09-01', ret: '2026-09-07', base: 410 },
  { from: 'PAR', to: 'ROM', depart: '2026-06-10', ret: '2026-06-15', base: 170 },
  { from: 'PAR', to: 'BCN', depart: '2026-06-10', ret: '2026-06-15', base: 160 },
  { from: 'BCN', to: 'NYC', depart: '2026-10-01', ret: '2026-10-10', base: 660 },
] as const;

const HOTELS: Hotel[] = [
  { name: 'Hotel Sakura Stay', nights: 6, price: 420 },
  { name: 'Urban Nest Roma', nights: 4, price: 260 },
  { name: 'Mirage Bay Resort', nights: 5, price: 510 },
  { name: 'Capsule Hub Tokyo', nights: 6, price: 230 },
  { name: 'Sunset BCN Suites', nights: 4, price: 300 },
  { name: 'Marina Sands Singapore', nights: 5, price: 480 },
  { name: 'Brooklyn Loft NYC', nights: 7, price: 610 },
];

const ACTIVITIES: Activity[] = [
  { title: 'Food tour', price: 45 },
  { title: 'Museum pass', price: 35 },
  { title: 'City bike day', price: 22 },
  { title: 'Temple visit', price: 60 },
  { title: 'Harbor cruise', price: 48 },
  { title: 'Cooking class', price: 75 },
  { title: 'Street art walk', price: 18 },
];

function buildLeg(from: string, to: string, idx: number): Leg {
  return {
    flightNum: `STH${(100 + idx).toString().padStart(3, '0')}`,
    dep: from,
    arr: to,
    duration: 90 + (idx % 7) * 55,
  };
}

function makeOffers(): Omit<OfferDocument, '_id'>[] {
  const offers: Omit<OfferDocument, '_id'>[] = [];
  let i = 0;

  for (const route of ROUTES) {
    for (let variant = 0; variant < 3; variant++) {
      i++;
      const provider = PROVIDERS[(i + variant) % PROVIDERS.length];
      const hotel = i % 2 === 0 ? HOTELS[i % HOTELS.length] : null;
      const activity = i % 3 === 0 ? ACTIVITIES[i % ACTIVITIES.length] : null;
      const departDate = new Date(`${route.depart}T08:00:00.000Z`);
      const returnDate = new Date(`${route.ret}T18:00:00.000Z`);
      const extra = variant * 40
        + (hotel ? hotel.price * 0.10 : 0)
        + (activity ? activity.price * 0.50 : 0);

      offers.push({
        from: route.from,
        to: route.to,
        departDate,
        returnDate,
        provider,
        price: Number((route.base + extra).toFixed(2)),
        currency: 'EUR',
        legs: [buildLeg(route.from, route.to, i)],
        hotel,
        activity,
      });
    }
  }

  return offers;
}

export async function seedMongo(): Promise<{ inserted: number; indexes: string[] }> {
  const db = await getMongoDb();
  const col: Collection = db.collection('offers');

  await col.deleteMany({});
  const docs = makeOffers();
  await col.insertMany(docs as OfferDocument[]);

  const indexNames = ['from_to_price', 'text_search'];
  await col.createIndex({ from: 1, to: 1, price: 1 }, { name: indexNames[0] });
  await col.createIndex(
    { provider: 'text', 'hotel.name': 'text', 'activity.title': 'text' },
    { name: indexNames[1] },
  );

  return { inserted: docs.length, indexes: indexNames };
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  seedMongo()
    .then(({ inserted, indexes }) => {
      console.log(`Seeded ${inserted} offers into sth.offers`);
      console.log(`Indexes created: ${indexes.join(', ')}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
