
let movies = [];
let currentFocus = null;
let searchTimeout = null;


function formatText(text) {
  return text
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}


function renderMovieCard(movie, container) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.setAttribute("tabindex", "0");
  card.innerHTML = `
    <img src="${movie.image}" alt="${movie.title}">
    <div class="info">
      <h3>${movie.title}</h3>

    </div>
  `;

  card.addEventListener("click", () => {
    openMovie(movie);
  });

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      openMovie(movie);
    }
  });

  container.appendChild(card);
}


function openMovie(movie) {
  localStorage.setItem("currentMovie", JSON.stringify(movie));
  window.location.href = "movie_play.html";
}


function setupHeroSlider() {
  const heroMovies = movies.filter(m => m.category === "trailers");
  if (heroMovies.length === 0) return;

  const heroImg = document.getElementById("hero-img");
  const heroTitle = document.getElementById("hero-title");
  const playButton = document.getElementById("play-button");

  let index = 0;

  function updateHero() {
    const movie = heroMovies[index];
    heroImg.src = movie.image;
    heroTitle.textContent = movie.title;
    playButton.onclick = () => openMovie(movie);
    index = (index + 1) % heroMovies.length;
  }

  updateHero();
  setInterval(updateHero, 8000);
}


function renderMainPage() {
  const staticSections = [
    "trailers", "k-apps", "k-channels", "k-news", "k-activities", "live movies", "new movies", "old movies", "devotional", "web series", "live web series", "serials"
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
          <a href="movies_category.html?category=${encodeURIComponent(section)}" class="see-all">See All</a>
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
    const filteredMovies = movies.filter(m => m.category === category).sort((a, b) => b.type - a.type);
    if (filteredMovies.length === 0 || !dynamicContainer) return;

    const section = document.createElement("div");
    section.className = "movie-section";
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">${formatText(category)}</h2>
        <a href="movies_category.html?category=${encodeURIComponent(category)}" class="see-all">See All</a>
      </div>
      <div class="movie-row" id="dynamic-${category}"></div>
    `;
    dynamicContainer.appendChild(section);

    const row = section.querySelector(".movie-row");
    filteredMovies.forEach(m => renderMovieCard(m, row));
  });


  const langContainer = document.getElementById("language-row");
  if (langContainer) {
    const languages = [...new Set(movies.map(m => m.language))];
    const previewLanguages = languages.slice(0, 10);

    previewLanguages.forEach(lang => {
      const card = document.createElement("div");
      card.className = "lang-card";
      card.setAttribute("tabindex", "0");
      card.textContent = formatText(lang);
      card.addEventListener("click", () => {
        window.location.href = `language_page.html?language=${encodeURIComponent(lang)}`;
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          window.location.href = `language_page.html?language=${encodeURIComponent(lang)}`;
        }
      });
      langContainer.appendChild(card);
    });
  }

  setupHeroSlider();
  setupSearch();
  focusFirstElement();
}


function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = searchInput.value.toLowerCase();
      const results = movies.filter(m =>
        m.title.toLowerCase().includes(query)
      );

      const dynamicContainer = document.getElementById("dynamic-sections");
      dynamicContainer.innerHTML = "";

      if (results.length > 0) {
        const section = document.createElement("div");
        section.className = "movie-section";
        section.innerHTML = `
          <div class="section-header">
            <h2 class="section-title">Search Results</h2>
          </div>
          <div class="movie-row" id="search-results"></div>
        `;
        dynamicContainer.appendChild(section);

        const container = document.getElementById("search-results");
        results.forEach(m => renderMovieCard(m, container));
      }
    }, 300);
  });
}


function focusFirstElement() {
  const firstCard = document.querySelector(".movie-card, .lang-card, .see-all");
  if (firstCard) {
    firstCard.focus();
    currentFocus = firstCard;
  }
}


document.addEventListener("keydown", (e) => {
  const focusables = Array.from(document.querySelectorAll(".movie-card, .lang-card, .see-all, .back-btn, #play-button, .menu a, input"));

  if (focusables.length === 0) return;

  let index = focusables.indexOf(document.activeElement);

  if (index === -1 && currentFocus) {
    index = focusables.indexOf(currentFocus);
  }

  switch (e.key) {
    case "ArrowRight":
      e.preventDefault();
      index = (index + 1) % focusables.length;
      break;
    case "ArrowLeft":
      e.preventDefault();
      index = (index - 1 + focusables.length) % focusables.length;
      break;
    case "ArrowDown":
      e.preventDefault();
      index = Math.min(index + 5, focusables.length - 1);
      break;
    case "ArrowUp":
      e.preventDefault();
      index = Math.max(index - 5, 0);
      break;
    case "Enter":
      if (document.activeElement) {
        document.activeElement.click();
      }
      break;
  }

  if (focusables[index]) {
    focusables[index].focus();
    currentFocus = focusables[index];
  }
});


window.onload = () => {
  fetch("movies.json")
    .then(res => res.json())
    .then(data => {
      movies = data;

      if (document.body.classList.contains("main-page")) {
        renderMainPage();
      } else if (document.body.classList.contains("category-page")) {
        showCategory();
      } else if (document.body.classList.contains("language-page")) {
        showLanguage();
      } else if (document.body.classList.contains("play-page")) {
        playMovie();
      }
    })
    .catch(err => console.error("Failed to load movies:", err));
};


function showCategory() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");
  const titleEl = document.getElementById("category-title");
  const container = document.getElementById("category-movies");

  if (!category || !container) return;

  titleEl.textContent = formatText(category);

  const filteredMovies = movies.filter(m => m.category === category);
  filteredMovies.forEach(m => renderMovieCard(m, container));
}


function showLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const language = urlParams.get("language") || "";
  const container = document.getElementById("language-movies");

  if (!container) return;

  const filteredMovies = movies.filter(m => m.language === language);
  filteredMovies.forEach(m => renderMovieCard(m, container));
}


function playMovie() {
  const movie = JSON.parse(localStorage.getItem("currentMovie"));



  document.getElementById("player").src = movie.link;
}