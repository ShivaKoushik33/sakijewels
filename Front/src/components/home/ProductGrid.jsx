import ProductCard from './ProductCard';
import { useContext } from "react";
import { ShopContext } from "../../context/shopContext";

export default function ProductGrid({ title, products, showViewMore = false }) {
  if (!products || !Array.isArray(products) || products.length === 0) return null;
  const { variantType } = useContext(ShopContext);


  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Section Title */}
      {title && (
        <div className="flex flex-col items-center gap-2.5 px-2.5 py-2.5 mb-6 md:mb-10">
          <h2 className="text-xl md:text-2xl font-semibold text-[#141416] text-center">{title}</h2>
        </div>
      )}

      {/* Product Grid - 2 cols mobile, wrap on larger */}
      <div className="px-3 sm:px-4 md:px-[38px]">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-5 md:gap-7">
          {products?.filter(
  (p) => p.variantType === variantType
).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* View More Button */}
      {showViewMore && (
        <div className="flex justify-center mt-4 md:mt-6">
          <button className="px-6 md:px-8 py-2 md:py-2.5 border border-[#901CDB] rounded-lg text-base md:text-lg font-medium text-[#901CDB] hover:bg-[#901CDB] hover:text-white transition-colors">
            View More
          </button>
        </div>
      )}
    </div>
  );
}
