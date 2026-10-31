import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const DRAG_START_PX = 5;
const SWIPE_THRESHOLD_PX = 50;
const WHEEL_COOLDOWN_MS = 700;

/**
 * Home page carousel. Each slide is { src, alt } plus where it leads:
 * `to` for a page on this site, `href` for an outside link.
 *
 * The banners are made about 3:1, so the frame is 3:1 (a little taller,
 * 5:2, on phones, where 3:1 looks squashed) and each banner fills
 * it edge to edge, trimming a thin strip off the sides or top and bottom
 * rather than showing empty bands.
 */
export default function HeroBanner({ data }) {
  const slides = data?.images || [];
  const [current, setCurrent] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);
  const drag = useRef({ active: false, moved: false, startX: 0 });

  const move = (step) =>
    setCurrent((prev) => (prev + step + slides.length) % slides.length);

  // Auto slide. Restarts on every change so a swipe gets a full 4s, and waits
  // while the customer is holding the banner.
  useEffect(() => {
    if (slides.length < 2 || dragging) return undefined;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000); // 4s like ecommerce banners
    return () => clearTimeout(timer);
  }, [slides.length, current, dragging]);

  // Native listener: React's onWheel is passive, and without preventDefault a
  // sideways trackpad swipe also triggers the browser's back gesture.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || slides.length < 2) return undefined;

    let total = 0;
    let lockedUntil = 0;

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();

      if (Date.now() < lockedUntil) return;
      total += e.deltaX;
      if (Math.abs(total) < SWIPE_THRESHOLD_PX) return;

      setCurrent((prev) => (prev + (total > 0 ? 1 : -1) + slides.length) % slides.length);
      total = 0;
      lockedUntil = Date.now() + WHEEL_COOLDOWN_MS;
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const onPointerDown = (e) => {
    if (slides.length < 2 || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag.current = { active: true, moved: false, startX: e.clientX };
    setDragging(true);
  };

  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) < DRAG_START_PX) return;
    if (!drag.current.moved) {
      drag.current.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setDragX(dx);
  };

  const endDrag = (e) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const dx = e.clientX - drag.current.startX;
    if (e.type === "pointerup" && drag.current.moved && Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
      move(dx < 0 ? 1 : -1);
    }
    setDragX(0);
    setDragging(false);
  };

  const onClickCapture = (e) => {
    if (!drag.current.moved) return;
    drag.current.moved = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const renderSlide = (slide) => (
    <img
      src={slide.src}
      alt={slide.alt}
      className="w-full h-full object-cover"
      // A banner whose top matters more (a logo) can move its crop with
      // `position`, e.g. "center 25%"; the default is the middle.
      style={{ objectPosition: slide.position || "center" }}
    />
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 md:px-10 lg:px-[121px] pt-4 sm:pt-6 md:pt-[44px]">
      <div className="w-full max-w-[1200px] mx-auto aspect-[5/2] sm:aspect-[3/1] rounded-xl md:rounded-2xl border border-[#9A9A9A] overflow-hidden relative">

        {/* Slides */}
        <div
          ref={trackRef}
          className={`flex h-full touch-pan-y select-none cursor-grab active:cursor-grabbing ${
            dragX === 0 ? "transition-transform duration-700 ease-in-out" : ""
          }`}
          style={{ transform: `translateX(calc(${-current * 100}% + ${dragX}px))` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
        >
          {slides.map((slide, index) => {
            const className = "relative block w-full h-full flex-shrink-0 min-w-full overflow-hidden";

            if (slide.to) {
              return (
                <Link key={index} to={slide.to} className={className}>
                  {renderSlide(slide)}
                </Link>
              );
            }
            if (slide.href) {
              return (
                <a key={index} href={slide.href} target="_blank" rel="noreferrer" className={className}>
                  {renderSlide(slide)}
                </a>
              );
            }
            return (
              <div key={index} className={className}>
                {renderSlide(slide)}
              </div>
            );
          })}
        </div>

        {/* Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show banner ${index + 1}`}
                onClick={() => setCurrent(index)}
                className={`cursor-pointer rounded transition-all
                  ${current === index
                    ? "w-6 md:w-8 h-0.5 md:h-1 bg-[#901CDB]"
                    : "w-4 md:w-6 h-0.5 md:h-1 bg-white"
                  }`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
