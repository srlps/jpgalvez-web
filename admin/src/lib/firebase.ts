import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore/lite";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseConfig, firebaseConfigurado } from "./config";

// Se inicializa solo si hay config real: evita que initializeApp() falle en desarrollo sin .env
// (App.tsx no renderiza nada que use auth/db/storage cuando firebaseConfigurado es false).
const app = firebaseConfigurado ? initializeApp(firebaseConfig) : null;

export const auth: Auth | null = app && getAuth(app);
export const db: Firestore | null = app && getFirestore(app);
export const storage: FirebaseStorage | null = app && getStorage(app);
