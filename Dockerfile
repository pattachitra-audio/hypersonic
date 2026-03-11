FROM oven/bun:latest

WORKDIR /app

COPY package.json ./
COPY bun.lock ./

RUN bun install

COPY src ./

RUN bun run build
