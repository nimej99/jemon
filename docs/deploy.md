# jemon Deployment Guide

This guide covers building multiarch Docker images, deploying via Helm, and producing offline air-gap bundles.

---

## Prerequisites

| Tool | Min version | Notes |
|---|---|---|
| Docker | 24.x | with BuildKit |
| docker buildx | bundled | multiarch builder required |
| pnpm | 9.15.9 | `corepack prepare pnpm@9.15.9 --activate` |
| helm | 3.14+ | |
| kubectl | 1.28+ | for Helm deploy |

---

## 1. Multiarch Docker Images

### Create a buildx builder (once per machine)

```bash
docker buildx create --name jemon-builder --use
docker buildx inspect --bootstrap
```

### Build and push both images (amd64 + arm64)

```bash
# From repo root
docker buildx bake \
  -f infra/docker/docker-bake.hcl \
  --set "*.tags=ghcr.io/nimej99/jemon-api:0.5.0" \
  --push
```

Or build everything at once with the default group:

```bash
TAG=0.5.0 docker buildx bake -f infra/docker/docker-bake.hcl --push
```

### Verify manifest (amd64 + arm64)

```bash
docker buildx imagetools inspect ghcr.io/nimej99/jemon-api:0.5.0
docker buildx imagetools inspect ghcr.io/nimej99/jemon-web:0.5.0
```

Both should list `linux/amd64` and `linux/arm64` digests.

### Print manifest without pushing (CI dry-run)

```bash
docker buildx bake -f infra/docker/docker-bake.hcl --print
```

---

## 2. Helm Deploy

### Lint and template validation

```bash
helm lint infra/helm/
helm template jemon infra/helm/ | head -80
```

### Install / upgrade

```bash
# Install
helm install jemon infra/helm/ \
  --set image.tag=0.5.0 \
  --create-namespace \
  --namespace jemon

# Upgrade
helm upgrade jemon infra/helm/ \
  --set image.tag=0.5.1 \
  --namespace jemon
```

### Override values per environment

```bash
helm upgrade jemon infra/helm/ -f values-prod.yaml --namespace jemon
```

### Port-forward for local access

```bash
kubectl port-forward svc/jemon-web          3000:3000 -n jemon &
kubectl port-forward svc/jemon-api          3001:3001 -n jemon &
kubectl port-forward svc/jemon-victoriametrics 8428:8428 -n jemon &
```

---

## 3. Offline / Air-gap Bundle

Produces OCI image tarballs + Helm chart package in `bundle/`:

```bash
./scripts/offline-bundle.sh 0.5.0
```

Output structure:
```
bundle/
  images/
    jemon-api-0.5.0.tar    # OCI layout, amd64+arm64
    jemon-web-0.5.0.tar    # OCI layout, amd64+arm64
  charts/
    jemon-0.5.0.tgz        # helm package
  bundle.sha256            # SHA-256 checksums
```

### Load on air-gapped node

```bash
# Copy bundle/ to target host, then:
for f in bundle/images/*.tar; do docker load -i "$f"; done
helm install jemon bundle/charts/jemon-0.5.0.tgz --namespace jemon --create-namespace
```

---

## 4. Services Overview

| Service | Port | Description |
|---|---|---|
| `jemon-web` | 3000 | Next.js dashboard (standalone) |
| `jemon-api` | 3001 | Fastify REST API |
| `jemon-victoriametrics` | 8428 | Time-series DB + query engine |
| `jemon-valkey` | 6379 | Redis-compatible cache |

---

## 5. Environment Variables

Key values configured via Helm `values.yaml` and surfaced in the `jemon-config` ConfigMap:

| Key | Default | Description |
|---|---|---|
| `VICTORIAMETRICS_URL` | `http://jemon-victoriametrics:8428` | VM write/query endpoint |
| `VALKEY_URL` | `redis://jemon-valkey:6379` | Cache endpoint |
| `NEXT_PUBLIC_API_URL` | `http://jemon-api:3001` | Browser-visible API base |

Override in `values.yaml`:
```yaml
web:
  env:
    NEXT_PUBLIC_API_URL: "https://api.example.com"
```
