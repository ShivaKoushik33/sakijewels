import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// A card in a moving carousel can only hold so much. Anything longer is cut
// here so every card stays the same height, whatever a customer wrote.
const MAX_REVIEW_CHARS = 150;

const shorten = (text = "") =>
  text.length > MAX_REVIEW_CHARS
    ? `${text.slice(0, MAX_REVIEW_CHARS).trimEnd()}...`
    : text;

const DRAG_START_PX = 5;
const RESUME_DELAY_MS = 1500;

// One full set of cards, measured: cards and gaps are narrower on phones, so a
// fixed width would restart the loop at the wrong place.
const measureLoopWidth = (track) => {
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  return (track.scrollWidth + gap) / 2;
};

const wrap = (value, loopWidth) =>
  loopWidth > 0 ? ((value % loopWidth) + loopWidth) % loopWidth : 0;

export default function Testimonials({ data }) {
  const trackRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);
  const translateRef = useRef(0);
  const pausedUntil = useRef(0);
  const drag = useRef({ active: false, moved: false, startX: 0, startOffset: 0 });
  const cardCount = data?.length || 0;

  const moveTo = (value) => {
    const track = trackRef.current;
    if (!track) return;
    translateRef.current = wrap(value, measureLoopWidth(track));
    setTranslateX(translateRef.current);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (drag.current.active || Date.now() < pausedUntil.current) return;
      moveTo(translateRef.current + 1);
    }, 20); // speed control (smaller = faster)

    return () => clearInterval(interval);
  }, []);

  // Native listener: React's onWheel is passive, and without preventDefault a
  // sideways trackpad swipe also triggers the browser's back gesture.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      pausedUntil.current = Date.now() + RESUME_DELAY_MS;
      moveTo(translateRef.current + e.deltaX);
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, [cardCount]);

  if (!data || data.length === 0) return null;

  // duplicate array for infinite loop
  const items = [...data, ...data];

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startOffset: translateRef.current,
    };
  };

  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) < DRAG_START_PX) return;
    if (!drag.current.moved) {
      drag.current.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    moveTo(drag.current.startOffset - dx);
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    pausedUntil.current = Date.now() + RESUME_DELAY_MS;
  };

  const onClickCapture = (e) => {
    if (!drag.current.moved) return;
    drag.current.moved = false;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto overflow-hidden pb-10 md:pb-16">

      {/* Header */}
      <div className="flex flex-col items-center gap-1.5 px-2.5 py-2.5 mb-6 md:mb-10">
        <h2 className="text-xl md:text-2xl font-semibold text-[#353945] text-center">
          Let Customers Speak
        </h2>
        <p className="text-base md:text-xl text-[#777E90] text-center">
          Trusted by 10,000+ Customers
        </p>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden px-3 sm:px-6 md:px-12 lg:px-[124px]">
        <div
          ref={trackRef}
          className="flex gap-4 md:gap-[43px] touch-pan-y select-none cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(-${translateX}px)`,
            transition: "linear"
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
        >
          {items.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 md:p-6 bg-[#FFE1BA] rounded-xl md:rounded-[20px] w-[280px] sm:w-[340px] md:w-[400px] flex-shrink-0 overflow-hidden"
            >
              <div className="w-20 h-20 sm:w-[120px] sm:h-[120px] md:w-[148px] md:h-[148px] flex-shrink-0">
                {testimonial.productId ? (
                  <Link to={`/products/${testimonial.productId}`} className="block w-full h-full">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover rounded-lg border border-white"
                    />
                  </Link>
                ) : (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover rounded-lg border border-white"
                  />
                )}
              </div>
              {/* w-full on phones: stacked under the image, the text would
                  otherwise size to its longest word and run out of the card. */}
              <div className="flex flex-col gap-2 md:gap-3 text-center sm:text-left w-full sm:w-auto flex-1 min-w-0">
                <div className="flex items-center gap-1 justify-center sm:justify-start">
                  {Array(testimonial.stars || 5).fill(0).map((_, i) => (
                    <span key={i} className="text-[#901CDB]">★</span>
                  ))}
                  <span className="text-sm">{testimonial.rating}/5</span>
                </div>
                <h3 className="text-base md:text-xl font-medium truncate">{testimonial.name}</h3>
                {/* break-words: one very long word would otherwise run out
                    of the card sideways, where line-clamp cannot help. */}
                <p className="text-xs md:text-sm line-clamp-3 break-words">
                  {shorten(testimonial.review)}
                </p>
                <span className="text-[10px] text-[#777E90]">{testimonial.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
