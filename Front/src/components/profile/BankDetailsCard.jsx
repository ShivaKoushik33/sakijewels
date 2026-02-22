export default function BankDetailsCard({ bankDetails }) {
  if (!bankDetails) return null;

  const fields = bankDetails.ui?.fields;

  return (
    <div className="w-full bg-white border border-[#E6E8EC] rounded-xl p-6">
      <div className="grid grid-cols-2 gap-x-10 gap-y-6">
        <div>
          <div className="text-sm text-[#777E90]">{fields?.accountHolderName}</div>
          <div className="text-base font-semibold text-[#141416] mt-1">
            {bankDetails.accountHolderName}
          </div>
        </div>
        <div>
          <div className="text-sm text-[#777E90]">{fields?.bankName}</div>
          <div className="text-base font-semibold text-[#141416] mt-1">
            {bankDetails.bankName}
          </div>
        </div>
        <div>
          <div className="text-sm text-[#777E90]">{fields?.accountNumber}</div>
          <div className="text-base font-semibold text-[#141416] mt-1">
            {bankDetails.accountNumber}
          </div>
        </div>
        <div>
          <div className="text-sm text-[#777E90]">{fields?.ifscCode}</div>
          <div className="text-base font-semibold text-[#141416] mt-1">
            {bankDetails.ifscCode}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-sm text-[#777E90]">{fields?.upiId}</div>
          <div className="text-base font-semibold text-[#141416] mt-1">
            {bankDetails.upiId}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button className="px-6 py-2 border border-[#901CDB] rounded-lg text-sm font-medium text-[#901CDB] hover:bg-[#901CDB] hover:text-white transition-colors">
          {bankDetails.ui?.editText}
        </button>
      </div>
    </div>
  );
}

