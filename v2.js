const globalMenu = document.getElementById('global-menu');
const globalMenuOpeners = Array.from(document.querySelectorAll('[data-global-menu-open]'));
const globalMenuCloser = globalMenu?.querySelector('[data-global-menu-close]');
const floatingMenuButton = document.querySelector('.floating-menu-button');
const floatingPhoneButton = document.querySelector('.floating-phone-button');
const floatingActions = document.querySelector('[data-floating-actions]');
const contactWidget = document.querySelector('[data-contact-widget]');
const contactToggle = document.querySelector('[data-contact-toggle]');
const contactPanel = document.getElementById('contact-widget-panel');
const contactScrollButton = document.querySelector('[data-contact-scroll]');
const scrollTopButton = document.querySelector('[data-scroll-top]');
const siteFooter = document.querySelector('.footer-v2');
let lastMenuTrigger = null;
let closeMenuTimer = null;

const syncFloatingControls = () => {
    const hasScrolled = window.scrollY > 100;
    const canReturnTop = window.scrollY > window.innerHeight * 0.85;
    floatingMenuButton?.classList.toggle('is-visible', hasScrolled);
    floatingPhoneButton?.classList.toggle('is-visible', hasScrolled);
    document.body.classList.toggle('is-mobile-controls-floating', hasScrolled);
    floatingActions?.classList.toggle('is-visible', hasScrolled);
    scrollTopButton?.classList.toggle('is-visible', canReturnTop);
    const footerTop = siteFooter?.getBoundingClientRect().top;
    const footerInBottomZone = Boolean(siteFooter && (footerTop <= window.innerHeight - 250 || footerTop <= 250));
    floatingActions?.classList.toggle('is-footer-zone', footerInBottomZone);
    if (footerInBottomZone) closeContactWidget();
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
    openApplicationModal();
});

const applicationModal = document.querySelector('[data-application-modal]');
const applicationForm = document.querySelector('[data-application-form]');
const applicationFormView = document.querySelector('[data-application-form-view]');
const applicationSuccess = document.querySelector('[data-application-success]');
const applicationModalTitle = document.getElementById('application-modal-title');
const applicationModalDescription = applicationFormView?.querySelector('p');
const cookieNotice = document.querySelector('[data-cookie-notice]');
const cookieAccept = document.querySelector('[data-cookie-accept]');

const defaultApplicationTitle = applicationModalTitle?.textContent || 'Залишити заявку';
const defaultApplicationDescription = applicationModalDescription?.textContent || '';

if (cookieNotice && window.localStorage.getItem('shepit-cookie-notice-accepted') !== '1') {
    cookieNotice.hidden = false;
}

cookieAccept?.addEventListener('click', () => {
    window.localStorage.setItem('shepit-cookie-notice-accepted', '1');
    cookieNotice.hidden = true;
});

function openApplicationModal() {
    if (!applicationModal) return;
    if (applicationModalTitle) applicationModalTitle.textContent = defaultApplicationTitle;
    if (applicationModalDescription) applicationModalDescription.textContent = defaultApplicationDescription;
    applicationFormView.hidden = false;
    applicationSuccess.hidden = true;
    applicationModal.hidden = false;
    document.body.classList.add('is-application-modal-open');
    applicationForm?.querySelector('input')?.focus();
}

function closeApplicationModal() {
    if (!applicationModal) return;
    applicationModal.hidden = true;
    document.body.classList.remove('is-application-modal-open');
}

document.querySelectorAll('[data-application-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
        event.preventDefault();
        closeContactWidget();
        openApplicationModal();
    });
});

document.querySelectorAll('[data-plan-link]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
        event.preventDefault();
        openApplicationModal();
    });
});

applicationModal?.querySelectorAll('[data-application-modal-close]').forEach((control) => {
    control.addEventListener('click', closeApplicationModal);
});

applicationForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = applicationForm.querySelector('button[type="submit"]');
    const label = submit?.querySelector('span');
    const status = applicationForm.querySelector('[data-application-status]');
    const data = new FormData(applicationForm);
    if (submit) submit.disabled = true;
    if (label) label.textContent = 'Надсилаємо…';
    if (status) status.textContent = '';

    try {
        const response = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: data.get('name'),
                phone: data.get('phone'),
                source: 'main-site-inquiry',
                device: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? '📱 Мобільний' : '💻 Десктоп',
                timestamp: new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })
            })
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error('Lead submission failed');
        applicationForm.reset();
        applicationFormView.hidden = true;
        applicationSuccess.hidden = false;
        if (typeof window.shepitTrack === 'function') window.shepitTrack('generate_lead', { form_name: 'application_modal' });
    } catch (error) {
        console.error(error);
        window.shepitTrackFormFailure?.(applicationForm);
        if (status) { status.textContent = 'Заявку не надіслано. Перевірте з’єднання або зателефонуйте: +38 (095) 073 43 76.'; status.focus(); }
    } finally {
        if (submit) submit.disabled = false;
        if (label) label.textContent = 'Надіслати заявку';
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && applicationModal && !applicationModal.hidden) closeApplicationModal();
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
            galleryProgress.style.width = `${100 / gallerySlides.length}%`;
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
    const allPins = Array.from(v2Masterplan.querySelectorAll('.plan-pin'));
    const unitButtons = Array.from(v2Masterplan.querySelectorAll('[data-plan-target]'));
    const numberOutput = v2Masterplan.querySelector('[data-plan-number]');
    const typeOutput = v2Masterplan.querySelector('[data-plan-type-output]');
    const areaOutput = v2Masterplan.querySelector('[data-plan-area-output]');
    const statusOutput = v2Masterplan.querySelector('[data-plan-status-output]');
    const bedroomsOutput = v2Masterplan.querySelector('[data-plan-bedrooms-output]');
    const detailsLink = v2Masterplan.querySelector('[data-plan-link]');
    const selectedPanel = v2Masterplan.querySelector('.plan-v2__selected');
    let selectedUnit = '01';

    const selectUnit = (unitId) => {
        const pin = allPins.find((item) => item.dataset.planUnit === unitId);
        if (!pin) return;

        selectedUnit = unitId;

        allPins.forEach((item) => item.classList.toggle('is-active', item === pin));
        unitButtons.forEach((item) => item.classList.toggle('is-active', item.dataset.planTarget === unitId));

        if (numberOutput) numberOutput.textContent = `Резиденція ${pin.dataset.planUnit}`;
        if (typeOutput) typeOutput.textContent = pin.dataset.planType;
        if (areaOutput) areaOutput.textContent = pin.dataset.planArea;
        if (statusOutput) statusOutput.textContent = pin.dataset.planStatus;
        if (bedroomsOutput) bedroomsOutput.textContent = pin.dataset.planType.startsWith('Таунхаус') ? '3 спальні' : '4 спальні';
        if (detailsLink) {
            detailsLink.setAttribute('aria-label', `Дізнатися деталі про резиденцію ${pin.dataset.planUnit}`);
            detailsLink.dataset.planUnit = pin.dataset.planUnit;
            detailsLink.dataset.planType = pin.dataset.planType;
        }

        if (selectedPanel) {
            const isLight = Number(pin.dataset.planUnit) % 2 === 0;
            selectedPanel.classList.toggle('is-light', isLight);
            selectedPanel.classList.toggle('is-dark', !isLight);
        }
    };

    allPins.forEach((pin) => {
        pin.addEventListener('click', () => {
            if (pin.dataset.planUrl) {
                window.location.assign(pin.dataset.planUrl);
                return;
            }
            selectUnit(pin.dataset.planUnit);
        });
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
const contactSuccess = document.querySelector('[data-contact-success]');
const questionButton = document.querySelector('[data-question-button]');
const colorTestToggle = document.querySelector('[data-color-test-toggle]');
const colorTestLabel = document.querySelector('[data-color-test-label]');

const colorModes = [
    { id: 'graphite', label: 'Графіт', className: '' },
    { id: 'olive', label: 'Олива', className: 'is-olive-accent' },
    { id: 'olive-light', label: 'Світла олива', className: 'is-olive-light-accent' }
];

const setColorTestMode = (modeId) => {
    const mode = colorModes.find((item) => item.id === modeId) || colorModes[1];
    colorModes.filter((item) => item.className).forEach((item) => document.body.classList.toggle(item.className, item.className === mode.className));
    colorTestToggle?.setAttribute('aria-label', `Кольорова тема: ${mode.label}. Натисніть, щоб змінити.`);
    if (colorTestLabel) colorTestLabel.textContent = mode.label;
};

// The public site is locked to olive. Other tokens stay defined for future use.
setColorTestMode('olive');

questionButton?.addEventListener('click', () => {
    openApplicationModal();
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
                source: 'Відкрита форма SHEPIT HOUSE',
                device: isMobile ? '📱 Мобільний' : '💻 Десктоп',
                timestamp: new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })
            })
        });

        const result = await response.json();
        if (!response.ok || !result.success) throw new Error('Lead submission failed');

        contactForm.reset();
        contactForm.hidden = true;
        if (contactSuccess) contactSuccess.hidden = false;
        if (typeof window.shepitTrack === 'function') window.shepitTrack('generate_lead', { form_name: 'contact_form' });
    } catch (error) {
        console.error(error);
        window.shepitTrackFormFailure?.(contactForm);
        if (status) { status.textContent = 'Заявку не надіслано. Перевірте з’єднання або зателефонуйте: +38 (095) 073 43 76.'; status.focus(); }
    } finally {
        if (submitButton) submitButton.disabled = false;
        if (submitLabel) submitLabel.textContent = originalLabel;
    }
});
