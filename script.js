/* ============================================================
   StreamBox — script.js
   Main orchestrator: Khadija Mbodji
   ============================================================ */

import {
  signUpUser,
  signInUser,
  signOutUser,
  onAuthChange,
  supabaseClient,
} from "./auth.js";
import {
  fetchPopularMovies,
  fetchTrendingMovies,
  fetchTopRatedMovies,
  fetchActionMovies,
  fetchTVShows,
  fetchDocumentaries,
  fetchNewReleases,
  fetchFeatured,
  searchMovies,
  fetchMovieDetails,
  searchByPerson,
  getPosterUrl,
  getBackdropUrl,
} from "./tmdb.js";

// ── DOM References ──────────────────────────────────────────

const authWrapper = document.getElementById("authWrapper");
const appWrapper = document.getElementById("appWrapper");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const signinError = document.getElementById("signinError");
const signupError = document.getElementById("signupError");
const signupSuccess = document.getElementById("signupSuccess");
const signinBtn = document.getElementById("signinBtn");
const signupBtn = document.getElementById("signupBtn");
const signOutBtn = document.getElementById("signOutBtn");
const userEmailEl = document.getElementById("userEmail");

const searchWrap = document.getElementById("searchWrap");
const searchIconBtn = document.getElementById("searchIconBtn");
const searchInput = document.getElementById("search");

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const emptyState = document.getElementById("emptyState");
const retryBtn = document.getElementById("retryBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");

const homeView = document.getElementById("homeView");
const seriesView = document.getElementById("seriesView");
const filmsView = document.getElementById("filmsView");
const documentairesView = document.getElementById("documentairesView");
const nouveautesView = document.getElementById("nouveautesView");
const searchView = document.getElementById("searchView");
const legalView = document.getElementById("legalView");
const movieGrid = document.getElementById("movieGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const loadMoreContainer = document.getElementById("loadMoreContainer");

const trendingGrid = document.getElementById("trendingGrid");
const popularGrid = document.getElementById("popularGrid");
const topRatedGrid = document.getElementById("topRatedGrid");
const actionGrid = document.getElementById("actionGrid");
const seriesGrid = document.getElementById("seriesGrid");
const filmsGrid = document.getElementById("filmsGrid");
const docsGrid = document.getElementById("docsGrid");
const newGrid = document.getElementById("newGrid");

// Duplicate ALL_VIEWS removed

// Modal variables removed
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const themeToggleBtn = document.getElementById("themeToggleBtn");

const heroBanner = document.getElementById("heroBanner");
const heroBackdrop = document.getElementById("heroBackdrop");
const heroTitle = document.getElementById("heroTitle");
const heroOverview = document.getElementById("heroOverview");
const heroPlayBtn = document.getElementById("heroPlayBtn");
const heroInfoBtn = document.getElementById("heroInfoBtn");

// ── Theme Management ─────────────────────────────────────────

function initTheme() {
  const saved = localStorage.getItem("streambox-theme") || "dark";
  applyTheme(saved);
}

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.classList.add("light-theme");
  } else {
    document.documentElement.classList.remove("light-theme");
  }
  localStorage.setItem("streambox-theme", theme);
}

themeToggleBtn.addEventListener("click", () => {
  const isLight = document.documentElement.classList.contains("light-theme");
  applyTheme(isLight ? "dark" : "light");
});

initTheme();

// ── Collapsible Search ───────────────────────────────────────

searchIconBtn.addEventListener("click", () => {
  searchWrap.classList.toggle("open");
  if (searchWrap.classList.contains("open")) {
    searchInput.focus();
  } else {
    searchInput.value = "";
    showView("home");
  }
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    searchWrap.classList.remove("open");
    searchInput.value = "";
    showView("home");
  }
});

// ── Toggle Password Visibility ────────────────────────────────

document.querySelectorAll(".toggle-password").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    btn.textContent = isHidden ? "🙈" : "👁";
  });
});

// ── Auth UI Helpers ───────────────────────────────────────────

function showAuth() {
  authWrapper.classList.remove("hidden");
  appWrapper.classList.add("hidden");
  loadAuthBackground();
}

function showApp(email) {
  authWrapper.classList.add("hidden");
  appWrapper.classList.remove("hidden");
  userEmailEl.textContent = email ? email.split("@")[0] : "";
}

