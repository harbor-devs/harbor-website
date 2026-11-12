import type { Metadata } from "next";
import { EB_Garamond, IM_Fell_English } from "next/font/google";
import { preload } from "react-dom";
import PreloadTextures from "./_components/PreloadTextures";
import "./globals.css";

// Body text font
const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Headings font (only comes in weight 400)
const fell = IM_Fell_English({
  variable: "--font-fell",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

// Tab title, search description and link previews (WhatsApp, LinkedIn, X).
// The tab icon and preview picture are the files app/icon.png, app/apple-icon.png,
// app/favicon.ico and app/opengraph-image.png (Next.js picks them up by name).
export const metadata: Metadata = {
  // The live address, so previews can find the picture
  metadataBase: new URL("https://harbordevs.com"),
  title: { default: "Harbor", template: "%s · Harbor" },
  description:
    "The working notebook of Abdullah Saghir. Websites, web apps and small tools, made with care.",
  openGraph: {
    siteName: "Harbor",
    type: "website",
    locale: "en_US",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // The cover picture is a CSS background, which browsers find late.
  // This tells the browser to fetch it first, in the page's very first lines.
  preload("/textures/cover.webp", { as: "image", fetchPriority: "high" });

  return (
    <html
      lang="en"
      className={`${garamond.variable} ${fell.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">
        {children}
        <PreloadTextures />
      </body>
    </html>
  );
}