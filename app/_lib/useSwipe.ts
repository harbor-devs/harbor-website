"use client";

import { useRef, type DragEvent, type MouseEvent, type PointerEvent } from "react";

// Tells a click from a sideways drag (mouse or finger).
// Once the pointer moves 8px, mostly sideways and in the wanted direction,
// onSwipe gets the event and where it went down. Anything else is left alone.
// The click a mouse sends after a drag is swallowed, so a link underneath
// doesn't fire as well.
export function useSwipe(
  dir: -1 | 1, // -1 = left, 1 = right
  onSwipe: ((e: globalThis.PointerEvent, startX: number) => void) | null,
  only?: (e: PointerEvent<HTMLElement>) => boolean, // where on the element a swipe may start
) {
  // Where it went down, until we know if it's a click or a drag
  const down = useRef<{ id: number; x: number; y: number } | null>(null);
  const swiped = useRef(false);

  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      swiped.current = false;
      if (!onSwipe || (e.pointerType === "mouse" && e.button !== 0)) return;
      if (only && !only(e)) return;
      down.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      if (e.pointerType === "mouse") e.preventDefault(); // no text selection while dragging (clicks still work)
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const d = down.current;
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.hypot(dx, dy) < 8) return; // still a click
      down.current = null;
      if (Math.sign(dx) === dir && Math.abs(dx) > Math.abs(dy)) {
        swiped.current = true;
        onSwipe?.(e.nativeEvent, d.x);
      }
    },
    onPointerUp() {
      down.current = null;
    },
    onPointerCancel() {
      down.current = null;
    },
    onClickCapture(e: MouseEvent) {
      if (!swiped.current) return;
      swiped.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
    onDragStart(e: DragEvent) {
      e.preventDefault(); // a mouse drag shouldn't pick up a link or image
    },
  };
}
type Swipe = ReturnType<typeof useSwipe>;

// Two swipes on one element (the left page and the right page), both listening
export function bothSwipes(a: Swipe, b: Swipe): Swipe {
  return {
    onPointerDown(e) {
      a.onPointerDown(e);
      b.onPointerDown(e);
    },
    onPointerMove(e) {
      a.onPointerMove(e);
      b.onPointerMove(e);
    },
    onPointerUp() {
      a.onPointerUp();
      b.onPointerUp();
    },
    onPointerCancel() {
      a.onPointerCancel();
      b.onPointerCancel();
    },
    onClickCapture(e) {
      a.onClickCapture(e);
      b.onClickCapture(e);
    },
    onDragStart(e) {
      e.preventDefault();
    },
  };
}