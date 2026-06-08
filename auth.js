/* ============================================================
   StreamBox — auth.js
   Authentication: Ndeye Diakhou Seck

   This file handles all Supabase authentication.
   script.js calls these functions — do NOT touch script.js
   for auth logic, keep everything here.
   ============================================================ */

const SUPABASE_URL =  "https://zebnqkacqyxeorpogzdv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplYm5xa2FjcXl4ZW9ycG9nemR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTQ3MzksImV4cCI6MjA5NjE3MDczOX0.0KQIo-yRpTDvYJGTeFcsxj4Im0EzgFdblq6ip3-QehI";
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
