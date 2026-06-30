# jemon

License-clean unified monitoring platform for Korean enterprise NMS/SIEM.

Standardizes 10-domain metrics and KPIs into a typed catalog, links collection
(SNMP/exporter) → time-series storage (VictoriaMetrics) → TypeScript API →
Next.js visualization, and layers a Claude Code design-set agent that generates
reference-grade dashboards from requirements and topology images.

## Stack (all commercially license-clean)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, ECharts (Apache-2.0), uPlot |
| 3-D / diagrams | react-three-fiber + three + drei (MIT) for the campus scene; inline SVG for rack elevation |
| API | Fastify 5, TypeScript (ESM), Zod |
| Auth | @fastify/jwt + bcryptjs (Bearer JWT, single-org RBAC) |
| Time-series | VictoriaMetrics OSS — raw (30 d) + rollup (365 d) via vmagent OSS stream-aggregation |
| Alerting | vmalert → Alertmanager (Apache-2.0) |
| Cache / session | Valkey (Redis-compatible) |
| Collection | snmp_exporter (if_mib + host_resources), vmagent |
| Deploy | Docker Compose, Kubernetes / Helm |

> **Avoided**: Grafana (AGPL), Highcharts/amCharts (commercial), Mapbox GL v2+ (proprietary),
> LibreNMS (GPLv3), Elasticsearch/Kibana (SSPL), VictoriaMetrics Enterprise-only features.
> Run `pnpm run check:licenses` to enforce the allowlist.

## Repository Layout

```
apps/web              Next.js dashboard — routes: /login /dashboard /campus /racks
packages/catalog      10-domain metric/KPI catalog (Zod schema + data, 46 entries)
packages/metric-sdk   Typed query/KPI client (useKpi / useMetric / useAlerts)
packages/ui           Design system — charts, primitives, @jemon/ui/scenes (3-D campus), @jemon/ui/rack (2-D elevation)
services/api          Fastify API: /healthz /auth/* /catalog /devices /metrics/* /alerts
collectors/           snmp_exporter (if_mib + host_resources), vmagent scrape + stream-agg, vmalert rules, alertmanager
infra/compose         Docker Compose stack (9 services)
infra/docker          Dockerfiles + multi-arch bake
infra/helm            Helm chart
scripts/              license classifier, scale-test (2000-device synthetic load)
.claude/              Claude Code design-set agent scaffolding
tests/                E2e suite (API inject + catalog cross-check + Playwright)
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
```

| Service | Port | Purpose |
|---|---|---|
| victoriametrics | 8428 | raw metrics (30 d retention) |
| victoriametrics-rollup | 8429 | rollup metrics (365 d, stream-aggregated) |
| snmp-exporter | 9116 | interface MIB (if_mib) |
| snmp-exporter-host | 9117 | host-resources (CPU/mem/disk) |
| snmpd-test | — | demo SNMP agent (auto-scraped) |
| vmagent | — | scrape → both VM instances |
| vmalert | 8880 | alert rule evaluation → Alertmanager |
| alertmanager | 9093 | alert delivery (configure receiver) |
| valkey | 6379 | cache / session |

### 4. Start the API server (development)

```bash
pnpm --filter @jemon/api build   # `start` runs dist/, so build first
CRED_KEY=your-secret-key-min-16-chars VM_URL=http://localhost:8428 PORT=8080 \
  NODE_ENV=development pnpm --filter @jemon/api start
# API on http://localhost:8080
```

