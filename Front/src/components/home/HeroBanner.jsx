import { useState, useEffect } from "react";

export default function HeroBanner({ data }) {
  if (!data || !data.images?.length) return null;

  const [current, setCurrent] = useState(0);

  // auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % data.images.length);
    }, 4000); // 4s like ecommerce banners
    return () => clearInterval(interval);
  }, [data.images.length]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 md:px-10 lg:px-[121px] pt-4 sm:pt-6 md:pt-[44px]">
      <div className="w-full max-w-[1200px] mx-auto h-[180px] sm:h-[240px] md:h-[300px] lg:h-[360px] rounded-xl md:rounded-2xl border border-[#9A9A9A] overflow-hidden relative">

        {/* Images */}
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {data.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`banner-${index}`}
              className="w-full h-full object-cover flex-shrink-0 min-w-full"
            />
          ))}
        </div>

        {/* Indicators */}
        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
          {data.images.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrent(index)}
              className={`cursor-pointer rounded transition-all
                ${current === index 
                  ? "w-6 md:w-8 h-0.5 md:h-1 bg-[#901CDB]" 
                  : "w-4 md:w-6 h-0.5 md:h-1 bg-white"
                }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
