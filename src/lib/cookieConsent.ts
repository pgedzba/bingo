import { writable } from 'svelte/store';

export const cookieConsent = writable<boolean | null>(null);

if (typeof window !== 'undefined') {
  const consent = localStorage.getItem('cookieConsent');
  if (consent === 'true') cookieConsent.set(true);
  else if (consent === 'false') cookieConsent.set(false);
  else cookieConsent.set(null);
}

export function acceptCookies() {
  localStorage.setItem('cookieConsent', 'true');
  cookieConsent.set(true);
}

export function rejectCookies() {
  localStorage.setItem('cookieConsent', 'false');
  cookieConsent.set(false);
}
