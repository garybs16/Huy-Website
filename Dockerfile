# syntax=docker/dockerfile:1

FROM node:22.12.0-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22.12.0-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=4000 \
    SERVE_STATIC_APP=true \
    TRUST_PROXY=true \
    DATA_DIR=/var/data \
    DATABASE_URL=/var/data/enrollment.db \
    STATIC_DIR=/app/dist

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/dist ./dist

RUN mkdir -p /var/data && chown -R node:node /var/data /app

USER node

EXPOSE 4000
VOLUME ["/var/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD ["node", "scripts/healthcheck.mjs"]

CMD ["npm", "run", "start"]
