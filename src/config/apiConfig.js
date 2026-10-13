/**
 * API configuration for frontend communication with the Render backend.
 * Uses environment variable VITE_API_BASE_URL or defaults to the deployed Render URL.
 */
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) || 
  'https://minor-project-rf8c.onrender.com';

/**
 * Robust fetch wrapper for all backend API calls.
 * - Adds Content-Type and auth headers automatically
 * - Times out after 15 seconds (Render free tier can cold-start slowly)
 * - Returns parsed JSON or throws descriptive errors
 *
 * @param {string} path - API path, e.g. '/api/requirements'
 * @param {object} options - fetch options (method, body, headers, etc.)
 * @param {string} [uid] - Optional Firebase UID for Authorization header
 */
export const apiFetch = async (path, options = {}, uid = null) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const headers = {
    'Content-Type': 'application/json',
    ...(uid ? { Authorization: `Bearer ${uid}`, 'x-user-id': uid } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok) {
      // Surface structured validation errors from express-validator
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const msg = data.errors.map(e => e.message).join('. ');
        throw new Error(msg);
      }
      throw new Error(data?.message || `Server error (${response.status})`);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server may be starting up — please try again in a few seconds.');
    }
    throw err;
  }
};
