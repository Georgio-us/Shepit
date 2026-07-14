const globalMenu = document.getElementById('global-menu');
const globalMenuOpeners = Array.from(document.querySelectorAll('[data-global-menu-open]'));
const globalMenuCloser = globalMenu?.querySelector('[data-global-menu-close]');
const floatingMenuButton = document.querySelector('.floating-menu-button');
const floatingActions = document.querySelector('[data-floating-actions]');
const contactWidget = document.querySelector('[data-contact-widget]');
const contactToggle = document.querySelector('[data-contact-toggle]');
const contactPanel = document.getElementById('contact-widget-panel');
const contactScrollButton = document.querySelector('[data-contact-scroll]');
const scrollTopButton = document.querySelector('[data-scroll-top]');
let lastMenuTrigger = null;
let closeMenuTimer = null;

const syncFloatingControls = () => {
    const hasScrolled = window.scrollY > 100;
    const canReturnTop = window.scrollY > window.innerHeight * 0.85;
    floatingMenuButton?.classList.toggle('is-visible', hasScrolled);
    floatingActions?.classList.toggle('is-visible', hasScrolled);
    scrollTopButton?.classList.toggle('is-visible', canReturnTop);
};

const closeGlobalMenu = ({ restoreFocus = true } = {}) => {
    if (!globalMenu || globalMenu.hidden) return;
    globalMenu.classList.remove('is-open');
    document.body.classList.remove('is-global-menu-open');
    globalMenuOpeners.forEach((button) => button.setAttribute('aria-expanded', 'false'));
    window.clearTimeout(closeMenuTimer);
    closeMenuTimer = window.setTimeout(() => {
        globalMenu.hidden = true;
        if (restoreFocus) lastMenuTrigger?.focus();
        lastMenuTrigger = null;
    }, 280);
};

const openGlobalMenu = (trigger) => {
    if (!globalMenu) return;
    window.clearTimeout(closeMenuTimer);
    lastMenuTrigger = trigger;
    globalMenu.hidden = false;
    document.body.classList.add('is-global-menu-open');
    globalMenuOpeners.forEach((button) => button.setAttribute('aria-expanded', 'true'));
    window.requestAnimationFrame(() => {
        globalMenu.classList.add('is-open');
        globalMenuCloser?.focus();
    });
};

globalMenuOpeners.forEach((button) => {
    button.addEventListener('click', () => openGlobalMenu(button));
});

globalMenuCloser?.addEventListener('click', () => closeGlobalMenu());

globalMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeGlobalMenu({ restoreFocus: false }));
});

const closeContactWidget = () => {
    contactWidget?.classList.remove('is-open');
    contactToggle?.setAttribute('aria-expanded', 'false');
    contactPanel?.setAttribute('aria-hidden', 'true');
    if (contactPanel) contactPanel.inert = true;
};

contactToggle?.addEventListener('click', () => {
    const willOpen = !contactWidget?.classList.contains('is-open');
    contactWidget?.classList.toggle('is-open', willOpen);
    contactToggle.setAttribute('aria-expanded', String(willOpen));
    contactPanel?.setAttribute('aria-hidden', String(!willOpen));
    if (contactPanel) contactPanel.inert = !willOpen;
});

contactWidget?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeContactWidget);
});

contactScrollButton?.addEventListener('click', () => {
    closeContactWidget();
    const form = document.getElementById('v2-contact-form');
    form?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => form?.querySelector('input')?.focus(), 550);
});

