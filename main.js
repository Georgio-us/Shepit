const navbar = document.getElementById('navbar');

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

window.addEventListener('scroll', () => {
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

const overlay = document.getElementById('modal-overlay');

function openModal(modalId) {
    closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
}

function closeAllModals() {
    document.querySelectorAll('.modal-content').forEach((modal) => {
        modal.classList.remove('active');
    });
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
}

function openDynamicModal(title, desc, imgSrc, btnText = 'Отримати консультацію') {
    document.getElementById('info-modal-title').innerText = title;
    document.getElementById('info-modal-desc').innerText = desc;
    document.getElementById('info-modal-img').src = imgSrc;
    document.getElementById('info-modal-btn').innerText = btnText;

    openModal('info-modal');
}

function submitForm(event) {
    event.preventDefault();
    closeAllModals();

    setTimeout(() => {
        openModal('success-modal');
    }, 300);
}
