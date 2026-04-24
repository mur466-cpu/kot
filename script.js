
// Global movies array
let movies = [];

// Fetch movies.json
async function loadMovies() {
  const res = await fetch('movies.json');
  movies = await res.json();
}

// Format text (e.g., "new_movies" → "New Movies")
function formatText(str) {
  return str
    .split('-').join(' ')
    .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

// Render movie card
function renderMovieCard(movie, container) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.tabIndex = 0;
  card.innerHTML = `
    <img src="${movie.image}" alt="${movie.title}" />
    <div class="card-title">${formatText(movie.title)}</div>
  `;
  card.onclick = () => {
    localStorage.setItem("currentMovie", JSON.stringify(movie));
    window.location.href = "movie_play.html";
  };
  container.appendChild(card);
}

// Render Main Page
async function renderMainPage() {
  await loadMovies();

  const staticSections = [
    "trailers", "k-apps", "k-channels", "k-news", "live movies", "new movies",
    "old movies", "devotional", "k-activities", "web series", "live web series", "serials"
  ];
  const dynamicContainer = document.getElementById("dynamic-sections");

  // Hero Slider (Only Trailers)
  const trailers = movies.filter(m => m.category === "trailers");
  if (trailers.length > 0) {
    const heroSlide = document.getElementById("hero-slide");
    const heroBtn = document.getElementById("hero-play-btn");
    const trailer = trailers[0]; // Pick first trailer
    heroSlide.style.backgroundImage = `url(${trailer.image})`;
    heroBtn.onclick = () => {
      localStorage.setItem("currentMovie", JSON.stringify(trailer));
      window.location.href = "movie_play.html";
    };
  }

  // Static Sections
  staticSections.forEach(section => {
    const filteredMovies = movies.filter(m => m.category === section);
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

  // Extra Categories
  const allCategories = [...new Set(movies.map(m => m.category))];
  const extraCategories = allCategories.filter(c => !staticSections.includes(c));

  extraCategories.forEach(category => {
    const filteredMovies = movies.filter(m => m.category === category)
                                 .sort((a, b) => (b.type || '').localeCompare(a.type || ''));
    if (filteredMovies.length === 0 || !dynamicContainer) return;

    const section = document.createElement("div");
    section.className = "movie-section";
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">${formatText(category)}</h2>
        <a href="movies_category.html?category=${category}" class="see-all">See All</a>
      </div>
      <div class="movie-row" id="dynamic-${category}"></div>
    `;
    dynamicContainer.appendChild(section);

    const row = section.querySelector(".movie-row");
    filteredMovies.forEach(m => renderMovieCard(m, row));
  });

  // Language Section
  const langContainer = document.getElementById("language-row");
  if (langContainer) {
    const languages = [...new Set(movies.map(m => m.language))];
    const previewLanguages = languages.slice(0, 10);

    previewLanguages.forEach(lang => {
      const card = document.createElement("div");
      card.className = "lang-card";
      card.textContent = formatText(lang);
      card.tabIndex = 0;
      card.onclick = () => {
        window.location.href = `language_page.html?language=${lang}`;
      };
      langContainer.appendChild(card);
    });
  }

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const movieCards = document.querySelectorAll(".movie-card");
      movieCards.forEach(card => {
        const title = card.querySelector(".card-title").textContent.toLowerCase();
        card.style.display = title.includes(query) ? "block" : "none";
      });
    });
  }

  // Focus management for TV remote
  setupRemoteNavigation();
}

// Navigate with TV remote (Arrow keys + Enter)
function setupRemoteNavigation() {
  let currentFocus = document.querySelector(".movie-card, .lang-card, .see-all, .hero-play-btn") || document.body;
  currentFocus.focus();

  document.addEventListener("keydown", (e) => {
    const allFocusable = Array.from(document.querySelectorAll(".movie-card, .lang-card, .see-all, .hero-play-btn, .back-btn, .category-card"));
    const currentIndex = allFocusable.indexOf(currentFocus);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = allFocusable.find((el, i) => i > currentIndex && el.offsetTop > currentFocus.offsetTop);
      const newFocus = next || currentFocus;
      newFocus.focus();
      currentFocus = newFocus;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = [...allFocusable].reverse().find((el, i) => {
        const idx = allFocusable.length - 1 - i;
        return idx < currentIndex && el.offsetTop < currentFocus.offsetTop;
      });
      const newFocus = prev || currentFocus;
      newFocus.focus();
      currentFocus = newFocus;
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = allFocusable[currentIndex + 1] || currentFocus;
      next.focus();
      currentFocus = next;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = allFocusable[currentIndex - 1] || currentFocus;
      prev.focus();
      currentFocus = prev;
    } else if (e.key === "Enter") {
      e.preventDefault();
      currentFocus.click();
    }
  });
}

// Render Category Page
function renderCategoryPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");
  const titleEl = document.getElementById("category-title");
  const container = document.getElementById("category-movies");

  if (!category || !container) return;

  titleEl.textContent = formatText(category);

  let filteredMovies = [];
  if (category === "languages") {
    const languages = [...new Set(movies.map(m => m.language))];
    languages.forEach(lang => {
      const card = document.createElement("div");
      card.className = "category-card";
      card.textContent = formatText(lang);
      card.onclick = () => {
        window.location.href = `language_page.html?language=${lang}`;
      };
      container.appendChild(card);
    });
  } else {
    filteredMovies = movies.filter(m => m.category === category);
    filteredMovies.forEach(m => renderMovieCard(m, container));
  }
}

// Render Language Page
function renderLanguagePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const language = urlParams.get("language");
  const titleEl = document.getElementById("language-title");
  const container = document.getElementById("language-movies");

  if (!language || !container) return;

  titleEl.textContent = `Movies in ${formatText(language)}`;
  const filteredMovies = movies.filter(m => m.language === language);
  filteredMovies.forEach(m => renderMovieCard(m, container));
}

// Play Movie Page
function renderPlayPage() {
  const movie = JSON.parse(localStorage.getItem("currentMovie"));
  if (!movie) {
    document.getElementById("play-title").textContent = "No movie selected";
    return;
  }
  document.getElementById("play-movie-title").textContent = formatText(movie.title);
  // Simulate video playback (in real app, use actual video src)
  const video = document.getElementById("video-player");
  video.src = movie.link; // or embed a mock video
}

// Route to correct page
async function route() {
  await loadMovies();
  const path = window.location.pathname;

  if (path.includes("index.html") || path === "/" || path.endsWith("ott-app/")) {
    renderMainPage();
  } else if (path.includes("movies_category.html")) {
    renderCategoryPage();
  } else if (path.includes("language_page.html")) {
    renderLanguagePage();
  } else if (path.includes("movie_play.html")) {
    renderPlayPage();
  }
}

// Start App
route();