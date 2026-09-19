import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { getProfileUi } from '../services/profileService';
import { ShopContext } from '../context/ShopContext';
import useAddressForm from '../hooks/useAddressForm';
import AddressFormFields from '../components/profile/AddressFormFields';

export default function AddAddress() {
  const [ui, setUi] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [formMsg, setFormMsg] = useState('');   // inline form error
  const [saving, setSaving] = useState(false);

  const { backendUrl, token, setSelectedAddress } = useContext(ShopContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { formData, handleChange, suggestions, loadingPin, pinMsg, validate } =
    useAddressForm(backendUrl);

  useEffect(() => {
    getProfileUi().then((data) => setUi(data || null));
  }, []);

  const pageUi = ui?.pages?.addAddress;
  const fields = pageUi?.fields;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setFormMsg('');

    if (!token) {
      localStorage.setItem('authNotice', 'Please login to add an address.');
      return navigate('/login');
    }

    const problem = validate();
    if (problem) {
      setFormMsg(problem);
      return;
    }

    try {
      setSaving(true);

      const res = await axios.post(
        `${backendUrl}/api/addresses`,
        { ...formData, isDefault },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newAddress = res.data.addresses?.[res.data.addresses.length - 1];

      if (searchParams.get('redirect') === 'checkout') {
        setSelectedAddress(newAddress);
        navigate('/checkout/review');
      } else {
        navigate('/profile/addresses');
      }
    } catch (error) {
      setFormMsg(error?.response?.data?.message || 'Failed to add address');
      setSaving(false);
    }
  };

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

        <div className="max-w-[640px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-5">
            <AddressFormFields
              fields={fields}
              formData={formData}
              onChange={handleChange}
              suggestions={suggestions}
              loadingPin={loadingPin}
              pinMsg={pinMsg}
            />

            <label className="flex items-center gap-3 text-sm text-[#141416]">
              <input
                type="checkbox"
                name="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              Set as default address
            </label>

            {formMsg && <p className="text-sm text-red-500">{formMsg}</p>}

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full sm:w-[220px] h-[44px] bg-[#901CDB] text-white rounded-lg text-base font-medium hover:bg-[#7A16C0] transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : pageUi.primaryCtaText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
