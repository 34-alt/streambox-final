/* ============================================================
   StreamBox — tmdb.js
   TMDB API Integration: Cheikh Ahmed Tidiane Dione

   This file handles all TMDB API calls.
   script.js calls these functions — do NOT put API logic in script.js.
   ============================================================ */

// ---- TMDB Configuration ----
// TODO (Cheikh): Replace with your actual TMDB API key.
// You can get one at: https://www.themoviedb.org/settings/api
// ⚠️ NEVER commit your real key to GitHub. Use a placeholder here
//    and fill it in locally / during the demo.

const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";


// ---- Fetch popular movies ----
/**
 * Returns a list of currently popular movies from TMDB.
 * Called on page load after user signs in.
 *
 * @returns {Promise<Array>} array of movie objects
 */
async function fetchPopularMovies() {
  // TODO (Cheikh): implement
  // Hint: GET /movie/popular?api_key=...
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
  );
  if (!response.ok) throw new Error("Failed to fetch popular movies");
  const data = await response.json();
  return data.results;
}


// ---- Search movies ----
/**
 * Searches TMDB for movies matching the given query.
 *
 * @param {string} query - the search term
 * @returns {Promise<Array>} array of movie objects
 */
async function searchMovies(query) {
  // TODO (Cheikh): implement
  // Hint: GET /search/movie?api_key=...&query=...
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
  );
  if (!response.ok) throw new Error("Search failed");
  const data = await response.json();
  return data.results;
}


// ---- Fetch movie details ----
/**
 * Fetches full details for a single movie by its TMDB ID.
 * Used when a user clicks a movie card.
 *
 * @param {number} movieId
 * @returns {Promise<Object>} movie detail object (includes genres array)
 */
async function fetchMovieDetails(movieId) {
  // TODO (Cheikh): implement
  // Hint: GET /movie/{movie_id}?api_key=...
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
  );
  if (!response.ok) throw new Error("Failed to fetch movie details");
  return await response.json();
}


// ---- Get poster URL ----
/**
 * Returns the full image URL for a movie poster.
 * Returns null if no poster path is available.
 *
 * @param {string|null} posterPath - the poster_path from TMDB (e.g. "/abc123.jpg")
 * @returns {string|null}
 */
function getPosterUrl(posterPath) {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}${posterPath}`;
}
