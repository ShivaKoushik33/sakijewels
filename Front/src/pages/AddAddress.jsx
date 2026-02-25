import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProfileUi } from '../services/profileService';
import { ShopContext } from '../context/shopContext';
import axios from 'axios';
import { toast } from 'react-toastify';




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

  const { backendUrl, token, setSelectedAddress } = useContext(ShopContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    getProfileUi().then((data) => setUi(data || null));
  }, []);

  const pageUi = ui?.pages?.addAddress;
  const fields = pageUi?.fields;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login");
      return navigate('/login');
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/addresses`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Address added successfully");

      const newAddress =
        res.data.addresses?.[res.data.addresses.length - 1];

      // If coming from checkout → auto select and redirect back
      if (searchParams.get('redirect') === 'checkout') {
        setSelectedAddress(newAddress);
        navigate('/checkout/review');
      } else {
        navigate('/profile/addresses');
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add address");
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
              placeholder={fields?.namePlaceholder}
              required
            />

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
              placeholder={fields?.phonePlaceholder}
              required
            />

            <textarea
              name="house"
              value={formData.house}
              onChange={handleChange}
              className="w-full min-h-[72px] px-4 py-2 border border-[#E6E8EC] rounded-lg text-sm"
              placeholder={fields?.addressPlaceholder}
              required
            />

            <input
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
              placeholder={fields?.landmarkPlaceholder}
            />

            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
              placeholder={fields?.cityPlaceholder}
              required
            />

            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
              placeholder={fields?.statePlaceholder}
              required
            />

            <input
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
              placeholder={fields?.pincodePlaceholder}
              required
            />

            <button
              type="submit"
              className="mt-4 w-full sm:w-[200px] h-[44px] bg-[#901CDB] text-white rounded-lg text-base font-medium hover:bg-[#7A16C0]"
            >
              {pageUi?.primaryCtaText || "Add Address"}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}
