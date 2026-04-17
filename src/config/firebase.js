import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────
//  CONFIGURAÇÃO DO FIREBASE
//  1. Acesse https://console.firebase.google.com
//  2. Crie um projeto chamado "medicare-app"
//  3. Em "Build" > "Firestore Database", crie o banco (modo de teste)
//  4. Na visão geral do projeto, clique no ícone </> (Web App)
//  5. Registre o app e copie o objeto firebaseConfig abaixo
// ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: 'SUA_API_KEY',
  authDomain: 'SEU_AUTH_DOMAIN',
  projectId: 'SEU_PROJECT_ID',
  storageBucket: 'SEU_STORAGE_BUCKET',
  messagingSenderId: 'SEU_SENDER_ID',
  appId: 'SEU_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
