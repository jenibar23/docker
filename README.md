# Task 03 — Multi-Stage Docker Containerization & Optimization

RabTech Academy — Task 3
Stack: **Node.js + Express + PostgreSQL + Docker**

## 📁 Project Structure
```
task3-docker/
├── src/
│   └── server.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── package.json
└── README.md
```

## 1️⃣ Multi-Stage Dockerfile
- **Build stage**: installs dependencies on `node:20-alpine`
- **Production stage**: copies only `node_modules` + `src` into a fresh `node:20-alpine`, no build tools/dev deps
- Final image is small (Alpine base + no dev dependencies) — target **< 150 MB**

## 2️⃣ Non-root User
- Dockerfile creates `appuser`/`appgroup` and runs the container with `USER appuser`
- Never runs as `root`

## 3️⃣ Docker Compose
- `web` service (Node/Express app)
- `db` service (`postgres:16-alpine`)
- Named volume `pgdata` for persistence
- Health checks on both services; `web` waits for `db` to be healthy

## 4️⃣ Testing (health check + persistence)
See commands below.

---

## 🚀 How to Run

```bash
# 1. Build & start everything
docker compose up -d --build

# 2. Check containers are running
docker compose ps
```

### ✅ Proof 1 — Build successful
```bash
docker compose build
```

### ✅ Proof 2 — Image size < 150 MB
```bash
docker images | grep task3
```

### ✅ Proof 3 — Non-root user verification
```bash
docker exec -it task3_web whoami
# should print: appuser (NOT root)

docker exec -it task3_web id
```

### ✅ Proof 4 — Web + DB containers running
```bash
docker compose ps
```

### ✅ Proof 5 — Health check status
```bash
docker inspect --format='{{json .State.Health.Status}}' task3_web
docker inspect --format='{{json .State.Health.Status}}' task3_db
# both should say "healthy"

# Or hit the endpoint directly:
curl http://localhost:3000/health
```

### ✅ Proof 6 — Volume persistence test
```bash
# Add a record
curl -X POST http://localhost:3000/visits -H "Content-Type: application/json" -d '{"message":"test before restart"}'

# Confirm it exists
curl http://localhost:3000/visits

# Restart the containers (simulate crash/restart)
docker compose restart

# Wait a few seconds for health check, then check data is STILL there
curl http://localhost:3000/visits
```
If the same record still shows up after `docker compose restart`, the Postgres volume (`pgdata`) has successfully persisted the data. ✅

### 🧹 Cleanup
```bash
docker compose down          # stop containers, keep volume/data
docker compose down -v       # stop containers AND wipe volume/data
```

---

## 📸 Screenshots to capture for submission
1. `docker compose up -d --build` — successful build log
2. `docker images` — showing image size < 150MB
3. `docker exec -it task3_web whoami` — showing `appuser`
4. `docker compose ps` — both containers `Up (healthy)`
5. `curl http://localhost:3000/visits` before and after `docker compose restart` — same data present

## 📤 Submission
Push this whole folder to a **public GitHub repository** and submit the repo link.
