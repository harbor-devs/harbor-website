"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { diaryPages } from "../_lib/pages";

export default function PageTurner() {
  const pathname = usePathname();
  const router = useRouter();
  const index = diaryPages.findIndex((page) => page.href === pathname);

  useEffect(() => {
    if (index === -1) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      const target = event.target as HTMLElement;
      const tag = target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === "ArrowRight") {
        const next = diaryPages[index + 1];
        if (next) router.push(next.href);
      }

      if (event.key === "ArrowLeft") {
        const previous = diaryPages[index - 1];
        if (previous) router.push(previous.href);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, router]);

  if (index === -1) return null;

  const previous = diaryPages[index - 1];
  const next = diaryPages[index + 1];

  return (
    <nav aria-label="Page turner" className="flex justify-between p-4">
      {previous ? (
        <Link href={previous.href}>Previous: {previous.label}</Link>
      ) : (
        <span />
      )}
      <span>
        Page {index + 1} of {diaryPages.length}
      </span>
      {next ? <Link href={next.href}>Next: {next.label}</Link> : <span />}
    </nav>
  );
}