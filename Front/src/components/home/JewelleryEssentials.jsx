import { useNavigate } from "react-router-dom";

/**
 * Men's collection box. Each item can carry one picture per side of the
 * Traditional / Modern switch (`images: { TRADITIONAL, FASHION }`); the one
 * matching the shopper's choice is shown, or `image` when there is no pair.
 *
 * The pictures are full designs with text and category tiles, so they are
 * shown whole at their own shape rather than cropped into a fixed box.
 */
export default function JewelleryEssentials({ data, variantType }) {
  const navigate = useNavigate();

  if (!data || !Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 md:px-10 lg:px-[120px]">
      <div className="flex flex-col items-center gap-2.5 px-2.5 py-2.5 mb-6 md:mb-10">
        <h2 className="text-xl md:text-2xl font-semibold text-[#141416] text-center">
          Mens Collection
        </h2>
      </div>

      <div className="flex flex-col items-center gap-4 md:gap-6">
        {data.map((item) => {
          const image = item.images?.[variantType] || item.images?.TRADITIONAL || item.image;

          return (
            <div
              key={item.id}
              onClick={() => navigate(item.type ? `/collections?type=${item.type}` : `/collections`)}
              className="w-full max-w-[1200px] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer"
            >
              <img
                src={image}
                alt={item.name}
                className="block w-full h-auto"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
