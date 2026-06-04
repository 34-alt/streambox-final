/* ============================================================
   StreamBox — script.js
   Main orchestrator: Khadija Mbodji
   
   This file wires auth (auth.js) and TMDB (tmdb.js) to the UI.
   It does NOT contain API logic — it only calls functions from
   auth.js and tmdb.js.
   ============================================================ */


// ---- DOM References ----

// Auth
const authWrapper   = document.getElementById("authWrapper");
const appWrapper    = document.getElementById("appWrapper");

const signInForm    = document.getElementById("signInForm");
const signUpForm    = document.getElementById("signUpForm");
const signinError   = document.getElementById("signinError");
const signupError   = document.getElementById("signupError");
const signupSuccess = document.getElementById("signupSuccess");
const signinBtn     = document.getElementById("signinBtn");
const signupBtn     = document.getElementById("signupBtn");

const signOutBtn    = document.getElementById("signOutBtn");
const userEmailEl   = document.getElementById("userEmail");

// Movies
const movieGrid     = document.getElementById("movieGrid");
const searchInput   = document.getElementById("search");
const loadingState  = document.getElementById("loadingState");
const errorState    = document.getElementById("errorState");
const errorMessage  = document.getElementById("errorMessage");
const emptyState    = document.getElementById("emptyState");
const retryBtn      = document.getElementById("retryBtn");
const clearSearchBtn= document.getElementById("clearSearchBtn");

// Modal
const movieModal    = document.getElementById("movieModal");
const closeModal    = document.getElementById("closeModal");
const modalPoster   = document.getElementById("modalPoster");
const modalPosterImg= document.getElementById("modalPosterImg");
const modalGenre    = document.getElementById("modalGenre");
const modalTitle    = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalYear     = document.getElementById("modalYear");
const modalRating   = document.getElementById("modalRating");

// Header nav
const menuBtn       = document.getElementById("menuBtn");
const navLinks      = document.getElementById("navLinks");


// ---- UI State Helpers ----

/**
 * Show the auth forms (user not logged in).
 */
function showAuth() {
  authWrapper.classList.remove("hidden");
  appWrapper.classList.add("hidden");
}

/**
 * Show the movie app (user is logged in).
 * @param {string} email - the logged-in user's email
 */
function showApp(email) {
  authWrapper.classList.add("hidden");
  appWrapper.classList.remove("hidden");
  userEmailEl.textContent = email || "";
}

/**
 * Switch between Sign In and Sign Up tabs.
 * Called from onclick in index.html.
 * @param {"signin"|"signup"} tab
 */
function showTab(tab) {
  const tabSignIn = document.getElementById("tabSignIn");
  const tabSignUp = document.getElementById("tabSignUp");

  if (tab === "signin") {
    signInForm.classList.remove("hidden");
    signUpForm.classList.add("hidden");
    tabSignIn.classList.add("active");
    tabSignUp.classList.remove("active");
    clearAuthMessages();
  } else {
    signInForm.classList.add("hidden");
    signUpForm.classList.remove("hidden");
    tabSignIn.classList.remove("active");
    tabSignUp.classList.add("active");
    clearAuthMessages();
  }
}

function clearAuthMessages() {
  signinError.textContent   = "";
  signupError.textContent   = "";
  signupSuccess.textContent = "";
}

function setSigninLoading(loading) {
  signinBtn.disabled = loading;
  signinBtn.querySelector(".btn-text").hidden   = loading;
  signinBtn.querySelector(".btn-loader").hidden = !loading;
}

function setSignupLoading(loading) {
  signupBtn.disabled = loading;
  signupBtn.querySelector(".btn-text").hidden   = loading;
  signupBtn.querySelector(".btn-loader").hidden = !loading;
}


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
  errorMessage.textContent = msg || "Something went wrong. Please check your connection.";
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

/**
 * Builds the movie card grid from an array of TMDB movie objects.
 * @param {Array} movies
 */
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
    const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
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


// ---- Load movies ----

