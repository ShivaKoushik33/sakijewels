export default function PromoBannerSection({ data }) {
    if (!data) return null;
  
    return (
      <div className="w-full max-w-[1440px] mx-auto my-10 md:my-20 px-3 sm:px-6 md:px-10 lg:px-[121px]">
        <div className="w-full h-[160px] sm:h-[200px] md:h-[235px] rounded-xl md:rounded-2xl overflow-hidden">
          <img
            src={data.image}
            alt="Promo Banner"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }
  