import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getAuth, signOut } from 'firebase/auth';
import { gameData as firebaseGameData } from '$lib/firebase';

export const user = writable(null);

export const gameData = writable(null);

let auth;
if (browser) {
  auth = getAuth();
  auth.onAuthStateChanged((u) => {
    user.set(u);
  });

  firebaseGameData.subscribe((data) => {
    gameData.set(data);
  });
}

export async function logout() {
  if (!auth) return;
  await signOut(auth);
}