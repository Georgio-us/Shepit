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
})();
