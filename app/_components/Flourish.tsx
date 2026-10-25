// The small ink flourish under page titles. Color comes from CSS (currentColor).
export default function Flourish({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 190 20" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M26 10C60 14 130 14 164 10" />
      <path d="M26 10C18 4 8 6 9 12C10 17 17 16 16 12C15 9 12 10 12 12" />
      <path d="M164 10C172 4 182 6 181 12C180 17 173 16 174 12C175 9 178 10 178 12" />
      <path d="M95 7L99 11L95 15L91 11Z" fill="currentColor" />
    </svg>
  );
}
