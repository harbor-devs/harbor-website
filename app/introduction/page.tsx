import BookSpread from "../_components/BookSpread";
import PhonePage from "../_components/PhonePage";

export default function IntroductionPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Laptop and up: two-page spread */}
      <div className="hidden flex-1 flex-col book:flex">
        <BookSpread
          left={<p>Left page test</p>}
          right={<p>Right page test</p>}
        />
      </div>

      {/* Below 900px: single phone page */}
      <div className="flex flex-1 flex-col book:hidden">
        <PhonePage chapter="intro">
          <p>Phone page test</p>
        </PhonePage>
      </div>
    </main>
  );
}