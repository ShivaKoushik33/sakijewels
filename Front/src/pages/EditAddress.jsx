import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getProfileUi, deleteUserAddress } from '../services/profileService';
import { ShopContext } from '../context/ShopContext';
import useAddressForm from '../hooks/useAddressForm';
import AddressFormFields from '../components/profile/AddressFormFields';
import ConfirmDialog from '../components/common/ConfirmDialog';

// Addresses saved before the server validated phone numbers can hold values
// like "+91 98765 43210"; the server now accepts only the 10-digit number.
const toTenDigits = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
};

export default function EditAddress() {
  const { token, backendUrl, selectedAddress, setSelectedAddress } = useContext(ShopContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [ui, setUi] = useState(null);
  const [loadMsg, setLoadMsg] = useState('');  // address could not be loaded
  const [formMsg, setFormMsg] = useState('');  // inline form error
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [askDelete, setAskDelete] = useState(false);

  const {
    formData,
    setFormData,
    handleChange,
    applyPincode,
    suggestions,
    loadingPin,
    pinMsg,
    validate,
  } = useAddressForm(backendUrl);

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

        const pincode = String(address.pincode || '').replace(/\D/g, '');

        setFormData({
          fullName: address.fullName || '',
          phone: toTenDigits(address.phone),
          pincode,
          house: address.house || '',
          street: address.street || '',
          city: address.city || '',
          district: address.district || '',
          state: address.state || '',
          landmark: address.landmark || '',
        });

        // Offers this pincode's villages/towns as suggestions, and fills the
        // district of an address saved before that field existed. Nothing
        // the customer already has is overwritten.
        if (/^[1-9][0-9]{5}$/.test(pincode)) {
          applyPincode(pincode, { keepFilled: true });
        }
      } catch {
        setLoadMsg('Could not load this address. Please try again.');
      }
    };

    fetchAddress();
  }, [id, token, backendUrl, setFormData, applyPincode]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (saving || deleting) return;
    setFormMsg('');

    const problem = validate();
    if (problem) {
      setFormMsg(problem);
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

  /** Deletes the address being edited, then returns to the address list. */
  const handleDelete = async () => {
    if (saving || deleting) return;

    setAskDelete(false);
    setFormMsg('');
    setDeleting(true);
    try {
      await deleteUserAddress(id, token, backendUrl);
      // An in-progress checkout must not keep pointing at a deleted address.
      if (selectedAddress?._id === id) setSelectedAddress(null);
      // replace: the form of a deleted address must not come back on Back.
      navigate('/profile/addresses', { replace: true });
    } catch (error) {
      setFormMsg(
        error?.response?.data?.message || 'Could not delete address. Please try again.'
      );
      setDeleting(false);
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
              <AddressFormFields
                fields={fields}
                formData={formData}
                onChange={handleChange}
                suggestions={suggestions}
                loadingPin={loadingPin}
                pinMsg={pinMsg}
              />

              {formMsg && <p className="text-sm text-red-500">{formMsg}</p>}

              <div className="mt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={saving || deleting || loadingPin}
                  className="w-full sm:w-[200px] h-[44px] bg-[#901CDB] text-white rounded-lg text-base font-medium hover:bg-[#7A16C0] transition-colors disabled:opacity-60"
                >
                  {saving ? 'Updating...' : pageUi.primaryCtaText}
                </button>
                <button
                  type="button"
                  onClick={() => setAskDelete(true)}
                  disabled={saving || deleting}
                  className="w-full sm:w-[200px] h-[44px] border border-[#FF3B30] text-[#FF3B30] rounded-lg text-base font-medium hover:bg-[#FFF5F5] transition-colors disabled:opacity-60"
                >
                  {deleting ? 'Deleting...' : 'Delete Address'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={askDelete}
        title="Delete this address?"
        message="It will be removed from your saved addresses."
        confirmText="Delete address"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setAskDelete(false)}
      />
    </div>
  );
}
