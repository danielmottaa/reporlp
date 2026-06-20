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