### 5. Start the dashboard (development)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080 pnpm --filter @jemon/web dev
# Open http://localhost:3000/login
```

### 6. Log in

Default seeded admin (development): **`admin` / `admin1234`**.
Override with `ADMIN_USER` / `ADMIN_PASSWORD` (required in non-development).

### 7. Run e2e tests / scale test

```bash
pnpm run build
pnpm run test:e2e
# Scale validation (needs a VictoriaMetrics on :8428):
DEVICE_COUNT=2000 node scripts/scale-test.mjs
```

## Web routes

| Route | Description |
|---|---|
| `/login` | Username/password login (Bearer JWT, stored client-side) |
| `/dashboard` | Network + Server live metrics (bandwidth, interface status, CPU, memory, top devices, alerts) |
| `/campus` | 3-D isometric campus topology (per-building CPU/mem/traffic/temp) |
| `/racks` | 2-D rack elevation (실장도) with per-unit status |

All app routes except `/login` are gated by a client-side `AuthGate`.

## Authentication & RBAC

Single-org auth using Bearer JWT (cross-origin friendly; no cookies).

- `POST /auth/login` → `{ token, user }`; `GET /auth/me`; `POST /auth/logout`.
- Roles: `admin`, `operator`, `viewer`. **Mutations** (e.g. `POST /devices`) require
  `admin`/`operator` via `requireRole`. **Read** endpoints (`/metrics/*`, `/catalog`,
  `GET /devices`) are currently public so the dashboard SDK works without per-request
  auth wiring — this is a known scope boundary; full read-gating is a follow-up.
- Env: `AUTH_SECRET` (falls back to `CRED_KEY`), `ADMIN_USER`, `ADMIN_PASSWORD`.

## Alerting

`vmalert` evaluates `collectors/vmalert/rules.yml` and pushes firing alerts to
Alertmanager (`-notifier.url`, replaces the previous blackhole). Configure a real
receiver (email / webhook / Slack) in `collectors/alertmanager/config.yml`
(compose) or the `alertmanager` ConfigMap (Helm). Alerts are queryable at
`http://localhost:9093/api/v2/alerts` and surfaced in the dashboard.

## Server (host) metrics

`snmp-exporter-host` walks HOST-RESOURCES-MIB + UCD-SNMP-MIB
(`collectors/snmp_exporter/snmp-host.yml`): `hrProcessorLoad`, `hrMemorySize`,
`hrStorageUsed/Size`, `ssCpuIdle`, `memTotalReal/memAvailReal`, `laLoadInt`.
The `snmp_host_mib` scrape job feeds these into VictoriaMetrics; the dashboard
SERVER/HOST section renders CPU / memory / top-devices from them.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser  apps/web (Next.js)                                   │
│  /login → JWT → /dashboard /campus (R3F) /racks (SVG)         │
│  packages/ui (ECharts / uPlot / three) · metric-sdk           │
└──────────────────┬───────────────────────────────────────────┘
                   │ HTTP (Bearer on auth/mutations)
┌──────────────────▼───────────────────────────────────────────┐
│  services/api (Fastify)                                        │
│  ├── POST /auth/login|logout  GET /auth/me   (JWT + bcrypt)    │
│  ├── GET /catalog[?domain=…]            ← packages/catalog     │
│  ├── GET|POST /devices  (POST gated; AES-256-GCM store)        │
│  ├── GET /metrics/query[_range]         ← VictoriaMetrics      │
│  └── GET /alerts                        ← vmalert              │
└──────────────────┬───────────────────────────────────────────┘
                   │ PromQL
┌──────────────────▼───────────────────────────────────────────┐
│  VictoriaMetrics :8428 (raw 30d) + :8429 (rollup 365d)        │
│  ← vmagent scrapes snmp_exporter (if_mib) + snmp-exporter-host │
│    (host_resources); stream-aggregation builds rollups (OSS)   │
│  vmalert :8880 → Alertmanager :9093                            │
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

The catalog contains **46 entries** across 10 domains. See `docs/metrics-catalog.md`.

### Credential encryption

SNMP community strings and SNMPv3 keys are encrypted at rest with AES-256-GCM
using a key derived from `CRED_KEY` via scrypt. Credentials are never exposed
through the API — `GET /devices` returns `***` for sensitive fields.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `CRED_KEY` | Yes | AES-256-GCM device-credential passphrase (min 16 chars) |
| `AUTH_SECRET` | No | JWT signing secret (falls back to `CRED_KEY`) |
| `ADMIN_USER` | No | Seeded admin username (default `admin`) |
| `ADMIN_PASSWORD` | Prod | Seeded admin password (dev default `admin1234`; required in non-development) |
| `PORT` | No | API listen port |
| `VM_URL` | No | VictoriaMetrics base URL (default `http://localhost:8428`) |

## License

MIT — see [LICENSE](LICENSE).
All dependencies are commercial-use-clean (MIT / Apache-2.0 / BSD / ISC / MPL-2.0).
