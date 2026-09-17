/**
 * Lightweight Client Analytics & Event Tracker
 * Tracks user interactions: Form Submits, CTA Clicks, WhatsApp Interactions, and Navigation
 */

const STORAGE_KEY = 'inventaris_analytics_events';

export const trackEvent = (eventName, data = {}) => {
  const payload = {
    event: eventName,
    data,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    userAgent: navigator.userAgent,
  };

  // Console output for dev visibility
  console.log(`[Analytics Event] ${eventName}:`, payload);

  // Store in event history (last 50 events)
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const events = raw ? JSON.parse(raw) : [];
    events.unshift(payload);
    if (events.length > 50) events.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('Could not persist analytics event to localStorage', e);
  }

  // Dispatch custom window event if any listener hooks in
  window.dispatchEvent(new CustomEvent('app_analytics_event', { detail: payload }));
};

export const trackFormSubmit = (formName, status = 'success', metadata = {}) => {
  trackEvent('form_submit', { formName, status, ...metadata });
};

export const trackClickCTA = (ctaName, targetUrl = '') => {
  trackEvent('click_cta', { ctaName, targetUrl });
};

export const trackClickWA = (source = 'navbar') => {
  trackEvent('click_wa', { source, phoneNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890' });
};

export const trackPageView = (pageName) => {
  trackEvent('page_view', { pageName, title: document.title, url: window.location.href });
};

export const getAnalyticsHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
