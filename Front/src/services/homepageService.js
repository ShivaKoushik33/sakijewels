import { productLabel } from "../utils/helpers";
// Mock homepage data service
// This simulates a real API call and can be replaced with actual API later

import bannerBrand from '../assets/images/banner_brand.jpeg';
import bannerWelcome from '../assets/images/banner_welcome.jpeg';
import bannerMens from '../assets/images/banner_mens.jpeg';
import bannerCoupons from '../assets/images/banner_coupons.jpeg';
import bannerPearlRuby from '../assets/images/banner_pearl_ruby.jpeg';
import { SHOP_PHONE } from '../utils/shopContact';
import dup_category from '../assets/images/dup_category.png';
import mensTraditional from '../assets/images/mens_traditional.jpeg';
import mensModern from '../assets/images/mens_modern.jpeg';
import promoTraditional from '../assets/images/promo_traditional.jpeg';
import promoModern from '../assets/images/promo_modern.jpeg';
import pendants from '../assets/images/trad_more_categories.jpeg';
import MODERN_MINIMUM_NECKLACES from '../assets/images/minimal_LATEST.jpeg';

// Traditional category images
import ONE_GRAM_GOLD_NECKLACES from '../assets/images/trad_necklaces.jpeg';
import PEARLNECKLACES from '../assets/images/trad_pearl_ruby_jewellery.jpeg';
import RUBYNECKLACES from '../assets/images/trad_rings.jpeg';
import EARINGS_JUMKA_TRAD from '../assets/images/trad_jhumkas.jpeg';
import Bangles from '../assets/images/trad_bangles.jpeg';
import MANGALASUTRA from '../assets/images/trad_mangalsutra.jpeg';


// Fashion category images
import FASHIONNECKLACES from '../assets/images/fashion_chains.jpeg';
import FASHION_EARINGS_JUMKA from '../assets/images/fashion_earrings_jumka.jpeg';
import FASHION_BRACELET_BANGLES from '../assets/images/fashion_bracelet_bangles.jpeg';
import FASHION_RINGS from '../assets/images/RINGS_LATEST.jpeg';
import FASHION_ANKLETS from '../assets/images/fashion_anklets.jpeg';
import FASHION_HAIR_ACCESSORIES from '../assets/images/fashion_hair_accessories.jpeg';
import FASHION_MANGALSUTRA from '../assets/images/Mangalsutra_latest.jpeg';
import FASHION_GIFT_HAMPER from '../assets/images/GiftHamper_latest.jpeg';

import api from "./apiService";

// The pearl & ruby banner offers custom pieces; those are arranged on WhatsApp.
const CUSTOMISE_WHATSAPP_LINK = `https://wa.me/91${SHOP_PHONE}?text=${encodeURIComponent(
  "Hi, I would like to create a custom pearl / ruby necklace."
)}`;


// Home page carousel, in the order shown. Each banner's own "Shop now" /
// "Create your custom piece" button is part of the picture, so the whole
// slide is the link.
const mockHero = {
  images: [
    {
      src: bannerBrand,
      alt: 'The Sakhi Jewels, jewellery for every story. Traditional elegance and modern charm',
      to: '/collections',
      // Keep the peacock logo at the top: trim more from the bottom instead.
      position: 'center 25%',
    },
    {
      src: bannerWelcome,
      alt: 'Welcome to The Sakhi Jewels. Get ₹100 off and free shipping on your first order above ₹599 with code TSJSFIRST',
      to: '/collections',
    },
    {
      src: bannerCoupons,
      alt: 'Use code TSJ10 for 10% off above ₹999, or TSJS10 for 10% off and free shipping above ₹1499',
      to: '/collections',
    },
    {
      src: bannerPearlRuby,
      alt: 'Pearl and ruby necklaces, customisation available. Message us to create your custom piece',
      href: CUSTOMISE_WHATSAPP_LINK,
    },
    {
      src: bannerMens,
      alt: "Men's collection available, traditional and modern. Explore men's collection",
      to: '/collections?type=MENS_COLLECTION',
    },
  ],
};

