(function () {
  const GA_ID = 'G-BZKXJY7T45';
  const META_ID = '1008871435016680';
  const GTM_ID = 'GTM-53F9CWJ4';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  if (!window.__shepitGaLoaded && !document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    window.__shepitGaLoaded = true;
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    const ga = document.createElement('script');
    ga.async = true;
    ga.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(ga);
  }

  if (!window.fbq && !window.__shepitMetaLoaded) {
    window.__shepitMetaLoaded = true;
    const queue = [];
    const fbq = function () { queue.push(arguments); };
    fbq.queue = queue;
    window.fbq = fbq;
    const pixel = document.createElement('script');
    pixel.async = true;
    pixel.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(pixel);
    window.fbq('init', META_ID);
    window.fbq('track', 'PageView');
  }

  if (!document.querySelector('script[data-shepit-gtm], script[src*="googletagmanager.com/gtm.js"]')) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const gtm = document.createElement('script');
    gtm.async = true;
    gtm.dataset.shepitGtm = 'true';
    gtm.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(gtm);
  }

  const track = (name, params = {}) => {
    window.gtag('event', name, { ...params, page_location: window.location.href });
    if (name === 'generate_lead') {
      // The API only returns success after at least one lead channel accepts it.
      window.gtag('event', 'lead_received', { ...params, page_location: window.location.href });
      window.gtag('event', 'form_submit_success', { ...params, page_location: window.location.href });
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
    }
  };

  window.shepitTrack = track;

  const formSelector = '[data-application-form], #v2-contact-form, [data-booking-form], [data-catalog-application-form], [data-calculator-form], #form-modal, #form-plans, #form-payment';
  const formName = (form) => {
    if (form.dataset.analyticsForm) return form.dataset.analyticsForm;
    if (form.matches('[data-application-form]')) return 'application_modal';
    if (form.matches('#v2-contact-form')) return 'contact_form';
    if (form.matches('[data-calculator-form]')) return 'calculator';
    if (form.matches('[data-catalog-application-form]')) return 'residences_catalog_inquiry';
    if (form.matches('[data-booking-form]')) return 'residence_inquiry';
    return form.id || 'lead_form';
  };
  const formParams = (form, extra = {}) => ({ form_name: formName(form), ...extra });

  window.shepitTrackFormBlocked = (form, reason) => track('form_submit_blocked', formParams(form, { reason }));
  window.shepitTrackFormFailure = (form, reason = 'request_failed') => track('form_submit_failure', formParams(form, { reason }));

  const observedForms = new WeakSet();
  const startedForms = new WeakSet();
  const seenForms = new WeakSet();
  const registerForm = (form) => {
    if (!(form instanceof HTMLFormElement) || observedForms.has(form)) return;
    observedForms.add(form);
    form.dataset.analyticsForm = formName(form);
    observer?.observe(form);
  };
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || seenForms.has(entry.target)) return;
      seenForms.add(entry.target);
      track('form_view', formParams(entry.target));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.35 }) : null;
  const registerForms = () => document.querySelectorAll(formSelector).forEach(registerForm);

  document.addEventListener('focusin', (event) => {
    const field = event.target.closest('input, select, textarea');
    const form = field?.closest(formSelector);
    if (!form || startedForms.has(form)) return;
    startedForms.add(form);
    track('form_start', formParams(form, { first_field: field.name || field.type || 'unknown' }));
  });
  document.addEventListener('invalid', (event) => {
    const field = event.target;
    const form = field.closest?.(formSelector);
    if (form) track('form_validation_error', formParams(form, { field_name: field.name || field.type || 'unknown' }));
  }, true);
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (form.matches(formSelector)) track('form_submit_attempt', formParams(form));
    else if (form.matches('[data-newsletter-form]')) track('newsletter_submit');
  });

  document.addEventListener('click', (event) => {
    const target = event.target.closest('a, button');
    if (!target) return;
    const text = (target.innerText || target.getAttribute('aria-label') || '').trim().slice(0, 100);
    const href = target.getAttribute('href') || '';

    if (target.matches('[data-hero-calculator]')) track('calculator_open', { cta_text: text, source: 'hero' });
    else if (target.matches('[data-plan-link]')) track('application_modal_open', { cta_text: text, source: 'masterplan' });
    else if (target.matches('[data-application-modal-open]')) track('application_modal_open', { cta_text: text });
    else if (target.matches('[data-catalog-application-open]')) track('catalog_inquiry_open', { cta_text: text });
    else if (target.matches('[data-residence-inquiry-open]')) track('residence_inquiry_open', { cta_text: text });
    else if (target.matches('[data-question-button]')) track('application_modal_open', { cta_text: text, source: 'faq' });
    else if (target.matches('[data-contact-toggle]')) track('contact_widget_open');
    else if (/^tel:/i.test(href)) track('phone_click', { link_url: href });
    else if (/t\.me\//i.test(href)) track('telegram_click', { link_url: href });
    else if (/^viber:/i.test(href)) track('viber_click', { link_url: href });
    else if (target.matches('[data-plan-unit], [data-plan-target], [data-unit]')) track('masterplan_interaction', { residence: target.dataset.planUnit || target.dataset.planTarget || target.dataset.unit });
    else if (/\/residences\//.test(href)) track('residence_open', { link_url: href });
    else if (/\/calculator\//.test(href)) track('calculator_open', { link_url: href });
    else if (target.matches('[data-media-video]')) track('video_open', { video_id: target.dataset.mediaVideo || '' });
    else if (target.matches('.faq-v2__item button')) track('faq_open', { cta_text: text });
    else if (target.matches('[data-cookie-accept]')) track('privacy_notice_accept');
  });

  document.addEventListener('DOMContentLoaded', registerForms);
  new MutationObserver(registerForms).observe(document.documentElement, { childList: true, subtree: true });
})();
