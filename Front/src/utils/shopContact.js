/**
 * The shop's own contact details, used by every call, mail and chat link.
 * One place, so a number or address is never right on one page and stale
 * on another.
 */
export const SHOP_PHONE = '9705653066';
export const SHOP_PHONE_DISPLAY = '+91 97056 53066';
export const SHOP_EMAIL = 'support@thesakhijewels.com';

export const SHOP_ADDRESS_LINES = [
  '1-108-2 kotala kalikiri Mandal',
  'chittoor dist Andhra Pradesh - 517234',
];

const WHATSAPP_GREETING = encodeURIComponent(
  'Hi, I have a question about an order from The Sakhi Jewels.'
);

export const PHONE_LINK = `tel:+91${SHOP_PHONE}`;
export const EMAIL_LINK = `mailto:${SHOP_EMAIL}`;
export const WHATSAPP_LINK = `https://wa.me/91${SHOP_PHONE}?text=${WHATSAPP_GREETING}`;
