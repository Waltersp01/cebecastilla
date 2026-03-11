import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAP4zlLPk3PDJZNV8JYdbJynO-mrS5ZUGY",
  authDomain: "asistenciacebe.firebaseapp.com",
  databaseURL: "https://asistenciacebe-default-rtdb.firebaseio.com",
  projectId: "asistenciacebe",
  storageBucket: "asistenciacebe.firebasestorage.app",
  messagingSenderId: "33327463039",
  appId: "1:33327463039:web:26c397d9fa89a864abdd4a"
};
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);