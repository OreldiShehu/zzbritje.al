import { formatDistance, format, parseISO } from 'date-fns';
import { sq } from 'date-fns/locale';

export const formatCurrency = (amount, currency = 'ALL') => {
  const rounded = Math.ceil((amount || 0) / 100) * 100;
  if (currency === 'ALL') return `${rounded.toLocaleString('sq-AL')} L`;
  return new Intl.NumberFormat('sq-AL', { style: 'currency', currency }).format(rounded);
};

export const formatDiscount = (percentage) => `-${Math.round(percentage)}%`;

export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '';
  try {
    return format(typeof date === 'string' ? parseISO(date) : date, formatStr, { locale: sq });
  } catch { return ''; }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    return formatDistance(typeof date === 'string' ? parseISO(date) : date, new Date(), { addSuffix: true, locale: sq });
  } catch { return ''; }
};

export const formatCountdown = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  if (diff <= 0) return { expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { expired: false, days, hours, minutes, seconds };
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const truncate = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return text.slice(0, length) + '...';
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\+355|0)(\d{2})(\d{3})(\d{3})(\d*)/, (_, code, a, b, c, d) =>
    `${code || '+355'} ${a} ${b} ${c}${d ? ' ' + d : ''}`
  ).trim();
};

export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const slugToTitle = (slug) => slug ? slug.split('-').map(capitalize).join(' ') : '';

export const getImageUrl = (url, width = 800) => {
  if (!url) return '/placeholder.jpg';
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }
  return url;
};
