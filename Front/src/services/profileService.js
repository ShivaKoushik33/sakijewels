// Mock profile data service (API layer)
// Replace these mocks with real API calls later without changing UI components.
import { ShopContext } from "../context/ShopContext";
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





function withDelay(result, delayMs = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(result), delayMs));
}

// Orders come from the API (see pages/MyOrders.jsx). Kept so any remaining
// import resolves; it no longer ships sample orders in the bundle.
export async function getMyOrders() {
  return withDelay([]);
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
    return null;
  }
}


/**
 * No bank/UPI details are stored for customers yet, so this returns null and
 * the page shows its empty state. It previously returned hardcoded account
 * details that were displayed to every logged-in customer as their own.
 */
export async function getBankAndUpiDetails() {
  return withDelay(null);
}

export async function getProfileUi() {
  return withDelay(UI);
}

// Profile data comes from GET /api/auth/me (see pages/Profile.jsx).
export async function getPersonalInfo() {
  return withDelay(null);
}

