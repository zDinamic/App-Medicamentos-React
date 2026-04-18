import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCNTiLSkwxOcvw8OYBABii08447AdvOkZo',
  authDomain: 'controle-de-medicamentos-fc6ab.firebaseapp.com',
  projectId: 'controle-de-medicamentos-fc6ab',
  storageBucket: 'controle-de-medicamentos-fc6ab.firebasestorage.app',
  messagingSenderId: '162059162201',
  appId: '1:162059162201:web:a652dee00b81bb8004d748',
};

export const firebaseConfigurado = true;

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
