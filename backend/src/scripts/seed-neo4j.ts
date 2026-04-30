import { neo4j } from '@/lib/neo4j.js'

const CITIES = [
  { code: 'PAR', name: 'Paris', country: 'FR' },
  { code: 'LON', name: 'London', country: 'UK' },
  { code: 'BER', name: 'Berlin', country: 'DE' },
  { code: 'MAD', name: 'Madrid', country: 'ES' },
  { code: 'BCN', name: 'Barcelona', country: 'ES' },
  { code: 'ROM', name: 'Rome', country: 'IT' },
  { code: 'MIL', name: 'Milan', country: 'IT' },
  { code: 'AMS', name: 'Amsterdam', country: 'NL' },
  { code: 'FRA', name: 'Frankfurt', country: 'DE' },
  { code: 'ZRH', name: 'Zurich', country: 'CH' },
  { code: 'NYC', name: 'New York', country: 'US' },
  { code: 'LAX', name: 'Los Angeles', country: 'US' },
  { code: 'TYO', name: 'Tokyo', country: 'JP' },
  { code: 'OSA', name: 'Osaka', country: 'JP' },
  { code: 'SEL', name: 'Seoul', country: 'KR' },
  { code: 'SIN', name: 'Singapore', country: 'SG' },
  { code: 'BKK', name: 'Bangkok', country: 'TH' },
  { code: 'DXB', name: 'Dubai', country: 'AE' },
  { code: 'MEL', name: 'Melbourne', country: 'AU' },
] as const

const NEAR_PAIRS: { a: string; b: string; w: number }[] = [
  { a: 'PAR', b: 'LON', w: 0.9 },
  { a: 'PAR', b: 'AMS', w: 0.85 },
  { a: 'PAR', b: 'FRA', w: 0.8 },
  { a: 'PAR', b: 'BCN', w: 0.75 },
  { a: 'PAR', b: 'ROM', w: 0.8 },
  { a: 'PAR', b: 'MAD', w: 0.7 },
  { a: 'PAR', b: 'MIL', w: 0.7 },
  { a: 'PAR', b: 'ZRH', w: 0.75 },
  { a: 'PAR', b: 'BER', w: 0.7 },
  { a: 'LON', b: 'AMS', w: 0.85 },
  { a: 'LON', b: 'ROM', w: 0.6 },
  { a: 'LON', b: 'NYC', w: 0.4 },
  { a: 'BCN', b: 'MAD', w: 0.85 },
  { a: 'BCN', b: 'ROM', w: 0.7 },
  { a: 'BCN', b: 'MIL', w: 0.7 },
  { a: 'BCN', b: 'NYC', w: 0.5 },
  { a: 'ROM', b: 'MIL', w: 0.85 },
  { a: 'BER', b: 'FRA', w: 0.85 },
  { a: 'BER', b: 'AMS', w: 0.8 },
  { a: 'BER', b: 'ZRH', w: 0.75 },
  { a: 'FRA', b: 'AMS', w: 0.85 },
  { a: 'FRA', b: 'ZRH', w: 0.8 },
  { a: 'NYC', b: 'LAX', w: 0.7 },
  { a: 'TYO', b: 'OSA', w: 0.95 },
  { a: 'TYO', b: 'SEL', w: 0.85 },
  { a: 'OSA', b: 'SEL', w: 0.85 },
  { a: 'TYO', b: 'SIN', w: 0.7 },
  { a: 'TYO', b: 'BKK', w: 0.65 },
  { a: 'SIN', b: 'BKK', w: 0.85 },
  { a: 'SIN', b: 'DXB', w: 0.7 },
  { a: 'BKK', b: 'DXB', w: 0.6 },
  { a: 'MEL', b: 'SIN', w: 0.55 },
  { a: 'MEL', b: 'BKK', w: 0.55 },
  { a: 'DXB', b: 'PAR', w: 0.6 },
  { a: 'DXB', b: 'LON', w: 0.65 },
]

const ROUTES = [
  { from: 'PAR', to: 'TYO' },
  { from: 'PAR', to: 'OSA' },
  { from: 'PAR', to: 'SEL' },
  { from: 'PAR', to: 'SIN' },
  { from: 'PAR', to: 'BKK' },
  { from: 'LON', to: 'TYO' },
  { from: 'LON', to: 'ROM' },
  { from: 'LON', to: 'NYC' },
  { from: 'NYC', to: 'PAR' },
  { from: 'NYC', to: 'BCN' },
  { from: 'DXB', to: 'SIN' },
  { from: 'DXB', to: 'BKK' },
  { from: 'PAR', to: 'ROM' },
  { from: 'PAR', to: 'BCN' },
  { from: 'BCN', to: 'NYC' },
] as const

export async function seedNeo4j(): Promise<{
  cities: number
  nearEdges: number
  offers: number
}> {
  const session = neo4j.session()
  try {
    await session.run('MATCH (n) DETACH DELETE n')

    await session.run(
      'UNWIND $cities AS c CREATE (:City {code:c.code, name:c.name, country:c.country})',
      { cities: CITIES },
    )

    await session.run(
      `UNWIND $pairs AS p
       MATCH (a:City {code:p.a}), (b:City {code:p.b})
       CREATE (a)-[:NEAR {weight:p.w}]->(b)
       CREATE (b)-[:NEAR {weight:p.w}]->(a)`,
      { pairs: NEAR_PAIRS },
    )

    const offers: { id: string; from: string }[] = []
    let i = 0
    for (const route of ROUTES) {
      for (let v = 0; v < 3; v++) {
        i++
        offers.push({
          id: `offer-${String(i).padStart(3, '0')}`,
          from: route.from,
        })
      }
    }

    await session.run(
      `UNWIND $offers AS o
       MATCH (c:City {code:o.from})
       CREATE (:Offer {id:o.id})-[:IN]->(c)`,
      { offers },
    )

    await session.run(
      'CREATE CONSTRAINT city_code_unique IF NOT EXISTS FOR (c:City) REQUIRE c.code IS UNIQUE',
    )
    await session.run(
      'CREATE CONSTRAINT offer_id_unique IF NOT EXISTS FOR (o:Offer) REQUIRE o.id IS UNIQUE',
    )

    return {
      cities: CITIES.length,
      nearEdges: NEAR_PAIRS.length * 2,
      offers: offers.length,
    }
  } finally {
    await session.close()
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  seedNeo4j()
    .then(async ({ cities, nearEdges, offers }) => {
      console.log(`Neo4j seeded: ${cities} cities, ${nearEdges} NEAR edges, ${offers} offers`)
      await neo4j.close()
      process.exit(0)
    })
    .catch(async (err) => {
      console.error('Seed failed:', err)
      await neo4j.close()
      process.exit(1)
    })
}
