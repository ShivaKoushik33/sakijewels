import { useEffect, useState } from "react";

export default function Testimonials({ data }) {
  if (!data || data.length === 0) return null;

  // duplicate array for infinite loop
  const items = [...data, ...data];
  const cardWidth = 443; // 400px card + 43px gap
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTranslateX((prev) => prev + 1);
    }, 20); // speed control (smaller = faster)

    return () => clearInterval(interval);
  }, []);

  // reset seamlessly when half scrolled
  if (translateX >= data.length * cardWidth) {
    setTranslateX(0);
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto overflow-hidden">

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
          className="flex gap-4 md:gap-[43px]"
          style={{
            transform: `translateX(-${translateX}px)`,
            transition: "linear"
          }}
        >
          {items.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 md:p-6 bg-[#FFE1BA] rounded-xl md:rounded-[20px] w-[280px] sm:w-[340px] md:w-[400px] flex-shrink-0"
            >
              <div className="w-20 h-20 sm:w-[120px] sm:h-[120px] md:w-[148px] md:h-[148px] flex-shrink-0">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-full h-full object-cover rounded-lg border border-white"
                />
              </div>
              <div className="flex flex-col gap-2 md:gap-3 text-center sm:text-left flex-1 min-w-0">
                <div className="flex items-center gap-1 justify-center sm:justify-start">
                  {Array(testimonial.stars || 5).fill(0).map((_, i) => (
                    <span key={i} className="text-[#901CDB]">★</span>
                  ))}
                  <span className="text-sm">{testimonial.rating}/5.0</span>
                </div>
                <h3 className="text-base md:text-xl font-medium">{testimonial.name}</h3>
                <p className="text-xs md:text-sm line-clamp-3">{testimonial.review}</p>
                <span className="text-[10px] text-[#777E90]">{testimonial.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
