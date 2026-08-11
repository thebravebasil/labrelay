// Shared Firebase setup + nav auth-state UI, imported by every page.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
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
try { getAnalytics(app); } catch (e) { /* analytics can fail silently, e.g. ad-blockers */ }

// Shows a small toast notification, bottom-left, instead of a browser alert().
// type is "info" (default, sage green) or "error" (red).
export function showToast(message, type = "info"){
  let stack = document.getElementById("toastStack");
  if (!stack){
    stack = document.createElement("div");
    stack.id = "toastStack";
    document.body.appendChild(stack);
  }
  const toast = document.createElement("div");
  toast.className = `site-toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}
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

    el.innerHTML = `<a href="profile.html" class="nav-user">Hi, <strong>${name}</strong></a><button class="link-btn-inv" id="logoutBtn" type="button">Log out</button>`;
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  });
}
