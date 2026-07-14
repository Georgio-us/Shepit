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

  plan.querySelectorAll('[data-unit]:not(:disabled)').forEach((pin) => {
    pin.addEventListener('click', () => {
      const model = modelData[pin.dataset.model];
      plan.querySelectorAll('[data-unit]').forEach((item) => item.classList.remove('is-active'));
      pin.classList.add('is-active');
      label.textContent = `Резиденція ${pin.dataset.unit}`;
      code.textContent = model.code;
      type.textContent = model.type;
      area.textContent = model.area;
      status.textContent = pin.classList.contains('is-reserved') ? 'Заброньовано' : 'У продажу';
      link.href = model.url;
    });
  });
}
