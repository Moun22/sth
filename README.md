# SupDeVinci Travel Hub (STH)

Mini-projet NoSQL polyglotte : API HTTP/JSON adossée à Redis, MongoDB et Neo4j, plus une console web de démo.

## Démarrer la stack

```bash
docker compose up --build
```

Une fois levée, depuis la console web tu peux tout tester (recherche, détail, recommandations, événements live, métriques, reset).

| Service | URL |
|---------|-----|
| Console démo | http://localhost:5173 |
| API | http://localhost:3000 |
| Neo4j Browser | http://localhost:7474 (`neo4j` / `sthpassword`) |
| MongoDB | `mongodb://localhost:27017` |
| Redis | `redis://localhost:6379` |

Les bases sont seedées automatiquement au boot. Pour reseter à n'importe quel moment, clique **Reset démo** en haut à droite de la console (ou `POST /admin/seed`).

## Structure

```
backend/    Node.js + Hono — API HTTP/JSON
frontend/   Vite + React + Park UI — console de démo
docker-compose.yml   orchestre api + frontend + redis + mongo + neo4j
```
