
// Global movies array
let movies = [];

// Format text: capitalize and replace dashes
function formatText(str) {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Fetch movies from JSON
async function loadMovies() {
  try {
    const res = await fetch('movies.json?' + new Date().getTime());
    movies = await res.json();
  } catch (err) {
    console.error("Failed to load movies:", err);
  }
}

// Hero Slider for Trailers
function setupHeroSlider() {
  const heroMovies = movies.filter(m => m.category === "trailers");
  if (heroMovies.length === 0) return;

  const heroImg = document.getElementById("hero-img");

  const playButton = document.getElementById("play-button");

  let index = 0;

  function updateHero() {
    const movie = heroMovies[index];
    heroImg.src = movie.image;

    playButton.onclick = () => openMovie(movie);
    index = (index + 1) % heroMovies.length;
  }

  updateHero();
  setInterval(updateHero, 8000);
}
// Open movie in player
function openMovie(movie) {
  localStorage.setItem("currentMovie", JSON.stringify(movie));
  window.location.href = "movie_play.html";
}

// Render movie card
function renderMovieCard(movie, container) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.style.backgroundImage = `url(${movie.image})`;
  card.tabIndex = 0;
  card.setAttribute("aria-label", movie.title);

  const title = document.createElement("span");
  title.textContent = movie.title;
  card.appendChild(title);

  card.onclick = () => {
    localStorage.setItem("currentMovie", JSON.stringify(movie));
    window.location.href = "movie_play.html";
  };

  container.appendChild(card);
}

// Main Page Render
async function renderMainPage() {
  await loadMovies();

  const staticSections = [
    "trailers", "k-apps", "k-channels", "k-news", "live movies", "new movies",
    "old movies", "devotional", "k-activities", "web series", "live web series", "serials"
  ];
  const dynamicContainer = document.getElementById("dynamic-sections");



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

  // Auto-update every 5 minutes
  setInterval(loadMoviesAndUpdate, 5 * 60 * 1000);
  
setupHeroSlider();
  
}

// Auto-update without full refresh
async function loadMoviesAndUpdate() {
  await loadMovies();
  const dynamicContainer = document.getElementById("dynamic-sections");
  if (!dynamicContainer) return;

  dynamicContainer.innerHTML = ""; // Clear and re-render
  renderMainPage(); // Re-render with new data
}

// movies_category.html
function renderCategoryPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");
  document.getElementById("category-title").textContent = formatText(category);

  const container = document.getElementById("category-movies");
  const filtered = movies.filter(m => m.category === category);
  filtered.forEach(m => renderMovieCard(m, container));
}

// language_page.html
function renderLanguagePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get("language") || "";
  const container = document.getElementById("language-movies");
  const filtered = movies.filter(m => m.language === lang);

  if (filtered.length === 0) {
    container.innerHTML = `<p>No movies in ${formatText(lang)}.</p>`;
    return;
  }

  filtered.forEach(m => renderMovieCard(m, container));
}

// movie_play.html
function playMovie() {
  const movie = JSON.parse(localStorage.getItem("currentMovie"));
  if (!movie) {
    alert("No movie selected!");
    window.history.back();
    return;
  }

  const video = document.getElementById("video-player");
  video.src = movie.link;


}

// Handle TV Remote Navigation
document.addEventListener("keydown", (e) => {
  const focusable = Array.from(document.querySelectorAll("a, button, .movie-card, .lang-card, #play-button, input"));
  let index = focusable.indexOf(document.activeElement);

  switch (e.key) {
    case "ArrowRight": index = Math.min(index + 1, focusable.length - 1); break;
    case "ArrowLeft": index = Math.max(index - 1, 0); break;
    case "ArrowDown":
      const row = getRow(focusable[index]);
      const nextRowItems = getItemsBelow(row);
      if (nextRowItems.length > 0) {
        const col = getColumn(focusable[index]);
        const closest = findClosest(nextRowItems, col);
        closest.focus();
        return;
      }
      break;
    case "ArrowUp":
      const currentRow = getRow(focusable[index]);
      const prevRowItems = getItemsAbove(currentRow);
      if (prevRowItems.length > 0) {
        const col = getColumn(focusable[index]);
        const closest = findClosest(prevRowItems, col);
        closest.focus();
        return;
      }
      break;
    case "Enter": case " ": 
      e.preventDefault();
      if (document.activeElement.click) document.activeElement.click();
      return;
    case "F": case "f":
      toggleFullscreen();
      return;
  }

  if (focusable[index]) {
    focusable[index].focus();
  }
});

function getRow(element) {
  let parent = element.parentElement;
  while (parent && !parent.classList.contains("movie-row")) {
    parent = parent.parentElement;
  }
  return parent;
}

function getColumn(el) {
  return el.getBoundingClientRect().left;
}

function getItemsBelow(row) {
  const allRows = Array.from(document.querySelectorAll(".movie-row"));
  const idx = allRows.indexOf(row);
  return idx < allRows.length - 1 ? Array.from(allRows[idx + 1].children) : [];
}

function getItemsAbove(row) {
  const allRows = Array.from(document.querySelectorAll(".movie-row"));
  const idx = allRows.indexOf(row);
  return idx > 0 ? Array.from(allRows[idx - 1].children) : [];
}

function findClosest(items, targetX) {
  return items.reduce((a, b) =>
    Math.abs(a.getBoundingClientRect().left - targetX) < Math.abs(b.getBoundingClientRect().left - targetX) ? a : b
  );
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.body.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Page Routing
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("body-main")) renderMainPage();
  if (document.body.classList.contains("body-category")) {
    loadMovies().then(renderCategoryPage);
  }
  if (document.body.classList.contains("body-lang")) {
    loadMovies().then(renderLanguagePage);
  }
  if (document.body.classList.contains("body-play")) {
    playMovie();
  }
});