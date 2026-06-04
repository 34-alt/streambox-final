# StreamBox Final Project

A responsive movie browsing web app upgraded with real API data and authentication.

## Team Members

| Name | Role |
|------|------|
| Khadija Mbodji | Project Lead + UI/UX Developer |
| Cheikh Ahmed Tidiane Dione | TMDB API Integration Developer |
| Ndeye Diakhou Seck | Supabase Authentication Developer |
| Abdou Aziz Sady | QA Tester + README + Deployment |

## Features

- 🔐 User sign-up, sign-in, and sign-out with Supabase Authentication
- 🎬 Real movie data from The Movie Database (TMDB) API
- 🔍 Live search with debounce
- 🖼️ Movie posters, ratings, overviews, genres, and release dates
- 📱 Fully responsive layout (mobile, tablet, desktop)
- ⚠️ Loading, empty, and error states for all async operations
- 🎭 Movie detail modal with full information

## Technologies Used

- HTML5, CSS3, JavaScript (ES2020)
- [Supabase JS Client v2](https://supabase.com/docs/reference/javascript)
- [TMDB API](https://developer.themoviedb.org/docs)

## How to Run Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/streambox-final.git
   cd streambox-final
   ```

2. Add your API keys (see sections below).

3. Open `index.html` in your browser. No build step needed.
   > Tip: use VS Code Live Server for the best experience.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API**
3. Copy your **Project URL** and **anon public key**
4. Open `auth.js` and replace:
   ```js
   const SUPABASE_URL = "YOUR_SUPABASE_URL";
   const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
   ```
5. In Supabase, go to **Authentication → Providers** and make sure **Email** is enabled.

## TMDB API Setup

1. Create an account at [themoviedb.org](https://www.themoviedb.org)
2. Go to **Settings → API** and request an API key
3. Open `tmdb.js` and replace:
   ```js
   const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
   ```

## Screenshots

> *(Add screenshots here after deployment)*

## Known Limitations

- TMDB API key is exposed in frontend code. In a production app, API calls should go through a backend server.
- No pagination yet — only the first page of results is shown.
- Email confirmation is required by Supabase before a user can sign in.

## Future Improvements

- Add genre filters
- Pagination / "Load more" button
- Watchlist feature (save movies per user in Supabase database)
- Move API calls to a backend to protect secrets
- Progressive Web App (PWA) support
