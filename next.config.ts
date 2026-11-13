import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build the site as plain files (HTML, CSS, JS) into the "out" folder,
  // so any free static host (Cloudflare) can serve it. No server needed.
  output: "export",
  // Plain files have no image server, so images are used as they are
  images: { unoptimized: true },
  // Dev only: lets my phone (on the laptop's network IP) load the dev scripts.
  // Hostname only, no http:// or port. Update it if the IP changes.
  allowedDevOrigins: ["10.148.210.50", "10.195.221.50"],
};

export default nextConfig;