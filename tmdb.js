 // StreamBox - tmdb.js
// TMDB API Integration: Cheikh Ahmed Tidiane Dione

const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

const SAFE_PARAMS = "&include_adult=false&certification_country=US&certification.lte=PG-13";
const SAFE_TV_PARAMS = "&include_adult=false&certification_country=US&certification.lte=TV-14";
const LANG = "&language=en-US";

export async function fetchPopularMovies(page = 1) {
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}${LANG}&page=${page}&sort_by=popularity.desc${SAFE_PARAMS}`,
  );
  if (!res.ok) throw new Error("Failed to fetch popular movies");
  const data = await res.json();
  return { results: data.results, totalPages: data.total_pages };
}

export async function fetchTrendingMovies() {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  const dateStr = d.toISOString().split("T")[0];
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}${LANG}&sort_by=popularity.desc&primary_release_date.gte=${dateStr}${SAFE_PARAMS}`,
  );
  if (!res.ok) throw new Error("Failed to fetch trending movies");
  const data = await res.json();
  return data.results;
}

export async function fetchTopRatedMovies() {
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}${LANG}&page=1&sort_by=vote_average.desc&vote_count.gte=500${SAFE_PARAMS}`,
  );
  if (!res.ok) throw new Error("Failed to fetch top rated movies");
  const data = await res.json();
  return data.results;
}

export async function fetchActionMovies() {
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}${LANG}&with_genres=28&page=1${SAFE_PARAMS}`,
  );
  if (!res.ok) throw new Error("Failed to fetch action movies");
  const data = await res.json();
  return data.results;
}

export async function fetchTVShows(page = 1) {
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}${LANG}&page=${page}&sort_by=popularity.desc${SAFE_TV_PARAMS}`,
  );
  if (!res.ok) throw new Error("Failed to fetch TV shows");
  const data = await res.json();
  return data.results;
}

export async function fetchDocumentaries(page = 1) {
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}${LANG}&with_genres=99&page=${page}${SAFE_PARAMS}`,
  );
  if (!res.ok) throw new Error("Failed to fetch documentaries");
  const data = await res.json();
  return data.results;
}

export async function fetchNewReleases(page = 1) {
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}${LANG}&page=${page}&with_release_type=2|3${SAFE_PARAMS}`,
  );
  if (!res.ok) throw new Error("Failed to fetch new releases");
  const data = await res.json();
  return data.results;
}

export async function fetchFeatured() {
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}${LANG}&sort_by=popularity.desc${SAFE_PARAMS}`,
  );
  if (!res.ok) throw new Error("Failed to fetch featured movie");
  const data = await res.json();
  const withBackdrop = data.results.filter((m) => m.backdrop_path);
  return withBackdrop[0] || data.results[0];
}

export async function searchMovies(query, page = 1) {
  const res = await fetch(
    `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}${LANG}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
  );
  if (!res.ok) throw new Error("Failed to search");
  const data = await res.json();
  const forbiddenWords = ["sex", "erot", "porn", "xxx"];
  const isSafe = (m) => {
    if (m.media_type === "person") return false;
    if (m.adult) return false;
    const title = (m.title || m.name || "").toLowerCase();
    const overview = (m.overview || "").toLowerCase();
    for (const word of forbiddenWords) {
      if (title.includes(word) || overview.includes(word)) return false;
    }
    return true;
  };
  return {
    results: data.results.filter(isSafe),
    totalPages: data.total_pages,
  };
}

export async function fetchMovieDetails(mediaId, mediaType = "movie") {
  const type = mediaType === "tv" ? "tv" : "movie";
  const res = await fetch(
    `${TMDB_BASE_URL}/${type}/${mediaId}?api_key=${TMDB_API_KEY}${LANG}`,
  );
  if (!res.ok) throw new Error("Failed to fetch details");
  return await res.json();
}

export async function searchByPerson(name) {
  const personRes = await fetch(
    `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}${LANG}&query=${encodeURIComponent(name)}&include_adult=false`
  );
  if (!personRes.ok) throw new Error("Person search failed");
  const personData = await personRes.json();
  if (!personData.results || personData.results.length === 0) return [];

  const person = personData.results[0];
  const creditsRes = await fetch(
    `${TMDB_BASE_URL}/person/${person.id}/combined_credits?api_key=${TMDB_API_KEY}${LANG}`
  );
  if (!creditsRes.ok) throw new Error("Credits fetch failed");
  const creditsData = await creditsRes.json();

  const excludedGenres = [10767, 10763, 10764];
  const seen = new Set();
  return [
    ...(creditsData.crew || []).filter((m) =>
      m.job === "Director" || m.job === "Writer" || m.job === "Producer"
    ),
    ...(creditsData.cast || []).filter((m) => m.order !== undefined && m.order < 10),
  ]
    .filter((m) => {
      if (m.adult || seen.has(m.id)) return false;
      if (!m.poster_path || !(m.title || m.name)) return false;
      if (m.genre_ids && m.genre_ids.some((g) => excludedGenres.includes(g))) return false;
      seen.add(m.id);
      return true;
    })
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 20);
}

export function getPosterUrl(posterPath) {
  if (!posterPath) return "https://via.placeholder.com/500x750?text=No+Poster";
  return `${TMDB_IMAGE_BASE}${posterPath}`;
}

export function getBackdropUrl(backdropPath) {
  if (!backdropPath) return "";
  return `${TMDB_BACKDROP_BASE}${backdropPath}`;
}
