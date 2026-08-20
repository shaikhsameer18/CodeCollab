<div align="center">

<img src="client/public/favicon.png" alt="CodeCollab" width="72" />

# CodeCollab

**A browser-based room where a team codes, runs, sketches, and ships together — live.**

[![License: MIT](https://img.shields.io/badge/license-MIT-14B8A6.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-both%20sides-3178C6)
![Socket.io](https://img.shields.io/badge/Socket.io-real--time-black)

[Deployment guide](DEPLOYMENT.md) · [Report a bug](https://github.com/shaikhsameer18/CodeCollabFinal/issues)

</div>

---

## About

CodeCollab turns a single room ID into a shared workspace: a multi-file code editor with live multi-cursor editing, an AI assistant, a whiteboard, in-room chat, one-click GitHub commits, and a real code runner — all in one browser tab, with nothing to install.

It's aimed at the moments where screen-sharing isn't quite enough: pair programming, technical interviews, teaching a class to debug together, or a hackathon team that's never met in person. Open a room, send the link, everyone's cursor shows up.

## Features

- **Real-time collaborative editing** — every keystroke, cursor position, and file-tree change syncs over WebSockets (Socket.io) to everyone in the room.
- **GitHub integration** — connect an account, pick a repo, and commit + push the room's files directly, without a local git clone.
- **AI pair programmer** — ask coding questions in the sidebar; answers stream in from a hosted code model, scoped to your own session.
- **Interactive whiteboard** — flip the room from code to a shared [tldraw](https://tldraw.dev) canvas for diagrams, then flip back without losing anything.
- **Run real code** — execute the open file against an actual language runtime (via [Piston](https://github.com/engineer-man/piston)) and see stdout/stderr inline.
- **Room-based access** — a room is just a shareable link; no accounts, no invites to manage.

## Tech stack

| | |
|---|---|
| **Client** | React 18, TypeScript, Vite, Tailwind CSS, CodeMirror 6, tldraw, Framer Motion, Socket.io-client |
| **Server** | Node.js, Express, Socket.io, express-session, express-rate-limit |
| **Integrations** | GitHub OAuth + REST API, DeepInfra (AI chat), Piston (code execution) |

## Architecture

```text
client (Vite/React, static)  ──HTTPS──▶  server (Express + Socket.io, one process)
      │                                        │
      ├─ WebSocket: file sync, cursors,        ├─ /api/auth/github/*  (OAuth, commit & push)
      │  presence, chat, drawing               ├─ /api/chatbot/ask    (AI, SSE stream)
      │                                        └─ Socket.io room state (in-memory)
      └─ Piston API (browser → third party, code execution)
```

One server process, one port. See [`DEPLOYMENT.md`](DEPLOYMENT.md#architecture-notes) for why that's worth calling out — it wasn't always true.

## Getting started

```bash
git clone https://github.com/shaikhsameer18/CodeCollabFinal.git
cd CodeCollabFinal

cd server && cp .env.example .env   # fill in the values, see below
npm install && npm run dev          # http://localhost:3000

cd ../client && cp .env.example .env
npm install && npm run dev          # http://localhost:5173
```

You'll need a [GitHub OAuth App](https://github.com/settings/developers) for the GitHub features and a [DeepInfra](https://deepinfra.com) API key for the AI assistant — both are optional for local editing/whiteboard/run-code use. Full variable reference in [`server/.env.example`](server/.env.example) and [`client/.env.example`](client/.env.example).

**Ready to put it online?** → [`DEPLOYMENT.md`](DEPLOYMENT.md) covers Render + Vercel (recommended, free) and a Docker path for self-hosting anywhere.

## Usage

1. **Create or join a room** — enter a username on the homepage, generate a room ID (or paste one a teammate sent you), and go.
2. **Share the link** — the URL in your address bar *is* the invite.
3. **Code, run, sketch, push** — edit files together, run the active file, switch to the whiteboard for a diagram, and push the result to GitHub when you're done.

## Security

If you're standing up your own instance from this repo, read [`DEPLOYMENT.md`](DEPLOYMENT.md#0-before-you-deploy-anywhere-rotate-your-secrets) before your first deploy — it covers rotating credentials and keeping `.env` files out of git.

## Contributing

Pull requests are welcome.

```bash
git checkout -b feature/your-feature
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

Then open a PR against `main`.

## License

[MIT](LICENSE)

## Acknowledgements

[React](https://reactjs.org) · [Socket.io](https://socket.io) · [CodeMirror](https://codemirror.net) · [tldraw](https://tldraw.dev) · [Piston](https://github.com/engineer-man/piston) · [DeepInfra](https://deepinfra.com)
