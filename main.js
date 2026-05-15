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
    console.log('SITE_VERSION: 3.0_FINAL');

    // Attach listeners to forms
    const forms = ['form-footer', 'form-modal'];
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
    if (!navbar) {
        return;
    }

    navbar.classList.remove('site-nav--open');
    if (burger) {
        burger.setAttribute('aria-expanded', 'false');
    }
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
        if (!target) {
            return;
        }

        closeMobileMenu();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && navbar && navbar.classList.contains('site-nav--open')) {
        closeMobileMenu();
    }
});

window.addEventListener('scroll', () => {
    if (!navbar) {
        return;
    }

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

function prepareModal(modal) {
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
}

function focusModal(modal) {
    const focusable = modal.querySelector(focusableSelector);
    if (focusable) {
        focusable.focus();
    } else {
        modal.setAttribute('tabindex', '-1');
        modal.focus();
    }
}

function restoreFocus() {
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }
    lastFocusedElement = null;
}

function setModalScrollTop(modal) {
    modal.scrollTop = 0;
    const scrollable = modal.querySelector('.modal-panel, .modal-info__body, .modal-doc, .modal-article');
    if (scrollable) {
        scrollable.scrollTop = 0;
    }
}

modals.forEach(prepareModal);

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal || !overlay) {
        return;
    }

    lastFocusedElement = document.activeElement;
    closeAllModals({ restore: false });

    overlay.classList.add('active');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setModalScrollTop(modal);
    focusModal(modal);
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
        if (overlay) {
            overlay.classList.remove('active');
        }
        document.body.classList.remove('modal-open');

        if (restore) {
            restoreFocus();
        }
    }
}

function closeAllModals(options = {}) {
    const { restore = true } = options;

    modals.forEach((modal) => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    });

    if (overlay) {
        overlay.classList.remove('active');
    }
    document.body.classList.remove('modal-open');

    if (restore) {
        restoreFocus();
    }
}

document.querySelectorAll('[data-modal-open]').forEach((control) => {
    control.addEventListener('click', () => {
        openModal(control.dataset.modalOpen);
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
        return;
    }

    const activeModal = document.querySelector('.modal-content.active');
    if (activeModal) {
        closeModal(activeModal.id);
    }
});

// Global debug error handler
window.onerror = function(msg, url, line) {
    alert("JS Error: " + msg + "\nLine: " + line);
    return false;
};

let lastInteractionContext = 'Головна сторінка';

function openDynamicModal(title, desc, imgSrc, btnText = 'Отримати консультацію') {
    lastInteractionContext = `Проєкт: ${title}`;
    document.getElementById('info-modal-title').innerText = title;
    document.getElementById('info-modal-desc').innerText = desc;
    document.getElementById('info-modal-img').src = imgSrc;
    document.getElementById('info-modal-btn').innerText = btnText;

    openModal('info-modal');
}

// Track blog opens for context
document.querySelectorAll('[onclick*="blog-article"]').forEach(btn => {
    btn.addEventListener('click', () => {
        const titleEl = btn.querySelector('.blog-card__title');
        const title = titleEl ? titleEl.innerText : 'Стаття в блозі';
        lastInteractionContext = `Блог: ${title}`;
    });
});

async function submitForm(event) {
    event.preventDefault();
    console.log('Form submission started');
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('.btn-submit');
    
    if (!submitBtn) {
        alert('Помилка: Кнопка відправки не знайдена');
        return;
    }

    const originalBtnText = submitBtn.innerText;

    // Detect device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const device = isMobile ? '📱 Мобільний' : '💻 Десктоп';

    // Get data from form
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        source: form.closest('#lead-modal') ? lastInteractionContext : 'Форма в футері',
        device: device,
        timestamp: new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })
    };

    console.log('Sending data:', data);

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Відправка...';

        const response = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Server returned ' + response.status);
        }

        const result = await response.json();

        if (result.success) {
            closeAllModals({ restore: false });
            setTimeout(() => {
                openModal('success-modal');
            }, 300);
            form.reset();
            lastInteractionContext = 'Головна сторінка';
        } else {
            alert('Сервер повернув помилку при відправці.');
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('Помилка мережі або сервера: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
    }
}
