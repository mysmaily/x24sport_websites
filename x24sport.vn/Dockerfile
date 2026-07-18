FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_SITE_URL=https://x24sport.vn
ARG SITE_ENV=production
ARG PAYLOAD_API_URL=http://10.10.0.28:3001
ARG TENANT_SLUG=x24sport
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV SITE_ENV=$SITE_ENV
ENV PAYLOAD_API_URL=$PAYLOAD_API_URL
ENV TENANT_SLUG=$TENANT_SLUG
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3010
ENV HOSTNAME=0.0.0.0
ENV PAYLOAD_API_URL=http://10.10.0.28:3001
ENV TENANT_SLUG=x24sport
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3010
CMD ["node", "server.js"]
