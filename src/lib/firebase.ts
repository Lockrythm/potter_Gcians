import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBedbgoO1v0bYrPhiI5OBE6xnSh51rVRJA",
  authDomain: "potter-a5abc.firebaseapp.com",
  projectId: "potter-a5abc",
  storageBucket: "potter-a5abc.firebasestorage.app",
  messagingSenderId: "296884044046",
  appId: "1:296884044046:web:c46b290be2577393e4975f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
