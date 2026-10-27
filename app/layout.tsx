import type { Metadata } from "next";
import { EB_Garamond, IM_Fell_English } from "next/font/google";
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

export const metadata: Metadata = {
    title: { default: "Harbor", template: "%s · Harbor" },
  description: "Harbor, by Abdullah Saghir.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${garamond.variable} ${fell.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}