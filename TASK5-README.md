# Task 05 — Linux Server Administration & Nginx Reverse Proxy

Configure a secure Linux environment with SSH keys, UFW firewall rules, and an
Nginx reverse proxy routing traffic with SSL encryption — deployed in front of
the Task 3/4 Dockerized Node.js + Express + PostgreSQL application.

---

## 1. Linux server setup

- Ubuntu (via WSL2) provisioned as the Linux environment
- Verified with `lsb_release -a` / `uname -a`
- Package index updated: `sudo apt update && sudo apt upgrade -y`

---

## 2. UFW Firewall — ports 22, 80, 443 only

```bash
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

**Verification (`sudo ufw status verbose`):**

```
Status: active
Default: deny (incoming), allow (outgoing), disabled (routed)

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
```

---

## 3. Nginx reverse proxy — gzip, caching, rate limiting

Installed Nginx and configured a reverse proxy in front of the containerized
app (see `nginx.conf` in this repo).

Key features configured:
- **Rate limiting**: `limit_req_zone` (10 req/s, burst 20) to prevent abuse
- **gzip compression** for text/JSON/JS responses
- **Cache-Control headers** on proxied responses
- **Proxy headers** (`X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`) so
  the backend app sees the original client info

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/myapp   # see nginx.conf
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo service nginx reload
```

---

## 4. SSL/TLS termination

Self-signed certificate generated for local/sandbox testing:

```bash
sudo mkdir -p /etc/ssl/private
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/selfsigned.key \
  -out /etc/ssl/certs/selfsigned.crt
```

Nginx configured to:
- Redirect all HTTP (port 80) traffic to HTTPS (port 443)
- Terminate SSL using the self-signed cert
- Restrict protocols to `TLSv1.2` / `TLSv1.3`

---

## 5. End-to-end verification (Docker app + Nginx + SSL)

Pulled and ran the Task 3/4 Docker image from GHCR, then proxied it through
Nginx over HTTPS:

```bash
sudo docker login ghcr.io -u jenibar23
sudo docker pull ghcr.io/jenibar23/docker:main
sudo docker run -d -p 3001:3000 --name myapp2 ghcr.io/jenibar23/docker:main
```

`nginx.conf` proxies to `http://127.0.0.1:3001`.

**Final test:**

```bash
curl -k https://localhost
```

**Result:**

```json
{"message":"Task 3 - Node.js + Express + PostgreSQL + Docker is running!"}
```

This confirms the full chain is working: **UFW firewall → Nginx (SSL +
gzip + rate limiting) → reverse proxy → Dockerized app** — all secured and
routed correctly.

---

## Files in this repo

| File          | Purpose                                                        |
|---------------|-----------------------------------------------------------------|
| `nginx.conf`  | Reverse proxy config: SSL, gzip, caching, rate limiting          |
| `TASK5-README.md` | This documentation                                          |

## Summary

- ✅ UFW firewall restricts inbound traffic to ports 22, 80, 443 only
- ✅ Nginx reverse proxy in front of the Dockerized app with gzip + cache headers
- ✅ Rate limiting configured to mitigate abuse
- ✅ SSL/TLS termination with HTTP → HTTPS redirect
- ✅ Verified end-to-end with the live Task 3/4 Docker container from GHCR
