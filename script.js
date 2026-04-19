
let movies = [];
let focusedElement = null;

// Format category name (e.g., "romantic_drama" → "Romantic Drama")
function formatText(text) {
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Render movie card
function renderMovieCard(movie, container) {
  const card = document.createElement("div");
  card.className = "movie-card";
  
      card.setAttribute('tabindex', '0');
      
  card.innerHTML = `
    <img src="${movie.image}" alt="${movie.title}">
    <div class="card-info">
      <h3>${movie.title}</h3>

    </div>
  `;
  
  card.addEventListener("click", () => {
            window.location.href = `movie_play.html?title=${encodeURIComponent(movie.title)}`;
  });
  
  
  container.appendChild(card);
  

  
}

// Render hero slider
function renderHeroSlider() {
  const heroSlider = document.getElementById("hero-slider");
  
          const featured = movies.filter(movie => movie.category.toLowerCase() === "trailers");
          
          featured.forEach((movie, index) => {
  

    const slide = document.createElement('div');

    slide.className = `hero-slide${index === 0 ? " active" : ""}`;
    slide.style.backgroundImage = `url(${movie.image})`;
    slide.innerHTML = `
      <div class="slide-content">





      </div>
    `;
    heroSlider.appendChild(slide);
  });
}
  // Auto-slide
  setInterval(() => {
    const slides = document.querySelectorAll(".hero-slide");
    const current = document.querySelector(".hero-slide.active");
    const next = current.nextElementSibling || slides[0];
    current.classList.remove("active");
    next.classList.add("active");
    

    
  }, 5000);


// Render main page
function renderMainPage() {
  const staticSections = [
   "trailers", "k-apps", "k-channels", "K-news", "live movies", "new movies", "old movies" , "devotinal", "k-activities", "web series", "live web series",  "serials"
  ];
  const dynamicContainer = document.getElementById("dynamic-sections");

  // --- Static Sections ---
  
  staticSections.forEach(section => {
    let filteredMovies = [];

      filteredMovies = movies.filter(m => m.category === section);

    if (filteredMovies.length === 0) return;
  
    let container = document.getElementById(section);
    if (!container && dynamicContainer) {
      const sectionDiv = document.createElement("div");
      sectionDiv.className = "movie-section";
      sectionDiv.id = section;
      sectionDiv.innerHTML = `
        <div class="section-header">
          <h2 class="section-title">${formatText(section)}</h2>
          <a href="movies_category.html?category=${section}" class="see-all">See All</a>
        </div>
        <div class="movie-row" id="dynamic-${section}"></div>
      `;
      dynamicContainer.appendChild(sectionDiv);
      container = sectionDiv.querySelector(".movie-row");
    }

    filteredMovies.forEach(m => renderMovieCard(m, container));
  });

  // --- Dynamic Categories (extra) ---
  const allCategories = [...new Set(movies.map(m => m.category))];
  const extraCategories = allCategories.filter(c => !staticSections.includes(c));

  extraCategories.forEach(category => {
    const filteredMovies = movies.filter(m => m.category === category);
    if (filteredMovies.length === 0 || !dynamicContainer) return;

    const section = document.createElement("div");
    section.className = "movie-section";
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">${formatText(category)}</h2>
        <a href="movies_category.html?category=${category}" class="see-all">See All</a>
      </div>
      <div class="movie-row-dynamic" id="dynamic-${category}"></div>
    `;
    dynamicContainer.appendChild(section);

    const row = section.querySelector(".movie-row-dynamic");
    filteredMovies.forEach(m => renderMovieCard(m, row));
  
  // Focus first card
  const firstCard = document.querySelector('.movie-card');
  if (firstCard) {
    firstCard.focus();
    focusedElement = firstCard;
  }


setTimeout(() => {
    const first = row.querySelector('.movie-card');
    if (first) first.focus();
  }, 500);
      
  });

  // --- Language Section ---
  const langContainer = document.getElementById("language-row");
  if (langContainer) {
    const languages = [...new Set(movies.map(m => m.language))];
    const previewLanguages = languages.slice(0, 10);

    previewLanguages.forEach(lang => {
      const card = document.createElement("div");
      card.className = "lang-card";
      card.textContent = formatText(lang);
      card.addEventListener("click", () => {
        window.location.href = `language_page.html?language=${lang}`;
      });
      langContainer.appendChild(card);
    });

    const header = langContainer.parentElement.querySelector(".section-header");
    if (header && !header.querySelector(".see-all")) {
      const seeAllLink = document.createElement("a");
      seeAllLink.href = "movies_category.html?category=languages";
      seeAllLink.className = "see-all";
      seeAllLink.textContent = "See All";
      header.appendChild(seeAllLink);
    }
  }
}

// Search Functionality
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) return;

    const results = movies.filter(m => 
      m.title.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query) ||
      m.language.toLowerCase().includes(query)
    );

    const container = document.getElementById("dynamic-sections");
    container.innerHTML = "";

    if (results.length > 0) {
      const section = document.createElement("div");
      section.className = "movie-section";
      section.innerHTML = `
        <div class="section-header">
          <h2 class="section-title">Search Results</h2>
        </div>
        <div class="movie-row"></div>
      `;
      container.appendChild(section);
      const row = section.querySelector(".movie-row");
      results.forEach(m => renderMovieCard(m, row));
    } else {
      container.innerHTML = "<p style='color:#aaa; padding:20px;'>No movies found.</p>";
    }
  });
  

  
}

// Load movies and initialize
window.onload = async () => {
  try {
    const res = await fetch('movies.json');
    movies = await res.json();
    renderHeroSlider();
    renderMainPage();
    setupSearch();
  } catch (err) {
    console.error("Failed to load movies:", err);
  }
};

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