
let movies = [];
let currentSlideIndex = 0;
let focusedElement = null;

// Fetch movies on load
window.onload = function () {
  fetch("movies.json")
    .then(res => res.json())
    .then(data => {
      movies = data;
      renderMainPage();
      initHeroSlider();
    })
    .catch(err => console.error("Failed to load movies:", err));

  // Focus body for keyboard navigation
  document.body.focus();
};

// Format category/language names
function formatText(text) {
  if (!text) return "";
  return text
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// Render movie card
function renderMovieCard(movie, container) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.tabIndex = 0;
  card.innerHTML = `
    <img src="${movie.image}" alt="${movie.title}" />
    <div class="info">
      <div class="title">${movie.title}</div>
      <div class="meta">${formatText(movie.language)}</div>
    </div>
  `;
  card.onclick = () => {
    window.location.href = movie.link;
  };
  container.appendChild(card);
}

// Hero Slider
function initHeroSlider() {
  const trailers = movies.filter(m => m.category === "trailers");
  if (trailers.length === 0) return;

  const slide = document.getElementById("slide-0");
  slide.querySelector(".slide-img").src = trailers[0].image;
  slide.querySelector(".slide-title").textContent = trailers[0].title;
  slide.dataset.link = trailers[0].link;

  window.trailers = trailers;
  updateSlide(0);
}

function updateSlide(index) {
  const trailers = window.trailers;
  if (!trailers || trailers.length === 0) return;

  const slide = document.getElementById("slide-0");
  currentSlideIndex = (index + trailers.length) % trailers.length;
  const movie = trailers[currentSlideIndex];
  slide.querySelector(".slide-img").src = movie.image;
  slide.querySelector(".slide-title").textContent = movie.title;
  slide.dataset.link = movie.link;
}

function changeSlide(dir) {
  updateSlide(currentSlideIndex + dir);
}

function playTrailer() {
  const slide = document.getElementById("slide-0");
  window.location.href = slide.dataset.link;
}

// Keyboard (TV Remote) Navigation
document.body.addEventListener("keydown", function (e) {
  const allCards = Array.from(document.querySelectorAll(".movie-card, .lang-card, .nav-link, .play-btn, .see-all"));
  let index = allCards.indexOf(focusedElement);

  // Arrow keys
  if (e.key === "ArrowDown") {
    e.preventDefault();
    index = Math.min(index + 5, allCards.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    index = Math.max(index - 5, 0);
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    index = Math.min(index + 1, allCards.length - 1);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    index = Math.max(index - 1, 0);
  } else if (e.key === "Enter" && focusedElement) {
    if (focusedElement.tagName === "A" || focusedElement.onclick) {
      focusedElement.click();
    }
    return;
  }

  if (allCards[index]) {
    if (focusedElement) focusedElement.classList.remove("focused");
    focusedElement = allCards[index];
    focusedElement.classList.add("focused");
    focusedElement.focus();
    ensureVisible(focusedElement);
  }
});

// Ensure focused element is in view
function ensureVisible(element) {
  const rect = element.getBoundingClientRect();
  if (rect.top < 0) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (rect.bottom > window.innerHeight) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// --- Main Render Function ---
function renderMainPage() {
  const staticSections = [
    "trailers", "k-apps", "k-channels", "K-news", "live movies",
    "new movies", "old movies", "devotional", "k-activities",
    "web series", "live web series", "serials"
  ];
  const dynamicContainer = document.getElementById("dynamic-sections");

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

  const allCategories = [...new Set(movies.map(m => m.category))];
  const extraCategories = allCategories.filter(c => !staticSections.includes(c));

  extraCategories.forEach(category => {
    const filteredMovies = movies.filter(m => m.category === category).sort((a, b) => b.type.localeCompare(a.type));
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
      card.addEventListener("click", () => {
        window.location.href = `language_page.html?language=${lang}`;
      });
      langContainer.appendChild(card);
    });
  }
}