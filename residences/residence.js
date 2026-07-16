const models = {
  t92: {
    code: 'T92', type: 'Таунхаус', area: '92 м²', parcel: 'до 2 соток', bedrooms: '3', price: 'від $85 000',
    description: 'Компактна приватна резиденція для сім\'ї: три спальні, власний двір, тераса та два паркомісця.',
    gallery: ['../../assets/townhouse-front-day.webp', '../../assets/townhouse-front-night.webp'],
    plans: ['../../assets/plan-t92-floor-1.webp', '../../assets/plan-t92-floor-2.webp'],
    rooms: [
      [['Тамбур', '3,8 м²'], ['Кухня-вітальня', '28,7 м²'], ['Кабінет / спальня', '10,4 м²'], ['Санвузол', '4,2 м²'], ['Тераса', '16 м²']],
      [['Хол', '6,1 м²'], ['Спальня 01', '12,8 м²'], ['Спальня 02', '11,7 м²'], ['Спальня 03', '14,2 м²'], ['Ванна кімната', '5,4 м²']]
    ],
    related: ['03', '04'], current: '03'
  },
  t102: {
    code: 'T102', type: 'Таунхаус', area: '102 м²', parcel: 'до 2 соток', bedrooms: '3', price: 'за запитом',
    description: 'Збільшений формат таунхауса з просторою денною зоною, трьома спальнями та приватною територією.',
    gallery: ['../../assets/townhouse-front-day.webp', '../../assets/townhouse-front-night.webp'],
    plans: ['../../assets/plan-t102-floor-1.webp', '../../assets/plan-t102-floor-2.webp'],
    rooms: [
      [['Тамбур', '4,1 м²'], ['Кухня-вітальня', '31,2 м²'], ['Кабінет', '10,8 м²'], ['Санвузол', '4,5 м²'], ['Тераса', '18 м²']],
      [['Хол', '6,8 м²'], ['Спальня 01', '13,5 м²'], ['Спальня 02', '12,1 м²'], ['Спальня 03', '14,8 м²'], ['Ванна кімната', '5,8 м²']]
    ],
    related: ['05', '06'], current: '05'
  },
  d101: {
    code: 'D101', type: 'Дуплекс', area: '101 м²', parcel: 'до 2 соток', bedrooms: '4', price: 'за запитом',
    description: 'Просторий дуплекс для великої родини: чотири спальні, власний двір, тераса та окремий вхід.',
    gallery: ['../../assets/duplex-front-day.webp', '../../assets/duplex-front-night.webp', '../../assets/duplex-back-day.webp', '../../assets/duplex-back-night.webp'],
    plans: ['../../assets/plan-d101-floor-1.webp', '../../assets/plan-d101-floor-2.webp'],
    rooms: [
      [['Тамбур', '3,9 м²'], ['Кухня-вітальня', '26,7 м²'], ['Гостьова спальня', '11,2 м²'], ['Санвузол', '4,4 м²'], ['Тераса', '17 м²']],
      [['Хол', '6,5 м²'], ['Спальня 01', '12,6 м²'], ['Спальня 02', '11,9 м²'], ['Спальня 03', '13,8 м²'], ['Ванна кімната', '5,6 м²']]
    ],
    related: ['01', '02', '07', '08'], current: '01'
  }
};

const key = document.body.dataset.residence || 't92';
const model = models[key] || models.t92;
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11"/></svg>';
const calendarIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>';
const walletIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h15a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h12v4"/><circle cx="17" cy="13" r="1"/></svg>';

const pinData = [
  ['03','36.82%','16.62%','33.53%','t92'], ['04','46.78%','16.62%','45.98%','t92'], ['05','55.69%','16.62%','57.11%','t102'], ['06','65.97%','16.62%','69.96%','t102'],
  ['02','32.14%','29.91%','27.68%','d101'], ['01','29.54%','49.76%','24.43%','d101'], ['07','71.11%','29.91%','76.39%','d101'], ['08','72.48%','49.76%','78.10%','d101']
];

