import { useCallback, useRef, useState } from 'react';
import { lookupPincode } from '../services/profileService';

export const EMPTY_ADDRESS = {
  fullName: '',
  phone: '',
  pincode: '',
  house: '',    // address: area or street
  street: '',   // village or locality
  city: '',
  district: '',
  state: '',
  landmark: '',
};

// In form order, so the message names the first field the customer missed.
const MANDATORY = [
  ['fullName', 'Please enter the name'],
  ['phone', 'Enter valid mobile number'],
  ['pincode', 'Enter valid pincode'],
  ['house', 'Please enter the address (area or street)'],
  ['city', 'Please enter the city/town'],
  ['district', 'Please enter the district'],
  ['state', 'Please enter the state'],
];

const NO_SUGGESTIONS = { localities: [], cities: [], districts: [] };

/**
 * The shared behaviour of the add and edit address forms: the pincode fills
 * in village, city, district and state, and the customer can still change
 * any of them.
 */
export default function useAddressForm(backendUrl) {
  const [formData, setFormData] = useState(EMPTY_ADDRESS);
  const [suggestions, setSuggestions] = useState(NO_SUGGESTIONS);
  const [loadingPin, setLoadingPin] = useState(false);
  const [pinMsg, setPinMsg] = useState('');

  // Lookups can answer out of order while the customer keeps typing; only
  // the newest pincode is allowed to write to the form.
  const latestPin = useRef('');

  /**
   * Looks the pincode up and fills what it can. With `keepFilled` the fields
   * that already hold something are left alone — the edit page loads a saved
   * address whose city may have been corrected by hand.
   */
  const applyPincode = useCallback(
    async (pin, { keepFilled = false } = {}) => {
      latestPin.current = pin;
      setLoadingPin(true);
      setPinMsg('');

      try {
        const result = await lookupPincode(pin, backendUrl);
        if (latestPin.current !== pin) return;

        if (!result) {
          setSuggestions(NO_SUGGESTIONS);
          setPinMsg('We could not find this pincode. You can still fill the address yourself.');
          return;
        }

        setSuggestions({
          localities: result.localities,
          cities: result.cities,
          districts: result.districts,
        });

        setFormData((prev) => {
          const fill = (field, value) =>
            (keepFilled && prev[field]) || !value ? prev[field] : value;

          return {
            ...prev,
            // A pincode with a single post office names one village; where it
            // covers many, they are offered as suggestions instead of picking
            // one of them for the customer.
            street: fill('street', result.localities.length === 1 ? result.localities[0] : ''),
            city: fill('city', result.cities[0]),
            district: fill('district', result.districts[0]),
            state: fill('state', result.state),
          };
        });
      } catch {
        if (latestPin.current === pin) {
          setPinMsg('Could not check the pincode. You can still fill the address yourself.');
        }
      } finally {
        if (latestPin.current === pin) setLoadingPin(false);
      }
    },
    [backendUrl]
  );

  const handleChange = useCallback(
    (e) => {
      const { name } = e.target;
      const value =
        name === 'phone' || name === 'pincode'
          ? e.target.value.replace(/\D/g, '')
          : e.target.value;

      setFormData((prev) => ({ ...prev, [name]: value }));

      if (name === 'pincode') {
        setPinMsg('');
        latestPin.current = value;
        if (value.length === 6) {
          applyPincode(value);
        } else {
          setSuggestions(NO_SUGGESTIONS);
        }
      }
    },
    [applyPincode]
  );

  /** The first problem with the form, or null when it can be saved. */
  const validate = useCallback(() => {
    for (const [field, message] of MANDATORY) {
      if (!String(formData[field] || '').trim()) return message;
    }
    if (formData.phone.length !== 10) return 'Enter valid mobile number';
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) return 'Enter valid pincode';
    return null;
  }, [formData]);

  return {
    formData,
    setFormData,
    handleChange,
    applyPincode,
    suggestions,
    loadingPin,
    pinMsg,
    validate,
  };
}
