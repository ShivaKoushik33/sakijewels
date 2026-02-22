import { useNavigate } from "react-router-dom";

export default function CategorySection({ data }) {
  const navigate = useNavigate();

  if (!data || !Array.isArray(data) || data.length === 0) return null;


  const handleCategoryClick = (categoryName) => {
    navigate(`/collections?type=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 md:px-[38px] overflow-x-auto">
      <div className="flex items-center justify-center gap-3 md:gap-7 min-w-0">

        {/* Left Arrow - hide on mobile */}
        <button className="hidden md:flex w-10 h-10 flex-shrink-0 items-center justify-center border border-[#E6E8EC] rounded-full opacity-0">
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
            <path d="M7 1L1 6.5L7 12" stroke="#353945" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Categories */}
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide justify-start md:justify-center pb-2 md:pb-0">
          {data.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.type)}
              className="flex flex-col items-center gap-2 md:gap-3 flex-shrink-0 cursor-pointer group"
            >
              <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[148px] md:h-[148px] rounded-xl md:rounded-[17.41px] border border-[#901CDB]/20 overflow-hidden group-hover:shadow-lg transition-all duration-300">
                
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute bottom-0 left-0 right-0 h-12 md:h-[72px] bg-gradient-to-b from-transparent to-[#160421]"></div>

                {category.badge && (
                  <div className="absolute w-full bottom-0 left-1/2 -translate-x-1/2">
                    <div className="bg-[#901CDB] py-1.5 md:py-2 flex items-center justify-center">
                      <span className="text-xs md:text-[14px] font-medium text-white whitespace-nowrap">
                        {category.badge}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <span className="text-xs sm:text-sm md:text-base font-medium text-[#353945] text-center group-hover:text-[#901CDB] transition-colors">
                {category.name}
              </span>
            </div>
          ))}
        </div>

        {/* Right Arrow - hide on mobile */}
        <button className="hidden md:flex w-10 h-10 flex-shrink-0 items-center justify-center border border-[#E6E8EC] rounded-full">
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
            <path d="M1 1L7 6.5L1 12" stroke="#353945" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

      </div>
    </div>
  );
}
