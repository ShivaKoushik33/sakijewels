import {
  EMAIL_LINK,
  PHONE_LINK,
  SHOP_ADDRESS_LINES,
  SHOP_EMAIL,
  SHOP_PHONE_DISPLAY,
  WHATSAPP_LINK,
} from '../../utils/shopContact';

const cardClass =
  'flex items-center gap-3 p-4 border border-[#E6E8EC] rounded-xl hover:border-[#901CDB] transition-colors';
const iconClass =
  'w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[#901CDB]/10 text-[#901CDB]';

/** Ways to reach the shop: WhatsApp, call, email and the postal address. */
export default function SupportContact() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className={cardClass}>
          <span className={iconClass}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.8.8-1 1.900-.6 3a9.300 9.300 0 0 0 4.300 4.500c1.500.7 2.400.7 3.200.6.5-.1 1.400-.6 1.600-1.200.2-.6.2-1.100.1-1.200-.1-.1-.2-.2-.4-.3z" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[#141416]">WhatsApp</span>
            <span className="block text-sm text-[#777E90]">Chat with us</span>
          </span>
        </a>

        <a href={PHONE_LINK} className={cardClass}>
          <span className={iconClass}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[#141416]">Call us</span>
            <span className="block text-sm text-[#777E90]">{SHOP_PHONE_DISPLAY}</span>
          </span>
        </a>

        <a href={EMAIL_LINK} className={cardClass}>
          <span className={iconClass}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[#141416]">Email</span>
            <span className="block text-sm text-[#777E90] break-all">{SHOP_EMAIL}</span>
          </span>
        </a>
      </div>

      <p className="mt-4 text-sm text-[#353945]">
        <span className="font-semibold">The Sakhi Jewels</span>
        <br />
        {SHOP_ADDRESS_LINES[0]}
        <br />
        {SHOP_ADDRESS_LINES[1]}
      </p>
    </div>
  );
}
