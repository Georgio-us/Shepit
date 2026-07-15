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
    if (name === 'generate_lead' && typeof window.fbq === 'function') window.fbq('track', 'Lead');
  };

  window.shepitTrack = track;

  document.addEventListener('click', (event) => {
    const target = event.target.closest('a, button');
    if (!target) return;
    const text = (target.innerText || target.getAttribute('aria-label') || '').trim().slice(0, 100);
    const href = target.getAttribute('href') || '';

    if (target.matches('[data-application-modal-open]')) track('application_modal_open', { cta_text: text });
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

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (form.matches('[data-application-form], #v2-contact-form, [data-booking-form], [data-calculator-form], #form-modal, #form-plans, #form-payment')) {
      track('form_submit_attempt', { form_name: form.id || form.dataset.applicationForm || form.className });
    } else if (form.matches('[data-newsletter-form]')) {
      track('newsletter_submit');
    }
  });
})();
