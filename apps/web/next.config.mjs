/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile local workspace packages so Next.js can process their source JSX/TSX
  transpilePackages: ["@jemon/ui", "@jemon/metric-sdk"],
};

export default nextConfig;
