// Mock profile data service (API layer)
// Replace these mocks with real API calls later without changing UI components.
import { ShopContext } from "../context/shopContext";
import axios from "axios";
const UI = {
  pages: {
    profile: {
      title: 'Personal Information',
      subtitle: 'Manage your account details',
      fields: {
        fullNameLabel: 'Full Name',
        emailLabel: 'Email',
        phoneLabel: 'Phone Number',
        fullNamePlaceholder: 'Enter your full name',
        emailPlaceholder: 'Enter your email',
        phonePlaceholder: '+91 XXXXX XXXXX',
      },
      primaryCtaText: 'Save Changes',
    },
    myOrders: {
      title: 'My Orders',
      empty: {
        title: 'No Items Ordered Yet',
        subtitle: 'Oops! No items get ordered',
        primaryCtaText: 'Keep shopping',
        illustration: '/images/empty-state.svg',
      },
    },
    addresses: {
      title: 'Addresses',
      primaryCtaText: 'Add New Address',
      empty: {
        title: 'No addresses added',
        subtitle: 'Add an address to get faster checkout',
        primaryCtaText: 'Add New Address',
        illustration: '/images/empty-state.svg',
      },
    },
    addAddress: {
      title: 'Add New Address',
      useCurrentLocationText: 'Use my current location',
      primaryCtaText: 'Add Address',
      fields: {
        nameLabel: 'Name*',
        phoneLabel: 'Phone Number*',
        addressLabel: 'Address (Area and Street)*',
        landmarkLabel: 'Landmark(optional)',
        pincodeLabel: 'Pincode*',
        cityLabel: 'City/town*',
        stateLabel: 'State*',
        namePlaceholder: 'Enter your name',
        phonePlaceholder: '+91XXXXXXXXXX',
        addressPlaceholder: 'Enter Area and street no.',
        landmarkPlaceholder: 'Enter landmark',
        pincodePlaceholder: 'Enter pincode',
        cityPlaceholder: 'Enter city/town',
        statePlaceholder: 'Select State',
        addressErrorText: 'Please fill the address',
      },
    },
    editAddress: {
      title: 'Edit Address',
      useCurrentLocationText: 'Use my current location',
      primaryCtaText: 'Update Address',
      fields: {
        nameLabel: 'Name*',
        phoneLabel: 'Phone Number*',
        addressLabel: 'Address (Area and Street)*',
        landmarkLabel: 'Landmark(optional)',
        pincodeLabel: 'Pincode*',
        cityLabel: 'City/town*',
        stateLabel: 'State*',
        namePlaceholder: 'Enter your name',
        phonePlaceholder: '+91XXXXXXXXXX',
        addressPlaceholder: 'Enter Area and street no.',
        landmarkPlaceholder: 'Enter landmark',
        pincodePlaceholder: 'Enter pincode',
        cityPlaceholder: 'Enter city/town',
        statePlaceholder: 'Select State',
        addressErrorText: 'Please fill the address',
      },
    },
    bankDetails: {
      title: 'Bank & UPI Details',
      primaryCtaText: 'Add / Update',
      empty: {
        title: 'No bank details added',
        subtitle: 'Add bank or UPI details for faster refunds',
        primaryCtaText: 'Add bank details',
        illustration: '/images/empty-state.svg',
      },
    },
  },
  common: {
    editText: 'Edit',
    deleteText: 'Delete',
  },
};

const mockPersonalInfo = {
  fullName: 'Shaik Muzammil',
  email: 'muzammil@example.com',
  phone: '+91 7032371104',
};

const mockOrders = [
  {
    id: 1,
    orderId: 'TSJ-ORD-10293',
    productName: 'Silver Classic Solitaire Ring',
    productImage: '/images/product-ring-56586a.png',
    price: 3799,
    orderDate: '19 Dec 2025',
    status: 'Delivered',
    ui: {
      statusTone: 'success',
    },
  },
  {
    id: 2,
    orderId: 'TSJ-ORD-10294',
    productName: 'Rose Gold Princess Earrings',
    productImage: '/images/product-ring-56586a.png',
    price: 2599,
    orderDate: '03 Jan 2026',
    status: 'Shipped',
    ui: {
      statusTone: 'info',
    },
  },
  {
    id: 3,
    orderId: 'TSJ-ORD-10295',
    productName: 'Silver Classic Solitaire Ring',
    productImage: '/images/product-ring-56586a.png',
    price: 3799,
    orderDate: '08 Jan 2026',
    status: 'Processing',
    ui: {
      statusTone: 'warning',
    },
  },
];

const mockAddresses = [
  {
    id: 1,
    name: 'Shaik Muzammil',
    phone: '+91 7032371104',
    addressLine:
      'Stay with friends gents pg, Hosapalaya, 8th Cross Road, Muneshwara Nagar,',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560068',
    ui: {
      editText: UI.common.editText,
      deleteText: UI.common.deleteText,
    },
  },
  {
    id: 2,
    name: 'Shaik Muzammil',
    phone: '+91 7032371104',
    addressLine:
      'Stay with friends gents pg, Hosapalaya, 8th Cross Road, Muneshwara Nagar,',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560068',
    ui: {
      editText: UI.common.editText,
      deleteText: UI.common.deleteText,
    },
  },
];

const mockBankAndUpiDetails = {
  accountHolderName: 'Shaik Muzammil',
  bankName: 'HDFC Bank',
  accountNumber: 'XXXXXX1104',
  ifscCode: 'HDFC0000123',
  upiId: 'muzammil@upi',
  ui: {
    editText: UI.common.editText,
    fields: {
      accountHolderName: 'Account holder',
      bankName: 'Bank',
      accountNumber: 'Account number',
      ifscCode: 'IFSC',
      upiId: 'UPI ID',
    },
  },
};

function withDelay(result, delayMs = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(result), delayMs));
}

export async function getMyOrders() {
  return withDelay(mockOrders);
}



export async function getUserAddresses(token, backendUrl) {
 
  try {
    const response = await axios.get(
      `${backendUrl}/api/addresses`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log("Fetched addresses:", response);

    // Transform backend format → UI format
    return response.data.map((addr) => ({
      id: addr._id,
      name: addr.fullName,
      phone: addr.phone,
      addressLine: `${addr.house}, ${addr.street || ""}`,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      ui: {
        editText: "Edit",
        deleteText: "Delete"
      }
    }));
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
}




export async function getAddressById(id, token, backendUrl) {
  try {
    const response = await axios.get(
      `${backendUrl}/api/addresses/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const address = response.data.find(
      (addr) => addr._id === id
    );

    if (!address) return null;

    return {
      id: address._id,
      name: address.fullName,
      phone: address.phone,
      addressLine: `${address.house}, ${address.street || ""}`,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}


export async function getBankAndUpiDetails() {
  return withDelay(mockBankAndUpiDetails);
}

export async function getProfileUi() {
  return withDelay(UI);
}

export async function getPersonalInfo() {
  return withDelay(mockPersonalInfo);
}