function showTab(tab) {
  const authTitle = document.getElementById("authTitle");
  if (tab === "signin") {
    signInForm.classList.remove("hidden");
    signUpForm.classList.add("hidden");
    if (authTitle) authTitle.textContent = "Sign In";
  } else {
    signInForm.classList.add("hidden");
    signUpForm.classList.remove("hidden");
    if (authTitle) authTitle.textContent = "Sign Up";
  }
  signinError.textContent = "";
  signupError.textContent = "";
  signupSuccess.textContent = "";
}

function setSigninLoading(loading) {
  signinBtn.disabled = loading;
  signinBtn.querySelector(".btn-text").hidden = loading;
  signinBtn.querySelector(".btn-loader").hidden = !loading;
}

function setSignupLoading(loading) {
  signupBtn.disabled = loading;
  signupBtn.querySelector(".btn-text").hidden = loading;
  signupBtn.querySelector(".btn-loader").hidden = !loading;
}

document
  .getElementById("switchToSignup")
  .addEventListener("click", () => showTab("signup"));
document
  .getElementById("switchToSignin")
  .addEventListener("click", () => showTab("signin"));

// ── Password Reset ──────────────────────────────────────────────
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const passwordResetForm = document.getElementById("passwordResetForm");

function showPasswordReset() {
  signInForm.classList.add("hidden");
  signUpForm.classList.add("hidden");
  passwordResetForm.classList.remove("hidden");
  const authTitle = document.getElementById("authTitle");
  if (authTitle) authTitle.textContent = "Réinitialiser";
}

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showPasswordReset();
  });
}

const cancelResetBtn = document.getElementById("cancelResetBtn");
if (cancelResetBtn) {
  cancelResetBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showTab("signin");
  });
}

const updatePasswordForm = document.getElementById("updatePasswordForm");
function showUpdatePassword() {
  signInForm.classList.add("hidden");
  signUpForm.classList.add("hidden");
  passwordResetForm.classList.add("hidden");
  if (updatePasswordForm) updatePasswordForm.classList.remove("hidden");
  const authTitle = document.getElementById("authTitle");
  if (authTitle) authTitle.textContent = "Set New Password";
}

// ── Auth Background (movie poster wall) ─────────────────────

async function loadAuthBackground() {
  const bg = document.getElementById("authBg");
  if (!bg || bg.children.length > 0) return;
  try {
    const movies = await fetchTrendingMovies();
    movies.slice(0, 18).forEach((movie) => {
      const img = document.createElement("img");
      img.src = getPosterUrl(movie.poster_path);
      img.alt = "";
      bg.appendChild(img);
    });
  } catch (err) {
    console.warn("Auth background load error:", err);
  }
}

// ── State Helpers ─────────────────────────────────────────────

