// import { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import ProductCard from "../components/home/ProductCard";
// import { useLocation } from "react-router-dom";


// export default function Collections() {
//   const location = useLocation();
//   const { products, search, showSearch } = useContext(ShopContext);

//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [selectedTypes, setSelectedTypes] = useState([]);
//   const [sortType, setSortType] = useState("relevant");
//   const [showFilter, setShowFilter] = useState(false);

//   useEffect(() => {
//   const params = new URLSearchParams(location.search);
//   const typeFromURL = params.get("type");

//   if (typeFromURL) {
//     setSelectedTypes([typeFromURL]);
//   } else {
//     setSelectedTypes([]);
//   }
// }, [location.search]);


//   const toggleType = (e) => {
//     const value = e.target.value;

//     if (selectedTypes.includes(value)) {
//       setSelectedTypes((prev) =>
//         prev.filter((item) => item !== value)
//       );
//     } else {
//       setSelectedTypes((prev) => [...prev, value]);
//     }
//   };

//   const applyFilterAndSearch = () => {
//     let productsCopy = [...products];

//     // 🔎 Search Filter
//     if (showSearch && search) {
//       productsCopy = productsCopy.filter((item) =>
//         item.name.toLowerCase().includes(search.toLowerCase().trim())
//       );
//     }

//     // 📦 Type Filter
//     if (selectedTypes.length > 0) {
//       productsCopy = productsCopy.filter((item) =>
//         selectedTypes.includes(item.type)
//       );
//     }

//     setFilteredProducts(productsCopy);
//   };

//   const applySort = () => {
//     let sorted = [...filteredProducts];

//     switch (sortType) {
//       case "low-high":
//         sorted.sort((a, b) => a.finalPrice - b.finalPrice);
//         break;

//       case "high-low":
//         sorted.sort((a, b) => b.finalPrice - a.finalPrice);
//         break;

//       default:
//         break;
//     }

//     setFilteredProducts(sorted);
//   };

//   useEffect(() => {
//     applyFilterAndSearch();
//   }, [products, selectedTypes, search, showSearch]);

//   useEffect(() => {
//     applySort();
//   }, [sortType]);

//   return (
//     <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t min-h-screen bg-[#FCFDFC]">

//       {/* Left Filter Panel */}
//       <div className="min-w-[220px] px-4">
//         <p
//           onClick={() => setShowFilter(!showFilter)}
//           className="text-xl font-semibold cursor-pointer mb-4"
//         >
//           Filters
//         </p>

//         <div className={`${showFilter ? "" : "hidden"} sm:block`}>
//           <p className="mb-3 text-sm font-medium">PRODUCT TYPE</p>

//           <div className="flex flex-col gap-2 text-sm text-gray-700">
//             {["RING", "NECKLACE", "EARRING", "BRACELET", "BANGLE", "CHAIN"].map((type) => (
//               <label key={type} className="flex gap-2 items-center">
//                 <input
//                   type="checkbox"
//                   value={type}
//                   checked={selectedTypes.includes(type)}
//                   onChange={toggleType}
//                 />

//                 {type}
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Right Product Area */}
//       <div className="flex-1 px-4 sm:px-6 md:px-10">

//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-[#141416]">
//             All Collections
//           </h1>

//           <select
//             value={sortType}
//             onChange={(e) => setSortType(e.target.value)}
//             className="border border-gray-300 text-sm px-3 py-1"
//           >
//             <option value="relevant">Sort by: Relevant</option>
//             <option value="low-high">Sort by: Low to High</option>
//             <option value="high-low">Sort by: High to Low</option>
//           </select>
//         </div>

