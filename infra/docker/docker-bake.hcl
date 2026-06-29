// Multiarch build: docker buildx bake -f infra/docker/docker-bake.hcl
// Requires: docker buildx create --use (or existing multi-platform builder)

variable "REGISTRY" { default = "ghcr.io/nimej99" }
variable "TAG"      { default = "dev" }

group "default" { targets = ["api", "web"] }

target "api" {
  context    = "../.."
  dockerfile = "infra/docker/Dockerfile.api"
  platforms  = ["linux/amd64", "linux/arm64"]
  tags       = ["${REGISTRY}/jemon-api:${TAG}"]
  cache-from = ["type=registry,ref=${REGISTRY}/jemon-api:cache"]
  cache-to   = ["type=registry,ref=${REGISTRY}/jemon-api:cache,mode=max"]
}

target "web" {
  context    = "../.."
  dockerfile = "infra/docker/Dockerfile.web"
  platforms  = ["linux/amd64", "linux/arm64"]
  tags       = ["${REGISTRY}/jemon-web:${TAG}"]
  cache-from = ["type=registry,ref=${REGISTRY}/jemon-web:cache"]
  cache-to   = ["type=registry,ref=${REGISTRY}/jemon-web:cache,mode=max"]
}
