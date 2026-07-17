(() => {
  const dayNames = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const monthNames = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  const createDates = () => Array.from({ length: 21 }, (_, offset) => {
    const value = new Date();
    value.setHours(12, 0, 0, 0);
    value.setDate(value.getDate() + offset + 1);
    return { value: value.toISOString().slice(0, 10), label: `${dayNames[value.getDay()]}, ${value.getDate()} ${monthNames[value.getMonth()]}` };
  });
  const createTimes = () => {
    const times = [];
    for (let hour = 10; hour <= 19; hour += 1) {
      times.push(`${String(hour).padStart(2, '0')}:00`);
      if (hour < 19) times.push(`${String(hour).padStart(2, '0')}:30`);
    }
    return times;
  };

  window.createShepitAppointmentPicker = ({ trigger, dateInput, timeInput, label }) => {
    if (!trigger || !dateInput || !timeInput || !label) return null;
    const dates = createDates();
    const times = createTimes();
    let selectedDate = dates[0];
    let selectedTime = times[0];
    const picker = document.createElement('div');
    picker.className = 'booking-picker';
    picker.setAttribute('aria-hidden', 'true');
    picker.innerHTML = `<div class="booking-picker__panel" role="dialog" aria-modal="true" aria-labelledby="booking-picker-title"><div class="booking-picker__head"><h2 id="booking-picker-title">Дата та час</h2><button class="booking-picker__close" type="button" aria-label="Закрити"><span></span><span></span></button></div><div class="booking-picker__wheels"><div class="booking-picker__wheel" data-date-wheel></div><div class="booking-picker__wheel" data-time-wheel></div></div><button class="booking-picker__confirm" type="button">Підтвердити</button></div>`;
    document.body.append(picker);
    const dateWheel = picker.querySelector('[data-date-wheel]');
    const timeWheel = picker.querySelector('[data-time-wheel]');
    const scrollSelectedIntoView = () => requestAnimationFrame(() => [dateWheel, timeWheel].forEach((wheel) => {
      const selected = wheel.querySelector('.is-selected');
      if (selected) wheel.scrollTop = selected.offsetTop - wheel.clientHeight / 2 + selected.offsetHeight / 2;
    }));
    const renderWheel = (wheel, items, selected, kind) => {
      wheel.innerHTML = items.map((item) => {
        const value = typeof item === 'string' ? item : item.value;
        const text = typeof item === 'string' ? item : item.label;
        return `<button class="booking-picker__option ${value === selected ? 'is-selected' : ''}" type="button" data-kind="${kind}" data-value="${value}">${text}</button>`;
      }).join('');
    };
    const render = () => { renderWheel(dateWheel, dates, selectedDate.value, 'date'); renderWheel(timeWheel, times, selectedTime, 'time'); scrollSelectedIntoView(); };
    const select = (kind, value) => { if (kind === 'date') selectedDate = dates.find((item) => item.value === value) || dates[0]; else selectedTime = value; render(); };
    const open = () => { picker.classList.add('is-open'); picker.setAttribute('aria-hidden', 'false'); document.body.classList.add('is-booking-picker-open'); render(); };
    const close = () => { picker.classList.remove('is-open'); picker.setAttribute('aria-hidden', 'true'); document.body.classList.remove('is-booking-picker-open'); };
    const reset = () => { selectedDate = dates[0]; selectedTime = times[0]; dateInput.value = ''; timeInput.value = ''; label.textContent = 'Обрати дату та час'; trigger.classList.remove('has-value'); };
    picker.addEventListener('click', (event) => {
      if (event.target === picker) close();
      const option = event.target.closest('[data-kind][data-value]');
      if (option) select(option.dataset.kind, option.dataset.value);
    });
    picker.querySelector('.booking-picker__close').addEventListener('click', close);
    picker.querySelector('.booking-picker__confirm').addEventListener('click', () => {
      dateInput.value = selectedDate.value;
      timeInput.value = selectedTime;
      label.textContent = `${selectedDate.label} · ${selectedTime}`;
      trigger.classList.add('has-value');
      close();
    });
    trigger.addEventListener('click', open);
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && picker.classList.contains('is-open')) close(); });
    render();
    return { open, reset };
  };
})();
