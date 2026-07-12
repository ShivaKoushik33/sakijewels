import { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { getProfileUi, getUserAddresses } from '../services/profileService';

export default function Profile() {
  const { token, backendUrl, logout } = useContext(ShopContext);
  const navigate = useNavigate();

  const [ui, setUi] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");   // inline validation error

  useEffect(() => {
    getProfileUi().then((data) => setUi(data || null));

    if (token) {
      axios
        .get(`${backendUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setPersonalInfo(res.data);
          setFormName(res.data?.name || "");
          setFormEmail(res.data?.email || "");
        })
        .catch(() => {});

      getUserAddresses(token, backendUrl).then((data) =>
        setAddresses(Array.isArray(data) ? data : [])
      );
    }
  }, [token, backendUrl]);

  const pageUi = ui?.pages?.profile;
  const fields = pageUi?.fields;

  const handleEdit = () => {
    setFormName(personalInfo?.name || "");
    setFormEmail(personalInfo?.email || "");
    setEditing(true);
  };

  const handleCancel = () => {
    setFormName(personalInfo?.name || "");
    setFormEmail(personalInfo?.email || "");
    setEditing(false);
  };

  const handleSave = async () => {
    setFormError("");

    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and email are required");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put(
        `${backendUrl}/api/auth/me`,
        { name: formName.trim(), email: formEmail.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPersonalInfo(res.data);
      setEditing(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!pageUi) return <div className="p-6">Loading...</div>;

  return (
    <section className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">

        {/* PERSONAL INFORMATION */}
        <div className="max-w-[640px]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#141416]">
              {pageUi.title}
            </h1>
            {!editing && (
              <button
                type="button"
                onClick={handleEdit}
                className="text-sm font-medium text-[#901CDB] hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          <form
            className="flex flex-col gap-4 md:gap-5 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#141416]">
                {fields.fullNameLabel}
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={editing ? formName : personalInfo?.name || ""}
                onChange={(e) => setFormName(e.target.value)}
                readOnly={!editing}
                className={`w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm placeholder-[#B1B5C3] ${
                  editing ? "bg-white focus:outline-none focus:border-[#901CDB]" : "bg-gray-100"
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#141416]">
                {fields.emailLabel}
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={editing ? formEmail : personalInfo?.email || ""}
                onChange={(e) => setFormEmail(e.target.value)}
                readOnly={!editing}
                className={`w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm placeholder-[#B1B5C3] ${
                  editing ? "bg-white focus:outline-none focus:border-[#901CDB]" : "bg-gray-100"
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#141416]">
                {fields.phoneLabel}
              </label>
              <input
                type="tel"
                value={personalInfo?.phone || ""}
                readOnly
                className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg bg-gray-100 text-sm"
              />
            </div>

            {editing && formError && (
              <p className="text-sm text-red-500">{formError}</p>
            )}

            {editing && (
              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#901CDB] text-white rounded-lg text-sm font-medium hover:bg-[#7A16C0] transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2.5 border border-[#E6E8EC] text-[#353945] rounded-lg text-sm font-medium hover:bg-[#F4F5F6] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* MOBILE-ONLY: ADDRESSES + LOGOUT */}
        <div className="lg:hidden mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#141416]">Addresses</h2>
            <Link
              to="/profile/addresses/new"
              className="text-sm font-medium text-[#901CDB] hover:underline"
            >
              + Add New
            </Link>
          </div>

          {addresses.length === 0 ? (
            <div className="border border-dashed border-[#E6E8EC] rounded-xl p-6 text-center">
              <p className="text-sm text-[#777E90] mb-3">
                No addresses added yet
              </p>
              <Link
                to="/profile/addresses/new"
                className="inline-block px-5 py-2 bg-[#901CDB] text-white rounded-lg text-sm font-medium"
              >
                Add Address
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="w-full bg-white border border-[#E6E8EC] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[#141416] truncate">
                        {address.name}
                      </div>
                      <div className="text-xs text-[#777E90] mt-0.5">
                        {address.phone}
                      </div>
                      <div className="text-xs text-[#353945] leading-relaxed mt-2">
                        {address.addressLine} {address.city}, {address.state} -{' '}
                        <span className="font-semibold text-[#141416]">
                          {address.pincode}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/profile/addresses/${address.id}/edit`}
                      className="text-sm font-medium text-[#901CDB] hover:underline flex-shrink-0"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 border-t border-[#E6E8EC] pt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 border border-[#FF3B30] text-[#FF3B30] rounded-lg font-medium hover:bg-[#FDECEC] transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