// const mockCategories = [
//   {
//     id: 1,
//     name: 'Necklaces',
//     type:'NECKLACE',
//     image: dup_category,
//     badge:  "Min\n75%\nOff"
//   },
//   {
//     id: 2,
//     name: 'Bracelets',
//     type:'BRACELET',
//     image: dup_category,
//     badge:  "Min\n75%\nOff"
//   },
//   {
//     id: 3,
//     name: 'Earrings',
//     type:"EARRING", 
//     image: dup_category
   
//   },
//   {
//     id: 4,
//     name: 'Bangles',
//     type: "BANGLE", 
//     image: dup_category,
//     badge:  "Min\n75%\nOff"
//   },
//   {
//     id: 5,
//     name: 'Anklets',
//     type:"ANKLET",
//     image: dup_category,
//     badge:  "Min\n75%\nOff"
//   },
//   {
//     id: 6,
//     name: 'Necklaces',
//     type:"NECKLACE", 
//     image: dup_category,
//     badge:  "Min\n75%\nOff"
//   },
//   {
//     id: 7,
//     name: 'Necklaces',
//     type:"NECKLACE", 
//     image: dup_category,
//     badge:  "Min\n75%\nOff"
//   }
// ];


export const categoryConfig = [
  // =========================
  // TRADITIONAL
  // =========================
  {
    name: "Necklaces",
    type: "ONE_GRAM_GOLD_NECKLACES",
    variantType: "TRADITIONAL",
    image: ONE_GRAM_GOLD_NECKLACES
  },
  {
    name: "Pearl & Ruby jewellery",
    type: "PEARL_NECKLACES",
    variantType: "TRADITIONAL",
    image: PEARLNECKLACES
  },
  {
    name: "Rings",
    type: "RUBY_NECKLACES",
    variantType: "TRADITIONAL",
    image: RUBYNECKLACES
  },
  {
    name: "Jhumkas",
    type: "EARINGS_JUMKA",
    variantType: "TRADITIONAL",
    image: EARINGS_JUMKA_TRAD
  },
  {
    name: "Bangles",
    type: "BANGLES",
    variantType: "TRADITIONAL",
    image: Bangles
  },
  {
    name: "Mangalsutra",
    type: "MANGALSUTRA",
    variantType: "TRADITIONAL",
    image: MANGALASUTRA
  },
  {
    name: "Minimal Necklaces",
    type: "MODERN_MINIMUM_NECKLACES",
    variantType: "TRADITIONAL",
    image: MODERN_MINIMUM_NECKLACES
  },
  {
    name: "More categories",
    type: "PENDANTS",
    variantType: "TRADITIONAL",
    image: pendants
  },

  // =========================
  // FASHION
  // =========================
  {
    name: "Chains",
    type: "FASHION_NECKLACES",
    variantType: "FASHION",
    image: FASHIONNECKLACES
  },
  {
    name: "Earrings",
    type: "FASHION_EARINGS_JUMKA",
    variantType: "FASHION",
    image: FASHION_EARINGS_JUMKA
  },
  {
    name: "Bracelets",
    type: "BRACELET_BANGLES",
    variantType: "FASHION",
    image: FASHION_BRACELET_BANGLES
  },
  {
    name: "Rings",
    type: "FASHION_RINGS",
    variantType: "FASHION",
    image: FASHION_RINGS
  },
  {
    name: "Anklets",
    type: "ANKLETS",
    variantType: "FASHION",
    image: FASHION_ANKLETS
  },
  {
    name: "Hair Accessories",
    type: "HAIR_ACCESSORIES",
    variantType: "FASHION",
    image: FASHION_HAIR_ACCESSORIES
  },
  {
    name: "Mangalsutra",
    type: "FASHION_MANGALSUTRA",
    variantType: "FASHION",
    image: FASHION_MANGALSUTRA
  },
  {
    name: "Gift Hamper",
    type: "GIFT_HAMPER",
    variantType: "FASHION",
    image: FASHION_GIFT_HAMPER
  },
];
const mockEssentials = [
  {
    id: 2,
    name: 'Mens Collection',
    type: 'MENS_COLLECTION',
    // One picture per side of the Traditional / Modern switch.
    images: {
      TRADITIONAL: mensTraditional,
      FASHION: mensModern,
    },
  }
];

