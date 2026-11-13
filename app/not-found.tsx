import type { Metadata } from "next";
import Link from "next/link";

// Shown for any link that doesn't exist.
// The static export turns this into 404.html, which Cloudflare Pages serves automatically.

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm -rotate-1 bg-paper px-8 py-10 text-center shadow-[var(--shadow-haze-page),var(--shadow-lift)]">
        <p className="text-sm tracking-[0.3em] text-brass">404</p>
        <h1 className="mt-3 text-4xl text-ink">Page not found</h1>
        <div className="mx-auto my-5 h-px w-24 bg-hairline" />
        <p className="text-ink-soft">Sorry, this page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block text-madder underline decoration-hairline underline-offset-4 hover:decoration-madder"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}