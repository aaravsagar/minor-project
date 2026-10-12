/**
 * API configuration for frontend communication with the backend.
 * Uses environment variable VITE_API_BASE_URL or defaults to the deployed Render backend.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://minor-project-rf8c.onrender.com';