//         {/* Product Grid */}
//         {filteredProducts.length === 0 ? (
//           <p className="text-gray-500">No products found.</p>
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {filteredProducts.map((product) => (
//               <ProductCard
//                 key={product._id}
//                 product={{
//                   id: product._id,
//                   name: product.name,
//                   price: product.finalPrice,
//                   originalPrice: product.rate,
//                   discount: product.discountRate,
//                   rating: product.rating,
//                   reviews: product.ratingCount,
//                   image: product.images?.[0]?.url,
//                 }}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




import { useContext, useEffect, useState, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductCard from "../components/home/ProductCard";
import { useLocation } from "react-router-dom";

export default function Collections() {
  const location = useLocation();
  const { products, search, showSearch, variantType } =
    useContext(ShopContext);

  // const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const [showFilter, setShowFilter] = useState(false);

  // ✅ Get available product types dynamically
  const availableTypes = useMemo(() => {
    return [...new Set(products.map((p) => p.type))];
  }, [products]);

  // ✅ Handle URL type param
  useEffect(() => {
    if(products.length === 0) return; // Wait for products to load

    const params = new URLSearchParams(location.search);
    const typeFromURL = params.get("type");
    
    if (typeFromURL) {
      setSelectedTypes([typeFromURL]);
    } else {
      setSelectedTypes([]);
    }
  }, [location.search,products]);

  // ✅ Reset filters when variant changes
  // useEffect(() => {
  //   setSelectedTypes([]);
  // }, [variantType]);

  const toggleType = (e) => {
    const value = e.target.value;

    if (selectedTypes.includes(value)) {
      setSelectedTypes((prev) =>
        prev.filter((item) => item !== value)
      );
    } else {
      setSelectedTypes((prev) => [...prev, value]);
    }
  };

  // ✅ Apply Filters
  // useEffect(() => {
  //   let productsCopy = [...products];

  //   // 🔎 Search filter
  //   if (showSearch && search) {
  //     productsCopy = productsCopy.filter((item) =>
  //       item.name.toLowerCase().includes(search.toLowerCase().trim())
  //     );
  //   }

  //   // 📦 Type filter
  //   if (selectedTypes.length > 0) {
  //     productsCopy = productsCopy.filter((item) =>
  //       selectedTypes.includes(item.type)
  //     );
  //   }

  //   // 🔃 Sorting
  //   if (sortType === "low-high") {
  //     productsCopy.sort((a, b) => a.finalPrice - b.finalPrice);
  //   } else if (sortType === "high-low") {
  //     productsCopy.sort((a, b) => b.finalPrice - a.finalPrice);
  //   }

  //   setFilteredProducts(productsCopy);
  // }, [products, selectedTypes, search, showSearch, sortType]);
const filteredProducts = useMemo(() => {
  let productsCopy = [...products];

  // Search
  if (showSearch && search) {
    productsCopy = productsCopy.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase().trim())
    );
  }

  // Type filter
  if (selectedTypes.length > 0) {
    productsCopy = productsCopy.filter((item) =>
      selectedTypes.includes(item.type)
    );
  }

  // Sorting
  if (sortType === "low-high") {
    productsCopy.sort((a, b) => a.finalPrice - b.finalPrice);
  } else if (sortType === "high-low") {
    productsCopy.sort((a, b) => b.finalPrice - a.finalPrice);
  }

  return productsCopy;
}, [products, selectedTypes, search, showSearch, sortType]);
  return (
    <div className="flex flex-col sm:flex-row gap-6 pt-4 sm:pt-10 pb-20 border-t min-h-screen bg-[#FCFDFC]">

      {/* LEFT FILTER PANEL */}
      <div className="min-w-[220px] px-4">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className=" font-olivera  text-xl font-semibold cursor-pointer mb-4"
        >
          Filters
        </p>

        <div className={`${showFilter ? "" : "hidden"} sm:block`}>
          <p className=" font-olivera mb-3 text-sm font-medium">PRODUCT TYPE</p>

          <div className="flex flex-col gap-2 text-sm text-gray-700">
            {availableTypes.map((type) => (
              <label key={type} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  value={type}
                  checked={selectedTypes.includes(type)}
                  onChange={toggleType}
                />
                {type.replaceAll("_", " ")}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PRODUCT AREA */}
      <div className="flex-1 px-4 sm:px-6 md:px-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="font-olivera text-xl font-bold text-[#141416]">
            {selectedTypes.length > 0
              ? selectedTypes[0].replaceAll("_", " ")
              : "All Collections"}
          </h1>

          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="border border-gray-300 text-sm px-3 py-1 w-fit"
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* PRODUCT GRID */}
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={{
                  id: product._id,
                  name: product.name,
                  price: product.finalPrice,
                  originalPrice: product.rate,
                  discount: product.discountRate,
                  rating: product.rating,
                  reviews: product.ratingCount,
                  image: product.images?.[0]?.url,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}