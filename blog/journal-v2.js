const newsletterForm = document.querySelector('[data-newsletter-form]');

if (newsletterForm) {
  const status = newsletterForm.querySelector('[data-newsletter-status]');
  newsletterForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = newsletterForm.elements.email.value.trim();
    if (!email) return;

    const button = newsletterForm.querySelector('button');
    button.disabled = true;
    status.textContent = 'Зберігаємо вашу підписку…';

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'SHEPIT Journal', timestamp: new Date().toISOString() })
      });
      if (!response.ok) throw new Error('Newsletter request failed');
      newsletterForm.classList.add('is-success');
      newsletterForm.reset();
      status.textContent = 'Готово. Наступний важливий лист надійде на вашу пошту.';
    } catch (error) {
      status.textContent = 'Не вдалося підписати. Спробуйте ще раз або напишіть нам у Telegram.';
    } finally {
      button.disabled = false;
    }
  });
}
