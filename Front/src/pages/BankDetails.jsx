import { useEffect, useState } from 'react';
import BankDetailsCard from '../components/profile/BankDetailsCard';
import { getBankAndUpiDetails, getProfileUi } from '../services/profileService';

export default function BankDetails() {
  const [bankDetails, setBankDetails] = useState(null);
  const [ui, setUi] = useState(null);

  useEffect(() => {
    getProfileUi().then((data) => setUi(data || null));
    getBankAndUpiDetails().then((data) => setBankDetails(data || null));
  }, []);

  const pageUi = ui?.pages?.bankDetails;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 md:mb-10">
          {pageUi?.title && (
            <div className="text-3xl font-bold text-[#141416]">
              {pageUi.title}
            </div>
          )}
          {pageUi?.primaryCtaText && (
            <button className="px-10 py-3 bg-[#901CDB] text-white rounded-lg text-base font-medium hover:bg-[#7A16C0] transition-colors">
              {pageUi.primaryCtaText}
            </button>
          )}
        </div>

        {!bankDetails ? (
          <div className="w-full min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center text-center max-w-[520px] w-full px-2">
              {pageUi?.empty?.illustration && (
                <img
                  src={pageUi.empty.illustration}
                  alt={pageUi.empty.title}
                  className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[520px] h-auto max-h-[240px] sm:max-h-[280px] md:max-h-[320px] object-contain"
                />
              )}
              {pageUi?.empty?.title && (
                <div className="text-xl font-semibold text-[#141416] mt-6">
                  {pageUi.empty.title}
                </div>
              )}
              {pageUi?.empty?.subtitle && (
                <div className="text-sm text-[#777E90] mt-2">
                  {pageUi.empty.subtitle}
                </div>
              )}
              {pageUi?.empty?.primaryCtaText && (
                <button className="mt-6 px-10 py-3 border border-[#901CDB] rounded-lg text-base font-medium text-[#901CDB] hover:bg-[#901CDB] hover:text-white transition-colors">
                  {pageUi.empty.primaryCtaText}
                </button>
              )}
            </div>
          </div>
        ) : (
          <BankDetailsCard bankDetails={bankDetails} />
        )}
      </div>
    </div>
  );
}

