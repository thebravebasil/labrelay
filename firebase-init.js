// Shared Firebase setup + nav auth-state UI, imported by every page.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4j6dZlWOJA7sD6ix_kBZvOhqEbpyNL5Y",
  authDomain: "labrelay.firebaseapp.com",
  projectId: "labrelay",
  storageBucket: "labrelay.firebasestorage.app",
  messagingSenderId: "244000540166",
  appId: "1:244000540166:web:ee4159373eb4bb3bbe2587",
  measurementId: "G-W1MY5C0ER9"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Wires up the #navAuth placeholder that appears in every page's nav.
export function initNavAuth(){
  const el = document.getElementById("navAuth");
  if (!el) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user){
      el.innerHTML = `<a href="login.html">Log in</a><a href="signup.html" class="btn-mini">Sign up</a>`;
      return;
    }
    let name = user.email;
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists() && snap.data().name) name = snap.data().name;
    } catch (e) { /* fine, fall back to email */ }

    el.innerHTML = `<span class="nav-user">Hi, <strong>${name}</strong></span><button class="link-btn-inv" id="logoutBtn" type="button">Log out</button>`;
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  });
}
