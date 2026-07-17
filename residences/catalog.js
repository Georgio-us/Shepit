const modelData = {
  t92: { code: 'T92', type: 'Таунхаус', area: '92 м²', url: 't92/' },
  t102: { code: 'T102', type: 'Таунхаус', area: '102 м²', url: 't102/' },
  d101: { code: 'D101', type: 'Дуплекс', area: '101 м²', url: 'd101/' }
};

const plan = document.querySelector('[data-catalog-plan]');
if (plan) {
  const label = plan.querySelector('[data-unit-label]');
  const code = plan.querySelector('[data-unit-code]');
  const type = plan.querySelector('[data-unit-type]');
  const area = plan.querySelector('[data-unit-area]');
  const status = plan.querySelector('[data-unit-status]');
  const link = plan.querySelector('[data-unit-link]');

  plan.querySelectorAll('[data-unit]').forEach((pin) => {
    pin.addEventListener('click', () => {
      const model = modelData[pin.dataset.model];
      const isSold = pin.dataset.status === 'sold';
      plan.querySelectorAll('[data-unit]').forEach((item) => item.classList.remove('is-active'));
      pin.classList.add('is-active');
      label.textContent = `Резиденція ${pin.dataset.unit}`;
      code.textContent = model.code;
      type.textContent = model.type;
      area.textContent = model.area;
      status.textContent = isSold ? 'Продано' : 'У продажу';
      link.hidden = isSold;
      if (!isSold) link.href = model.url;
    });
  });
}

const lightbox = document.querySelector('[data-plan-lightbox]');
const lightboxImage = lightbox?.querySelector('[data-plan-lightbox-image]');
const lightboxDialog = lightbox?.querySelector('[data-plan-lightbox-dialog]');
let lightboxStartY = 0;
function closePlanLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.classList.remove('is-overlay-open');
}
document.querySelectorAll('[data-plan-preview]').forEach((preview) => preview.addEventListener('click', () => {
  if (!lightbox || !lightboxImage) return;
  lightboxImage.src = preview.dataset.planSrc;
  lightboxImage.alt = preview.dataset.planAlt;
  lightbox.hidden = false;
  document.body.classList.add('is-overlay-open');
}));
lightbox?.querySelectorAll('[data-plan-lightbox-close]').forEach((button) => button.addEventListener('click', closePlanLightbox));
lightboxDialog?.addEventListener('touchstart', (event) => { lightboxStartY = event.touches[0]?.clientY || 0; }, { passive: true });
lightboxDialog?.addEventListener('touchend', (event) => {
  if ((event.changedTouches[0]?.clientY || 0) - lightboxStartY > 80) closePlanLightbox();
}, { passive: true });

const application = document.querySelector('[data-catalog-application]');
const applicationForm = document.querySelector('[data-catalog-application-form]');
const applicationStatus = document.querySelector('[data-catalog-application-status]');
const applicationPicker = window.createShepitAppointmentPicker?.({
  trigger: document.querySelector('[data-catalog-application-picker-open]'),
  dateInput: document.querySelector('[data-catalog-application-date]'),
  timeInput: document.querySelector('[data-catalog-application-time]'),
  label: document.querySelector('[data-catalog-application-datetime-label]')
});
function closeCatalogApplication() {
  if (!application) return;
  application.hidden = true;
  document.body.classList.remove('is-overlay-open');
}
document.querySelectorAll('[data-catalog-application-open]').forEach((button) => button.addEventListener('click', () => {
  if (!application) return;
  application.hidden = false;
  document.body.classList.add('is-overlay-open');
  applicationPicker?.reset();
  applicationForm?.querySelector('input')?.focus();
}));
application?.querySelectorAll('[data-catalog-application-close]').forEach((button) => button.addEventListener('click', closeCatalogApplication));
applicationForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submit = applicationForm.querySelector('[type="submit"]');
  const data = new FormData(applicationForm);
  if (!data.get('date') || !data.get('time')) {
    applicationStatus.textContent = 'Оберіть, будь ласка, дату та час перегляду.';
    applicationPicker?.open();
    return;
  }
  submit.disabled = true;
  applicationStatus.textContent = 'Надсилаємо заявку…';
  try {
    const response = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), phone: data.get('phone'), date: data.get('date'), time: data.get('time'), source: 'residences-catalog-viewing' }) });
    if (!response.ok) throw new Error('Request failed');
    applicationForm.reset();
    applicationPicker?.reset();
    applicationStatus.textContent = 'Дякуємо. Менеджер зв’яжеться з вами найближчим часом.';
    if (typeof window.shepitTrack === 'function') window.shepitTrack('generate_lead', { form_name: 'residences_catalog_viewing' });
  } catch (error) {
    applicationStatus.textContent = 'Не вдалося надіслати. Спробуйте ще раз або зателефонуйте нам.';
  } finally {
    submit.disabled = false;
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closePlanLightbox();
  closeCatalogApplication();
});
