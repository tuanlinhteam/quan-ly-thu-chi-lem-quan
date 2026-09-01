import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, push, remove, update } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCOxebYuPgq3LXj4QUwrTreNLhVwbrZUUs",
  authDomain: "lemquan-quanlythuchi.firebaseapp.com",
  databaseURL: "https://lemquan-quanlythuchi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lemquan-quanlythuchi",
  storageBucket: "lemquan-quanlythuchi.firebasestorage.app",
  messagingSenderId: "316121368993",
  appId: "1:316121368993:web:84d485c085891f05ae23e0",
  measurementId: "G-17HL1TLZSY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Firebase Realtime Database helpers
export const dbRef = (path) => ref(db, path);

export const dbSet = (path, data) => set(ref(db, path), data);

export const dbGet = async (path) => {
  const snapshot = await get(ref(db, path));
  return snapshot.exists() ? snapshot.val() : null;
};

export const dbPush = (path, data) => push(ref(db, path), data);

export const dbRemove = (path) => remove(ref(db, path));

export const dbUpdate = (path, data) => update(ref(db, path), data);

export const dbListen = (path, callback, errorCallback) => {
  return onValue(ref(db, path), (snapshot) => {
    const data = snapshot.exists() ? snapshot.val() : null;
    callback(data);
  }, (error) => {
    console.error(`Firebase listener error on "${path}":`, error);
    if (errorCallback) errorCallback(error);
  });
};

export { db };
