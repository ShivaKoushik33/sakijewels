import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProfileUi } from '../services/profileService';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';

export default function AddAddress() {
  const [ui, setUi] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    house: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [cities, setCities] = useState([]);
  const [loadingPin, setLoadingPin] = useState(false);
  const [pinMsg, setPinMsg] = useState("");    // inline pincode message
  const [formMsg, setFormMsg] = useState("");  // inline form error

  const { backendUrl, token, setSelectedAddress } = useContext(ShopContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    getProfileUi().then((data) => setUi(data || null));
  }, []);

  const pageUi = ui?.pages?.addAddress;
  const fields = pageUi?.fields;

  /* 🔥 PINCODE VERIFY */
  const fetchPincodeData = async (pin) => {
    if (pin.length !== 6) return;

    try {
      setLoadingPin(true);
      setPinMsg("");

      const res = await axios.get(
        `${backendUrl}/api/pincode/${pin}`
      );

      const result = res.data?.[0];

      if (
        !result ||
        result.Status !== 'Success' ||
        !result.PostOffice ||
        result.PostOffice.length === 0
      ) {
        setPinMsg('Invalid pincode');
        setCities([]);
        setFormData((prev) => ({
          ...prev,
          city: '',
          state: ''
        }));
        return;
      }

      const offices = result.PostOffice;

      const cityList = [...new Set(offices.map((item) => item.District))];

      setCities(cityList);

      // Only auto-fill city & state. Village is always entered by the user
      // (rural villages may not be listed under a pincode).
      setFormData((prev) => ({
        ...prev,
        state: offices[0].State,
        city: cityList[0]
      }));
    } catch (error) {
      setPinMsg('Failed to verify pincode');
    } finally {
      setLoadingPin(false);
    }
  };

  /* 🔥 HANDLE CHANGE */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const finalValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));

    if (name === 'pincode') {
      const cleanPin = value.replace(/\D/g, '');

      setFormData((prev) => ({
        ...prev,
        pincode: cleanPin
      }));

      if (cleanPin.length === 6) {
        fetchPincodeData(cleanPin);
      }

      if (cleanPin.length < 6) {
        setCities([]);
      }
    }
  };

  /* 🔥 SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMsg("");

    if (!token) {
      localStorage.setItem("authNotice", "Please login to add an address.");
      return navigate('/login');
    }

    if (formData.phone.length !== 10) {
      setFormMsg('Enter valid mobile number');
      return;
    }

    if (formData.pincode.length !== 6) {
      setFormMsg('Enter valid pincode');
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/addresses`,
        formData, // 🔥 SAME BACKEND SCHEMA
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const newAddress =
        res.data.addresses?.[res.data.addresses.length - 1];

      if (searchParams.get('redirect') === 'checkout') {
        setSelectedAddress(newAddress);
        navigate('/checkout/review');
      } else {
        navigate('/profile/addresses');
      }
    } catch (error) {
      setFormMsg(
        error?.response?.data?.message ||
          'Failed to add address'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">
        {pageUi?.title && (
          <h1 className="text-2xl md:text-3xl font-bold text-[#141416] mb-6 md:mb-8">
            {pageUi.title}
          </h1>
        )}

        <div className="max-w-[640px]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            {/* FULL NAME */}
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
              placeholder={fields?.namePlaceholder || 'Full Name'}
              required
            />

            {/* PHONE */}
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
              placeholder={
                fields?.phonePlaceholder || 'Phone Number'
              }
              required
            />

            {/* HOUSE */}
            <textarea
              name="house"
              value={formData.house}
              onChange={handleChange}
              className="w-full min-h-[72px] px-4 py-2 border border-[#E6E8EC] rounded-lg text-sm"
              placeholder={
                fields?.addressPlaceholder ||
                'House No / Flat / Building'
              }
              required
            />

            {/* VILLAGE (entered by user — rural areas may not resolve by pincode) */}
            <input
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
              placeholder="Enter Village"
              required
            />

            {/* PINCODE */}
            <div>
              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
                className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
                placeholder={
                  fields?.pincodePlaceholder || 'Pincode'
                }
                required
              />

              {loadingPin && (
                <p className="text-xs text-[#901CDB] mt-2">
                  Verifying pincode...
                </p>
              )}
              {pinMsg && (
                <p className="text-xs text-red-500 mt-2">{pinMsg}</p>
              )}
            </div>

            {/* CITY */}
            {cities.length > 0 ? (
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm bg-white"
                required
              >
                {cities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
                placeholder={fields?.cityPlaceholder || 'City'}
                required
              />
            )}

            {/* STATE */}
            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm bg-gray-50"
              placeholder={fields?.statePlaceholder || 'State'}
              required
              readOnly={formData.state !== ''}
            />

            {/* DEFAULT */}
            <label className="flex items-center gap-3 text-sm text-[#141416]">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              Set as default address
            </label>

            {/* INLINE FORM ERROR */}
            {formMsg && (
              <p className="text-sm text-red-500">{formMsg}</p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="mt-4 w-full sm:w-[220px] h-[44px] bg-[#901CDB] text-white rounded-lg text-base font-medium hover:bg-[#7A16C0]"
            >
              {pageUi?.primaryCtaText || 'Add Address'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}