// Small inline icons. They use currentColor, so they match the text color.
// All are decorative (aria-hidden): the link text next to them says what they do.

export function ArrowLeft() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <path d="M19 12H6M11 6l-6 6 6 6" />
    </svg>
  );
}

export function ArrowRight() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export function Diamond() {
  return (
    <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10">
      <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor" />
    </svg>
  );
}

export function MenuLines() {
  return (
    <svg aria-hidden="true" width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M0 1H20M0 7H20M0 13H20" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4L16 16M16 4L4 16" />
    </svg>
  );
}