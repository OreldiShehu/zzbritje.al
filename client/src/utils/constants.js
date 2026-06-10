export const CITIES = [
  'Tiranë', 'Durrës', 'Vlorë', 'Shkodër', 'Elbasan',
  'Korçë', 'Fier', 'Berat', 'Lushnjë', 'Pogradec',
  'Sarandë', 'Gjirokastër', 'Lezhë', 'Kukës', 'Kavajë',
];

export const DEAL_TYPES = [
  { value: 'percentage_discount', label: 'Zbritje %' },
  { value: 'fixed_discount', label: 'Zbritje Fikse' },
  { value: 'bogo', label: 'Merr 2, Paguaj 1' },
  { value: 'package', label: 'Paketë' },
  { value: 'flash', label: 'Flash Deal' },
  { value: 'bundle', label: 'Bundle' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Më të Reja' },
  { value: 'popular', label: 'Më Popullorë' },
  { value: 'highest_discount', label: 'Zbritje Më e Lartë' },
  { value: 'lowest_price', label: 'Çmim Më i Ulët' },
  { value: 'best_rated', label: 'Vlerësim Më i Lartë' },
  { value: 'ending_soon', label: 'Skadon Së Shpejti' },
];

export const LOYALTY_LEVELS = {
  bronze: { label: 'Bronze', color: '#cd7f32', min: 0, max: 499, icon: '🥉' },
  silver: { label: 'Silver', color: '#c0c0c0', min: 500, max: 1999, icon: '🥈' },
  gold: { label: 'Gold', color: '#ffd700', min: 2000, max: 4999, icon: '🥇' },
  platinum: { label: 'Platinum', color: '#e5e4e2', min: 5000, max: 9999, icon: '💎' },
  diamond: { label: 'Diamond', color: '#b9f2ff', min: 10000, max: Infinity, icon: '💠' },
};

export const VOUCHER_STATUSES = {
  active: { label: 'Aktiv', color: 'green' },
  redeemed: { label: 'Përdorur', color: 'blue' },
  expired: { label: 'Skaduar', color: 'gray' },
  cancelled: { label: 'Anulluar', color: 'red' },
  refunded: { label: 'Rimbursuar', color: 'orange' },
};

export const BUSINESS_PLANS = {
  free: { label: 'Free', price: 0, features: ['2 deals active', 'Basic analytics', 'Standard listing'] },
  starter: { label: 'Starter', price: 49, features: ['5 deals active', 'Advanced analytics', 'Priority listing', 'Email support'] },
  growth: { label: 'Growth', price: 99, features: ['15 deals active', 'Full analytics', 'Featured listing', 'Phone support', 'Marketing tools'] },
  premium: { label: 'Premium', price: 199, features: ['Unlimited deals', 'AI analytics', 'Top featured', 'Dedicated manager', 'Campaign tools', 'Custom commission'] },
};

export const ALBANIAN_MONTHS = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