scrollTopButton?.addEventListener('click', () => {
    closeContactWidget();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.addEventListener('click', (event) => {
    if (contactWidget && !contactWidget.contains(event.target)) closeContactWidget();
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (globalMenu && !globalMenu.hidden) {
        closeGlobalMenu();
        return;
    }
    closeContactWidget();
});

window.addEventListener('scroll', syncFloatingControls, { passive: true });
window.addEventListener('resize', syncFloatingControls);
syncFloatingControls();

const galleryViewport = document.querySelector('.about-gallery__viewport');
const galleryTrack = document.querySelector('.about-gallery__track');
const gallerySlides = Array.from(document.querySelectorAll('.about-gallery__slide'));
const galleryPrevious = document.querySelector('[data-gallery-prev]');
const galleryNext = document.querySelector('[data-gallery-next]');
const galleryProgress = document.querySelector('.about-gallery__progress i');
const galleryCounter = document.querySelector('.about-gallery__counter');

if (galleryViewport && galleryTrack && gallerySlides.length) {
    let activeSlide = 0;
    let pointerStart = null;

    const renderGallery = () => {
        const offset = gallerySlides[activeSlide].offsetLeft;
        galleryTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;

        gallerySlides.forEach((slide, index) => {
            slide.classList.toggle('is-active', index === activeSlide);
        });

        if (galleryProgress) {
            galleryProgress.style.transform = `translateX(${activeSlide * 100}%)`;
        }

        if (galleryCounter) {
            galleryCounter.textContent = `${String(activeSlide + 1).padStart(2, '0')} / ${String(gallerySlides.length).padStart(2, '0')}`;
        }
    };

    const moveGallery = (direction) => {
        activeSlide = (activeSlide + direction + gallerySlides.length) % gallerySlides.length;
        renderGallery();
    };

    galleryPrevious?.addEventListener('click', () => moveGallery(-1));
    galleryNext?.addEventListener('click', () => moveGallery(1));

    galleryViewport.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') moveGallery(-1);
        if (event.key === 'ArrowRight') moveGallery(1);
    });

    galleryViewport.addEventListener('pointerdown', (event) => {
        pointerStart = event.clientX;
    });

    galleryViewport.addEventListener('pointerup', (event) => {
        if (pointerStart === null) return;
        const distance = event.clientX - pointerStart;
        pointerStart = null;
        if (Math.abs(distance) > 45) moveGallery(distance > 0 ? -1 : 1);
    });

    galleryViewport.addEventListener('pointercancel', () => {
        pointerStart = null;
    });

    window.addEventListener('resize', renderGallery);
    renderGallery();
}

const v2Masterplan = document.querySelector('[data-v2-masterplan]');

if (v2Masterplan) {
    const pins = Array.from(v2Masterplan.querySelectorAll('.plan-pin'));
    const unitButtons = Array.from(v2Masterplan.querySelectorAll('[data-plan-target]'));
    const numberOutput = v2Masterplan.querySelector('[data-plan-number]');
    const typeOutput = v2Masterplan.querySelector('[data-plan-type-output]');
    const areaOutput = v2Masterplan.querySelector('[data-plan-area-output]');
    const statusOutput = v2Masterplan.querySelector('[data-plan-status-output]');
    const bedroomsOutput = v2Masterplan.querySelector('[data-plan-bedrooms-output]');
    const detailsLink = v2Masterplan.querySelector('[data-plan-link]');
    const selectedPanel = v2Masterplan.querySelector('.plan-v2__selected');

    const selectUnit = (unitId) => {
        const pin = pins.find((item) => item.dataset.planUnit === unitId);
        if (!pin) return;

        pins.forEach((item) => item.classList.toggle('is-active', item === pin));
        unitButtons.forEach((item) => item.classList.toggle('is-active', item.dataset.planTarget === unitId));

        if (numberOutput) numberOutput.textContent = `Резиденція ${pin.dataset.planUnit}`;
        if (typeOutput) typeOutput.textContent = pin.dataset.planType;
        if (areaOutput) areaOutput.textContent = pin.dataset.planArea;
        if (statusOutput) statusOutput.textContent = pin.dataset.planStatus;
        if (bedroomsOutput) bedroomsOutput.textContent = pin.dataset.planType === 'Таунхаус' ? '3 спальні' : '4 спальні';
        if (detailsLink) detailsLink.setAttribute('aria-label', `Забронювати перегляд резиденції ${pin.dataset.planUnit}`);

        if (selectedPanel) {
            const isLight = Number(pin.dataset.planUnit) % 2 === 0;
            selectedPanel.classList.toggle('is-light', isLight);
            selectedPanel.classList.toggle('is-dark', !isLight);
        }
    };

    pins.forEach((pin) => {
        pin.addEventListener('click', () => selectUnit(pin.dataset.planUnit));
        pin.addEventListener('mouseenter', () => selectUnit(pin.dataset.planUnit));
        pin.addEventListener('focus', () => selectUnit(pin.dataset.planUnit));
    });

    unitButtons.forEach((button) => {
        button.addEventListener('click', () => selectUnit(button.dataset.planTarget));
    });
}

