// Helper utilities for avatar SVG data-URLs and fallback initials SVG
import { createAvatar } from '@dicebear/core';
import { bigEars } from '@dicebear/collection';

export function dicebearAvatar(name = 'user', gender = 'boy') {
  const seed = (name || (gender === 'boy' ? 'boy' : 'girl'));
  const hair = gender === 'boy' ? 'short' : 'long';
  try {
    const svg = createAvatar(bigEars, { seed, hair }).toString();
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  } catch (e) {
    // If avatar generation fails for any reason, fall back to initials
    return fallbackInitialsDataUrl(name);
  }
}

export function fallbackInitialsDataUrl(name = '') {
  const initials = (name || '').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '??';
  const bg = '#E2E8F0';
  const fg = '#1F2937';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dy='0.35em' text-anchor='middle' font-family='system-ui, -apple-system, Roboto, "Helvetica Neue", Arial' font-size='72' fill='${fg}' font-weight='700'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