const mockProducts = [
  {
    id: 1,
    name: 'Silver Classic Solitaire Ring',
    price: 3799,
    originalPrice: 8399,
    discount: 72,
    rating: 4.8,
    reviews: 323,
    image: '/images/product-ring-56586a.png',
    isBestseller: true,
    couponPrice: 3649
  },
  {
    id: 2,
    name: 'Silver Classic Solitaire Ring',
    price: 3799,
    originalPrice: 8399,
    discount: 72,
    rating: 4.8,
    reviews: 323,
    image: '/images/product-ring-56586a.png',
    isBestseller: false,
    couponPrice: 3649
  },
  {
    id: 3,
    name: 'Silver Classic Solitaire Ring',
    price: 3799,
    originalPrice: 8399,
    discount: 72,
    rating: 4.8,
    reviews: 323,
    image: '/images/product-ring-56586a.png',
    isBestseller: false,
    couponPrice: 3649
  },
  {
    id: 4,
    name: 'Silver Classic Solitaire Ring',
    price: 3799,
    originalPrice: 8399,
    discount: 72,
    rating: 4.8,
    reviews: 323,
    image: '/images/product-ring-56586a.png',
    isBestseller: false,
    couponPrice: 3649
  },
  {
    id: 5,
    name: 'Silver Classic Solitaire Ring',
    price: 3799,
    originalPrice: 8399,
    discount: 72,
    rating: 4.8,
    reviews: 323,
    image: '/images/product-ring-56586a.png',
    isBestseller: false,
    couponPrice: 3649
  },
  {
    id: 6,
    name: 'Silver Classic Solitaire Ring',
    price: 3799,
    originalPrice: 8399,
    discount: 72,
    rating: 4.8,
    reviews: 323,
    image: '/images/product-ring-56586a.png',
    isBestseller: false,
    couponPrice: 3649
  }
];


// Offer banner above Best Selling, one per side of the Traditional / Modern
// switch (Modern is stored as FASHION).
const mockHomepage = {
  TRADITIONAL: {
    src: promoTraditional,
    alt: 'Special website launching offer: 20% off traditional jewellery',
  },
  FASHION: {
    src: promoModern,
    alt: 'Special website launching offer: 40% off modern jewellery',
  },
};




const mockOurStory = {
  title: 'Our Story\nThe Sakhi Jewels',
  description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  buttonText: 'Know More'
};

// export async function getHomepageData() {
//   // Simulate API delay
  
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         hero: mockHero,
//         categories: mockCategories,
//         essentials: mockEssentials,
//         mostGifted: mockProducts,
//         bestSelling: mockProducts,
//         testimonials: mockTestimonials,
//         ourStory: mockOurStory,
//         promoBanner: mockHomepage
//       });
//     }, 300);
//   });
// }

export async function getHomepageData() {
  try {
    const [bestSellersRes, mostGiftedRes, newArrivalsRes, reviewsRes] = await Promise.all([
      api.get("/products/best-sellers"),
      api.get("/products/most-gifted"),
      api.get("/products/new-arrivals"),
      // Reviews are a nice-to-have here: a failure must not blank the homepage.
      api.get("/reviews/featured").catch(() => ({ data: [] }))
    ]);

    // const {bestSellers, mostGifted} = useContext(ShopContext);

    const formatProduct = (product) => ({
      id: product._id,
      name: productLabel(product),
      price: product.finalPrice,
      originalPrice: product.rate,
      discount: product.discountRate,
      rating: product.rating,
      reviews: product.ratingCount,
      image: product.images?.[0]?.url,
      variantType: product.variantType,
      stock: product.stock
    });

    const formatReview = (review) => ({
      id: review.id,
      productId: review.productId,
      name: review.name,
      rating: review.rating,
      stars: review.rating,
      review: review.message,
      date: new Date(review.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      image: review.image
    });
    return {
      hero: mockHero,
      categories: categoryConfig,
      essentials: mockEssentials,
      mostGifted: mostGiftedRes.data.map(formatProduct),
      bestSelling: bestSellersRes.data.map(formatProduct),
      newArrivals: newArrivalsRes.data.map(formatProduct),
      testimonials: (reviewsRes.data || []).map(formatReview),
      ourStory: mockOurStory,
      promoBanner: mockHomepage
    };

  } catch (error) {
    throw error;
  }
}

 