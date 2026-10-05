/**
 * Administrator Configuration for Need Connect
 * Designated administrator accounts
 */
export const ADMIN_EMAILS = [
  "admin@needconnect.demo",
  "admin@needconnect.com",
  "admin@welcro.com",
  "harsh@gmail.com"
];

/**
 * Checks if the given email address has admin privileges
 * @param {string} email
 * @returns {boolean}
 */
export const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === email.toLowerCase());
};
