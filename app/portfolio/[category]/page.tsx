import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Board from "../../_components/Board";
import { CATEGORIES } from "../../_lib/portfolio";
import { ITEMS } from "../../_lib/portfolioItems";

// The whole board depends on the category in the URL, so there is no shared
// shell to prefetch. The boards are still built ahead of time below.
export const instant = false;

// Builds the category boards ahead of time
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

function findCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[category]">): Promise<Metadata> {
  const { category } = await params;
  return { title: findCategory(category)?.title ?? "Portfolio" };
}

// Any category that isn't in the list shows a 404
export default async function Page({ params }: PageProps<"/portfolio/[category]">) {
  const { category } = await params;
  const found = findCategory(category);
  if (!found) notFound();

  return <Board category={found} items={ITEMS[found.slug]} />;
}