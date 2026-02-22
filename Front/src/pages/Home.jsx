import { useState, useEffect,useContext } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import CategorySection from '../components/home/CategorySection';
import JewelleryEssentials from '../components/home/JewelleryEssentials';
import ProductGrid from '../components/home/ProductGrid';
import Testimonials from '../components/home/Testimonials';
import OurStory from '../components/home/OurStory';
import { getHomepageData } from '../services/homepageService';
import { ShopContext } from '../context/shopContext';
import PromoBannerSection from '../components/home/PromoBannerSection';

export default function Home() {
  const [homepage, setHomepage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { variantType, setVariantType } = useContext(ShopContext);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getHomepageData();
        setHomepage(data);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFDFC] flex items-center justify-center">
        <div className="text-lg text-[#141416]">Loading...</div>
      </div>
    );
  }

  if (!homepage) {
    return (
      <div className="min-h-screen bg-[#FCFDFC] flex items-center justify-center">
        <div className="text-lg text-[#141416]">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFDFC]">
      {/* Variant Filter Bar */}
<div className="w-full bg-white border-b border-[#E6E8EC] sticky top-0 z-40">
  <div className="max-w-[1440px] mx-auto flex justify-center gap-10 py-4">
    
    <button
      onClick={() => setVariantType("TRADITIONAL")}
      className={`font-semibold text-lg transition ${
        variantType === "TRADITIONAL"
          ? "text-[#901CDB] border-b-2 border-[#901CDB]"
          : "text-gray-500"
      }`}
    >
      TRADITIONAL
    </button>

    <button
      onClick={() => setVariantType("WESTERN")}
      className={`font-semibold text-lg transition ${
        variantType === "WESTERN"
          ? "text-[#901CDB] border-b-2 border-[#901CDB]"
          : "text-gray-500"
      }`}
    >
      WESTERN
    </button>

  </div>
</div>
      {/* Hero Banner */}
      {homepage.hero && <HeroBanner data={homepage.hero} />}

      {/* Shop by Categories */}
      {homepage.categories && (
        <div className="w-full max-w-[1440px] mx-auto my-6 md:my-10 px-2 md:px-4">
          <div className="flex flex-col items-center gap-2.5 px-2.5 py-2.5 mb-6 md:mb-10">
            <h2 className="text-xl md:text-2xl font-semibold text-[#141416] text-center">Shop by Categories</h2>
          </div>
          <CategorySection data={homepage.categories} />
        </div>
      )}

      {/* 2026 Jewellery Essentials */}
      {homepage.essentials && (
        <div className="my-10 md:my-20">
          <JewelleryEssentials data={homepage.essentials} />
        </div>
      )}

      {/* Most Gifted */}
      {homepage.mostGifted && (
        <div className="w-full max-w-[1440px] mx-auto my-10 md:my-20 px-2 md:px-4">
          <div className="flex flex-col items-center gap-2.5 px-2.5 py-2.5 mb-6 md:mb-10">
            <h2 className="text-xl md:text-2xl font-semibold text-[#141416] text-center">Most Gifted</h2>
          </div>
          <ProductGrid title="" products={homepage.mostGifted}  />
        </div>
      )}

      {/* Promo Banner Section */}
      {homepage.promoBanner && (
        <PromoBannerSection data={homepage.promoBanner} />
      )}

      {/* Best Selling Products */}
      {homepage.bestSelling && (
        <div className="my-10 md:my-20">
          <ProductGrid 
            title="Best Selling products" 
            products={homepage.bestSelling} 
            
          />
        </div>
      )}

      {/* Testimonials */}
      {homepage.testimonials && (
        <div className="my-10 md:my-20">
          <Testimonials data={homepage.testimonials} />
        </div>
      )}

      {/* Floating WhatsApp Button */}
<a
  href="https://wa.me/919705653066"  // 👈 replace with your link if different
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-20 right-6 z-50"
>
  <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className="w-8 h-8 fill-white"
    >
      <path d="M16 .396C7.164.396 0 7.56 0 16.396c0 2.883.754 5.703 2.188 8.184L0 32l7.65-2.146A15.93 15.93 0 0016 32c8.836 0 16-7.164 16-16.004C32 7.56 24.836.396 16 .396zm0 29.333a13.26 13.26 0 01-6.76-1.857l-.484-.29-4.54 1.273 1.212-4.427-.314-.51a13.24 13.24 0 01-2.02-7.016c0-7.32 5.94-13.26 13.26-13.26 7.32 0 13.26 5.94 13.26 13.26 0 7.32-5.94 13.26-13.26 13.26zm7.347-9.845c-.402-.201-2.376-1.172-2.745-1.305-.369-.134-.637-.201-.905.201-.268.402-1.038 1.305-1.273 1.573-.235.268-.47.302-.872.101-.402-.201-1.697-.626-3.234-1.997-1.196-1.068-2.003-2.387-2.238-2.789-.235-.402-.025-.619.176-.82.18-.179.402-.47.603-.704.201-.235.268-.402.402-.67.134-.268.067-.503-.033-.704-.101-.201-.905-2.18-1.239-2.986-.326-.785-.657-.678-.905-.691l-.771-.013c-.268 0-.704.101-1.072.503-.369.402-1.407 1.374-1.407 3.349 0 1.975 1.441 3.882 1.641 4.151.201.268 2.833 4.329 6.865 6.07.959.413 1.706.66 2.289.845.961.305 1.835.262 2.527.159.771-.115 2.376-.97 2.711-1.906.336-.937.336-1.74.235-1.906-.101-.167-.369-.268-.771-.47z" />
    </svg>
  </div>
</a>


    </div>
  );
}
