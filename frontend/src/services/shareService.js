/**
 * Share utility for PandaPulse AI.
 * Generates viral, lightweight share URLs that load code directly into the Data Studio Canvas.
 */

export function createShareUrl({ code = '', title = '', prompt = '', tab = '' }) {
  const url = new URL(window.location.origin);
  if (tab) url.searchParams.set('tab', tab);
  if (code) {
    url.searchParams.set('code', code);
    if (title) url.searchParams.set('title', title);
  } else if (prompt) {
    url.searchParams.set('prompt', prompt);
  }
  return url.toString();
}

export function copyShareUrlToClipboard({ code = '', title = '', prompt = '', tab = '' }) {
  const link = createShareUrl({ code, title, prompt, tab });
  return navigator.clipboard.writeText(link).then(() => link);
}

export function parseSharedParams() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const title = params.get('title') || 'Shared Solution';
  const prompt = params.get('prompt');
  const tab = params.get('tab');
  return { code, title, prompt, tab };
}