async function loadPopularMovies() {
  showLoading();
  try {
    const movies = await fetchPopularMovies();
    renderMovies(movies);
  } catch (err) {
    console.error("Error loading popular movies:", err);
    showError("Could not load movies. Please check your connection and try again.");
  }
}


// ---- Search with debounce ----

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
  }, 400); // 400ms debounce
});


// ---- Movie Detail Modal ----

async function openMovieModal(movieId) {
  // Reset modal state
  modalPosterImg.classList.add("hidden");
  modalPosterImg.src = "";
  modalGenre.textContent = "";
  modalTitle.textContent = "";
  modalDescription.textContent = "Loading…";
  modalYear.textContent = "";
  modalRating.textContent = "";

  movieModal.showModal();

  try {
    const movie = await fetchMovieDetails(movieId);

    // Poster
    const posterUrl = getPosterUrl(movie.poster_path);
    if (posterUrl) {
      modalPosterImg.src = posterUrl;
      modalPosterImg.alt = movie.title + " poster";
      modalPosterImg.classList.remove("hidden");
    }

    // Genres (array of { id, name })
    const genres = movie.genres && movie.genres.length > 0
      ? movie.genres.map(g => g.name).join(", ")
      : "";

    modalGenre.textContent       = genres;
    modalTitle.textContent       = movie.title;
    modalDescription.textContent = movie.overview || "No description available.";
    modalYear.textContent        = movie.release_date
      ? `📅 ${movie.release_date}`
      : "";
    modalRating.textContent      = movie.vote_average
      ? `★ ${movie.vote_average.toFixed(1)} / 10`
      : "";

  } catch (err) {
    console.error("Error loading movie details:", err);
    modalDescription.textContent = "Could not load movie details. Please try again.";
  }
}

// Close modal
closeModal.addEventListener("click", () => movieModal.close());

movieModal.addEventListener("click", (e) => {
  const box = movieModal.getBoundingClientRect();
  const outside = e.clientX < box.left || e.clientX > box.right
    || e.clientY < box.top || e.clientY > box.bottom;
  if (outside) movieModal.close();
});


// ---- Sign Out ----

signOutBtn.addEventListener("click", async () => {
  const { error } = await signOutUser();
  if (error) {
    console.error("Sign out error:", error.message);
  }
  // Auth state change listener will call showAuth() automatically
});


// ---- Form Submissions ----

// Sign In
signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signinError.textContent = "";

  const email    = document.getElementById("signinEmail").value.trim();
  const password = document.getElementById("signinPassword").value;

  // Validation
  if (!email || !password) {
    signinError.textContent = "Please fill in all fields.";
    return;
  }

  setSigninLoading(true);

  const { error } = await signInUser(email, password);

  setSigninLoading(false);

  if (error) {
    signinError.textContent = error.message || "Sign in failed. Please try again.";
  }
  // On success, the auth state listener triggers showApp()
});


// Sign Up
signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupError.textContent   = "";
  signupSuccess.textContent = "";

  const email    = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm  = document.getElementById("signupConfirm").value;

  // Validation
  if (!email || !password || !confirm) {
    signupError.textContent = "Please fill in all fields.";
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
    signupSuccess.textContent = "Account created! Check your email to confirm your account.";
    signUpForm.reset();
  }
});


// ---- Auth State Management ----

/**
 * Called on page load and whenever auth state changes.
 * Toggles between auth UI and app UI.
 */
listenAuthChanges((event, session) => {
  if (session && session.user) {
    showApp(session.user.email);
    loadPopularMovies();
  } else {
    showAuth();
  }
});


// ---- Header: hamburger menu ----

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

navLinks.addEventListener("click", () => {
  navLinks.classList.remove("show");
});


// ---- Utility buttons ----

retryBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    searchInput.dispatchEvent(new Event("input"));
  } else {
    loadPopularMovies();
  }
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  loadPopularMovies();
});


// ---- Page load: check existing session ----
(async () => {
  const session = await getCurrentSession();
  if (session && session.user) {
    showApp(session.user.email);
    loadPopularMovies();
  } else {
    showAuth();
  }
})();

console.log("StreamBox loaded ✓");
