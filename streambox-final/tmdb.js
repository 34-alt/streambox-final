 // StreamBox - tmdb.js
// TMDB API Integration: Cheikh Ahmed Tidiane Dione

const TMDB_API_KEY = "3d321dc8ecb16aa80e608c772bb9fbb1";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Fetch popular movies
export async function fetchPopularMovies() {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch popular movies");
  }

  const data = await response.json();
  return data.results;
}

// Search movies
export async function searchMovies(query) {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
  );

  if (!response.ok) {
    throw new Error("Failed to search movies");
  }

  const data = await response.json();
  return data.results;
}

// Fetch one movie details
export async function fetchMovieDetails(movieId) {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }

  return await response.json();
}

// Get poster image URL
export function getPosterUrl(posterPath) {
  if (!posterPath) {
    return "https://via.placeholder.com/500x750?text=No+Poster";
  }

  return `${TMDB_IMAGE_BASE}${posterPath}`;
}