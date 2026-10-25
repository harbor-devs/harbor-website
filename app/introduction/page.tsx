import BookSpread from "../_components/BookSpread";

export default function IntroductionPage() {
  return (
    <main className="flex flex-1 flex-col">
      <BookSpread
        left={<p>Left page test</p>}
        right={<p>Right page test</p>}
      />
    </main>
  );
}