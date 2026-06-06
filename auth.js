/* ============================================================
   StreamBox — auth.js
   Authentication: Ndeye Diakhou Seck

   This file handles all Supabase authentication.
   script.js calls these functions — do NOT touch script.js
   for auth logic, keep everything here.
   ============================================================ */

// ---- Supabase Configuration ----
const SUPABASE_URL = "https://zebnqkacqyxeorpogzdv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplYm5xa2FjcXl4ZW9ycG9nemR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTQ3MzksImV4cCI6MjA5NjE3MDczOX0.0KQIo-yRpTDvYJGTeFcsxj4Im0EzgFdblq6ip3-QehI";

// Use a different variable name to avoid conflict with the Supabase CDN
// which already declares `supabase` on window
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// ---- Sign Up ----
async function signUpUser(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  return { data, error };
}


// ---- Sign In ----
async function signInUser(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  return { data, error };
}


// ---- Sign Out ----
async function signOutUser() {
  const { error } = await supabaseClient.auth.signOut();
  return { error };
}


// ---- Get Current User ----
async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}


// ---- Auth State Listener ----
function onAuthChange(callback) {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}


// ---- Exports (required because script.js uses ES modules) ----
export { signUpUser, signInUser, signOutUser, getCurrentUser, onAuthChange };