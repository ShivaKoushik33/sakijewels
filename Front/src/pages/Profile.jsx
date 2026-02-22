import { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { ShopContext } from '../context/shopContext';
import { getProfileUi } from '../services/profileService';

export default function Profile() {
  const { token, backendUrl } = useContext(ShopContext);
  const [ui, setUi] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);

  useEffect(() => {
    getProfileUi().then((data) => setUi(data || null));

    if (token) {
      axios.get(`${backendUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(res => {
        setPersonalInfo(res.data);
      });
    }
  }, [token]);

  const pageUi = ui?.pages?.profile;
  const fields = pageUi?.fields;

  if (!pageUi) return <div>Loading...</div>;

  return (
    <section className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">
        <div className="max-w-[640px]">
          <h1 className="text-2xl md:text-3xl font-bold text-[#141416] mb-2">
            {pageUi.title}
          </h1>

          <form className="flex flex-col gap-4 md:gap-5">

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#141416]">
                {fields.fullNameLabel}
              </label>
              <input
                type="text"
                value={personalInfo?.name || ""}
                readOnly
                className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg bg-gray-100 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#141416]">
                {fields.emailLabel}
              </label>
              <input
                type="email"
                value={personalInfo?.email || ""}
                readOnly
                className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg bg-gray-100 text-sm"
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

          </form>
        </div>
      </div>
    </section>
  );
}
