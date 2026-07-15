const form = document.querySelector('[data-calculator-form]');

const units = {
  t92: { code: 'T92', type: 'Таунхаус', area: 92 },
  t102: { code: 'T102', type: 'Таунхаус', area: 102 },
  d101: { code: 'D101', type: 'Дуплекс', area: 101 }
};

const aliases = {
  'townhouse-92': 't92',
  'townhouse-102': 't102',
  'duplex-101': 'd101'
};

const pricePerMeter = 990;
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function formatMoney(value) {
  return money.format(Math.round(value)).replace(/,/g, ' ');
}

function selectedValue(name) {
  return form.elements[name] instanceof RadioNodeList ? form.elements[name].value : form.elements[name]?.value;
}

function getEstimate() {
  const key = selectedValue('unit') || 't92';
  const unit = units[key] || units.t92;
  const depositPercent = Number(form.elements.deposit.value || 0);
  const months = Number(selectedValue('months') || 12);
  const cash = form.elements.cash.checked;
  const total = unit.area * pricePerMeter;
  const deposit = cash ? total : total * (depositPercent / 100);
  const balance = total - deposit;

  return { key, unit, depositPercent, months, cash, total, deposit, balance, monthly: cash ? 0 : balance / months };
}

function renderTimeline(months, cash) {
  const timeline = document.querySelector('[data-timeline]');
  timeline.innerHTML = Array.from({ length: 12 }, (_, index) => {
    const active = !cash && index < months ? ' is-active' : '';
    const height = 5 + ((index % 4) * 4);
    return `<i class="${active}" style="height:${height}px" aria-hidden="true"></i>`;
  }).join('');
}

function updateUrl(key) {
  const url = new URL(window.location.href);
  url.searchParams.set('unit', key);
  window.history.replaceState({}, '', url);
}

function render() {
  const estimate = getEstimate();
  const fill = (estimate.depositPercent / 70) * 100;
  form.elements.deposit.style.setProperty('--range-fill', `${fill}%`);

  document.querySelector('[data-deposit-percent]').textContent = `${estimate.depositPercent}%`;
  document.querySelector('[data-deposit-amount]').textContent = formatMoney(estimate.cash ? estimate.total : estimate.deposit);
  document.querySelector('[data-monthly]').textContent = formatMoney(estimate.monthly);
  document.querySelector('[data-months]').textContent = `${estimate.months} ${estimate.months === 3 ? 'місяці' : 'місяців'}`;
  document.querySelector('[data-unit-label]').textContent = `${estimate.unit.code} · ${estimate.unit.area} м²`;
  document.querySelector('[data-total]').textContent = formatMoney(estimate.total);
  document.querySelector('[data-deposit-detail]').textContent = estimate.cash ? '100%' : `${formatMoney(estimate.deposit)} · ${estimate.depositPercent}%`;
  document.querySelector('[data-balance]').textContent = formatMoney(estimate.balance);
  document.querySelector('[data-installment-result]').hidden = estimate.cash;
  document.querySelector('[data-cash-result]').hidden = !estimate.cash;
  document.querySelector('[data-installment-group]').classList.toggle('is-locked', estimate.cash);
  form.elements.months.forEach(input => { input.disabled = estimate.cash; });
  renderTimeline(estimate.months, estimate.cash);
  updateUrl(estimate.key);
}

function applyUrlSelection() {
  const value = new URLSearchParams(window.location.search).get('unit');
  const key = aliases[value] || value;
  const input = form.querySelector(`input[name="unit"][value="${key}"]`);
  if (input) input.checked = true;
}

function getLeadSource() {
  const estimate = getEstimate();
  if (estimate.cash) {
    return `Калькулятор SHEPIT HOUSE | ${estimate.unit.code}, ${estimate.unit.area} м² | 100% оплата | орієнтовна вартість ${formatMoney(estimate.total)}`;
  }
  return `Калькулятор SHEPIT HOUSE | ${estimate.unit.code}, ${estimate.unit.area} м² | внесок ${estimate.depositPercent}% (${formatMoney(estimate.deposit)}) | ${estimate.months} міс. | платіж ${formatMoney(estimate.monthly)}`;
}

form.addEventListener('input', render);
form.addEventListener('change', render);

form.addEventListener('submit', async event => {
  event.preventDefault();
  const submit = form.querySelector('button[type="submit"]');
  const status = document.querySelector('[data-form-status]');
  const original = submit.querySelector('span').textContent;
  const data = new FormData(form);

  submit.disabled = true;
  submit.querySelector('span').textContent = 'Надсилаємо…';
  status.textContent = '';

  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.get('name'),
        phone: data.get('phone'),
        source: getLeadSource(),
        device: window.matchMedia('(max-width: 700px)').matches ? '📱 Мобільний' : '💻 Десктоп',
        timestamp: new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })
      })
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error('submit_failed');

    if (typeof window.shepitTrack === 'function') window.shepitTrack('generate_lead', { form_name: 'calculator_v2', unit: getEstimate().key });
    document.querySelector('[data-success-modal]').hidden = false;
    document.body.classList.add('is-modal-open');
    form.elements.name.value = '';
    form.elements.phone.value = '';
  } catch (error) {
    status.textContent = 'Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте нам.';
  } finally {
    submit.disabled = false;
    submit.querySelector('span').textContent = original;
  }
});

function closeSuccess() {
  document.querySelector('[data-success-modal]').hidden = true;
  document.body.classList.remove('is-modal-open');
}

document.querySelector('[data-success-close]').addEventListener('click', closeSuccess);
document.querySelector('[data-success-modal]').addEventListener('click', event => {
  if (event.target === event.currentTarget) closeSuccess();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !document.querySelector('[data-success-modal]').hidden) closeSuccess();
});

applyUrlSelection();
render();
