const navLinks = document.querySelectorAll('.sidebar .nav-link[href^="#"]');
const sections = Array.from(navLinks)
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const linkBySectionId = new Map(
  Array.from(navLinks).map(link => [link.getAttribute('href').slice(1), link])
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const link = linkBySectionId.get(entry.target.id);
      if (!link) return;
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  },
  { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
);

sections.forEach(section => observer.observe(section));
