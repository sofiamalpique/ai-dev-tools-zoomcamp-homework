# Agent Guidelines for this Repo

- Node toolchain: add `/opt/homebrew/opt/node@20/bin` to `PATH` when running npm (Node 20 is keg-only here).
- Install deps: `PATH="/opt/homebrew/opt/node@20/bin:$PATH" npm install`.
- Dev: `PATH="...:$PATH" npm run dev` (starts Express on 4000 + Vite on 5173).
- Tests: `PATH="...:$PATH" npm test` (Playwright). Use `SKIP_PYODIDE_TEST=1` if offline for Pyodide CDN.
- Build: `PATH="...:$PATH" npm run build`.
- Start (built assets): `PATH="...:$PATH" npm run start -w 02-end-to-end/server`.
- Docker: `docker build -t coding-interview-app .` then `docker run -p 4000:4000 coding-interview-app`.
- Commit cadence: commit after meaningful milestones (scaffold, backend, frontend, tests, docs/docker).
- Do **not** run destructive git commands (`reset --hard`, `checkout -- .`) without explicit user approval.
