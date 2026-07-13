const menuButton = document.querySelector('.hero-v2__menu');
const navigation = document.getElementById('v2-navigation');

function closeNavigation() {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
}

if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
        const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
        menuButton.setAttribute('aria-expanded', String(isOpen));
        navigation.classList.toggle('is-open', isOpen);
    });

    navigation.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeNavigation);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeNavigation();
    });
}

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
