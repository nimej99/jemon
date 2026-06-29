#!/usr/bin/env bash
# offline-bundle.sh — produce a self-contained air-gap bundle:
#   bundle/images/*.tar   docker-save archives (amd64 + arm64 manifests)
#   bundle/charts/*.tgz   helm package of infra/helm
#   bundle/bundle.sha256  checksums
#
# Usage:
#   ./scripts/offline-bundle.sh [TAG]
#
# Prerequisites:
#   - docker with buildx + multi-platform builder (docker buildx create --use)
#   - helm 3.x
#   - enough disk space (~2 GB for both images)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TAG="${1:-dev}"
REGISTRY="${REGISTRY:-ghcr.io/nimej99}"
BUNDLE_DIR="${REPO_ROOT}/bundle"
IMAGES_DIR="${BUNDLE_DIR}/images"
CHARTS_DIR="${BUNDLE_DIR}/charts"

echo "==> jemon offline-bundle TAG=${TAG}"

# ── 1. Clean previous bundle ──────────────────────────────────────────────────
rm -rf "${BUNDLE_DIR}"
mkdir -p "${IMAGES_DIR}" "${CHARTS_DIR}"

# ── 2. Build + export multiarch images ───────────────────────────────────────
# docker buildx --output type=docker,dest=... does not support multi-platform
# to a single tarball; we build and export each platform separately, then
# combine them into a manifest-list-compatible archive structure.
for SERVICE in api web; do
  IMAGE="${REGISTRY}/jemon-${SERVICE}:${TAG}"
  TARFILE="${IMAGES_DIR}/jemon-${SERVICE}-${TAG}.tar"

  echo "--> Building jemon-${SERVICE} (linux/amd64 + linux/arm64) ..."
  docker buildx build \
    --file "${REPO_ROOT}/infra/docker/Dockerfile.${SERVICE}" \
    --platform linux/amd64,linux/arm64 \
    --tag "${IMAGE}" \
    --output "type=oci,dest=${TARFILE}" \
    "${REPO_ROOT}"

  echo "--> Saved: ${TARFILE}"
done

# ── 3. Package Helm chart ─────────────────────────────────────────────────────
echo "--> Packaging Helm chart ..."
helm package "${REPO_ROOT}/infra/helm" \
  --version "${TAG}" \
  --app-version "${TAG}" \
  --destination "${CHARTS_DIR}"

# ── 4. Generate checksums ─────────────────────────────────────────────────────
echo "--> Generating checksums ..."
(
  cd "${BUNDLE_DIR}"
  find . -type f \( -name "*.tar" -o -name "*.tgz" \) | sort | xargs shasum -a 256
) > "${BUNDLE_DIR}/bundle.sha256"

cat "${BUNDLE_DIR}/bundle.sha256"

echo ""
echo "==> Bundle ready: ${BUNDLE_DIR}"
echo "    To load images on air-gapped node:"
echo "      for f in bundle/images/*.tar; do docker load -i \"\$f\"; done"
echo "    To install chart:"
echo "      helm install jemon bundle/charts/jemon-${TAG}.tgz"
