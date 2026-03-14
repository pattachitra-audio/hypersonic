FROM node:slim AS builder

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

RUN npm install pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone .
COPY --from=builder /app/.next/static .next/static

EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["node"]
CMD ["server.js"]