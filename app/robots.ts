import type { MetadataRoute } from "next";

// Makes /robots.txt: lets search engines read every page and tells them where the sitemap is.
// force-static so it works with the static export (Cloudflare Pages).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://harbordevs.com/sitemap.xml",
  };
}