document.querySelector('#app').innerHTML = `
  <main class="residence-page">
    <section class="residence-hero" aria-labelledby="residence-title">
      <div class="residence-gallery" data-gallery>
        <img class="residence-gallery__image" src="${model.gallery[0]}" alt="${model.type} ${model.code} — фасад резиденції" data-gallery-image>
        <div class="residence-gallery__controls">
          <span class="residence-gallery__count"><b data-gallery-current>01</b> / 0${model.gallery.length}</span>
          <span class="residence-gallery__progress"><i data-gallery-progress></i></span>
          <button class="circle-control" type="button" data-gallery-prev aria-label="Попередній кадр"><svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg></button>
          <button class="circle-control" type="button" data-gallery-next aria-label="Наступний кадр"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></button>
        </div>
      </div>
      <article class="residence-summary">
        <div class="residence-summary__top">
          <a class="residence-brand" href="/">SHEPIT <small>HOUSE</small></a>
          <a class="residence-close" href="/#residences" aria-label="Повернутися до резиденцій"></a>
        </div>
        <div class="residence-summary__body">
          <p class="residence-kicker">Приватна резиденція · Нові Петрівці</p>
          <h1 class="residence-title" id="residence-title">${model.code}</h1>
          <nav class="residence-tabs" aria-label="Типи резиденцій">
            ${Object.entries(models).map(([id, item]) => `<a href="../${id}/" class="${id === key ? 'is-active' : ''}" ${id === key ? 'aria-current="page"' : ''}>${item.code}</a>`).join('')}
          </nav>
          <div class="residence-metrics">
            <div class="residence-metric"><strong>${model.area}</strong><span>площа будинку</span></div>
            <div class="residence-metric"><strong>${model.parcel}</strong><span>власна ділянка</span></div>
            <div class="residence-metric"><strong>${model.bedrooms}</strong><span>спальні</span></div>
          </div>
          <div class="residence-price"><strong>${model.price}</strong><span>готовий будинок</span></div>
          <div class="residence-actions">
            <a class="pill-action" href="#booking"><span>Записатися на перегляд</span><i class="button-arrow">${arrow}</i></a>
            <button class="secondary-action" type="button" aria-label="PDF-презентація готується" title="PDF-презентація готується"><svg viewBox="0 0 24 24"><path d="M6 2h8l4 4v16H6zM14 2v5h5M8.5 16.5h7M8.5 13h7"/></svg><span>PDF</span></button>
          </div>
          <a class="residence-installment" href="../../calculator/?unit=${key}">${walletIcon}<span>Доступна розстрочка · відкрити калькулятор</span></a>
        </div>
      </article>
    </section>

    <section class="section plans-section" id="plans" aria-labelledby="plans-title">
      <p class="section-label">(01) · Планування</p>
      <div class="plans-head">
        <h2 class="section-heading" id="plans-title">Простір,<br>продуманий для життя.</h2>
        <div class="plans-controls">
          <button class="plan-tab is-active" type="button" data-floor="0" aria-pressed="true">1</button>
          <button class="plan-tab" type="button" data-floor="1" aria-pressed="false">2</button>
        </div>
      </div>
      <div class="plans-layout">
        <div class="room-list" data-room-list></div>
        <figure class="plan-stage"><img src="${model.plans[0]}" alt="План першого поверху ${model.code}" data-plan-image></figure>
      </div>
    </section>

    <section class="section specs-section" aria-labelledby="specs-title">
      <p class="section-label">(02) · Архітектура і комплектація</p>
      <div class="specs-intro">
        <h2 class="section-heading" id="specs-title">Деталі,<br>що залишаються.</h2>
        <p>${model.description} Будинок передається із підключеними комунікаціями та готовою приватною територією.</p>
      </div>
      <div class="specs-grid">
        ${[
          ['Каркас','Монолітний залізобетонний каркас будинку.'], ['Стіни','Керамоблок із продуманим теплоізоляційним контуром.'],
          ['Фасад','Комбінація клінкерної цегли та сучасних панелей.'], ['Утеплення','Мінеральна вата по всьому фасаду.'],
          ['Вікна','Панорамні енергоефективні алюмінієві системи.'], ['Опалення','Індивідуальна система опалення кожної резиденції.'],
          ['Електрика','Окреме підключення та резерв потужності.'], ['Інженерія','Автономні підведені комунікації.']
        ].map((item, index) => `<article class="spec-card"><i>0${index + 1}</i><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('')}
      </div>
      <div class="material-pair">
        <figure><img src="../../assets/photo_rop 1.webp" alt="Матеріали фасаду SHEPIT HOUSE" loading="lazy"></figure>
        <figure><img src="../../assets/img_5.webp" alt="Архітектурні деталі SHEPIT HOUSE" loading="lazy"></figure>
      </div>
    </section>

    <section class="section masterplan-section" aria-labelledby="masterplan-title">
      <p class="section-label">(03) · Резиденція на генплані</p>
      <div class="masterplan-head">
        <h2 class="section-heading" id="masterplan-title">Оберіть свій<br>будинок.</h2>
        <p>Номери вашого типу резиденції виділені. Інший номер одразу відкриє відповідне планування.</p>
      </div>
      <div class="masterplan-frame">
        <img src="../../assets/visual_2.webp" alt="Генеральний план SHEPIT HOUSE" loading="lazy">
        ${pinData.map(([number,x,y,mobileX,target]) => `<a class="unit-pin ${model.related.includes(number) ? 'is-related' : ''} ${model.current === number ? 'is-current' : ''}" style="--x:${x};--y:${y};--mobile-x:${mobileX}" href="../${target}/" aria-label="Резиденція ${number}, відкрити ${models[target].code}">${number}</a>`).join('')}
      </div>
      <div class="masterplan-legend"><span><i></i>Обрана резиденція</span><span><i></i>Цей тип планування</span><span>Натисніть номер, щоб перейти</span></div>
    </section>

    <section class="section booking-section" id="booking" aria-labelledby="booking-title">
      <div class="booking-grid">
        <div class="booking-copy">
          <p class="section-label">(04) · Запис на перегляд</p>
          <h2 class="section-heading" id="booking-title">Побачити<br>${model.code} наживо.</h2>
          <p>Оберіть зручну дату й орієнтовний час. Менеджер зв’яжеться з вами та підтвердить перегляд.</p>
        </div>
        <form class="booking-form" data-booking-form>
          <label class="field"><input name="name" type="text" autocomplete="name" placeholder="Ваше ім’я" required></label>
          <label class="field"><input name="phone" type="tel" autocomplete="tel" placeholder="Номер телефону" required></label>
          <input name="date" type="hidden" data-date-input>
          <input name="time" type="hidden" data-time-input>
          <button class="datetime-trigger" type="button" data-picker-open>${calendarIcon}<span data-datetime-label>Обрати дату та час</span>${arrow}</button>
          <button class="pill-action" type="submit"><span>Надіслати заявку</span><i class="button-arrow">${arrow}</i></button>
          <p class="booking-note">Менеджер підтвердить обраний час телефоном.</p>
          <p class="form-status" data-form-status aria-live="polite"></p>
        </form>
      </div>
    </section>
  </main>

  <div class="picker" data-picker aria-hidden="true">
    <div class="picker__panel" role="dialog" aria-modal="true" aria-labelledby="picker-title">
      <div class="picker__head"><h2 id="picker-title">Дата та час</h2><button class="picker__close" type="button" data-picker-close aria-label="Закрити">×</button></div>
      <div class="picker__wheels"><div class="picker__wheel" data-date-wheel></div><div class="picker__wheel" data-time-wheel></div></div>
      <button class="picker__confirm" type="button" data-picker-confirm>Підтвердити</button>
    </div>
  </div>`;

let galleryIndex = 0;
const gallery = document.querySelector('[data-gallery]');
const galleryImage = document.querySelector('[data-gallery-image]');
const galleryCurrent = document.querySelector('[data-gallery-current]');
const galleryProgress = document.querySelector('[data-gallery-progress]');
function showGallery(index) {
  galleryIndex = (index + model.gallery.length) % model.gallery.length;
  gallery.classList.add('is-changing');
  window.setTimeout(() => {
    galleryImage.src = model.gallery[galleryIndex];
    galleryImage.alt = `${model.type} ${model.code} — ракурс ${galleryIndex + 1}`;
    galleryCurrent.textContent = String(galleryIndex + 1).padStart(2, '0');
    galleryProgress.style.transform = `translateX(${galleryIndex * 100}%)`;
    gallery.classList.remove('is-changing');
  }, 140);
}
document.querySelector('[data-gallery-prev]').addEventListener('click', () => showGallery(galleryIndex - 1));
document.querySelector('[data-gallery-next]').addEventListener('click', () => showGallery(galleryIndex + 1));

let floor = 0;
const planImage = document.querySelector('[data-plan-image]');
const roomList = document.querySelector('[data-room-list]');
function renderFloor(nextFloor) {
  floor = nextFloor;
  document.querySelectorAll('[data-floor]').forEach((button, index) => {
    button.classList.toggle('is-active', index === floor);
    button.setAttribute('aria-pressed', String(index === floor));
  });
  planImage.style.opacity = '.35';
  window.setTimeout(() => {
    planImage.src = model.plans[floor];
    planImage.alt = `План ${floor + 1} поверху ${model.code}`;
    planImage.style.opacity = '1';
  }, 120);
  roomList.innerHTML = model.rooms[floor].map((item, index) => `<div class="room-item"><i>0${index + 1}</i><strong>${item[0]}</strong><span>${item[1]}</span></div>`).join('');
}
document.querySelectorAll('[data-floor]').forEach(button => button.addEventListener('click', () => renderFloor(Number(button.dataset.floor))));
renderFloor(0);

const picker = document.querySelector('[data-picker]');
const dateWheel = document.querySelector('[data-date-wheel]');
const timeWheel = document.querySelector('[data-time-wheel]');
const dateInput = document.querySelector('[data-date-input]');
const timeInput = document.querySelector('[data-time-input]');
const dateTimeLabel = document.querySelector('[data-datetime-label]');
const dayNames = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const monthNames = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];
const dates = Array.from({ length: 21 }, (_, offset) => {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() + offset + 1);
  return { value: value.toISOString().slice(0, 10), label: `${dayNames[value.getDay()]}, ${value.getDate()} ${monthNames[value.getMonth()]}` };
});
const times = [];
for (let hour = 10; hour <= 19; hour += 1) {
  times.push(`${String(hour).padStart(2, '0')}:00`);
  if (hour < 19) times.push(`${String(hour).padStart(2, '0')}:30`);
}
let selectedDate = dates[0];
let selectedTime = times[0];
function renderWheel(container, items, selectedValue, kind) {
  container.innerHTML = items.map(item => {
    const value = typeof item === 'string' ? item : item.value;
    const label = typeof item === 'string' ? item : item.label;
    return `<button class="picker__option ${value === selectedValue ? 'is-selected' : ''}" type="button" data-picker-kind="${kind}" data-picker-value="${value}">${label}</button>`;
  }).join('');
}
function selectOption(kind, value) {
  if (kind === 'date') selectedDate = dates.find(item => item.value === value) || dates[0];
  else selectedTime = value;
  renderWheel(dateWheel, dates, selectedDate.value, 'date');
  renderWheel(timeWheel, times, selectedTime, 'time');
  requestAnimationFrame(() => {
    [dateWheel, timeWheel].forEach(wheel => {
      const selected = wheel.querySelector('.is-selected');
      if (selected) wheel.scrollTop = selected.offsetTop - wheel.clientHeight / 2 + selected.offsetHeight / 2;
    });
  });
}
renderWheel(dateWheel, dates, selectedDate.value, 'date');
renderWheel(timeWheel, times, selectedTime, 'time');
[dateWheel, timeWheel].forEach(wheel => wheel.addEventListener('click', event => {
  const option = event.target.closest('[data-picker-value]');
  if (option) selectOption(option.dataset.pickerKind, option.dataset.pickerValue);
}));
const wheelTimers = new WeakMap();
[dateWheel, timeWheel].forEach(wheel => wheel.addEventListener('scroll', () => {
  window.clearTimeout(wheelTimers.get(wheel));
  wheelTimers.set(wheel, window.setTimeout(() => {
    const wheelRect = wheel.getBoundingClientRect();
    const center = wheelRect.top + wheelRect.height / 2;
    const options = [...wheel.querySelectorAll('[data-picker-value]')];
    const closest = options.reduce((best, option) => {
      const rect = option.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      return !best || distance < best.distance ? { option, distance } : best;
    }, null)?.option;
    if (!closest) return;
    options.forEach(option => option.classList.toggle('is-selected', option === closest));
    if (closest.dataset.pickerKind === 'date') {
      selectedDate = dates.find(item => item.value === closest.dataset.pickerValue) || dates[0];
    } else {
      selectedTime = closest.dataset.pickerValue;
    }
  }, 90));
}));
function openPicker() {
  picker.classList.add('is-open');
  picker.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-picker-open');
  window.setTimeout(() => selectOption('date', selectedDate.value), 40);
}
function closePicker() {
  picker.classList.remove('is-open');
  picker.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-picker-open');
}
document.querySelector('[data-picker-open]').addEventListener('click', openPicker);
document.querySelector('[data-picker-close]').addEventListener('click', closePicker);
picker.addEventListener('click', event => { if (event.target === picker) closePicker(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closePicker(); });
document.querySelector('[data-picker-confirm]').addEventListener('click', () => {
  dateInput.value = selectedDate.value;
  timeInput.value = selectedTime;
  dateTimeLabel.textContent = `${selectedDate.label} · ${selectedTime}`;
  document.querySelector('[data-picker-open]').classList.add('has-value');
  closePicker();
});

document.querySelector('[data-booking-form]').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[type="submit"]');
  const data = new FormData(form);
  if (!data.get('date') || !data.get('time')) {
    status.textContent = 'Оберіть, будь ласка, дату та час.';
    openPicker();
    return;
  }
  submit.disabled = true;
  status.textContent = 'Надсилаємо заявку…';
  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.get('name'), phone: data.get('phone'),
        source: `residence-${model.code.toLowerCase()}-${data.get('date')}-${data.get('time')}`
      })
    });
    if (!response.ok) throw new Error('Request failed');
    form.reset();
    dateInput.value = '';
    timeInput.value = '';
    dateTimeLabel.textContent = 'Обрати дату та час';
    document.querySelector('[data-picker-open]').classList.remove('has-value');
    status.textContent = 'Дякуємо. Менеджер зв’яжеться з вами для підтвердження.';
    if (typeof window.shepitTrack === 'function') window.shepitTrack('generate_lead', { form_name: 'residence_booking', residence: model.code });
  } catch (error) {
    status.textContent = 'Не вдалося надіслати. Спробуйте ще раз або зателефонуйте нам.';
  } finally {
    submit.disabled = false;
  }
});
