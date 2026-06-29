# Operations Guide

Runbook for deploying, operating, and troubleshooting jemon.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 20 |
| pnpm | 9.15.9 (enforced via `packageManager` field) |
| Docker | ≥ 24 |
| Docker Compose | ≥ 2.20 |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `CRED_KEY` | **Yes** | — | Passphrase for AES-256-GCM device credential encryption. Use a random string of ≥ 32 chars. Never commit this. |
| `PORT` | No | `3000` | API server listen port. |
| `VM_URL` | No | `http://localhost:8428` | VictoriaMetrics base URL used by the API `/metrics/query` proxy. |

---

## Infrastructure Stack

All infrastructure runs via Docker Compose:

```bash
docker compose -f infra/compose/docker-compose.yml up -d
```

| Service | Image | Port | Description |
|---|---|---|---|
| `victoriametrics` | `victoriametrics/victoria-metrics:v1.111.0` | 8428 | Time-series storage (30-day retention) |
| `valkey` | `valkey/valkey:8-alpine` | 6379 | Redis-compatible cache / session store |
| `snmpd-test` | `whyit/snmpd_test` | — | Test SNMP agent for local development |

### Verify the stack is healthy

```bash
# VictoriaMetrics health
curl http://localhost:8428/health

# Query metric count
curl "http://localhost:8428/api/v1/query?query=count(%7B__name__%21%3D%22%22%7D)"

# Valkey ping
docker exec jemon-valkey redis-cli ping
```

---

## API Service

### Start (development)

```bash
CRED_KEY=your-secret-key pnpm --filter @jemon/api start
```

### Start (production build)

```bash
pnpm --filter @jemon/api build
CRED_KEY=your-secret-key node services/api/dist/index.js
```

### Health check

```bash
curl http://localhost:3000/healthz
# → {"status":"ok"}
```

### API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/healthz` | Liveness probe — returns `{"status":"ok"}` |
| `GET` | `/catalog` | All 46 catalog entries |
| `GET` | `/catalog?domain=<domain>` | Entries for a specific domain |
| `GET` | `/devices` | Device inventory (credentials masked as `***`) |
| `POST` | `/devices` | Add or replace a device (AES-GCM encrypts credentials) |
| `GET` | `/metrics/query?query=<promql>` | Proxy a PromQL instant query to VictoriaMetrics |

### POST /devices payload schema

```json
{
  "id":     "switch-01",
  "name":   "Core Switch",
  "siteId": "site-hq",
  "ip":     "10.0.0.1",
  "snmp": {
    "version": "v2c",
    "community": "public"
  }
}
```

For SNMPv3:

```json
{
  "id":     "router-01",
  "name":   "Edge Router",
  "siteId": "site-hq",
  "ip":     "10.0.1.1",
  "snmp": {
    "version": "v3",
    "v3": {
      "user":      "admin",
      "authProto": "SHA",
      "authKey":   "authpassword",
      "privProto": "AES",
      "privKey":   "privpassword"
    }
  }
}
```

### Device store

Devices are persisted as AES-256-GCM ciphertext in `services/api/data/devices.json`.
The key is derived from `CRED_KEY` via scrypt. **If `CRED_KEY` changes, all stored
credentials become unreadable — back up the old key before rotating.**

---

## Dashboard (web)

### Start (development)

```bash
pnpm --filter @jemon/web dev
# → http://localhost:3000
```

### Production build and serve

```bash
pnpm --filter @jemon/web build
pnpm --filter @jemon/web start --port 3100
```

---

## Running Tests

### Unit tests (all packages)

```bash
pnpm run test
```

### E2e tests (API inject + catalog cross-check + Playwright dashboard smoke)

```bash
# Requires a production build to be present
pnpm run build
pnpm run test:e2e
```

The `test:e2e` script runs in two phases:

1. **Node.js tests** (`--experimental-strip-types --test`):
   - `tests/api.e2e.ts` — Fastify inject tests for all API routes
   - `tests/catalog.cross-check.ts` — Validates all 46 catalog entries

2. **Playwright tests** (`playwright test`):
   - `tests/dashboard.smoke.ts` — Starts the Next.js production server on `:3100` and verifies `/dashboard` renders

### License check

```bash
pnpm run check:licenses
```

Fails on any dependency outside the allowlist (MIT, Apache-2.0, BSD-*, ISC, MPL-2.0, CC0-1.0, Unlicense, 0BSD, Python-2.0, BlueOak-1.0.0).

---

## Log and Metric Collection

### vmagent

vmagent configuration lives in `collectors/vmagent/`. It scrapes:

- `snmp_exporter` at the configured scrape target list
- Application exporters as defined in the scrape config

vmagent writes to VictoriaMetrics via `remoteWrite`.

### snmp_exporter

Configuration in `collectors/snmp_exporter/`. Maps OIDs to metric names using
the MIB modules defined per domain.

### Generating scrape targets from inventory

The API includes a `configgen` module that produces vmagent-compatible YAML
scrape targets from the `/devices` inventory:

```bash
node services/api/dist/configgen.js > collectors/vmagent/targets.yml
```

---

## Troubleshooting

### VictoriaMetrics returns no metrics

1. Check vmagent is running: `docker ps | grep vmagent` (add to compose if missing).
2. Check scrape targets: `curl http://localhost:8429/targets` (vmagent UI).
3. Confirm snmp_exporter can reach the device: `curl "http://localhost:9116/snmp?target=10.0.0.1&module=if_mib"`.

### API returns 502 on `/metrics/query`

VictoriaMetrics is unreachable. Check `VM_URL` env and that the container is running.

### `GET /devices` returns 500

The `CRED_KEY` used to start the API does not match the key used when devices
were last saved. The AES-GCM tag verification fails. Options:

1. Set `CRED_KEY` back to the original value.
2. Or reset the store: `echo '[]' > services/api/data/devices.json` and re-add
   devices via `POST /devices`.

### Next.js build fails: "Package path . is not exported from @jemon/ui"

This occurs if `packages/ui/dist/` is not built or the `exports` map does not
include a `"default"` condition. Run `pnpm run build` to rebuild, or ensure
`packages/ui/package.json` exports include:

```json
".": {
  "types":   "./dist/index.d.ts",
  "import":  "./dist/index.js",
  "default": "./dist/index.js"
}
```

---

## Security Notes

- **Never commit `CRED_KEY`** to version control. Use an environment variable or secret manager.
- The API does not implement authentication or RBAC in the current phase. Do not expose it to untrusted networks without a reverse proxy / gateway.
- All SNMP credentials are encrypted at rest (AES-256-GCM) and masked (`***`) in API responses.
- SNMPv3 authKey and privKey are also masked in responses.
