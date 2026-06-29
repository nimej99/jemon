# jemon

License-clean unified monitoring platform for Korean enterprise NMS/SIEM.

Standardizes 10-domain metrics and KPIs into a typed catalog, links collection
(SNMP/exporter) → time-series storage (VictoriaMetrics) → TypeScript API →
Next.js visualization, and layers a Claude Code design-set agent that generates
reference-grade dashboards from requirements and topology images.

## Stack (all commercially license-clean)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui, ECharts (Apache-2.0), uPlot |
| API | Fastify 5, TypeScript (ESM), Zod |
| Time-series | VictoriaMetrics OSS |
| Cache / session | Valkey (Redis-compatible) |
| Collection | snmp_exporter, vmagent |
| Deploy | Docker Compose, Kubernetes / Helm |

> **Avoided**: Grafana (AGPL), Highcharts/amCharts (commercial), Mapbox GL v2+ (proprietary),
> LibreNMS (GPLv3), Elasticsearch/Kibana (SSPL), VictoriaMetrics Enterprise-only features.
> Run `pnpm run check:licenses` to enforce the allowlist.

## Repository Layout

```
apps/web              Next.js dashboard (Tailwind + ECharts)
packages/catalog      10-domain metric/KPI catalog (Zod schema + data)
packages/metric-sdk   Typed query/KPI client
packages/ui           Design-system — chart, gauge, stat, rack, 3-D components
services/api          Fastify API: /healthz /catalog /devices /metrics/query
collectors/           snmp_exporter + vmagent configuration
infra/compose         Docker Compose stack
infra/docker          Dockerfiles
infra/helm            Helm chart skeleton
.claude/              Claude Code design-set agent scaffolding
tests/                E2e test suite (API inject + catalog cross-check + Playwright)
docs/                 Metrics catalog reference, operations guide
```

## Quickstart

### 1. Install dependencies

```bash
# Requires Node ≥20, pnpm 9.15.9
corepack prepare pnpm@9.15.9 --activate
pnpm install
```

### 2. Build all packages

```bash
pnpm run build
```

### 3. Start the infrastructure stack

```bash
docker compose -f infra/compose/docker-compose.yml up -d
# Services: VictoriaMetrics :8428, Valkey :6379, snmpd-test (SNMP agent)
```

### 4. Start the API server (development)

```bash
CRED_KEY=your-secret-key-min-16-chars pnpm --filter @jemon/api start
# API runs on :3000 by default
```

### 5. Start the dashboard (development)

```bash
pnpm --filter @jemon/web dev
# Opens on http://localhost:3000  (or :3001 if API is on :3000)
```

### 6. Run e2e tests

```bash
# Builds all packages first if not done yet
pnpm run build

# Run all e2e tests: API inject + catalog cross-check + Playwright dashboard smoke
pnpm run test:e2e
```

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser                                                       │
│  apps/web (Next.js)  →  packages/ui (ECharts / uPlot / R3F)  │
└──────────────────┬───────────────────────────────────────────┘
                   │ HTTP
┌──────────────────▼───────────────────────────────────────────┐
│  services/api (Fastify)                                        │
│  ├── GET /healthz                                              │
│  ├── GET /catalog[?domain=…]   ← packages/catalog             │
│  ├── GET|POST /devices          (AES-256-GCM encrypted store)  │
│  └── GET /metrics/query         ← proxy to VictoriaMetrics     │
└──────────────────┬───────────────────────────────────────────┘
                   │ PromQL
┌──────────────────▼───────────────────────────────────────────┐
│  VictoriaMetrics :8428                                         │
│  ← vmagent scrapes snmp_exporter / application exporters       │
│  ← snmp_exporter polls devices in services/api inventory       │
└──────────────────────────────────────────────────────────────┘
```

### packages/catalog

Single source of truth for all metrics. Each entry carries:

- **key** — dot-separated identifier (e.g. `net.ifHCInOctets`)
- **domain** — one of 10 domains (see `docs/metrics-catalog.md`)
- **source** — `snmp` (OID), `exporter` (PromQL metric), or `log`
- **agg** — aggregation function (`avg`, `sum`, `max`, `min`, `rate`, `last`)
- **kpi** — optional PromQL expression with warn/crit thresholds
- **panel** — default visualization type

The catalog contains **46 entries** across 10 domains. See `docs/metrics-catalog.md` for the full reference.

### Data flow

1. `vmagent` reads device targets from the API `/devices` endpoint (via `configgen`).
2. `snmp_exporter` polls each device using generated SNMP configs.
3. Metrics are ingested into VictoriaMetrics.
4. The Next.js dashboard queries VictoriaMetrics via the API proxy.

### Credential encryption

SNMP community strings and SNMPv3 keys are encrypted at rest with AES-256-GCM
using a key derived from the `CRED_KEY` environment variable via scrypt.
Credentials are never exposed through the API — `GET /devices` returns `***`
for any sensitive field.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `CRED_KEY` | Yes | Passphrase for AES-256-GCM device credential encryption (min 16 chars) |
| `PORT` | No | API listen port (default `3000`) |
| `VM_URL` | No | VictoriaMetrics base URL (default `http://localhost:8428`) |

## License

MIT — see [LICENSE](LICENSE).  
All dependencies are commercial-use-clean (MIT / Apache-2.0 / BSD / ISC / MPL-2.0).
