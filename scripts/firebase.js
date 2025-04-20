import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, get, child, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyDXFLYGWTz4EyTaQheoL3wrNxmr9lmpBx4",
  authDomain: "idyllic-striker-418412.firebaseapp.com",
  databaseURL: "https://idyllic-striker-418412-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "idyllic-striker-418412",
  storageBucket: "idyllic-striker-418412.firebasestorage.app",
  messagingSenderId: "269954001903",
  appId: "1:269954001903:web:75632689e079945385e41a"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getDatabase(app);

export async function setData(name, data) {
  try {
      await set(ref(db, name), data);
  } catch (err) {
      console.error("Error:", err);
      throw err; 
  }
}

export async function getData(name) {
  try {
    const snapshot = await get(child(ref(db), name));
    if (snapshot.exists()) return snapshot.val();
    else {
      console.log(`Path '${name}' does not exist.`);
      return null;
    }
  }
  catch (err) {
    console.log(err.message);
    return null
  }
}

export async function delData(name) {
  remove(ref(db, name))
    .catch(err => {
      console.log(err.message);
    })
}
