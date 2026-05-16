const navbar = document.getElementById('navbar');
const burger = document.querySelector('.site-nav__burger');
const mobileMenuLinks = document.querySelectorAll('.site-nav__mobile-menu a, .site-nav__mobile-menu button');
const overlay = document.getElementById('modal-overlay');
const modals = document.querySelectorAll('.modal-content');
const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

let lastFocusedElement = null;

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// FORCE DISABLE any reload warnings
window.onbeforeunload = null;

window.addEventListener('load', () => {
    // Attach listeners to forms
    const forms = ['form-footer', 'form-modal', 'form-plans'];
    forms.forEach(id => {
        const f = document.getElementById(id);
        if (f) f.addEventListener('submit', submitForm);
    });
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
});

function closeMobileMenu() {
    if (!navbar) return;
    navbar.classList.remove('site-nav--open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
}

if (burger && navbar) {
    burger.addEventListener('click', () => {
        const isOpen = navbar.classList.toggle('site-nav--open');
        burger.setAttribute('aria-expanded', String(isOpen));
    });
}

mobileMenuLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
});

document.querySelectorAll('[data-scroll-target]').forEach((control) => {
    control.addEventListener('click', () => {
        const target = document.getElementById(control.dataset.scrollTarget);
        if (!target) return;
        closeMobileMenu();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.classList.add('site-nav--scrolled');
    } else {
        navbar.classList.remove('site-nav--scrolled');
    }
});

const revealObserver = new IntersectionObserver(
    (entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15 }
);

document.querySelectorAll('.reveal, .reveal-left').forEach((el) => revealObserver.observe(el));

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal || !overlay) return;
    lastFocusedElement = document.activeElement;
    closeAllModals({ restore: false });
    overlay.classList.add('active');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.scrollTop = 0;
    const focusable = modal.querySelector(focusableSelector);
    if (focusable) focusable.focus();
}

function closeModal(modalId, options = {}) {
    const { restore = true } = options;
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
    const hasActiveModal = Boolean(document.querySelector('.modal-content.active'));
    if (!hasActiveModal) {
        if (overlay) overlay.classList.remove('active');
        document.body.classList.remove('modal-open');
        if (restore && lastFocusedElement) lastFocusedElement.focus();
    }
}

function closeAllModals(options = {}) {
    const { restore = true } = options;
    modals.forEach((modal) => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    });
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    if (restore && lastFocusedElement) lastFocusedElement.focus();
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal-content.active');
        if (activeModal) closeModal(activeModal.id);
    }
});

// Global interaction tracking
let lastInteractionContext = 'Головна сторінка';

function openDynamicModal(title, desc, imgSrc, btnText = 'Записатись на перегляд') {
    lastInteractionContext = `Проєкт: ${title}`;
    
    // UI mapping
    document.getElementById('info-modal-title').innerText = title;
    document.getElementById('info-modal-desc').innerText = desc;
    document.getElementById('info-modal-img').src = imgSrc;
    document.getElementById('info-modal-btn').innerText = btnText;

    // Define specs based on title
    let specsHtml = '';
    if (title.includes('100–120')) {
        specsHtml = `
            <div class="spec-item"><i class="ph ph-arrows-out"></i><div><p>Площа</p><p>100–120 м²</p></div></div>
            <div class="spec-item"><i class="ph ph-bed"></i><div><p>Кімнат</p><p>3 спальні</p></div></div>
            <div class="spec-item"><i class="ph ph-bathtub"></i><div><p>Санвузлів</p><p>2</p></div></div>
            <div class="spec-item"><i class="ph ph-park"></i><div><p>Ділянка</p><p>до 2 соток</p></div></div>
        `;
    } else if (title.includes('двір')) {
        specsHtml = `
            <div class="spec-item"><i class="ph ph-park"></i><div><p>Територія</p><p>Приватна</p></div></div>
            <div class="spec-item"><i class="ph ph-fence"></i><div><p>Паркан</p><p>По периметру</p></div></div>
            <div class="spec-item"><i class="ph ph-sun"></i><div><p>Зона</p><p>Відпочинку</p></div></div>
            <div class="spec-item"><i class="ph ph-tree-evergreen"></i><div><p>Сад</p><p>Власний</p></div></div>
        `;
    } else if (title.includes('паркомісця')) {
        specsHtml = `
            <div class="spec-item"><i class="ph ph-car"></i><div><p>Місць</p><p>2 авто</p></div></div>
            <div class="spec-item"><i class="ph ph-lightning"></i><div><p>EV-Ready</p><p>Так</p></div></div>
            <div class="spec-item"><i class="ph ph-shield-check"></i><div><p>Безпека</p><p>Закрита</p></div></div>
            <div class="spec-item"><i class="ph ph-path"></i><div><p>Доступ</p><p>24/7</p></div></div>
        `;
    }

    document.getElementById('info-modal-specs').innerHTML = specsHtml;
    openModal('info-modal');
}

async function submitForm(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const originalBtnText = submitBtn.innerText;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const device = isMobile ? '📱 Мобільний' : '💻 Десктоп';

    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        source: form.id === 'form-plans' ? 'Модалка Планувань' : (form.closest('#lead-modal') ? lastInteractionContext : 'Футер'),
        device: device,
        timestamp: new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })
    };

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Відправка...';
        const response = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            closeAllModals({ restore: false });
            setTimeout(() => openModal('success-modal'), 300);
            form.reset();
        } else {
            alert('Помилка. Спробуйте ще раз.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
    }
}

function toggleFaq(button) {
    const item = button.closest('.faq-item');
    const isActive = item.classList.contains('active');
    
    // Close all others
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
    
    if (!isActive) {
        item.classList.add('active');
    }
}
