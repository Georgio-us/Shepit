(() => {
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const phoneIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 3 1 1 4-2 2a14 14 0 0 0 6 6l2-2 4 1 1 3c0 2-2 3-4 3A17 17 0 0 1 3 7c0-2 1-4 3-4Z"/></svg>';
  const bell = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3ZM10 20h4M12 2v2"/></svg>';
  const close = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>';
  const modal = document.createElement('dialog');
  modal.className = 'lead-dialog';
  modal.setAttribute('aria-labelledby', 'lead-dialog-title');
  modal.innerHTML = `<button class="lead-dialog__close" type="button" aria-label="Закрити форму">${close}</button><span class="lead-eyebrow">SHEPIT HOUSE · Відділ продажу</span><h2 id="lead-dialog-title" tabindex="-1">Отримати пропозицію</h2><p data-lead-description>Уточнимо актуальну вартість, наявність та умови оплати.</p><form class="lead-form" data-lead-form data-analytics-form="quick_inquiry"><label><span>Номер телефону</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="Наприклад, 095 123 45 67" required></label><label><span>Ім’я <small>необов’язково</small></span><input name="name" type="text" autocomplete="name" maxlength="100" placeholder="Як до вас звертатися?"></label><button type="submit"><span>Отримати пропозицію</span>${arrow}</button><p class="lead-note">Менеджер зателефонує та відповість на ваші запитання.</p><p class="lead-status" data-form-status role="status" aria-live="polite" tabindex="-1"></p><p class="lead-privacy">Надсилаючи заявку, ви погоджуєтеся з <a href="/privacy-policy/">політикою конфіденційності</a>.</p></form>`;
  document.body.append(modal);
  const bar = document.createElement('aside');
  bar.className = 'lead-bar';
  bar.setAttribute('aria-label', 'Зв’язатися з відділом продажу');
  bar.innerHTML = `<button class="lead-bar__primary" type="button" data-lead-open>${bell}<span>Залишити заявку</span></button><a class="lead-bar__phone" href="tel:+380950734376">${phoneIcon}<span>Зателефонувати</span></a><button class="lead-bar__chat" type="button" aria-expanded="false" aria-controls="lead-chat-panel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 1 1 18 0Z"/><path d="M7 10h10M7 14h6"/></svg><span>Чат</span></button><div class="lead-chat" id="lead-chat-panel" hidden><strong>Написати менеджеру</strong><a href="https://t.me/Liliia_Horodnia" target="_blank" rel="noopener noreferrer">Telegram ${arrow}</a><a href="viber://chat/?number=%2B380950734376">Viber ${arrow}</a></div>`;
  document.body.append(bar);
  let opener;
  const closeModal = () => modal.close();
  modal.querySelector('.lead-dialog__close').addEventListener('click', closeModal);
  modal.addEventListener('click', event => {
    const rect = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeModal();
  });
  modal.addEventListener('close', () => { document.body.classList.remove('is-lead-open'); opener?.focus({ preventScroll: true }); });
  const modalForm = modal.querySelector('form');
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-lead-open]');
    if (!trigger) return;
    event.preventDefault();
    opener = trigger;
    const context = trigger.dataset.leadContext || (document.querySelector('.residence-title')?.textContent.trim() || '');
    modalForm.dataset.leadContext = context;
    modalForm.dataset.leadSource = trigger.dataset.leadSource || 'Швидка заявка';
    const title = trigger.dataset.leadTitle || (context ? `Ціна та умови ${context}` : 'Отримати пропозицію');
    modal.querySelector('h2').textContent = title;
    modal.querySelector('[data-lead-description]').textContent = trigger.dataset.leadDescription || 'Уточнимо актуальну вартість, наявність та умови оплати.';
    if (modalForm.dataset.completed === 'true') {
      modalForm.dataset.completed = 'false';
      modalForm.querySelector('[data-form-status]').textContent = '';
      modalForm.querySelectorAll('label,button,.lead-note,.lead-privacy').forEach(e => e.hidden = false);
    }
    bar.querySelector('[aria-expanded]').setAttribute('aria-expanded', 'false');
    bar.querySelector('.lead-chat').hidden = true;
    modal.showModal();
    document.body.classList.add('is-lead-open');
    modal.querySelector('h2').focus({ preventScroll: true });
    window.shepitTrack?.('application_modal_open', { source: modalForm.dataset.leadSource, residence: context });
  });
  const chatToggle = bar.querySelector('.lead-bar__chat');
  chatToggle.addEventListener('click', () => {
    const open = chatToggle.getAttribute('aria-expanded') !== 'true';
    chatToggle.setAttribute('aria-expanded', String(open));
    bar.querySelector('.lead-chat').hidden = !open;
  });
  document.addEventListener('click', event => {
    if (!bar.contains(event.target)) { chatToggle.setAttribute('aria-expanded', 'false'); bar.querySelector('.lead-chat').hidden = true; }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { chatToggle.setAttribute('aria-expanded', 'false'); bar.querySelector('.lead-chat').hidden = true; }
  });
  const leadSelector = '[data-lead-form],[data-application-form],#v2-contact-form,[data-booking-form],[data-catalog-application-form],[data-calculator-form],[data-offer-form]';
  document.querySelectorAll(leadSelector).forEach(form => {
    form.querySelector('input[name="name"]')?.removeAttribute('required');
    const phone = form.querySelector('input[name="phone"]');
    if (phone) {
      phone.setAttribute('pattern', '[+0-9\\(\\) .\\-]{7,30}');
      phone.setAttribute('maxlength', '30');
      phone.setAttribute('inputmode', 'tel');
      phone.setAttribute('title', 'Вкажіть номер телефону з кодом оператора або країни.');
      phone.addEventListener('input', () => {
        const digits = phone.value.replace(/\D/g, '');
        phone.setCustomValidity(phone.value && (digits.length < 9 || digits.length > 15) ? 'Вкажіть номер телефону з кодом оператора або країни.' : '');
      });
    }
    form.querySelectorAll('label').forEach(label => {
      const input = label.querySelector('input[name="name"],input[name="phone"]');
      if (!input) return;
      let caption = label.querySelector('span');
      if (!caption) {
        Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
        caption = document.createElement('span'); label.prepend(caption);
      }
      caption.classList.remove('visually-hidden');
      caption.textContent = input.name === 'phone' ? 'Номер телефону' : 'Ім’я · необов’язково';
    });
  });
  document.querySelectorAll('[data-lead-form]').forEach(form => {
    let pending = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (pending) return;
      const button = form.querySelector('[type="submit"]');
      const label = button.querySelector('span');
      const original = label.textContent;
      const status = form.querySelector('[data-form-status]');
      const data = new FormData(form);
      const source = `${form.dataset.leadSource || 'Консультація'}${form.dataset.leadContext ? ' | ' + form.dataset.leadContext : ''} | ${location.pathname}`;
      pending = true;
      button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      label.textContent = 'Надсилаємо…';
      status.textContent = '';
      try {
        const response = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: String(data.get('name') || '').trim(), phone: String(data.get('phone') || '').trim(), source }) });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error('submit_failed');
        form.reset();
        form.querySelector('input[name="phone"]').setCustomValidity('');
        form.dataset.completed = 'true';
        form.querySelectorAll('label,button,.lead-note,.lead-privacy').forEach(e => e.hidden = true);
        status.classList.add('is-success');
        status.textContent = 'Дякуємо! Заявку надіслано. Менеджер зателефонує та уточнить деталі.';
        status.focus({ preventScroll: true });
        window.shepitTrack?.('generate_lead', { form_name: form.dataset.analyticsForm || 'inline_inquiry', source, residence: form.dataset.leadContext || '' });
      } catch (_) {
        status.classList.remove('is-success');
        status.innerHTML = 'Не вдалося надіслати заявку. Спробуйте ще раз або <a href="tel:+380950734376">зателефонуйте нам</a>.';
        status.focus({ preventScroll: true });
        window.shepitTrackFormFailure?.(form);
      } finally {
        pending = false;
        button.disabled = false;
        label.textContent = original;
        form.removeAttribute('aria-busy');
      }
    });
  });
  const updateBar = () => {
    const activeDialog = document.querySelector('dialog[open], .application-modal:not([hidden]), .catalog-application:not([hidden]), .global-menu:not([hidden]), .plan-lightbox:not([hidden]), .calculator-success:not([hidden])');
    const contactInView = Array.from(document.querySelectorAll(leadSelector)).some(form => {
      if (form.closest('dialog') || form.closest('[hidden]')) return false;
      const phone = form.querySelector('input[name="phone"]');
      const r = phone?.getBoundingClientRect();
      return r && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight;
    });
    const editing = document.activeElement?.matches('input,textarea,select');
    const initialHero = document.querySelector('.hero-v2') && scrollY < 100;
    const shouldHide = Boolean(activeDialog || contactInView || editing || initialHero);
    if (bar.hidden !== shouldHide) bar.hidden = shouldHide;
    const floatingMenu = document.querySelector('.floating-menu-button');
    const hideMenu = Boolean(activeDialog || contactInView || editing);
    if (floatingMenu && floatingMenu.hidden !== hideMenu) floatingMenu.hidden = hideMenu;
    if (bar.hidden) {
      chatToggle.setAttribute('aria-expanded', 'false');
      const panel = bar.querySelector('.lead-chat');
      if (!panel.hidden) panel.hidden = true;
    }
  };
  addEventListener('scroll', updateBar, { passive: true });
  addEventListener('resize', updateBar);
  document.addEventListener('focusin', updateBar);
  document.addEventListener('focusout', () => requestAnimationFrame(updateBar));
  new MutationObserver(updateBar).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden','open','class'] });
  updateBar();
})();
