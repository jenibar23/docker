# =========================================
# Stage 1: Build Stage
# =========================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev && npm cache clean --force

COPY src ./src

# =========================================
# Stage 2: Production Stage (distroless, non-root, no shell)
# =========================================
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS production

WORKDIR /app

COPY --from=build --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=build --chown=nonroot:nonroot /app/src ./src
COPY --chown=nonroot:nonroot package*.json ./

USER nonroot

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:3000/health', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"]

CMD ["src/server.js"]