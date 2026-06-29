// 멀티아치 빌드(P5). docker buildx bake -f infra/docker/docker-bake.hcl
variable "REGISTRY" { default = "ghcr.io/nimej99" }
variable "TAG" { default = "dev" }
group "default" { targets = ["api", "web"] }
target "api" {
  context = "../.."
  dockerfile = "infra/docker/Dockerfile.api"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = ["${REGISTRY}/jemon-api:${TAG}"]
}
target "web" {
  context = "../.."
  dockerfile = "infra/docker/Dockerfile.web"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = ["${REGISTRY}/jemon-web:${TAG}"]
}
