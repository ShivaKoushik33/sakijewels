import { Link } from "react-router-dom";

/**
 * Offer banner above Best Selling. `data` holds one banner per side of the
 * Traditional / Modern switch ({ TRADITIONAL, FASHION }, each { src, alt }),
 * and the one matching the shopper's choice is shown.
 *
 * The banners are 16:9. Phones show them whole; from tablets up the box is
 * wider and shorter (2:1) so it doesn't look square, trimming only plain
 * background off the bottom so the "Limited offer" ribbon in the top corner
 * and all the text stay in view.
 */
export default function PromoBannerSection({ data, variantType }) {
  const banner = data?.[variantType] || data?.TRADITIONAL;
  if (!banner) return null;

  return (
    <div className="w-full max-w-[1440px] mx-auto my-10 md:my-20 px-3 sm:px-6 md:px-10 lg:px-[121px]">
      <Link
        to="/collections"
        className="block w-full max-w-[1200px] mx-auto aspect-video md:aspect-[2/1] rounded-xl md:rounded-2xl overflow-hidden"
      >
        <img
          src={banner.src}
          alt={banner.alt}
          className="w-full h-full object-cover"
          style={{ objectPosition: "center top" }}
        />
      </Link>
    </div>
  );
}
