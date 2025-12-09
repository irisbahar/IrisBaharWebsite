const track = document.querySelector('.carousel-track');
const dots = document.querySelectorAll('.carousel-dots .dot');

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    // Move the track to show the clicked card
    track.style.transform = `translateX(-${index * 100}%)`;
    
    // Update active dot
    dots.forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
});
