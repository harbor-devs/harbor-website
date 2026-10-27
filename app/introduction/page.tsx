import ChapterShell from "../_components/ChapterShell";
import { introduction } from "../_chapters/Introduction";

export default function IntroductionPage() {
  return <ChapterShell slug="introduction" {...introduction} />;
}