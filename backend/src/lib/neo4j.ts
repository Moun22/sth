import neo4jDriver from 'neo4j-driver'
import { env } from '@/config/env.js'
import type { OfferDocument } from '@/models/offer.js'

export const neo4j = neo4jDriver.driver(
  env.neo4jUrl,
  neo4jDriver.auth.basic(env.neo4jUser, env.neo4jPassword),
)

export async function connectNeo4j(): Promise<void> {
  await neo4j.verifyConnectivity()
  console.log(`Neo4j connected on ${env.neo4jUrl}`)
}

export async function getRecommendations(
  city: string,
  limit: number,
): Promise<{ city: string; score: number }[]> {
  const session = neo4j.session()
  try {
    const result = await session.run(
      `
      MATCH (c:City {code:$city})-[r:NEAR]->(n:City)
      RETURN n.code AS city, r.weight AS score
      ORDER BY r.weight DESC
      LIMIT toInteger($limit)
      `,
      { city, limit },
    )

    return result.records.map((r) => ({
      city: r.get('city'),
      score: r.get('score'),
    }))
  } catch (err) {
    console.error('Neo4j reco error', err)
    return []
  } finally {
    await session.close()
  }
}

export async function registerOfferNode(id: string, fromCity: string): Promise<void> {
  const session = neo4j.session()
  try {
    await session.run(
      `
      MERGE (c:City {code:$from})
      ON CREATE SET c.name = $from, c.country = 'XX'
      MERGE (o:Offer {id:$id})
      MERGE (o)-[:IN]->(c)
      `,
      { id, from: fromCity },
    )
  } catch (err) {
    console.error('Neo4j registerOfferNode error', err)
  } finally {
    await session.close()
  }
}

export async function getRelatedOffers(
  offer: Pick<OfferDocument, 'id'>,
  limit: number,
): Promise<string[]> {
  const session = neo4j.session()
  try {
    const result = await session.run(
      `
      MATCH (o:Offer {id:$id})-[:IN]->(c:City)
      MATCH (c)-[r:NEAR]->(near:City)
      MATCH (o2:Offer)-[:IN]->(near)
      RETURN DISTINCT o2.id AS id, r.weight AS weight
      ORDER BY weight DESC
      LIMIT toInteger($limit)
      `,
      { id: offer.id, limit },
    )

    return result.records.map((r) => r.get('id'))
  } catch (err) {
    console.error('Neo4j related offers error', err)
    return []
  } finally {
    await session.close()
  }
}
