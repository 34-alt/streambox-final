/* ============================================================
   StreamBox — script.js
   Main orchestrator: Khadija Mbodji
   ============================================================ */

import { signUpUser, signInUser, signOutUser, getCurrentUser, onAuthChange } from "./auth.js";
import { fetchPopularMovies, searchMovies, fetchMovieDetails, getPosterUrl } from "./tmdb.js";


// ---- DOM References ----

const authWrapper    = document.getElementById("authWrapper");
const appWrapper     = document.getElementById("appWrapper");
const signInForm     = document.getElementById("signInForm");
const signUpForm     = document.getElementById("signUpForm");
const signinError    = document.getElementById("signinError");
const signupError    = document.getElementById("signupError");
const signupSuccess  = document.getElementById("signupSuccess");
const signinBtn      = document.getElementById("signinBtn");
const signupBtn      = document.getElementById("signupBtn");
const signOutBtn     = document.getElementById("signOutBtn");
const userEmailEl    = document.getElementById("userEmail");
const movieGrid      = document.getElementById("movieGrid");
const searchInput    = document.getElementById("search");
const loadingState   = document.getElementById("loadingState");
const errorState     = document.getElementById("errorState");
const errorMessage   = document.getElementById("errorMessage");
const emptyState     = document.getElementById("emptyState");
const retryBtn       = document.getElementById("retryBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const movieModal     = document.getElementById("movieModal");
const closeModal     = document.getElementById("closeModal");
const modalPosterImg = document.getElementById("modalPosterImg");
const modalGenre     = document.getElementById("modalGenre");
const modalTitle     = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalYear      = document.getElementById("modalYear");
const modalRating    = document.getElementById("modalRating");
const menuBtn        = document.getElementById("menuBtn");
const navLinks       = document.getElementById("navLinks");

// ---- Toggle Password Visibility ---- 

document.querySelectorAll(".toggle-password").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    btn.textContent = isHidden ? "🙈" : "👁";
  });
});

// ---- Auth UI Helpers ----

function showAuth() {
  authWrapper.classList.remove("hidden");
  appWrapper.classList.add("hidden");
}

function showApp(email) {
  authWrapper.classList.add("hidden");
  appWrapper.classList.remove("hidden");
  userEmailEl.textContent = email || "";
}

function showTab(tab) {
  const tabSignIn = document.getElementById("tabSignIn");
  const tabSignUp = document.getElementById("tabSignUp");

  if (tab === "signin") {
    signInForm.classList.remove("hidden");
    signUpForm.classList.add("hidden");
    tabSignIn.classList.add("active");
    tabSignUp.classList.remove("active");
  } else {
    signInForm.classList.add("hidden");
    signUpForm.classList.remove("hidden");
    tabSignIn.classList.remove("active");
    tabSignUp.classList.add("active");
  }
  signinError.textContent   = "";
  signupError.textContent   = "";
  signupSuccess.textContent = "";
}

function setSigninLoading(loading) {
  signinBtn.disabled = loading;
  signinBtn.querySelector(".btn-text").hidden   =  loading;
  signinBtn.querySelector(".btn-loader").hidden = !loading;
}

function setSignupLoading(loading) {
  signupBtn.disabled = loading;
  signupBtn.querySelector(".btn-text").hidden   =  loading;
  signupBtn.querySelector(".btn-loader").hidden = !loading;
}


// ---- Tab switching (replaces onclick in HTML) ----

document.getElementById("tabSignIn").addEventListener("click",    () => showTab("signin"));
document.getElementById("tabSignUp").addEventListener("click",    () => showTab("signup"));
document.getElementById("switchToSignup").addEventListener("click", () => showTab("signup"));
document.getElementById("switchToSignin").addEventListener("click", () => showTab("signin"));


// ---- Movie UI Helpers ----

