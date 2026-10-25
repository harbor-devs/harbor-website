import ChapterShell from "../_components/ChapterShell";

export default function IntroductionPage() {
  return (
    <ChapterShell
      slug="introduction"
      left={<p>Left page test</p>}
      right={<p>Right page test</p>}
      phone={<p>Phone page test</p>}
    />
  );
}