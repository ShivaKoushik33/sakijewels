import { useContext, useMemo } from "react";
import { ShopContext } from "../../context/ShopContext";
import ProductCard from "../home/ProductCard";

const RelatedProducts = ({ currentProduct }) => {
  const { products } = useContext(ShopContext);

  const related = useMemo(() => {
    if (!currentProduct) return [];
    return products
      .filter(
        (p) =>
          p._id !== currentProduct._id &&
          p.type === currentProduct.type &&
          p.isActive
      )
      .slice(0, 5);
  }, [products, currentProduct]);

  if (related.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Related Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 m-5">
        {related.map((product) => (
          <ProductCard
            key={product._id}
            product={{
              id: product._id,
              name: product.name,
              price: product.finalPrice,
              originalPrice: product.rate,
              discount: product.discountRate,
              image: product.images?.[0]?.url,
              stock: product.stock,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
