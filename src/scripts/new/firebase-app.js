import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { firebaseConfig } from "./firebase-config.js";

export const app = getApps()[0] ?? initializeApp(firebaseConfig);
export const db = getFirestore(app);
