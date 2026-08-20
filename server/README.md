# CodeCollab server

Express + Socket.io backend for [CodeCollab](../README.md). One process, one port — see the root [`DEPLOYMENT.md`](../DEPLOYMENT.md) for why that's worth noting.

## Structure

- `src/server.ts` — entry point: Express app, Socket.io room/file-sync logic, mounts the routes below
- `src/routes/auth.ts` — GitHub OAuth login/callback and commit/push-to-GitHub endpoints
- `src/routes/chatbot.ts` — AI assistant endpoint (SSE stream), per-session conversation history

## Local dev

```bash
cp .env.example .env   # fill in the values
npm install
npm run dev             # ts-node-dev, http://localhost:3000
```

## Build

```bash
npm run build   # tsc -> dist/
npm start        # node dist/server.js
```

Full environment variable reference and deployment steps: [`../DEPLOYMENT.md`](../DEPLOYMENT.md).
