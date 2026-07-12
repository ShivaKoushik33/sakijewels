import { useNavigate } from "react-router-dom";

export default function JewelleryEssentials({ data }) {
  const navigate = useNavigate();

  if (!data || !Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 md:px-10 lg:px-[120px]">
      <div className="flex flex-col items-center gap-2.5 px-2.5 py-2.5 mb-6 md:mb-10">
        <h2 className="text-xl md:text-2xl font-semibold text-[#141416] text-center">
          Mens Collection
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center lg:gap-[52px] lg:justify-center gap-4 md:gap-6">
        {data.map((item) => (
          <div 
            key={item.id}
            onClick={() => navigate(item.type ? `/collections?type=${item.type}` : `/collections`)}
            className="relative w-full max-w-[363px] mx-auto lg:mx-0 h-[200px] sm:h-[220px] md:h-[240px] lg:w-[363px] rounded-2xl overflow-hidden group cursor-pointer"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
