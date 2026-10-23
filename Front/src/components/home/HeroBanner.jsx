import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

  // auto slide
  useEffect(() => {
    if (slides.length < 2) return undefined;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000); // 4s like ecommerce banners
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

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
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
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
