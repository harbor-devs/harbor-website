// page-flip ships no TypeScript types, so these describe only the parts
// app/_components/FlipBook.tsx uses. Checked against page-flip 2.0.7's source.
declare module "page-flip" {
  export type FlipState = "user_fold" | "fold_corner" | "flipping" | "read";
  export type FlipCorner = "top" | "bottom";

  export type FlipSettings = {
    startPage: number;
    size: "fixed" | "stretch";
    width: number; // one page
    height: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    drawShadow: boolean;
    flippingTime: number; // ms for one turn
    usePortrait: boolean;
    startZIndex: number;
    autoSize: boolean;
    maxShadowOpacity: number;
    showCover: boolean;
    mobileScrollSupport: boolean;
    clickEventForward: boolean;
    useMouseEvents: boolean;
    swipeDistance: number;
    showPageCorners: boolean;
    disableFlipByClick: boolean;
  };

  export type FlipEvent<T> = { data: T; object: PageFlip };

  export class PageFlip {
    constructor(root: HTMLElement, settings: Partial<FlipSettings>);
    loadFromHTML(items: HTMLElement[]): void;
    flipNext(corner?: FlipCorner): void;
    flipPrev(corner?: FlipCorner): void;
    turnToPage(page: number): void; // no animation
    getCurrentPageIndex(): number;
    getState(): FlipState;
    getSettings(): FlipSettings; // the live settings object
    clear(): void; // puts the page elements back in root
    getUI(): { destroy(): void };
        // The part that bends pages. showCorner and isPointOnCorners are private
    // in the library; FlipBook uses them only to stop the hover fold following the mouse.
    getFlipController(): {
      getState(): FlipState;
      showCorner: (pos: { x: number; y: number }) => void;
      isPointOnCorners(pos: { x: number; y: number }): boolean;
    };
    // "render" is private in the library. We only use it to silence the
    // drawing loop when the book unmounts (the library has no stop).
    getRender(): { render: (timer: number) => void };
    on(event: "changeState", callback: (e: FlipEvent<FlipState>) => void): PageFlip;
    on(event: "flip", callback: (e: FlipEvent<number>) => void): PageFlip;
    off(event: "changeState" | "flip"): void;
  }
}