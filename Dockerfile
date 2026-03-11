FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json .
COPY bun.lock .

RUN bun install

COPY . .

RUN bun run build

FROM oven/bun:latest AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone .
COPY --from=builder /app/.next/static .next/static

ENTRYPOINT ["bun"]
CMD ["server.js"]