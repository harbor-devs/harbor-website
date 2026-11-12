import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Dev only: lets my phone (on the laptop's network IP) load the dev scripts.
  // Hostname only, no http:// or port. Update it if the IP changes.
  allowedDevOrigins: ["10.148.210.50", "10.195.221.50"],
};

export default nextConfig;