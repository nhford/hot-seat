import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface Props {
  children: ReactNode;
  className?: string;
  label?: string;
}

export default function ScrollHintStrip({
  children,
  className = "",
  label = "Scroll for more",
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateHints = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const hasOverflow = maxScroll > 1;

    setCanScrollLeft(hasOverflow && scrollLeft > 1);
    setCanScrollRight(hasOverflow && scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateHints();

    const onScroll = () => updateHints();
    el.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(updateHints);
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(updateHints);
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateHints]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollerRef}
        className="flex w-full overflow-x-auto gap-2 px-1"
        aria-label={label}
      >
        {children}
      </div>

      {/* Edge fades */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-neutral-800 to-transparent transition-opacity ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-neutral-800 to-transparent transition-opacity ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Chevron hints */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-0.5 text-white/70 transition-opacity ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
      >
        ‹
      </div>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-0.5 text-white/70 transition-opacity ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      >
        ›
      </div>
    </div>
  );
}
