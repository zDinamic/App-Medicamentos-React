import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCl3ZyyV2ek8qVWlxDHMynqeEXKbgwyAmQ',
  authDomain: 'medicare-81917.firebaseapp.com',
  projectId: 'medicare-81917',
  storageBucket: 'medicare-81917.firebasestorage.app',
  messagingSenderId: '821902205281',
  appId: '1:821902205281:web:e7e61573eb76a1881fe520',
  measurementId: 'G-XRC83KVV9N',
};

export const firebaseConfigurado = true;

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
