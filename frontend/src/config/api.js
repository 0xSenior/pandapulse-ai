/**
 * Centralized API configuration for PandaPulse AI.
 * Automatically falls back to relative '/api' paths for local dev and Vercel rewrites,
 * or uses VITE_API_URL if configured in environment variables.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
