import { Link } from 'react-router-dom';

export default function AddressCard({ address }) {
  if (!address) return null;

  return (
    <div className="w-full bg-white border border-[#E6E8EC] rounded-xl p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 md:gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-sm md:text-base font-semibold text-[#141416] truncate">
            {address.name}
          </div>
          <div className="text-xs md:text-sm text-[#777E90] mt-0.5">{address.phone}</div>
          <div className="text-xs md:text-sm text-[#353945] leading-relaxed mt-2 md:mt-3">
            {address.addressLine} {address.city}, {address.state} -{' '}
            <span className="font-semibold text-[#141416]">{address.pincode}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
          <Link
            to={`/profile/addresses/${address.id}/edit`}
            className="flex items-center gap-2 text-sm font-medium text-[#901CDB] hover:underline"
          >
            <span>{address.ui?.editText}</span>
          </Link>
          <button type="button" className="flex items-center gap-2 text-sm font-medium text-[#FF3B30] hover:underline">
            <span>{address.ui?.deleteText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

