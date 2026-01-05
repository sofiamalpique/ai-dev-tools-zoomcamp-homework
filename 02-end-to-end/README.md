# Coding Interview App (Homework 02)

Real-time collaborative coding interview tool built with React/Vite and an Express + WebSocket backend. Supports shareable rooms, live code editing, syntax highlighting (JS/Python), in-browser code execution (JS sandbox + Pyodide), Playwright integration tests, and single-container deployment.

## Requirements
- Node 20 (Homebrew path: `/opt/homebrew/opt/node@20/bin` on this machine)
- npm workspaces enabled (root `package.json`)

## Install
```bash
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npm install
```

## Run in dev
Starts Express (port 4000) and Vite dev server with hot reload.
```bash
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npm run dev
```

## Tests (Playwright integration)
```bash
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npm test
# Optional: skip Pyodide test if offline
PATH="/opt/homebrew/opt/node@20/bin:$PATH" SKIP_PYODIDE_TEST=1 npm test
```

## Build
```bash
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npm run build
```

## Start (serves built client + API/WebSocket)
```bash
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npm run start -w 02-end-to-end/server
```
Environment:
- `PORT` (default `4000`)
- `CLIENT_DIST` (default `02-end-to-end/client/dist`)

## Docker
```bash
# build
docker build -t coding-interview-app .
# run
docker run -p 4000:4000 coding-interview-app
```

## Deployment (single container)
- Recommended: Render or Fly.io.
- Build image from this repo and run with port `4000` exposed; no extra env required (optional `PORT` override).
- Render: create a new web service from Dockerfile, set port `4000`, health check `/api/health`.

## Key Scripts
- `npm run dev` – concurrently runs server + Vite
- `npm test` – Playwright integration suite
- `npm run build` – Vite production build + placeholder server build
- `npm run start -w 02-end-to-end/server` – serve built client + API/WebSocket
