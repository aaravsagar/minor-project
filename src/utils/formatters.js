/**
 * Currency and Date formatters for Indian locale standards
 */

/**
 * Formats a number to Indian Rupee representation (e.g. ₹35,000 or ₹1,25,000)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN');
};

/**
 * Formats a Firestore Timestamp or JS Date to a human readable format
 * @param {any} dateObj 
 * @param {boolean} includeTime 
 * @returns {string}
 */
export const formatDate = (dateObj, includeTime = false) => {
  if (!dateObj) return '—';
  
  let date;
  if (dateObj.toDate && typeof dateObj.toDate === 'function') {
    date = dateObj.toDate();
  } else if (dateObj.seconds) {
    date = new Date(dateObj.seconds * 1000);
  } else if (dateObj instanceof Date) {
    date = dateObj;
  } else if (typeof dateObj === 'string' || typeof dateObj === 'number') {
    date = new Date(dateObj);
  } else {
    return '—';
  }

  if (isNaN(date.getTime())) return '—';

  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }

  return date.toLocaleDateString('en-IN', options);
};

/**
 * Returns a time ago string (e.g., "5 mins ago", "2 hours ago", "Yesterday")
 * @param {any} dateObj 
 * @returns {string}
 */
export const timeAgo = (dateObj) => {
  if (!dateObj) return '';
  let date;
  if (dateObj.toDate && typeof dateObj.toDate === 'function') {
    date = dateObj.toDate();
  } else if (dateObj.seconds) {
    date = new Date(dateObj.seconds * 1000);
  } else {
    date = new Date(dateObj);
  }
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return formatDate(date);
};

/**
 * Truncates text with ellipsis
 * @param {string} text 
 * @param {number} length 
 * @returns {string}
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
