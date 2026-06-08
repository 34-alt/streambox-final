/* ============================================================
   StreamBox — auth.js
   Authentication: Ndeye Diakhou Seck

   This file handles all Supabase authentication.
   script.js calls these functions — do NOT touch script.js
   for auth logic, keep everything here.
   ============================================================ */

const SUPABASE_URL = "YOUR_SUPABASE_URL" ;
const SUPABASE_ANON_KEY =
  "YOUR_SUPABASE_ANON_KEY";
export const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

export async function signUpUser(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  return { data, error };
}

export async function signInUser(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOutUser() {
  const { error } = await supabaseClient.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  return user;
}

export function onAuthChange(callback) {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
