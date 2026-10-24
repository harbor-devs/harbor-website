import type { Metadata } from "next";
import { EB_Garamond, IM_Fell_English } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import PageTurner from "./_components/PageTurner";

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
  title: "Harbor",
  description: "Harbor, by Abdullah Saghir.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${garamond.variable} ${fell.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header>
          <nav aria-label="Main" className="flex items-center gap-6 p-4">
            <Link href="/">Harbor</Link>
            <ul className="flex gap-4">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/portfolio">Portfolio</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
        </header>
        {children}
        <PageTurner />
      </body>
    </html>
  );
}