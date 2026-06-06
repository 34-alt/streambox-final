/* ============================================================
   StreamBox — auth.js
   Authentication: Ndeye Diakhou Seck

   This file handles all Supabase authentication.
   script.js calls these functions — do NOT touch script.js
   for auth logic, keep everything here.
   ============================================================ */

// ---- Supabase Configuration ----
// TODO (Ndeye): Replace with your actual Supabase project URL and anon key.
// You can find these in: Supabase Dashboard → Project Settings → API
// ⚠️ NEVER commit real keys to GitHub. Use placeholders here and
//    fill them in locally / during the demo.

const SUPABASE_URL = "https://zebnqkacqyxeorpogzdv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplYm5xa2FjcXl4ZW9ycG9nemR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTQ3MzksImV4cCI6MjA5NjE3MDczOX0.0KQIo-yRpTDvYJGTeFcsxj4Im0EzgFdblq6ip3-QehI";

// Initialize the Supabase client (the CDN script is loaded in index.html)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// ---- Sign Up ----
/**
 * Creates a new user account with email and password.
 * Supabase will send a confirmation email automatically.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ data, error }>}
 */
async function signUpUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  return { data, error };
}


// ---- Sign In ----
/**
 * Signs in an existing user with email and password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ data, error }>}
 */
async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
}


// ---- Sign Out ----
/**
 * Signs out the currently authenticated user.
 *
 * @returns {Promise<{ error }>}
 */
async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  return { error };
}


// ---- Get current session ----
/**
 * Returns the current session (or null if not logged in).
 * Used by script.js on page load to check if user is already signed in.
 *
 * @returns {Promise<{ session }>}
 */
async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}


// ---- Auth state listener ----
/**
 * Calls onAuthChange(event, session) whenever the auth state changes
 * (sign in, sign out, token refresh, etc.)
 * script.js uses this to toggle between auth UI and app UI.
 *
 * @param {Function} onAuthChange
 */
function listenAuthChanges(onAuthChange) {
  supabase.auth.onAuthStateChange((event, session) => {
    onAuthChange(event, session);
  });
}