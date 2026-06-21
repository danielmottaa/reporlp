const buttons = document.querySelectorAll('[data-copy]');

buttons.forEach((button) => {
  button.addEventListener('click', async () => {
    const text = button.getAttribute('data-copy') || '';
    const original = button.textContent;

    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copiado';
      button.classList.add('copied');
      window.setTimeout(() => {
        button.textContent = original;
        button.classList.remove('copied');
      }, 1800);
    } catch {
      button.textContent = 'Copie manualmente';
      window.setTimeout(() => {
        button.textContent = original;
      }, 1800);
    }
  });
});

const links = [...document.querySelectorAll('.sidebar a')];
const sections = links
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      links.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === id);
      });
    });
  },
  { rootMargin: '-30% 0px -55% 0px', threshold: 0.01 }
);

sections.forEach((section) => observer.observe(section));

const filterButtons = document.querySelectorAll('[data-filter-group]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const group = button.getAttribute('data-filter-group');
    const value = button.getAttribute('data-filter');

    if (!group || !value) {
      return;
    }

    document
      .querySelectorAll(`[data-filter-group="${group}"]`)
      .forEach((item) => item.classList.remove('active'));

    button.classList.add('active');

    document
      .querySelectorAll(`.filterable-item[data-filter-type="${group}"]`)
      .forEach((item) => {
        const tags = item.getAttribute('data-filter-tags') || '';
        const visible = value === 'all' || tags.split(' ').includes(value);
        item.toggleAttribute('hidden', !visible);
      });
  });
});
