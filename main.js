const navbar = document.getElementById('navbar');
const burger = document.querySelector('.site-nav__burger');
const mobileMenuLinks = document.querySelectorAll('.site-nav__mobile-menu a, .site-nav__mobile-menu button');
const overlay = document.getElementById('modal-overlay');
const modals = document.querySelectorAll('.modal-content');
const scrollTopButton = document.querySelector('.scroll-top');
const contactWidget = document.querySelector('[data-contact-widget]');
const contactWidgetToggle = document.querySelector('.contact-widget__toggle');
const contactWidgetPanel = document.getElementById('contact-widget-panel');
const contactLeadButton = document.querySelector('[data-contact-lead]');
const defaultVideoId = '6gkOhjr1IhM';
const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

let lastFocusedElement = null;

function closeContactWidget() {
    if (!contactWidget || !contactWidgetToggle || !contactWidgetPanel) return;
    contactWidget.classList.remove('contact-widget--open');
    contactWidgetToggle.setAttribute('aria-expanded', 'false');
    contactWidgetPanel.setAttribute('aria-hidden', 'true');
}

function toggleContactWidget() {
    if (!contactWidget || !contactWidgetToggle || !contactWidgetPanel) return;
    if (!contactWidget.classList.contains('contact-widget--visible')) return;
    const isOpen = contactWidget.classList.toggle('contact-widget--open');
    contactWidgetToggle.setAttribute('aria-expanded', String(isOpen));
    contactWidgetPanel.setAttribute('aria-hidden', String(!isOpen));
}

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

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

document.querySelectorAll('[data-plan-preview]').forEach((control) => {
    control.addEventListener('click', () => {
        const previewImage = document.getElementById('plan-preview-img');
        const previewTitle = document.getElementById('plan-preview-title');
        const title = control.dataset.planTitle || 'Планування';

        if (previewImage) {
            previewImage.src = control.dataset.planPreview;
            previewImage.alt = title;
        }

        if (previewTitle) previewTitle.textContent = title;
        openModal('plan-preview-modal');
    });
});

document.querySelectorAll('[data-video-open]').forEach((control) => {
    control.addEventListener('click', (event) => {
        event.preventDefault();
        const videoBox = document.querySelector('#video-modal .modal-video-placeholder');
        const videoId = control.dataset.videoId || defaultVideoId;
        const title = control.dataset.videoTitle || 'Відео ходу будівництва';
        const videoUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;

        openModal('video-modal');

        if (videoBox) {
            videoBox.innerHTML = `
                <iframe
                    src="${videoUrl}"
                    title="${title}"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen
                ></iframe>
            `;
        }
    });
});

const videoModal = document.getElementById('video-modal');
if (videoModal) {
    videoModal.addEventListener('click', (event) => {
        if (event.target === videoModal) closeModal('video-modal');
    });
}

window.addEventListener('scroll', () => {
    if (!navbar) return;
    const shouldShowFloatingActions = window.scrollY > 650;

    if (window.scrollY > 0) {
        navbar.classList.add('site-nav--scrolled');
    } else {
        navbar.classList.remove('site-nav--scrolled');
    }

    if (scrollTopButton) {
        scrollTopButton.classList.toggle('scroll-top--visible', shouldShowFloatingActions);
    }

    if (contactWidget) {
        contactWidget.classList.toggle('contact-widget--visible', shouldShowFloatingActions);
        if (!shouldShowFloatingActions) closeContactWidget();
    }
});

if (scrollTopButton) {
    scrollTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

if (contactWidgetToggle) {
    contactWidgetToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleContactWidget();
    });
}

if (contactWidget) {
    contactWidget.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

if (contactLeadButton) {
    contactLeadButton.addEventListener('click', () => {
        closeContactWidget();
        openModal('lead-modal');
    });
}

document.addEventListener('click', closeContactWidget);

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
    if (modalId === 'video-modal') resetVideoModal();
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
    resetVideoModal();
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    if (restore && lastFocusedElement) lastFocusedElement.focus();
}

function resetVideoModal() {
    const videoBox = document.querySelector('#video-modal .modal-video-placeholder');
    if (!videoBox) return;
    videoBox.innerHTML = '<p><i class="ph ph-play-circle" aria-hidden="true"></i>Відео завантажиться після відкриття</p>';
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeContactWidget();
        const activeModal = document.querySelector('.modal-content.active');
        if (activeModal) closeModal(activeModal.id);
    }
});

// Global interaction tracking
let lastInteractionContext = 'Головна сторінка';

function openDynamicModal(title, desc, imgSrc, btnText = 'Записатись на перегляд') {
    lastInteractionContext = `Проєкт: ${title}`;
    
    document.getElementById('info-modal-title').innerText = title;
    document.getElementById('info-modal-desc').innerText = desc;
    document.getElementById('info-modal-img').src = imgSrc;
    document.getElementById('info-modal-btn').innerText = btnText;

    // Define specs based on title
    let specsHtml = '';
    if (title.includes('100–120')) {
        specsHtml = `
            <div class="spec-item"><i class="ph ph-arrows-out"></i><p>Площа до 120 м²</p></div>
            <div class="spec-item"><i class="ph ph-bed"></i><p>3 окремі спальні</p></div>
            <div class="spec-item"><i class="ph ph-bathtub"></i><p>2 санвузли</p></div>
            <div class="spec-item"><i class="ph ph-park"></i><p>Ділянка до 2 соток</p></div>
        `;
    } else if (title.includes('двір')) {
        specsHtml = `
            <div class="spec-item"><i class="ph ph-lock-key"></i><p>Приватна територія</p></div>
            <div class="spec-item"><i class="ph ph-shield-check"></i><p>Паркан по периметру</p></div>
            <div class="spec-item"><i class="ph ph-sun"></i><p>Зона відпочинку</p></div>
            <div class="spec-item"><i class="ph ph-tree-evergreen"></i><p>Власний сад</p></div>
        `;
    } else if (title.includes('паркомісця')) {
        specsHtml = `
            <div class="spec-item"><i class="ph ph-car"></i><p>2 паркомісця біля дому</p></div>
            <div class="spec-item"><i class="ph ph-lightning"></i><p>Можливість зарядки електроавто</p></div>
            <div class="spec-item"><i class="ph ph-shield-check"></i><p>Закрита територія</p></div>
            <div class="spec-item"><i class="ph ph-clock"></i><p>Доступ 24/7</p></div>
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
            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead');
            }
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

// FAQ Logic
document.querySelectorAll('.faq-item__trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const item = trigger.closest('.faq-item');
        if (item) {
            item.classList.toggle('faq-open');
        }
    });
});
