# Hypersonic

[![codecov](https://codecov.io/github/pattachitra/hypersonic/graph/badge.svg?token=VLGDOVU1F2)](https://codecov.io/github/pattachitra/hypersonic)

[View Coverage Report](https://pattachitra.github.io/hypersonic/coverage/)

Build audiobooks at lightspeed! Upload your story's JSON, assign custom voices to characters, and generate/refine individual dialogue lines. Once everything sounds perfect, seamlessly merge it all into a final, full-cast audio masterpiece.

**Live:** [hypersonic.up.railway.app](https://hypersonic.up.railway.app)

## Tech Stack

- **Framework:** Next.js with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **API Layer:** tRPC (end-to-end typesafe routing)
- **Testing:** Vitest with V8 coverage
- **Linting & Formatting:** ESLint + Prettier
- **Runtime:** Node.js with pnpm
- **Deployment:** Dockerized, hosted on Railway

## Getting Started

### Prerequisites

- Node.js
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Running Tests

```bash
pnpm unit-test
```

### Build

```bash
pnpm build
```

### Docker

```bash
docker build -t hypersonic .
docker run -p 8080:8080 hypersonic
```

## Scripts

| Command           | Description                     |
| ----------------- | ------------------------------- |
| `pnpm dev`        | Start dev server with Turbopack |
| `pnpm build`      | Production build                |
| `pnpm start`      | Start production server         |
| `pnpm unit-test`  | Run tests with coverage         |
| `pnpm lint`       | Lint with ESLint                |
| `pnpm format`     | Format with Prettier            |
| `pnpm type-check` | TypeScript type checking        |

## Coverage

![Codecov Sunburst](https://codecov.io/github/pattachitra/hypersonic/graphs/sunburst.svg?token=VLGDOVU1F2)
