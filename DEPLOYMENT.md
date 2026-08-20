# Deploying CodeCollab

CodeCollab is two independently deployable pieces:

| Piece | What it is | Lives in |
|---|---|---|
| **server** | Express + Socket.io — real-time sync, GitHub OAuth/push proxy, AI chat proxy | `server/` |
| **client** | Static React/Vite build | `client/` |

The server is a single process now (it used to be two — see [Architecture notes](#architecture-notes)), which makes deployment simpler: one service, one port, one URL.

---

## 0. Before you deploy anywhere: rotate your secrets

`server/.env.production` and `client/.env.production` were committed to this repo's git history with real credentials in plaintext (a GitHub OAuth client secret, a session secret, and a DeepInfra API key). They've been removed from the working tree and replaced with `.env.example` templates, but **removal doesn't undo exposure** — anyone who already cloned the repo, or who reads its git history, still has the old values.

Do this once, before your first real deploy:

1. **GitHub OAuth secret** — go to [github.com/settings/developers](https://github.com/settings/developers) → your OAuth App → *Generate a new client secret* → delete the old one.
2. **DeepInfra API key** — [deepinfra.com/dash/api_keys](https://deepinfra.com/dash/api_keys) → revoke the old key → create a new one.
3. **Session secret** — generate a fresh random value:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. **Scrub git history** (the values still exist in old commits even after rotation — this step removes them from the repo itself; rotation is what actually neutralizes the risk if you'd rather skip this):
   ```bash
   # using git filter-repo (recommended over filter-branch)
   pip install git-filter-repo
   git filter-repo --path server/.env.production --path client/.env.production --invert-paths
   git push origin --force --all
   ```
   Force-pushing rewrites history — coordinate with anyone else who has a clone, and be aware old commit SHAs will change.

Only the new, rotated values go into the environment variables described below — never back into a committed file.

---

## 1. Local development

```bash
# server
cd server
cp .env.example .env   # fill in the values
npm install
npm run dev             # http://localhost:3000

# client (separate terminal)
cd client
cp .env.example .env    # VITE_BACKEND_URL=http://localhost:3000
npm install
npm run dev              # http://localhost:5173
```

For local GitHub OAuth testing, create a GitHub OAuth App with:
- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:3000/api/auth/github/callback`

---

## 2. Recommended: Render (server) + Vercel (client)

Free tier on both, zero server maintenance, HTTPS out of the box. This is the "deploy once, use it anytime" path.

### 2a. Server on Render

1. [render.com](https://render.com) → **New → Web Service** → connect this repo.
2. Root directory: `server`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Health check path: `/health`
6. Environment variables (Render dashboard → Environment, not a committed file):

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | your Vercel URL, e.g. `https://codecollab.vercel.app` |
   | `SESSION_SECRET` | the value you generated in step 0 |
   | `GITHUB_CLIENT_ID` | from your GitHub OAuth App |
   | `GITHUB_CLIENT_SECRET` | the **rotated** secret from step 0 |
   | `DEEPINFRA_API_KEY` | the **rotated** key from step 0 |

7. Deploy. Note the resulting URL, e.g. `https://codecollab-server.onrender.com`.

Render's free tier spins the service down after inactivity — the first request after idle takes ~30–60s to wake it. Upgrade to a paid instance if you need it always warm.

### 2b. Client on Vercel

1. [vercel.com](https://vercel.com) → **New Project** → import this repo.
2. Root directory: `client`
3. Framework preset: Vite (build command `npm run build`, output `dist` — already set in `client/vercel.json`).
4. Environment variables:

   | Key | Value |
   |---|---|
   | `VITE_BACKEND_URL` | your Render URL from step 2a |
   | `VITE_GITHUB_CLIENT_ID` | same GitHub OAuth client ID as above |

5. Deploy. Note the resulting URL, e.g. `https://codecollab.vercel.app`.
6. Go back to Render and double-check `FRONTEND_URL` matches this URL exactly (scheme + host, no trailing slash) — CORS and the session cookie's `sameSite: 'none'` behavior depend on it.

### 2c. Point the GitHub OAuth App at production

In your GitHub OAuth App settings:
- Homepage URL → your Vercel URL
- Authorization callback URL → `https://<your-render-url>/api/auth/github/callback`

---

## 3. Alternative: Docker, anywhere

Use this if you'd rather run CodeCollab on your own VPS, Fly.io, Railway, or any host that runs containers — one command, no dependence on a specific platform's dashboard.

```bash
cp server/.env.example .env   # only used to populate the compose env vars below
# edit .env: SESSION_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, DEEPINFRA_API_KEY

docker compose up --build -d
```

This builds and runs:
- `server` on `localhost:3000`
- `client` (nginx-served static build) on `localhost:8080`

For a real deployment, put a reverse proxy (Caddy, nginx, Traefik) in front for TLS, and change the `FRONTEND_URL` / `VITE_BACKEND_URL` values in `docker-compose.yml` from `localhost` to your real domain(s) before building — `VITE_BACKEND_URL` is baked into the client bundle at build time, so the client image needs rebuilding whenever it changes.

---

## Environment variable reference

**Server** (`server/.env.example`):

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no (defaults to 3000) | |
| `FRONTEND_URL` | yes | Used for CORS and Socket.io's allowed origin |
| `SESSION_SECRET` | yes | Random string, signs the OAuth session cookie |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | yes, for GitHub integration | From a GitHub OAuth App |
| `DEEPINFRA_API_KEY` | yes, for the AI assistant | From DeepInfra |
| `NODE_ENV` | recommended | `production` enables secure cookies |

**Client** (`client/.env.example`):

| Variable | Required | Notes |
|---|---|---|
| `VITE_BACKEND_URL` | yes | Base URL of the deployed server |
| `VITE_GITHUB_CLIENT_ID` | yes, for GitHub integration | Same client ID as the server |

---

## Architecture notes

Earlier versions of this repo ran **two separate Express processes** — `server/src/server.ts` (Socket.io + chatbot) and `server/src/index.ts` (GitHub OAuth, session, on a second port via `GITHUB_PORT`) — started together locally with `concurrently`. The committed production start script only ever launched the OAuth process, so a straightforward `npm start` in production would not have started the real-time collaboration server at all. That's been fixed: everything now runs in one Express app in `server/src/server.ts`, on one port, with one set of CORS/session config. `server/src/index.ts` no longer exists.
