// Mock order / checkout data service
// Replace with real API calls later

const mockReviewUi = {
  title: 'Review your order',
  subtitle: 'Confirm items and delivery before payment',
  sectionTitles: {
    deliveryAddress: 'Delivery Address',
    orderSummary: 'Order Summary',
    items: 'Items',
  },
  labels: {
    subtotal: 'Subtotal',
    discount: 'Discount',
    deliveryFee: 'Delivery Fee',
    total: 'Total Amount',
    saved: 'You saved',
    onThisOrder: 'on this order',
    expectedDelivery: 'Expected delivery on',
    freeShippingNote: 'Pan India Free Shipping for orders above Rs.',
    proceedToPayment: 'Proceed to Payment',
    editAddress: 'Edit',
  },
};

const mockReviewOrder = {
  address: {
    name: 'Shaik Muzammil',
    phone: '+91 7032371104',
    line1: 'Stay with friends gents pg, Hosapalaya, 8th Cross Road, Muneshwara Nagar,',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560068',
  },
  items: [
    {
      id: 1,
      name: 'Silver Classic Solitaire Ring',
      price: 3799,
      originalPrice: 8399,
      discount: 72,
      image: '/images/product-ring-56586a.png',
      quantity: 1,
    },
    {
      id: 2,
      name: 'Silver Classic Solitaire Ring',
      price: 3799,
      originalPrice: 8399,
      discount: 72,
      image: '/images/product-ring-56586a.png',
      quantity: 1,
    },
  ],
  summary: {
    subtotal: 7598,
    itemCount: 2,
    discount: 1277,
    deliveryFee: 0,
    total: 6321,
    savings: 1277,
    expectedDelivery: '01 Jan 2026',
    freeShippingThreshold: 450,
  },
};

const mockPaymentUi = {
  title: 'Payment',
  subtitle: 'Choose your payment method',
  sectionTitles: {
    paymentMethod: 'Payment Method',
    cardDetails: 'Card Details',
    orderSummary: 'Order Summary',
    upi: 'UPI',
    netBanking: 'Net Banking',
  },
  labels: {
    cardNumber: 'Card Number',
    expiry: 'Expiry (MM/YY)',
    cvv: 'CVV',
    nameOnCard: 'Name on Card',
    upiId: 'UPI ID',
    payNow: 'Pay Now',
    placeOrder: 'Place Order',
  },
  placeholders: {
    cardNumber: 'Enter card number',
    expiry: 'MM/YY',
    cvv: 'CVV',
    nameOnCard: 'Name on card',
    upiId: 'yourname@upi',
  },
};

export async function getOrderReviewData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ui: mockReviewUi,
        order: mockReviewOrder,
      });
    }, 300);
  });
}

export async function getPaymentPageData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ui: mockPaymentUi,
        orderSummary: {
          total: 6321,
          itemCount: 2,
        },
      });
    }, 300);
  });
}
