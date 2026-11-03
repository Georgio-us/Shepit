(() => {
  const section = document.querySelector('.construction-photos');
  if (!section) return;

  const tablist = section.querySelector('[role="tablist"]');
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));

  function selectTab(tab, moveFocus = false) {
    tabs.forEach((item) => {
      const selected = item === tab;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      panel.hidden = !selected;
      if (selected) panel.tabIndex = 0;
    });

    const left = tab.offsetLeft - tablist.offsetLeft - (tablist.clientWidth - tab.clientWidth) / 2;
    tablist.scrollTo({ left, behavior: moveFocus ? 'smooth' : 'auto' });
    if (moveFocus) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;

      event.preventDefault();
      selectTab(tabs[nextIndex], true);
    });
  });

  selectTab(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]);

  const dialog = section.querySelector('.construction-photo-dialog');
  const dialogImage = dialog.querySelector('.construction-photo-dialog__image');
  const dialogCaption = dialog.querySelector('[data-photo-caption]');
  const previousButton = dialog.querySelector('[data-photo-prev]');
  const nextButton = dialog.querySelector('[data-photo-next]');
  let photoLinks = [];
  let photoIndex = 0;
  let returnFocus = null;

  function displayPhoto(index) {
    photoIndex = (index + photoLinks.length) % photoLinks.length;
    const link = photoLinks[photoIndex];
    dialogImage.src = link.href;
    dialogImage.alt = link.querySelector('img').alt;
    dialogCaption.textContent = link.closest('figure').querySelector('figcaption').textContent;
    previousButton.hidden = photoLinks.length < 2;
    nextButton.hidden = photoLinks.length < 2;
  }

  section.addEventListener('click', (event) => {
    const link = event.target.closest('[data-construction-photo]');
    if (!link) return;
    event.preventDefault();
    photoLinks = Array.from(link.closest('.construction-photos__gallery').querySelectorAll('[data-construction-photo]'));
    returnFocus = link;
    displayPhoto(photoLinks.indexOf(link));
    dialog.showModal();
  });

  dialog.querySelector('[data-photo-close]').addEventListener('click', () => dialog.close());
  previousButton.addEventListener('click', () => displayPhoto(photoIndex - 1));
  nextButton.addEventListener('click', () => displayPhoto(photoIndex + 1));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      displayPhoto(photoIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      displayPhoto(photoIndex + 1);
    }
  });
  dialog.addEventListener('close', () => {
    dialogImage.removeAttribute('src');
    returnFocus?.focus();
  });
})();
