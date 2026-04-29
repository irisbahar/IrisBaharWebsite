const track = document.querySelector('.carousel-track');
const slides = document.querySelectorAll('.carousel-track .slide-content');
const dotsContainer = document.querySelector('.carousel-dots');

slides.forEach((_, index) => {
  const dot = document.createElement('span');
  dot.className = 'dot' + (index === 0 ? ' active' : '');
  dot.addEventListener('click', () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dotsContainer.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
  dotsContainer.appendChild(dot);
});
