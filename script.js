
// Static sections
const staticSections = [
  "trailers",
  "web_series",
  "romantic_drama",
  "anime_series",
  "action",
  "action_adventure"
];

const dynamicContainer = document.getElementById("dynamic-sections");
let movies = [];
let focusedElement = null;
let searchTimeout;

// Fetch movies
async function loadMovies() {
  try {
    const res = await fetch('movies.json');
    movies = await res.json();
    renderHeroSlider();
    renderDynamicSections();
  } catch (err) {
    console.error("Failed to load movies:", err);
  }
}

// Render Hero Slider (Only Trailers)
function renderHeroSlider() {
  const heroSlider = document.getElementById('heroSlider');
  const trailerMovies = movies.filter(m => m.category === "trailers");

  if (trailerMovies.length === 0) {
    heroSlider.innerHTML = `<div class="hero-slide" style="background:#222"><h2>No Trailers Available</h2></div>`;
    return;
  }

  const current = trailerMovies[0];
  heroSlider.innerHTML = `
    <div class="hero-slide" style="background-image: url('${current.image}')">
      <div>
        <h2>${current.title}</h2>
        <p>Watch the latest trailer now!</p>
      </div>
    </div>
  `;
}

// Render Dynamic Sections
function renderDynamicSections() {
  dynamicContainer.innerHTML = '';
  staticSections.forEach(section => {
    const sectionMovies = movies.filter(m => m.category.toLowerCase() === section.toLowerCase());
    if (sectionMovies.length === 0) return;

    const sectionEl = document.createElement('div');
    sectionEl.className = 'section';
    sectionEl.innerHTML = `<h2>${formatTitle(section)}</h2>`;
    
    const row = document.createElement('div');
    row.className = 'movies-row';
    
    sectionMovies.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.style.backgroundImage = `url('${movie.image}')`;
      card.setAttribute('tabindex', '0');
      card.setAttribute('data-link', movie.link);
      card.innerHTML = `<div class="title">${movie.title}</div>`;
      row.appendChild(card);
    });

    sectionEl.appendChild(row);
    dynamicContainer.appendChild(sectionEl);
  });

  // Focus first card
  const firstCard = document.querySelector('.movie-card');
  if (firstCard) {
    firstCard.focus();
    focusedElement = firstCard;
  }
}

// Format category name
function formatTitle(str) {
  return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Navigation with TV Remote (Arrow Keys + Enter)
document.addEventListener('keydown', (e) => {
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const currentIndex = cards.indexOf(focusedElement);

  switch(e.key) {
    case 'ArrowRight':
      e.preventDefault();
      const next = cards[currentIndex + 1];
      if (next) {
        next.focus();
        focusedElement = next;
        ensureVisible(next);
      }
      break;

    case 'ArrowLeft':
      e.preventDefault();
      const prev = cards[currentIndex - 1];
      if (prev) {
        prev.focus();
        focusedElement = prev;
        ensureVisible(prev);
      }
      break;

    case 'ArrowDown':
      e.preventDefault();
      // Move to next row (simplified: jump 5 items)
      const down = cards[currentIndex + 5];
      if (down) {
        down.focus();
        focusedElement = down;
        ensureVisible(down);
      }
      break;

    case 'ArrowUp':
      e.preventDefault();
      const up = cards[currentIndex - 5];
      if (up) {
        up.focus();
        focusedElement = up;
        ensureVisible(up);
      }
      break;

    case 'Enter':
      e.preventDefault();
      if (focusedElement && focusedElement.dataset.link) {
        window.location.href = focusedElement.dataset.link;
      }
      break;

    case 'Backspace':
    case 'Escape':
      // Go back (example)
      window.history.back();
      break;
  }
});

// Ensure focused element is in view
function ensureVisible(element) {
  const row = element.parentElement;
  const containerWidth = row.offsetWidth;
  const cardWidth = element.offsetWidth + 15;
  const scrollLeft = row.scrollLeft;
  const cardOffset = element.offsetLeft;

  if (cardOffset < scrollLeft) {
    row.scrollTo({ left: cardOffset, behavior: 'smooth' });
  } else if (cardOffset + cardWidth > scrollLeft + containerWidth) {
    row.scrollTo({ left: cardOffset - containerWidth + cardWidth, behavior: 'smooth' });
  }
}

// Search Functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const query = e.target.value.toLowerCase();
    if (query.length === 0) {
      renderDynamicSections();
      return;
    }

    const filtered = movies.filter(m =>
      m.title.toLowerCase().includes(query)
    );

    dynamicContainer.innerHTML = '';

    if (filtered.length === 0) {
      dynamicContainer.innerHTML = '<p>No results found.</p>';
      return;
    }

    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = `<h2>Search Results</h2>`;
    const row = document.createElement('div');
    row.className = 'movies-row';

    filtered.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.style.backgroundImage = `url('${movie.image}')`;
      card.setAttribute('tabindex', '0');
      card.setAttribute('data-link', movie.link);
      card.innerHTML = `<div class="title">${movie.title}</div>`;
      row.appendChild(card);
    });

    section.appendChild(row);
    dynamicContainer.appendChild(section);





    const first = row.querySelector('.movie-card');
    if (first) first.focus();
  }, 500);
});

// Initialize
window.onload = loadMovies;