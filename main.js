const navbar = document.getElementById('navbar');
const burger = document.querySelector('.site-nav__burger');
const mobileMenuLinks = document.querySelectorAll('.site-nav__mobile-panel a, .site-nav__mobile-panel button');
const overlay = document.getElementById('modal-overlay');
const modals = document.querySelectorAll('.modal-content');
const scrollTopButton = document.querySelector('.scroll-top');
const contactWidget = document.querySelector('[data-contact-widget]');
const contactWidgetToggle = document.querySelector('.contact-widget__toggle');
const contactWidgetPanel = document.getElementById('contact-widget-panel');
const contactLeadButton = document.querySelector('[data-contact-lead]');
const paymentForm = document.getElementById('form-payment');
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
    const forms = ['form-modal', 'form-payment'];
    forms.forEach(id => {
        const f = document.getElementById(id);
        if (f) f.addEventListener('submit', submitForm);
    });
    if (window.location.hash) {
        const hashTarget = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
        if (hashTarget) {
            requestAnimationFrame(() => {
                hashTarget.scrollIntoView({ block: 'start' });
            });
            return;
        }
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
});

function closeMobileMenu() {
    if (!navbar) return;
    navbar.classList.remove('site-nav--open');
    document.body.classList.remove('site-menu-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    const burgerIcon = burger?.querySelector('i');
    if (burgerIcon) {
        burgerIcon.classList.remove('ph-x');
        burgerIcon.classList.add('ph-list');
    }
}

if (burger && navbar) {
    burger.addEventListener('click', () => {
        const isOpen = navbar.classList.toggle('site-nav--open');
        document.body.classList.toggle('site-menu-open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
        const burgerIcon = burger.querySelector('i');
        if (burgerIcon) {
            burgerIcon.classList.toggle('ph-list', !isOpen);
            burgerIcon.classList.toggle('ph-x', isOpen);
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navbar?.classList.contains('site-nav--open')) {
        closeMobileMenu();
        burger?.focus();
    }
});

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

const masterplan = document.querySelector('[data-masterplan]');

if (masterplan) {
    const houses = Array.from(masterplan.querySelectorAll('[data-masterplan-house]'));
    const info = masterplan.querySelector('[data-masterplan-info]');
    const number = masterplan.querySelector('[data-masterplan-number]');
    const type = masterplan.querySelector('[data-masterplan-type]');
    const area = masterplan.querySelector('[data-masterplan-area]');
    const link = masterplan.querySelector('[data-masterplan-link]');
    let selectedHouse = null;

    const showHouse = (house, persist = false) => {
        if (!house || !info) return;
        houses.forEach((item) => item.classList.toggle('is-selected', persist && item === house));
        if (persist) selectedHouse = house;
        if (number) number.textContent = `Резиденція ${house.dataset.houseId}`;
        if (type) type.textContent = house.dataset.houseType;
        if (area) area.textContent = house.dataset.houseArea;
        if (link) link.href = house.dataset.houseUrl;
        info.classList.add('is-visible');
        info.setAttribute('aria-hidden', 'false');
    };

    const restoreSelection = () => {
        if (selectedHouse) {
            showHouse(selectedHouse, true);
            return;
        }
        info?.classList.remove('is-visible');
        info?.setAttribute('aria-hidden', 'true');
    };

    houses.forEach((house) => {
        house.addEventListener('mouseenter', () => showHouse(house));
        house.addEventListener('mouseleave', restoreSelection);
        house.addEventListener('focus', () => showHouse(house));
        house.addEventListener('blur', restoreSelection);
        house.addEventListener('click', () => showHouse(house, true));
        house.addEventListener('keydown', (event) => {
            if (!['Enter', ' '].includes(event.key)) return;
            event.preventDefault();
            showHouse(house, true);
        });
    });
}

const layoutPreviewControl = document.querySelector('[data-layout-preview]');
const layoutImage = document.querySelector('[data-layout-image]');
document.querySelectorAll('[data-layout-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
        if (!layoutPreviewControl || !layoutImage) return;
        const src = tab.dataset.planSrc;
        const title = tab.dataset.planTitle || 'Планування';
        const alt = tab.dataset.planAlt || title;
        if (!src) return;

        document.querySelectorAll('[data-layout-tab]').forEach((item) => {
            const isActive = item === tab;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-selected', String(isActive));
        });

        layoutImage.src = src;
        layoutImage.alt = alt;
        layoutPreviewControl.dataset.planPreview = src;
        layoutPreviewControl.dataset.planTitle = title;
        layoutPreviewControl.setAttribute('aria-label', `Відкрити ${title}`);
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

modals.forEach((modal) => {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal(modal.id);
    });
});

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
if (window.location.pathname.includes('/townhouse')) {
    lastInteractionContext = 'Сторінка Таунхаус';
} else if (window.location.pathname.includes('/duplex')) {
    lastInteractionContext = 'Сторінка Дуплекс';
}

const paymentUnits = {
    'townhouse-92': {
        title: 'Таунхаус 1',
        area: 92
    },
    'townhouse-102': {
        title: 'Таунхаус 2',
        area: 102
    },
    'duplex-101': {
        title: 'Дуплекс',
        area: 101
    }
};
const paymentPricePerMeter = 990;

function formatUsd(value) {
    return `$${Math.round(value).toLocaleString('en-US').replace(/,/g, ' ')}`;
}

function getPaymentEstimate() {
    if (!paymentForm) return null;
    const formData = new FormData(paymentForm);
    const unitKey = formData.get('unit') || 'townhouse-92';
    const unit = paymentUnits[unitKey] || paymentUnits['townhouse-92'];
    const depositPercent = Number(formData.get('deposit') || 0);
    const paymentMode = formData.get('paymentMode') || 'installment';
    const months = Number(formData.get('months') || 12);
    const total = unit.area * paymentPricePerMeter;
    const deposit = total * (depositPercent / 100);
    const balance = total - deposit;
    const monthly = balance / months;

    return {
        unit,
        depositPercent,
        paymentMode,
        months,
        total,
        deposit,
        balance,
        monthly
    };
}

function getPaymentSummaryText() {
    const estimate = getPaymentEstimate();
    if (!estimate) return 'Розрахунок платежу';
    if (estimate.paymentMode === 'cash') {
        return [
            '100% оплата',
            `${estimate.unit.title}, ${estimate.unit.area} м²`,
            `орієнтовна вартість: ${formatUsd(estimate.total)}`,
            'запит персональних умов'
        ].join(' | ');
    }

    return [
        'Розрахунок платежу',
        `${estimate.unit.title}, ${estimate.unit.area} м²`,
        `перший внесок ${estimate.depositPercent}% (${formatUsd(estimate.deposit)})`,
        `період: ${estimate.months} міс.`,
        `орієнтовний платіж: ${formatUsd(estimate.monthly)}`
    ].join(' | ');
}

function setPaymentControlsLocked(isLocked) {
    const depositOptionsEl = document.querySelector('[data-payment-deposit-options]');
    const monthOptionsEl = document.querySelector('[data-payment-month-options]');
    const installmentSectionEl = document.querySelector('[data-payment-installment-section]');

    if (installmentSectionEl) installmentSectionEl.classList.toggle('payment-form__section--locked', isLocked);
    if (depositOptionsEl) depositOptionsEl.classList.toggle('payment-options--locked', isLocked);
    if (monthOptionsEl) monthOptionsEl.classList.toggle('payment-options--locked', isLocked);
    paymentForm.querySelectorAll('input[name="deposit"], input[name="months"]').forEach((input) => {
        input.disabled = isLocked;
    });
}

function updatePaymentEstimate() {
    const estimate = getPaymentEstimate();
    if (!estimate) return;

    const unitEl = document.querySelector('[data-payment-unit]');
    const depositEl = document.querySelector('[data-payment-deposit]');
    const balanceEl = document.querySelector('[data-payment-balance]');
    const monthlyEl = document.querySelector('[data-payment-monthly]');
    const summaryEl = document.querySelector('.payment-summary');
    const cashOfferEl = document.querySelector('.payment-cash-offer');
    const submitEl = document.querySelector('[data-payment-submit]');
    const isCash = estimate.paymentMode === 'cash';

    if (summaryEl) summaryEl.hidden = isCash;
    if (cashOfferEl) cashOfferEl.hidden = !isCash;
    setPaymentControlsLocked(isCash);
    if (submitEl) {
        submitEl.textContent = isCash ? 'Уточнити умови 100% оплати' : 'Уточнити наявність';
    }

    if (unitEl) unitEl.textContent = `${estimate.unit.title}, ${estimate.unit.area} м²`;
    if (depositEl) depositEl.textContent = `${formatUsd(estimate.deposit)} (${estimate.depositPercent}%)`;
    if (balanceEl) balanceEl.textContent = formatUsd(estimate.balance);
    if (monthlyEl) monthlyEl.textContent = formatUsd(estimate.monthly);
}

if (paymentForm) {
    paymentForm.addEventListener('change', (event) => {
        if (event.target.name === 'paymentMode' && !event.target.checked) {
            setPaymentControlsLocked(false);
        }
        updatePaymentEstimate();
    });
    updatePaymentEstimate();
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
        source: (() => {
            let pageName = 'Головна';
            if (window.location.pathname.includes('/townhouse')) {
                pageName = 'Таунхаус';
            } else if (window.location.pathname.includes('/duplex')) {
                pageName = 'Дуплекс';
            }
            
            if (form.id === 'form-plans') {
                return `Планування (${pageName})`;
            } else if (form.id === 'form-payment') {
                return getPaymentSummaryText();
            } else if (form.closest('#lead-modal')) {
                return `${lastInteractionContext} (Модалка)`;
            } else {
                return `Футер (${pageName})`;
            }
        })(),
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
