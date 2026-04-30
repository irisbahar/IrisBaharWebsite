const track = document.querySelector('.carousel-track');
const slides = document.querySelectorAll('.carousel-track .slide-content');
const dotsContainer = document.querySelector('.carousel-dots');

let currentIndex = 0;

function goTo(index) {
  currentIndex = index;
  track.style.transform = `translateX(-${index * 100}%)`;
  dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

slides.forEach((_, index) => {
  const dot = document.createElement('span');
  dot.className = 'dot' + (index === 0 ? ' active' : '');
  dot.addEventListener('click', () => goTo(index));
  dotsContainer.appendChild(dot);
});

window.addEventListener('resize', () => goTo(currentIndex));
