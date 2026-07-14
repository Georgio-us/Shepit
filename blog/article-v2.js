const progress = document.querySelector('[data-reading-progress]');
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const value = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
  progress.style.transform = `scaleX(${value})`;
};
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

document.querySelector('[data-copy-link]')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(window.location.href);
    button.textContent = 'Посилання скопійовано';
  } catch (error) {
    button.textContent = 'Скопіюйте адресу сторінки';
  }
});
