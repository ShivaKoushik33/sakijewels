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
        phoneLabel: '10 digit mobile number*',
        pincodeLabel: 'Pincode*',
        addressLabel: 'Address (Area or street)*',
        villageLabel: 'Village/Locality',
        cityLabel: 'City/town*',
        districtLabel: 'District*',
        stateLabel: 'State*',
        landmarkLabel: 'Landmark (optional)',
        namePlaceholder: 'Enter your name',
        phonePlaceholder: '10 digit mobile number',
        pincodePlaceholder: 'Enter 6 digit pincode',
        addressPlaceholder: 'Enter area or street no.',
        villagePlaceholder: 'Filled from pincode - editable',
        cityPlaceholder: 'Filled from pincode - editable',
        districtPlaceholder: 'Filled from pincode - editable',
        statePlaceholder: 'Filled from pincode - editable',
        landmarkPlaceholder: 'Nearby landmark to find the house',
        addressErrorText: 'Please fill the address',
      },
    },
    editAddress: {
      title: 'Edit Address',
      useCurrentLocationText: 'Use my current location',
      primaryCtaText: 'Update Address',
      fields: {
        nameLabel: 'Name*',
        phoneLabel: '10 digit mobile number*',
        pincodeLabel: 'Pincode*',
        addressLabel: 'Address (Area or street)*',
        villageLabel: 'Village/Locality',
        cityLabel: 'City/town*',
        districtLabel: 'District*',
        stateLabel: 'State*',
        landmarkLabel: 'Landmark (optional)',
        namePlaceholder: 'Enter your name',
        phonePlaceholder: '10 digit mobile number',
        pincodePlaceholder: 'Enter 6 digit pincode',
        addressPlaceholder: 'Enter area or street no.',
        villagePlaceholder: 'Filled from pincode - editable',
        cityPlaceholder: 'Filled from pincode - editable',
        districtPlaceholder: 'Filled from pincode - editable',
        statePlaceholder: 'Filled from pincode - editable',
        landmarkPlaceholder: 'Nearby landmark to find the house',
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



// Transform backend format → UI format
const toUiAddress = (addr) => ({
  id: addr._id,
  name: addr.fullName,
  phone: addr.phone,
  addressLine: [addr.house, addr.street].filter(Boolean).join(", "),
  landmark: addr.landmark || "",
  city: addr.city,
  district: addr.district || "",
  state: addr.state,
  pincode: addr.pincode,
  ui: {
    editText: "Edit",
    deleteText: "Delete"
  }
});

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

    return response.data.map(toUiAddress);
  } catch (error) {
    return [];
  }
}




/** Deletes an address and resolves to the customer's remaining addresses. */
export async function deleteUserAddress(id, token, backendUrl) {
  const response = await axios.delete(
    `${backendUrl}/api/addresses/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data.addresses.map(toUiAddress);
}

/**
 * Look up a 6-digit pincode for the address forms. Resolves to
 * { cities, state } for a known pincode and null for an unknown one;
 * throws when the lookup itself failed.
 */
const uniqueValues = (offices, read) => [
  ...new Set(
    offices
      .map((office) => String(read(office) || "").trim())
      // The API writes "NA" where it has no value for a field.
      .filter((value) => value && value.toUpperCase() !== "NA")
  )
];

/**
 * What a pincode can tell us about an address.
 *
 * A pincode covers many post offices (a rural one can cover 35), so each
 * field comes back as the best guess plus the alternatives to offer as
 * suggestions — the customer can always type their own.
 *   localities = the post office names  (villages/areas)
 *   cities     = the blocks             (town/mandal)
 *   districts  = the districts
 */
export async function lookupPincode(pin, backendUrl) {
  try {
    const response = await axios.get(`${backendUrl}/api/pincode/${pin}`);
    const result = response.data?.[0];
    const offices = result?.Status === "Success" ? result.PostOffice : null;
    if (!offices?.length) return null;

    const districts = uniqueValues(offices, (o) => o.District);
    const cities = uniqueValues(offices, (o) => o.Block);

    return {
      localities: uniqueValues(offices, (o) => o.Name),
      cities: cities.length ? cities : districts,
      districts,
      state: offices[0].State
    };
  } catch (error) {
    // The server answers 400 for pincodes that cannot exist (e.g. leading 0).
    if (error?.response?.status === 400) return null;
    throw error;
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