const faqItems = Array.from(document.querySelectorAll('.faq-v2__item'));

faqItems.forEach((item) => {
    const trigger = item.querySelector('button');
    const indicator = trigger?.querySelector('i');

    trigger?.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');

        faqItems.forEach((faqItem) => {
            const faqTrigger = faqItem.querySelector('button');
            const faqIndicator = faqTrigger?.querySelector('i');
            faqItem.classList.remove('is-open');
            faqTrigger?.setAttribute('aria-expanded', 'false');
            if (faqIndicator) faqIndicator.textContent = '+';
        });

        if (willOpen) {
            item.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            if (indicator) indicator.textContent = '−';
        }
    });
});

const mediaModal = document.querySelector('[data-media-modal]');
const mediaFrame = mediaModal?.querySelector('[data-media-frame]');
const mediaModalTitle = mediaModal?.querySelector('[data-media-modal-title]');
const mediaTriggers = Array.from(document.querySelectorAll('[data-media-video]'));
let lastMediaTrigger = null;

const closeMediaModal = () => {
    if (!mediaModal) return;

    mediaModal.hidden = true;
    document.body.classList.remove('is-media-open');
    if (mediaFrame) mediaFrame.innerHTML = '';
    lastMediaTrigger?.focus();
    lastMediaTrigger = null;
};

const openMediaModal = (trigger) => {
    if (!mediaModal || !mediaFrame) return;

    const videoId = trigger.dataset.mediaVideo || '';
    if (!/^[\w-]{11}$/.test(videoId)) return;

    const title = trigger.dataset.mediaTitle || 'Відео SHEPIT HOUSE';
    lastMediaTrigger = trigger;
    if (mediaModalTitle) mediaModalTitle.textContent = title;

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
    iframe.title = title;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    mediaFrame.replaceChildren(iframe);

    mediaModal.hidden = false;
    document.body.classList.add('is-media-open');
    mediaModal.querySelector('[data-media-close]:not(.media-modal__backdrop)')?.focus();
};

mediaTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openMediaModal(trigger));
});

mediaModal?.querySelectorAll('[data-media-close]').forEach((control) => {
    control.addEventListener('click', closeMediaModal);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mediaModal && !mediaModal.hidden) closeMediaModal();
});

const contactForm = document.getElementById('v2-contact-form');
const questionButton = document.querySelector('[data-question-button]');

questionButton?.addEventListener('click', () => {
    contactForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => contactForm?.querySelector('input')?.focus(), 500);
});

contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const submitLabel = submitButton?.querySelector('span');
    const status = contactForm.querySelector('[data-form-status]');
    const formData = new FormData(contactForm);
    const originalLabel = submitLabel?.textContent || 'Надіслати';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (status) status.textContent = '';
    if (submitButton) submitButton.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Надсилаємо…';

    try {
        const response = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.get('name'),
                phone: formData.get('phone'),
                source: 'Відкрита форма V2',
                device: isMobile ? '📱 Мобільний' : '💻 Десктоп',
                timestamp: new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })
            })
        });

        const result = await response.json();
        if (!response.ok || !result.success) throw new Error('Lead submission failed');

        contactForm.reset();
        if (status) status.textContent = 'Дякуємо. Ми зв’яжемося з вами найближчим часом.';
        if (typeof gtag === 'function') gtag('event', 'generate_lead');
    } catch (error) {
        console.error(error);
        if (status) status.textContent = 'Не вдалося надіслати. Зателефонуйте нам: +38 (095) 073 43 76.';
    } finally {
        if (submitButton) submitButton.disabled = false;
        if (submitLabel) submitLabel.textContent = originalLabel;
    }
});
