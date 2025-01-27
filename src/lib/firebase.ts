// src/lib/firebase.ts
import { browser } from '$app/environment';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { writable } from 'svelte/store';

// Your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize only in browser
let app, db, auth;
if (browser) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
}

// Expose these so other files can use them
export { db, doc, setDoc, getDoc, onSnapshot, updateDoc, getDocs, arrayUnion, query, collection, where };

// A top-level store for game data from Firestore
export const gameData = writable(null);
export const messages = writable([]);

/* Auth-related */
export async function loginWithGoogle() {
  if (!browser || !auth) return;
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

/* Shuffling helper */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* Create a new Bingo game doc */
export async function createGame(gameName, sentences, options) {
  if (!browser || !db) return null;
  const gameCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  const sentencesArray = sentences.split('\n');
  const { creator, creatorName } = options;
  const playerBoard = shuffleArray(sentencesArray).slice(0, 25);
  const gameRef = doc(db, 'games', gameCode);

  await setDoc(gameRef, {
    gameName,
    sentences: sentencesArray,
    settings: options.settings || {},
    playerIDs: [creator],
    players: [
      {
        id: creator,
        name: creatorName,
        board: playerBoard,
        crossedOut: [],
        progress: {},
        completedAt: null
      }
    ],
    messages: [],
    createdAt: new Date()
  });

  return gameCode;
}

/* Join an existing game */
export async function joinGame(gameCode, playerName, uid) {
  if (!browser || !db) return null;
  const gameRef = doc(db, 'games', gameCode);
  const gameSnapshot = await getDoc(gameRef);

  if (!gameSnapshot.exists()) throw new Error('Game not found');
  const data = gameSnapshot.data();

  // Already joined?
  const existingPlayer = data.players.find((p) => p.id === uid);
  if (existingPlayer) {
    return { playerId: existingPlayer.id, board: existingPlayer.board };
  }

  // Not joined yet, so create a board for user
  const playerBoard = shuffleArray(data.sentences).slice(0, 25);

  await updateDoc(gameRef, {
    playerIDs: arrayUnion(uid),
    players: arrayUnion({
      id: uid,
      name: playerName,
      board: playerBoard,
      crossedOut: [],
      progress: {},
      completedAt: null
    }),
  });

  return { playerId: uid, board: playerBoard };
}

/* Real-time listener for a game doc */
export function subscribeToGame(gameCode) {
  if (!browser || !db) return () => {};
  const gameRef = doc(db, 'games', gameCode);
  return onSnapshot(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      gameData.set({ id: snapshot.id, ...snapshot.data() });
    } else {
      gameData.set(null);
    }
  });
}
