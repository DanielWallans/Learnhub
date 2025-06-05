import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvyCzmEiPVbVasWgsUVOnDZzCfJoZq4CI",
  authDomain: "learnhub-d18a1.firebaseapp.com",
  projectId: "learnhub-d18a1",
  storageBucket: "learnhub-d18a1.appspot.com", // <-- CORRIGIDO AQUI
  messagingSenderId: "791816992157",
  appId: "1:791816992157:web:6c453f59543d78377d2b74",
  measurementId: "G-3H3M2VCCCL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, addDoc };