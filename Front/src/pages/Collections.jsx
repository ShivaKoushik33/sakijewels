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

// UI-only display overrides for specific category types.
const TYPE_LABEL_OVERRIDES = {
  EARINGS_JUMKA: "Ear Rings",
  FASHION_EARINGS_JUMKA: "Ear Rings",
  BRACELET_BANGLES: "Bangles",
};

const formatTypeLabel = (type) => {
  if (!type) return "";
  if (TYPE_LABEL_OVERRIDES[type]) return TYPE_LABEL_OVERRIDES[type];
  return type
    .replace(/^FASHION_/, "")
    .replaceAll("_", " ");
};

export default function Collections() {
  const location = useLocation();
  const { products, search, showSearch, variantType } =
    useContext(ShopContext);

  // const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);   // mobile sort menu

  const sortOptions = [
    { value: "relevant", label: "Relevant" },
    { value: "low-high", label: "Price: Low to High" },
    { value: "high-low", label: "Price: High to Low" },
  ];

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
          className="hidden sm:block font-olivera text-xl font-semibold cursor-pointer mb-4"
        >
          Filters
        </p>

        <div className={`${showFilter ? "" : "hidden"} sm:block`}>
          <p className=" font-olivera mb-3 text-sm font-medium">PRODUCT TYPE</p>

          <div className="flex flex-col gap-2 text-sm text-gray-700">
            {availableTypes.map((type) => (
              <label key={type} className="flex gap-2 items-center font-olivera">
                <input
                  type="checkbox"
                  value={type}
                  checked={selectedTypes.includes(type)}
                  onChange={toggleType}
                />
                {formatTypeLabel(type)}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PRODUCT AREA */}
      <div className="flex-1 px-4 sm:px-6 md:px-10">

        {/* HEADER */}
        <div className="flex flex-row justify-between items-center gap-3 mb-6">
          <h1 className="font-olivera text-xl font-bold text-[#141416]">
            {selectedTypes.length > 0
              ? formatTypeLabel(selectedTypes[0])
              : "All Collections"}
          </h1>

          {/* MOBILE SORT — funnel icon + popover on the far right (hidden on desktop) */}
          <div className="relative sm:hidden">
            <button
              type="button"
              onClick={() => setShowSort((prev) => !prev)}
              aria-label="Sort products"
              className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
                showSort || sortType !== "relevant"
                  ? "border-[#901CDB] text-[#901CDB] bg-[#901CDB]/10"
                  : "border-gray-300 text-[#141416]"
              }`}
            >
              {/* Funnel / filter icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
            </button>

            {showSort && (
              <>
                {/* click-away overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSort(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E6E8EC] rounded-xl shadow-lg z-50 overflow-hidden animate-[slideDown_0.15s_ease-out]">
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold text-[#777E90] uppercase tracking-wide">
                    Sort By
                  </p>
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortType(opt.value);
                        setShowSort(false);
                      }}
                      className={`flex items-center justify-between w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortType === opt.value
                          ? "text-[#901CDB] font-semibold bg-[#901CDB]/5"
                          : "text-[#141416] hover:bg-[#F4F5F6]"
                      }`}
                    >
                      {opt.label}
                      {sortType === opt.value && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* DESKTOP SORT dropdown (unchanged, hidden on mobile) */}
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="hidden sm:block border border-gray-300 text-sm px-3 py-1 w-fit"
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