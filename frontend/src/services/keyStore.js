/**
 * Local storage manager for Bring Your Own Key (BYOK) mode.
 * Stores user-provided API keys strictly inside client browser memory (localStorage).
 */

const STORAGE_KEY = 'pandapulse_byok_keys_v1';

export function getStoredKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCustomApiKey(provider = 'groq') {
  const keys = getStoredKeys();
  return keys[provider] || '';
}

export function setCustomApiKey(provider, key) {
  const keys = getStoredKeys();
  if (!key || !key.trim()) {
    delete keys[provider];
  } else {
    keys[provider] = key.trim();
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch (e) {
    console.warn('Failed to save API key to localStorage:', e);
  }
}

export function removeCustomApiKey(provider) {
  setCustomApiKey(provider, '');
}

export function clearAllCustomKeys() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear keys:', e);
  }
}
