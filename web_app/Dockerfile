# Build stage
FROM node:18-alpine AS builder
RUN corepack enable
WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build with secrets if available, otherwise build normally
RUN --mount=type=secret,id=env_file set -a && . /run/secrets/env_file && set +a; \
    pnpm build

# Production stage
FROM node:18-alpine AS runner
RUN corepack enable
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN chown -R nextjs:nodejs /app


USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]
