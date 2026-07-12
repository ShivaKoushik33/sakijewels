// Mock homepage data service
// This simulates a real API call and can be replaced with actual API later

import banner from '../assets/images/banner.png';
import dup_category from '../assets/images/dup_category.png';
import JewelleryEssentials from '../assets/images/jewelery_essentials.png';
import productBanner from '../assets/images/product_banner.png';
import pendants from '../assets/images/Earrings.jpeg';
import MODERN_MINIMUM_NECKLACES from '../assets/images/modern_min.jpeg';

// Traditional category images
import ONE_GRAM_GOLD_NECKLACES from '../assets/images/trad_one_gram_gold_necklaces.jpeg';
import PEARLNECKLACES from '../assets/images/trad_pearl_necklaces.jpeg';
import RUBYNECKLACES from '../assets/images/trad_ruby_necklaces.jpeg';
import EARINGS_JUMKA_TRAD from '../assets/images/trad_earrings_jumka.jpeg';
import Bangles from '../assets/images/trad_bangles.jpeg';
import MANGALASUTRA from '../assets/images/trad_mangalsutra.jpeg';

// Fashion category images
import FASHIONNECKLACES from '../assets/images/fashion_necklaces.jpeg';
import FASHION_EARINGS_JUMKA from '../assets/images/fashion_earrings_jumka.jpeg';
import FASHION_BRACELET_BANGLES from '../assets/images/fashion_bracelet_bangles.jpeg';
import FASHION_RINGS from '../assets/images/fashion_rings.jpeg';
import FASHION_ANKLETS from '../assets/images/fashion_anklets.jpeg';
import FASHION_HAIR_ACCESSORIES from '../assets/images/fashion_hair_accessories.jpeg';
import FASHION_MANGALSUTRA from '../assets/images/fashion_mangalsutra.jpeg';
import FASHION_GIFT_HAMPER from '../assets/images/fashion_gift_hamper.jpeg';

import api from "./apiService";


const mockHero = {
  images:[banner, banner, banner],
  title: 'Jewelry Store',
  subtitle: 'WEDDING JEWELRY',
  offer: {
    text: 'SPECIAL OFFER',
    discount: '50% OFF'
  },
 
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
    name: "One Gram Gold Necklaces",
    type: "ONE_GRAM_GOLD_NECKLACES",
    variantType: "TRADITIONAL",
    image: ONE_GRAM_GOLD_NECKLACES
  },
  {
    name: "Pearl Necklaces",
    type: "PEARL_NECKLACES",
    variantType: "TRADITIONAL",
    image: PEARLNECKLACES
  },
  {
    name: "Ruby Necklaces",
    type: "RUBY_NECKLACES",
    variantType: "TRADITIONAL",
    image: RUBYNECKLACES
  },
  {
    name: "Ear Rings",
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
    name: "Pendants",
    type: "PENDANTS",
    variantType: "TRADITIONAL",
    image: pendants
  },

  // =========================
  // FASHION
  // =========================
  {
    name: "Necklaces",
    type: "FASHION_NECKLACES",
    variantType: "FASHION",
    image: FASHIONNECKLACES
  },
  {
    name: "Ear Rings",
    type: "FASHION_EARINGS_JUMKA",
    variantType: "FASHION",
    image: FASHION_EARINGS_JUMKA
  },
  {
    name: "Bangles",
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
    image: JewelleryEssentials
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


const mockHomepage = {
    image: productBanner
};




const mockTestimonials = [
  {
    id: 1,
    name: 'Virda',
    rating: 4.5,
    stars: 5,
    review: "A big shout out to you guys for improving my hubby's gifting tastes. Completely in love with my ring!",
    date: '19 Dec 2025',
    image: '/images/testimonial-1-56586a.png'
  },
  {
    id: 2,
    name: 'Virda',
    rating: 4.5,
    stars: 5,
    review: "A big shout out to you guys for improving my hubby's gifting tastes. Completely in love with my ring!",
    date: '19 Dec 2025',
    image: '/images/testimonial-1-56586a.png'
  },
  {
    id: 3,
    name: 'Virda',
    rating: 4.5,
    stars: 5,
    review: "A big shout out to you guys for improving my hubby's gifting tastes. Completely in love with my ring!",
    date: '19 Dec 2025',
    image: '/images/testimonial-1-56586a.png'
  },
  {
    id: 4,
    name: 'Virda',
    rating: 4.5,
    stars: 5,
    review: "A big shout out to you guys for improving my hubby's gifting tastes. Completely in love with my ring!",
    date: '19 Dec 2025',
    image: '/images/testimonial-1-56586a.png'
  },
  {
    id: 5,
    name: 'Virda',
    rating: 4.5,
    stars: 5,
    review: "A big shout out to you guys for improving my hubby's gifting tastes. Completely in love with my ring!",
    date: '19 Dec 2025',
    image: '/images/testimonial-1-56586a.png'
  },
  {
    id: 6,
    name: 'Virda',
    rating: 4.5,
    stars: 5,
    review: "A big shout out to you guys for improving my hubby's gifting tastes. Completely in love with my ring!",
    date: '19 Dec 2025',
    image: '/images/testimonial-1-56586a.png'
  }
];

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
    const [bestSellersRes, mostGiftedRes, newArrivalsRes] = await Promise.all([
      api.get("/products/best-sellers"),
      api.get("/products/most-gifted"),
      api.get("/products/new-arrivals")
    ]);

    // const {bestSellers, mostGifted} = useContext(ShopContext);

    const formatProduct = (product) => ({
      id: product._id,
      name: product.name,
      price: product.finalPrice,
      originalPrice: product.rate,
      discount: product.discountRate,
      rating: product.rating,
      reviews: product.ratingCount,
      image: product.images?.[0]?.url,
      variantType: product.variantType
    });
    return {
      hero: mockHero,
      categories: categoryConfig,
      essentials: mockEssentials,
      mostGifted: mostGiftedRes.data.map(formatProduct),
      bestSelling: bestSellersRes.data.map(formatProduct),
      newArrivals: newArrivalsRes.data.map(formatProduct),
      testimonials: mockTestimonials,
      ourStory: mockOurStory,
      promoBanner: mockHomepage
    };

  } catch (error) {
    throw error;
  }
}

 