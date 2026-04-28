export const env = {
  port: Number(process.env.PORT ?? 3000),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  mongoUrl: process.env.MONGO_URL ?? 'mongodb://localhost:27017/sth',
  neo4jUrl: process.env.NEO4J_URL ?? 'bolt://localhost:7687',
  neo4jUser: process.env.NEO4J_USER ?? 'neo4j',
  neo4jPassword: process.env.NEO4J_PASSWORD ?? 'sthpassword',
};
