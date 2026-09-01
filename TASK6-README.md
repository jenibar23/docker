Task 06 — Cloud Infrastructure Deployment & Monitoring Capstone

Deploy the complete containerized application (from Task 3/4) to a cloud provider, with automated environment configuration and uptime monitoring.

Live Application URL: https://jenibar-devops-app.onrender.com

Architecture Overview
GitHub Repo (jenibar23/docker)
        │
        │  CI/CD (Task 4 — GitHub Actions)
        ▼
GHCR (ghcr.io/jenibar23/docker:main)
        │
        │  Pulled directly by cloud provider
        ▼
Render.com (Web Service, Free Tier)
        │
        │  Public HTTPS endpoint
        ▼
https://jenibar-devops-app.onrender.com
        │
        │  Monitored every 5 minutes
        ▼
UptimeRobot (uptime + downtime email alerts)

The same Docker image built and pushed to GHCR in Task 4 is deployed directly to the cloud — no rebuild step, no manual server management. This demonstrates the full DevOps pipeline: code → container → registry → cloud deployment → monitoring.

1. Cloud Deployment (Render.com)

Render was chosen as the cloud provider because it supports deploying an existing Docker image directly from a container registry (GHCR), with a free tier and zero-downtime HTTPS out of the box — functionally equivalent to deploying on AWS EC2 / DigitalOcean, without requiring a payment card for a student account.

Steps:

Signed in to Render.com via GitHub (no card required)
Created a New Web Service → Existing Image
Image URL: ghcr.io/jenibar23/docker:main (auto-detected and validated)
Selected the Free instance plan (0.1 CPU / 512 MB RAM)
Added environment variable:
   PORT=3000
Clicked Deploy Web Service

Result: Deploy succeeded in ~20 seconds, service went Live, and a public HTTPS URL was automatically provisioned:

https://jenibar-devops-app.onrender.com

Verification:

bash
curl https://jenibar-devops-app.onrender.com
json
{"message":"Task 3 - Node.js + Express + PostgreSQL + Docker is running!"}
2. Environment Variable Configuration

Environment variables are configured directly in the Render dashboard under the service's Environment tab, rather than hardcoded in the image — keeping the same container portable across environments (local WSL testing in Task 5, and cloud deployment here in Task 6).

Variable	Value	Purpose
PORT	3000	Tells the container which port the Express app listens on
3. Uptime Monitoring & Health Check Alerts

Tool used: UptimeRobot (free tier)

Setup:

Created an UptimeRobot account (via GitHub sign-in)
Added a new HTTP(s) monitor:
Friendly name: Task 6 App
URL: https://jenibar-devops-app.onrender.com
Check interval: 5 minutes
Configured an email alert contact — sends a notification automatically if the app goes down or fails a health check

This gives continuous uptime tracking and automatic alerting without needing to self-host Prometheus/Grafana, while covering the same goal: knowing immediately if the deployed service becomes unavailable.

4. Notes on the Free Tier
Render's free instance spins down after 15 minutes of inactivity — the first request after idle time can take up to ~50 seconds while it restarts. This is expected behavior on the free plan, not a fault in the deployment.
The app was verified to start without a live database connection (it logs a DB init retry and continues serving requests), so core functionality is reachable even before a managed database is attached.
Summary
✅ Deployed the Task 3/4 Docker image directly from GHCR to Render.com
✅ Environment variables configured through the platform (not hardcoded)
✅ Live public HTTPS endpoint verified and working
✅ Uptime monitoring configured with automated downtime email alerts
✅ End-to-end pipeline: GitHub → GHCR → Cloud → Monitoring, fully working