function showLoading() {
  loadingState.classList.remove("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
  movieGrid.innerHTML = "";
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


// ---- Render Movies ----

function renderMovies(movies) {
  hideStates();
  movieGrid.innerHTML = "";

  if (!movies || movies.length === 0) {
    showEmpty();
    return;
  }

  movies.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.movieId = movie.id;

    const posterUrl = getPosterUrl(movie.poster_path);
    const year   = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

    card.innerHTML = `
      <div class="card-poster">
        ${posterUrl
          ? `<img src="${posterUrl}" alt="${movie.title} poster" loading="lazy" />`
          : `<div class="card-poster-fallback"><span>No Poster</span></div>`
        }
        <span class="card-rating-badge">★ ${rating}</span>
      </div>
      <div class="card-body">
        <h3>${movie.title}</h3>
        <div class="card-meta">
          <span class="card-year">${year}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => openMovieModal(movie.id));
    movieGrid.appendChild(card);
  });
}


// ---- Load Movies ----

async function loadPopularMovies() {
  showLoading();
  try {
    const movies = await fetchPopularMovies();
    renderMovies(movies);
  } catch (err) {
    console.error("Error loading movies:", err);
    showError("Could not load movies. Please check your connection.");
  }
}


// ---- Search ----

let searchTimeout = null;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  const query = searchInput.value.trim();

  if (!query) {
    loadPopularMovies();
    return;
  }

  searchTimeout = setTimeout(async () => {
    showLoading();
    try {
      const movies = await searchMovies(query);
      renderMovies(movies);
    } catch (err) {
      console.error("Search error:", err);
      showError("Search failed. Please check your connection.");
    }
  }, 400);
});


// ---- Movie Modal ----

async function openMovieModal(movieId) {
  modalPosterImg.classList.add("hidden");
  modalPosterImg.src       = "";
  modalGenre.textContent   = "";
  modalTitle.textContent   = "";
  modalDescription.textContent = "Loading…";
  modalYear.textContent    = "";
  modalRating.textContent  = "";

  movieModal.showModal();

  try {
    const movie = await fetchMovieDetails(movieId);

    const posterUrl = getPosterUrl(movie.poster_path);
    if (posterUrl) {
      modalPosterImg.src = posterUrl;
      modalPosterImg.alt = movie.title + " poster";
      modalPosterImg.classList.remove("hidden");
    }

    modalGenre.textContent       = movie.genres?.map(g => g.name).join(", ") || "";
    modalTitle.textContent       = movie.title;
    modalDescription.textContent = movie.overview || "No description available.";
    modalYear.textContent        = movie.release_date ? `📅 ${movie.release_date}` : "";
    modalRating.textContent      = movie.vote_average
      ? `★ ${movie.vote_average.toFixed(1)} / 10` : "";

  } catch (err) {
    console.error("Error loading movie details:", err);
    modalDescription.textContent = "Could not load movie details. Please try again.";
  }
}

closeModal.addEventListener("click", () => movieModal.close());

movieModal.addEventListener("click", (e) => {
  const box = movieModal.getBoundingClientRect();
  const outside = e.clientX < box.left || e.clientX > box.right
    || e.clientY < box.top  || e.clientY > box.bottom;
  if (outside) movieModal.close();
});


// ---- Sign Out ----

signOutBtn.addEventListener("click", async () => {
  const { error } = await signOutUser();
  if (error) console.error("Sign out error:", error.message);
});


// ---- Sign In Form ----

signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signinError.textContent = "";

  const email    = document.getElementById("signinEmail").value.trim();
  const password = document.getElementById("signinPassword").value;

  if (!email) {
    signinError.textContent = "Please enter your email address.";
    return;
  }
  if (!password) {
    signinError.textContent = "Please enter your password.";
    return;
  }

  setSigninLoading(true);
  const { error } = await signInUser(email, password);
  setSigninLoading(false);

  if (error) {
    signinError.textContent = "Incorrect email or password. Please try again.";
  }
});


// ---- Sign Up Form ----

signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupError.textContent   = "";
  signupSuccess.textContent = "";

  const email    = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm  = document.getElementById("signupConfirm").value;

  if (!email) {
    signupError.textContent = "Please enter your email address.";
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
    signupError.textContent = error.message || "Sign up failed. Please try again.";
  } else {
    signupSuccess.textContent =
      "Account created! Check your email to confirm your account before signing in.";
    signUpForm.reset();
  }
});


// ---- Auth State Listener ----

onAuthChange((event, session) => {
  if (session && session.user) {
    showApp(session.user.email);
    loadPopularMovies();
  } else {
    showAuth();
  }
});


// ---- Header hamburger ----

menuBtn.addEventListener("click", () => navLinks.classList.toggle("show"));
navLinks.addEventListener("click", () => navLinks.classList.remove("show"));


// ---- Retry / Clear search ----

retryBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) searchInput.dispatchEvent(new Event("input"));
  else loadPopularMovies();
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  loadPopularMovies();
});

console.log("StreamBox loaded ✓");