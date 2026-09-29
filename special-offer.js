(() => {
    const modal = document.querySelector('.offer-modal');
    if (!modal) return;
    const form = modal.querySelector('[data-offer-form]');
    const content = modal.querySelector('[data-offer-content]');
    const success = modal.querySelector('[data-offer-success]');
    const status = modal.querySelector('[data-offer-status]');
    const submit = form.querySelector('[type="submit"]');
    const label = submit.querySelector('span');
    const phone = form.elements.phone;
    let pending = false;
    let completed = false;
    let opener;

    document.querySelectorAll('[data-offer-open]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            opener = trigger;
            if (completed) {
                content.hidden = false;
                success.hidden = true;
                completed = false;
            }
            modal.showModal();
            document.body.classList.add('is-offer-open');
            modal.querySelector(content.hidden ? '[data-offer-success] h2' : '#offer-modal-title').focus();
        });
    });
    modal.querySelectorAll('[data-offer-close]').forEach(button => button.addEventListener('click', () => modal.close()));
    modal.addEventListener('click', event => {
        const bounds = modal.getBoundingClientRect();
        if (event.target === modal && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) modal.close();
    });
    modal.addEventListener('close', () => {
        document.body.classList.remove('is-offer-open');
        opener?.focus({ preventScroll: true });
    });
    phone.addEventListener('input', () => phone.setCustomValidity(''));
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (pending) return;
        if (phone.value.replace(/\D/g, '').length < 7) {
            phone.setCustomValidity('Вкажіть коректний номер телефону.');
            phone.reportValidity();
            return;
        }
        pending = true;
        submit.disabled = true;
        form.setAttribute('aria-busy', 'true');
        label.textContent = 'Надсилаємо…';
        status.textContent = '';
        try {
            const response = await fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: form.elements.name.value.trim(), phone: phone.value.trim(), source: 'Акція на 2 будинки · 50% перший внесок · до 24 місяців' })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error('Lead submission failed');
            form.reset();
            completed = true;
            content.hidden = true;
            success.hidden = false;
            if (modal.open) success.querySelector('h2').focus();
            window.shepitTrack?.('generate_lead', { form_name: 'special_offer_24_months' });
        } catch (_) {
            status.textContent = 'Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте: +38 (095) 073 43 76.';
            if (modal.open) status.focus();
            window.shepitTrackFormFailure?.(form);
        } finally {
            pending = false;
            submit.disabled = false;
            form.removeAttribute('aria-busy');
            label.textContent = 'Дізнатися про наявність';
        }
    });
})();
