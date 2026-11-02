import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Board from "../../_components/Board";
import { CATEGORIES } from "../../_lib/portfolio";
import { ITEMS } from "../../_lib/portfolioItems";


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

export default async function Page({ params }: PageProps<"/portfolio/[category]">) {
  const { category } = await params;
  const found = findCategory(category);
  if (!found) notFound();

  return <Board category={found} items={ITEMS[found.slug]} />;
}