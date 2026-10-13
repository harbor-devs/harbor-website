"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { diaryPages } from "../_lib/pages";

export default function PageTurner() {
  const pathname = usePathname();
  const index = diaryPages.findIndex((page) => page.href === pathname);

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