function showLoading() {
  loadingState.classList.remove("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
}
function showError(msg) {
  loadingState.classList.add("hidden");
  errorState.classList.remove("hidden");
  emptyState.classList.add("hidden");
  errorMessage.textContent = msg || "Something went wrong.";
}
function showEmpty() {
  loadingState.classList.add("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.remove("hidden");
}
function hideStates() {
  loadingState.classList.add("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
}

// ── Movie Card (Netflix style — pure poster) ─────────────────

function createMovieCard(movie) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.movieId = movie.id;
  card.dataset.mediaType = movie.media_type || (movie.first_air_date ? "tv" : "movie");

  const title = movie.title || movie.name || "Unknown";
  const year =
    (movie.release_date || movie.first_air_date || "").split("-")[0] || "N/A";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const posterUrl = getPosterUrl(movie.poster_path);

  card.innerHTML = `
    <div class="card-poster">
      ${
        movie.poster_path
          ? `<img src="${posterUrl}" alt="${title} poster" loading="lazy" />`
          : `<div class="card-poster-fallback"><span>No Poster</span></div>`
      }
      <div class="card-overlay">
        <div class="card-overlay-title">${title}</div>
        <div class="card-overlay-meta">
          <span class="card-rating-badge">★ ${rating}</span>
          <span>${year}</span>
        </div>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    // Modal removed, can add link logic here in the future
    openMovieModal(movie.id, card.dataset.mediaType);
  });
  return card;
}

// ── Hero Banner ───────────────────────────────────────────────

let featuredMovieId = null;

async function loadHero() {
  try {
    const movie = await fetchFeatured();
    if (!movie) return;
    featuredMovieId = movie.id;

    const backdrop = getBackdropUrl(movie.backdrop_path);
    if (backdrop) {
      heroBackdrop.style.backgroundImage = `url('${backdrop}')`;
    }
    heroTitle.textContent = movie.title || movie.name || "";
    heroOverview.textContent = movie.overview || "";
  } catch (err) {
    console.warn("Hero load error:", err);
    heroBanner.classList.add("hidden");
  }
}

heroPlayBtn.addEventListener("click", () => {
  if (featuredMovieId) console.log(`Play movie ${featuredMovieId}`);
});
heroInfoBtn.addEventListener("click", () => {
  if (featuredMovieId) console.log(`More info for movie ${featuredMovieId}`);
});

// ── SPA Navigation ────────────────────────────────────────────

const ALL_VIEWS = {
  home: homeView,
  series: seriesView,
  films: filmsView,
  documentaires: documentairesView,
  nouveautes: nouveautesView,
  search: searchView,
  legal: legalView,
};

const loadedViews = new Set();

async function showView(viewName) {
  // Update nav active state
  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.view === viewName);
  });

  // Toggle hero visibility
  heroBanner.classList.toggle(
    "hidden",
    viewName === "search" || viewName === "legal",
  );

  // Show/hide content views
  Object.entries(ALL_VIEWS).forEach(([name, el]) => {
    if (el) el.classList.toggle("hidden", name !== viewName);
  });

  hideStates();

  // Load data if not yet loaded
  if (loadedViews.has(viewName)) return;
  loadedViews.add(viewName);

  showLoading();
  try {
    switch (viewName) {
      case "home":
        await loadHomeCarousels();
        break;
      case "series":
        await loadSeriesView();
        break;
      case "films":
        await loadFilmsView();
        break;
      case "documentaires":
        await loadDocsView();
        break;
      case "nouveautes":
        await loadNewView();
        break;
    }
    hideStates();
  } catch (err) {
    loadedViews.delete(viewName);
    showError("Could not load content. Please check your connection.");
  }
}

// ── Nav click handlers ────────────────────────────────────────

document.querySelectorAll(".nav-item").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    navLinks.classList.remove("show");
    // Clear search on nav click
    searchWrap.classList.remove("open");
    searchInput.value = "";
    
    const view = el.dataset.view;
    if (view) showView(view);
    
    // Handle anchor scrolling for footer links
    const targetId = el.dataset.target;
    if (targetId) {
      setTimeout(() => {
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});

document.getElementById("logoBtn").addEventListener("click", (e) => {
  e.preventDefault();
  searchWrap.classList.remove("open");
  searchInput.value = "";
  showView("home");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ── Content loaders ───────────────────────────────────────────

async function loadHomeCarousels() {
  trendingGrid.innerHTML = "";
  popularGrid.innerHTML = "";
  topRatedGrid.innerHTML = "";
  actionGrid.innerHTML = "";

  const [trending, popular, topRated, action] = await Promise.all([
    fetchTrendingMovies(),
    fetchPopularMovies(1).then((r) => r.results),
    fetchTopRatedMovies(),
    fetchActionMovies(),
  ]);

  trending.forEach((m) => trendingGrid.appendChild(createMovieCard(m)));
  popular.forEach((m) => popularGrid.appendChild(createMovieCard(m)));
  topRated.forEach((m) => topRatedGrid.appendChild(createMovieCard(m)));
  action.forEach((m) => actionGrid.appendChild(createMovieCard(m)));
}

async function loadSeriesView() {
  seriesGrid.innerHTML = "";
  const shows = await fetchTVShows();
  shows.forEach((s) => seriesGrid.appendChild(createMovieCard(s)));
}

async function loadFilmsView() {
  filmsGrid.innerHTML = "";
  const { results } = await fetchPopularMovies();
  results.forEach((m) => filmsGrid.appendChild(createMovieCard(m)));
}

async function loadDocsView() {
  docsGrid.innerHTML = "";
  const docs = await fetchDocumentaries();
  docs.forEach((m) => docsGrid.appendChild(createMovieCard(m)));
}

async function loadNewView() {
  newGrid.innerHTML = "";
  const movies = await fetchNewReleases();
  movies.forEach((m) => newGrid.appendChild(createMovieCard(m)));
}

// ── Carousel Scroll Buttons ───────────────────────────────────

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".scroll-btn");
  if (!btn) return;
  const grid = document.getElementById(btn.dataset.target);
  if (!grid) return;
  const scrollAmount = btn.classList.contains("left") ? -720 : 720;
  grid.scrollBy({ left: scrollAmount, behavior: "smooth" });
});

// ── Search Type Toggle ────────────────────────────────────────

const searchByTitleBtn = document.getElementById("searchByTitle");
const searchByPeopleBtn = document.getElementById("searchByPeople");
let searchMode = "title"; // "title" or "people"

document.querySelectorAll(".search-type-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    searchMode = btn.dataset.type;
    document.querySelectorAll(".search-type-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    searchInput.placeholder = searchMode === "people" ? "Search actor or director..." : "Search titles...";
    // Re-trigger search if there's already a query
    if (searchInput.value.trim()) {
      searchInput.dispatchEvent(new Event("input"));
    }
  });
});

// ── Search ────────────────────────────────────────────────────

let searchTimeout = null;
let currentPage = 1;
let totalPages = 1;
let currentQuery = "";

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  const query = searchInput.value.trim();

  if (!query) {
    showView("home");
    return;
  }

  searchTimeout = setTimeout(async () => {
    Object.values(ALL_VIEWS).forEach((v) => v && v.classList.add("hidden"));
    searchView.classList.remove("hidden");
    heroBanner.classList.add("hidden");
    movieGrid.innerHTML = "";
    loadMoreContainer.classList.add("hidden");
    showLoading();

    currentQuery = query;
    currentPage = 1;

    try {
      if (searchMode === "people") {
        // Search by actor or director
        const results = await searchByPerson(query);
        hideStates();
        if (!results || results.length === 0) {
          showEmpty();
          return;
        }
        results.forEach((m) => movieGrid.appendChild(createMovieCard(m)));
      } else {
        // Search by title
        const res = await searchMovies(query, 1);
        totalPages = res.totalPages;
        hideStates();
        if (!res.results || res.results.length === 0) {
          showEmpty();
          return;
        }
        res.results.forEach((m) => movieGrid.appendChild(createMovieCard(m)));
        if (currentPage < totalPages) {
          loadMoreContainer.classList.remove("hidden");
        }
      }
    } catch (err) {
      showError("Search failed. Please check your connection.");
    }
  }, 400);
});

loadMoreBtn.addEventListener("click", async () => {
  if (currentPage >= totalPages) return;
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = "Loading…";
  currentPage++;

  try {
    const res = await searchMovies(currentQuery, currentPage);
    res.results.forEach((m) => movieGrid.appendChild(createMovieCard(m)));
    if (currentPage >= totalPages) loadMoreContainer.classList.add("hidden");
  } catch (err) {
    currentPage--;
  } finally {
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = "Load More";
  }
});

// Modal functionality removed per user request

// ── Movie Modal ───────────────────────────────────────────────

const movieModal = document.getElementById("movieModal");
const closeModal = document.getElementById("closeModal");
const modalPosterImg = document.getElementById("modalPosterImg");
const modalGenre = document.getElementById("modalGenre");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalYear = document.getElementById("modalYear");
const modalRating = document.getElementById("modalRating");

async function openMovieModal(movieId, mediaType = "movie") {
  modalPosterImg.classList.add("hidden");
  modalGenre.textContent = "";
  modalTitle.textContent = "";
  modalDescription.textContent = "Loading…";
  modalYear.textContent = "";
  modalRating.textContent = "";
  movieModal.showModal();

  try {
    const movie = await fetchMovieDetails(movieId, mediaType);
    const posterUrl = getPosterUrl(movie.poster_path);
    if (posterUrl) {
      modalPosterImg.src = posterUrl;
      modalPosterImg.alt = (movie.title || movie.name) + " poster";
      modalPosterImg.classList.remove("hidden");
    }
    modalGenre.textContent = movie.genres
      ? movie.genres.map((g) => g.name).join(", ")
      : "";
    modalTitle.textContent = movie.title || movie.name || "";
    modalDescription.textContent = movie.overview || "No description available.";
    const date = movie.release_date || movie.first_air_date;
    modalYear.textContent = date ? "📅 " + date : "";
    modalRating.textContent = movie.vote_average
      ? "★ " + movie.vote_average.toFixed(1) + " / 10"
      : "";
  } catch (err) {
    modalDescription.textContent = "Could not load details.";
  }
}

closeModal.addEventListener("click", () => movieModal.close());
movieModal.addEventListener("click", (e) => {
  const box = movieModal.getBoundingClientRect();
  if (
    e.clientX < box.left || e.clientX > box.right ||
    e.clientY < box.top  || e.clientY > box.bottom
  ) {
    movieModal.close();
  }
});

// ── Sign Out ──────────────────────────────────────────────────

signOutBtn.addEventListener("click", async () => {
  const { error } = await signOutUser();
  if (error) console.error("Sign out error:", error.message);
});

// ── Sign In ───────────────────────────────────────────────────

signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signinError.textContent = "";
  const email = document.getElementById("signinEmail").value.trim();
  const password = document.getElementById("signinPassword").value;
  if (!email) {
    signinError.textContent = "Please enter your email.";
    return;
  }
  if (!password) {
    signinError.textContent = "Please enter your password.";
    return;
  }
  setSigninLoading(true);
  const { error } = await signInUser(email, password);
  setSigninLoading(false);
  if (error)
    signinError.textContent = "Incorrect email or password. Please try again.";
});

// ── Sign Up ───────────────────────────────────────────────────

signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupError.textContent = "";
  signupSuccess.textContent = "";
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;
  if (!email) {
    signupError.textContent = "Please enter your email.";
    return;
  }
  if (!password) {
    signupError.textContent = "Please enter a password.";
    return;
  }
  if (password.length < 6) {
    signupError.textContent = "Password must be at least 6 characters.";
    return;
  }
  if (password !== confirm) {
    signupError.textContent = "Passwords do not match.";
    return;
  }
  setSignupLoading(true);
  const { error } = await signUpUser(email, password);
  setSignupLoading(false);
  if (error) {
    signupError.textContent = error.message || "Sign up failed.";
  } else {
    signupSuccess.textContent =
      "Account created! Check your email to confirm before signing in.";
    signUpForm.reset();
  }
});

// ── Password Reset ──────────────────────────────────────────────

const resetEmailBtn = document.getElementById("resetEmailBtn");
const resetEmailError = document.getElementById("resetEmailError");
const resetEmailSuccess = document.getElementById("resetEmailSuccess");

passwordResetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  resetEmailError.textContent = "";
  resetEmailSuccess.textContent = "";

  const email = document.getElementById("resetEmail").value.trim();
  if (!email) {
    resetEmailError.textContent = "Please enter your email.";
    return;
  }

  resetEmailBtn.disabled = true;
  resetEmailBtn.querySelector(".btn-text").hidden = true;
  resetEmailBtn.querySelector(".btn-loader").hidden = false;

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname, // Redirect back to same page
  });

  resetEmailBtn.disabled = false;
  resetEmailBtn.querySelector(".btn-text").hidden = false;
  resetEmailBtn.querySelector(".btn-loader").hidden = true;

  if (error) {
    // Show exact Supabase error for debugging
    resetEmailError.textContent = "Supabase error: " + error.message;
  } else {
    resetEmailSuccess.textContent =
      "Check your email for the password reset link.";
    passwordResetForm.reset();
  }
});

// ── Update Password ─────────────────────────────────────────────

const updatePasswordFormEl = document.getElementById("updatePasswordForm");
const updatePasswordBtn = document.getElementById("updatePasswordBtn");
const newPasswordError = document.getElementById("newPasswordError");
const newPasswordSuccess = document.getElementById("newPasswordSuccess");

if (updatePasswordFormEl) {
  updatePasswordFormEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    newPasswordError.textContent = "";
    newPasswordSuccess.textContent = "";

    const newPassword = document.getElementById("newPassword").value;
    if (!newPassword || newPassword.length < 6) {
      newPasswordError.textContent = "Password must be at least 6 characters.";
      return;
    }

    updatePasswordBtn.disabled = true;
    updatePasswordBtn.querySelector(".btn-text").hidden = true;
    updatePasswordBtn.querySelector(".btn-loader").hidden = false;

    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

    updatePasswordBtn.disabled = false;
    updatePasswordBtn.querySelector(".btn-text").hidden = false;
    updatePasswordBtn.querySelector(".btn-loader").hidden = true;

    if (error) {
      newPasswordError.textContent = error.message || "Failed to update password.";
    } else {
      newPasswordSuccess.textContent = "Password updated successfully! Redirecting...";
      setTimeout(() => {
        showTab("signin");
      }, 2000);
    }
  });
}

// ── Auth State ────────────────────────────────────────────────

onAuthChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    showAuth();
    showUpdatePassword();
    return;
  }

  if (session && session.user) {
    showApp(session.user.email);
    loadedViews.clear();
    loadHero();
    showView("home");
  } else {
    showAuth();
  }
});

// ── Header hamburger ──────────────────────────────────────────

menuBtn.addEventListener("click", () => navLinks.classList.toggle("show"));

// ── Retry / Clear search ──────────────────────────────────────

retryBtn.addEventListener("click", () => {
  const q = searchInput.value.trim();
  if (q) searchInput.dispatchEvent(new Event("input"));
  else showView("home");
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchWrap.classList.remove("open");
  showView("home");
});

console.log("StreamBox v2.0 loaded ✓");

   
