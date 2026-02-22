// Mock cart data service
// This simulates a real API call and can be replaced with actual API later

const mockCartItems = [
  {
    id: 1,
    name: 'Silver Classic Solitaire Ring',
    price: 3799,
    originalPrice: 8399,
    discount: 72,
    image: '/images/product-ring-56586a.png',
    quantity: 1
  },
  {
    id: 2,
    name: 'Silver Classic Solitaire Ring',
    price: 3799,
    originalPrice: 8399,
    discount: 72,
    image: '/images/product-ring-56586a.png',
    quantity: 1
  }
];

const mockOrderSummary = {
  subtotal: 5677,
  itemCount: 2,
  discount: 1277,
  deliveryFee: 0,
  total: 4400,
  savings: 1277,
  expectedDelivery: '01 Jan 2025',
  freeShippingThreshold: 450
};

export async function getCartData() {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items: mockCartItems,
        orderSummary: mockOrderSummary
      });
    }, 300);
  });
}
