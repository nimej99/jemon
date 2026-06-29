/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output: bundles server + minimal node_modules for Docker.
  // Produces .next/standalone — see infra/docker/Dockerfile.web.
  output: "standalone",

  // Transpile local workspace packages so Next.js can process their source JSX/TSX
  transpilePackages: ["@jemon/ui", "@jemon/metric-sdk"],
};

export default nextConfig;
