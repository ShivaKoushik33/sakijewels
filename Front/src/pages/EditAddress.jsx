import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getProfileUi, lookupPincode } from '../services/profileService';
import { ShopContext } from '../context/ShopContext';

// Addresses saved before the server validated phone numbers can hold values
// like "+91 98765 43210"; the server now accepts only the 10-digit number.
const toTenDigits = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
};

const fieldClass =
  'w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm text-[#141416]';
const labelClass = 'text-sm font-medium text-[#141416]';

export default function EditAddress() {
  const { token, backendUrl, selectedAddress, setSelectedAddress } = useContext(ShopContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [ui, setUi] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    house: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loadMsg, setLoadMsg] = useState('');  // address could not be loaded
  const [cities, setCities] = useState([]);
  const [loadingPin, setLoadingPin] = useState(false);
  const [pinMsg, setPinMsg] = useState('');    // inline pincode message
  const [formMsg, setFormMsg] = useState('');  // inline form error
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfileUi().then((data) => setUi(data || null));
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchAddress = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const address = res.data.find((addr) => addr._id === id);

        if (!address) {
          setLoadMsg('This address was not found. It may have been deleted.');
          return;
        }

        setFormData({
          fullName: address.fullName || '',
          phone: toTenDigits(address.phone),
          house: address.house || '',
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          pincode: String(address.pincode || '').replace(/\D/g, ''),
        });
      } catch {
        setLoadMsg('Could not load this address. Please try again.');
      }
    };

    fetchAddress();
  }, [id, token, backendUrl]);

  /* Pincode → city & state, same rule as the Add Address page */
  const fetchPincodeData = async (pin) => {
    try {
      setLoadingPin(true);
      setPinMsg('');

      const result = await lookupPincode(pin, backendUrl);

      if (!result) {
        setPinMsg('Invalid pincode');
        setCities([]);
        setFormData((prev) => ({ ...prev, city: '', state: '' }));
        return;
      }

      setCities(result.cities);
      setFormData((prev) => ({
        ...prev,
        state: result.state,
        city: result.cities[0],
      }));
    } catch {
      setPinMsg('Failed to verify pincode');
    } finally {
      setLoadingPin(false);
    }
  };

  const handleChange = (e) => {
    const { name } = e.target;
    const value =
      name === 'phone' || name === 'pincode'
        ? e.target.value.replace(/\D/g, '')
        : e.target.value;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'pincode') {
      setPinMsg('');
      if (value.length === 6) {
        fetchPincodeData(value);
      } else {
        setCities([]);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (saving) return;
    setFormMsg('');

    const required = ['fullName', 'house', 'street', 'city', 'state'];
    if (required.some((key) => !formData[key].trim())) {
      setFormMsg('Please fill all required fields');
      return;
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
      setSaving(true);

      const res = await axios.put(`${backendUrl}/api/addresses/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Keep a checkout that is in progress showing the edited address.
      if (selectedAddress?._id === id) {
        setSelectedAddress(
          res.data.addresses?.find((addr) => addr._id === id) || null
        );
      }

      navigate('/profile/addresses');
    } catch (error) {
      setFormMsg(error?.response?.data?.message || 'Update failed');
      setSaving(false);
    }
  };

  const pageUi = ui?.pages?.editAddress;
  const fields = pageUi?.fields;

  if (!pageUi) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#141416]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">
        {pageUi.title && (
          <h1 className="text-2xl md:text-3xl font-bold text-[#141416] mb-6 md:mb-8">
            {pageUi.title}
          </h1>
        )}

        {loadMsg ? (
          <div className="max-w-[640px] flex flex-col items-start gap-4">
            <p className="text-sm text-red-500">{loadMsg}</p>
            <Link
              to="/profile/addresses"
              className="text-sm font-medium text-[#901CDB] hover:underline"
            >
              Back to addresses
            </Link>
          </div>
        ) : (
          <div className="max-w-[640px]">
            <form onSubmit={handleUpdate} className="flex flex-col gap-4 md:gap-5">
              <div className="flex flex-col gap-1">
                <label className={labelClass}>{fields.nameLabel}</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`${fieldClass} bg-white`}
                  placeholder={fields.namePlaceholder}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelClass}>{fields.phoneLabel}</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  className={`${fieldClass} bg-white`}
                  placeholder={fields.phonePlaceholder}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelClass}>{fields.addressLabel}</label>
                <textarea
                  name="house"
                  value={formData.house}
                  onChange={handleChange}
                  className="w-full min-h-[72px] px-4 py-2 border border-[#E6E8EC] rounded-lg text-sm text-[#141416] bg-white"
                  placeholder={fields.addressPlaceholder}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>{fields.villageLabel}</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className={`${fieldClass} bg-white`}
                    placeholder={fields.villagePlaceholder}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>{fields.pincodeLabel}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    className={`${fieldClass} bg-white`}
                    placeholder={fields.pincodePlaceholder}
                  />
                  {loadingPin && (
                    <p className="text-xs text-[#901CDB] mt-1">Verifying pincode...</p>
                  )}
                  {pinMsg && <p className="text-xs text-red-500 mt-1">{pinMsg}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>{fields.cityLabel}</label>
                  {/* Filled in from the pincode but always editable: the
                      pincode's district is often not the customer's own town.
                      The pincode's districts are offered as suggestions. */}
                  <input
                    type="text"
                    name="city"
                    list="pincode-cities"
                    value={formData.city}
                    onChange={handleChange}
                    className={`${fieldClass} bg-white`}
                    placeholder={fields.cityPlaceholder}
                  />
                  <datalist id="pincode-cities">
                    {cities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>{fields.stateLabel}</label>
                  {/* Comes from the pincode; change the pincode to change it. */}
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    readOnly={formData.state !== ''}
                    className={`${fieldClass} ${formData.state ? 'bg-gray-50' : 'bg-white'}`}
                    placeholder={fields.statePlaceholder}
                  />
                </div>
              </div>

              {formMsg && <p className="text-sm text-red-500">{formMsg}</p>}

              <button
                type="submit"
                disabled={saving || loadingPin}
                className="mt-2 w-full sm:w-[200px] h-[44px] bg-[#901CDB] text-white rounded-lg text-base font-medium hover:bg-[#7A16C0] transition-colors disabled:opacity-60"
              >
                {saving ? 'Updating...' : pageUi.primaryCtaText}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
