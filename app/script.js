
const staticSections = ["trailers", "web_series", "romantic_drama", "anime_Series", "action", "action_adventure"];
const dynamicContainer = document.getElementById("dynamic-sections");
let movies = [];
let currentIndex = 0;
let focusedCard = null;
let heroIndex = 0;
let heroSlides = [];

// Load movies
fetch('movies.json')
  .then(res => res.json())
  .then(data => {
    movies = data;

    // Render hero slider (trailers only)
    heroSlides = movies.filter(m => m.category === "trailers");
    renderHeroSlider();

    // Render static sections
    staticSections.forEach(section => {
      const sectionMovies = movies.filter(m => m.category === section);
      if (sectionMovies.length > 0) renderSection(section, sectionMovies);
    });

    // Set initial focus
    setTimeout(() => {
      const firstCard = document.querySelector('.movie-card');
      if (firstCard) focusCard(firstCard);
    }, 500);
  });

function renderHeroSlider() {
  const slider = document.getElementById('hero-slider');
  slider.innerHTML = '';

  heroSlides.forEach((movie, i) => {
    const slide = document.createElement('div');
    slide.className = i === 0 ? 'slide active' : 'slide';
    slide.style.backgroundImage = `url('${movie.image}')`;
    
    const title = document.createElement('h2');
    title.className = 'slide-title';
    title.textContent = movie.title;
    slide.appendChild(title);

    const playBtn = document.createElement('div');
    playBtn.className = 'play-button';
    playBtn.onclick = () => window.location.href = movie.link;
    slide.appendChild(playBtn);

    slider.appendChild(slide);
  });

  setInterval(() => {
    heroIndex = (heroIndex + 1) % heroSlides.length;
    document.querySelectorAll('.slide').forEach((s, i) => {
      s.classList.toggle('active', i === heroIndex);
    });
  }, 5000);
}

function renderSection(title, movies) {
  const section = document.createElement('section');
  section.className = 'section';

  const heading = document.createElement('h2');
  heading.textContent = formatTitle(title);
  section.appendChild(heading);

  const row = document.createElement('div');
  row.className = 'movie-row';

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.backgroundImage = `url('${movie.image}')`;
    card.setAttribute('data-link', movie.link);
    card.tabIndex = 0;

    const titleEl = document.createElement('h3');
    titleEl.textContent = movie.title;
    card.appendChild(titleEl);

    card.onclick = () => window.location.href = movie.link;

    row.appendChild(card);
  });

  section.appendChild(row);
  dynamicContainer.appendChild(section);
}

function formatTitle(str) {
  return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// TV Remote Navigation
document.addEventListener('keydown', (e) => {
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  if (cards.length === 0) return;

  switch(e.key) {
    case 'ArrowRight':
      e.preventDefault();
      const next = cards.indexOf(focusedCard) + 1;
      if (next < cards.length) focusCard(cards[next]);
      break;

    case 'ArrowLeft':
      e.preventDefault();
      const prev = cards.indexOf(focusedCard) - 1;
      if (prev >= 0) focusCard(cards[prev]);
      break;

    case 'Enter':
      e.preventDefault();
      if (focusedCard) {
        const link = focusedCard.getAttribute('data-link');
        if (link) window.location.href = link;
      }
      break;
  }
});

function focusCard(card) {
  if (focusedCard) focusedCard.classList.remove('focused');
  focusedCard = card;
  focusedCard.classList.add('focused');
  focusedCard.focus();

  // Scroll into view
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}