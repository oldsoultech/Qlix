// Qlix account switcher
// Lets you stay signed in to several Qlix accounts on this device and switch between them
// without typing a password. Add ONE line to index.html (before </body>):
//   <script type="module" src="account-switcher.js"></script>
import { getApp, initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDP0yDxmCrcIXK_DkdXJZB_XzPRVPXMCyo",
  authDomain: "qlix-2701b.firebaseapp.com",
  projectId: "qlix-2701b",
  storageBucket: "qlix-2701b.appspot.com"
};
let app;
try { app = getApp(); } catch (e) { app = initializeApp(firebaseConfig); }
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- helpers ----------
const KEY = "qlixAccounts";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&apos;" }[c]));
const COLORS = ["#e67e22","#2e86de","#9b59b6","#16a085","#c0392b","#2c3e50"];
function avatarSrc(pic, name) {
  if (pic) return pic;
  const n = (name || "?").trim() || "?";
  const c = COLORS[[...n].reduce((a, ch) => a + ch.charCodeAt(0), 0) % COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${c}"/><text x="32" y="43" font-size="30" font-family="sans-serif" fill="#fff" text-anchor="middle">${esc(n[0].toUpperCase())}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
function toast(msg) {
  const c = document.getElementById("toast");
  if (!c) return;
  const t = document.createElement("div");
  t.className = "toast-item"; t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
const loadAccounts = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
const saveAccounts = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} };
const ready = a => a.authStateReady ? a.authStateReady() : new Promise(r => { const u = onAuthStateChanged(a, () => { u(); r(); }); });

// Each saved account keeps its own Firebase "app" so its login session stays alive in the background.
const secondary = new Map();
function getSecondary(uid) {
  if (!secondary.has(uid)) {
    const a = initializeApp(firebaseConfig, "acct-" + uid);
    secondary.set(uid, { app: a, auth: getAuth(a) });
  }
  return secondary.get(uid);
}

async function registerAccount(user) {
  const info = { uid: user.uid, email: user.email || "", name: user.displayName || user.email || "Account", handle: "", photo: user.photoURL || "" };
  try {
    const s = await getDoc(doc(db, "users", user.uid));
    if (s.exists()) { const d = s.data(); info.name = d.displayName || info.name; info.handle = d.handle || ""; info.photo = d.photoURL || info.photo; }
  } catch (e) {}
  if (info.photo.length > 20000) info.photo = "";
  saveAccounts([info, ...loadAccounts().filter(a => a.uid !== user.uid)]);
  try {
    const sec = getSecondary(user.uid);
    await ready(sec.auth);
    if (!sec.auth.currentUser || sec.auth.currentUser.uid !== user.uid) await sec.auth.updateCurrentUser(user);
  } catch (e) { console.warn("Could not save this session for switching:", e); }
}

function forgetAccount(uid) {
  saveAccounts(loadAccounts().filter(a => a.uid !== uid));
  try { getSecondary(uid).auth.signOut().catch(() => {}); } catch (e) {}
}

function closeEverything() {
  document.querySelectorAll(".modal-overlay.open").forEach(m => m.classList.remove("open"));
  const d = document.getElementById("dmDrawer");
  if (d) d.classList.remove("open");
}

let switching = false;
async function switchAccount(uid) {
  if (switching || (auth.currentUser && auth.currentUser.uid === uid)) return;
  switching = true;
  try {
    const sec = getSecondary(uid);
    await ready(sec.auth);
    const u = sec.auth.currentUser;
    if (!u) throw new Error("no saved session");
    await u.getIdToken(true);              // fails if the session was revoked or expired
    closeEverything();
    await auth.updateCurrentUser(u);       // the page reacts exactly like a normal sign-in
    toast("Switched account");
  } catch (e) {
    const a = loadAccounts().find(x => x.uid === uid);
    forgetAccount(uid);
    toast("That session expired. Please sign in again.");
    openAuth();
    const em = document.getElementById("signInEmail");
    if (a && a.email && em) em.value = a.email;
  }
  switching = false;
}

// ---------- UI ----------
const style = document.createElement("style");
style.textContent = `
.acct-row{display:flex;align-items:center;gap:10px;padding:8px;border-radius:12px;cursor:pointer;font-size:13px;text-align:left}
.acct-row:hover{background:rgba(0,0,0,.06)} body.dark .acct-row:hover{background:rgba(255,255,255,.08)}
.acct-row.active{background:rgba(84,117,56,.18);cursor:default}
.acct-row .grow{flex:1;min-width:0}
.acct-row .grow strong,.acct-row .grow div{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.acct-x{border:none;background:none;cursor:pointer;font-size:14px;opacity:.6;color:inherit}
.acct-x:hover{opacity:1}
.acct-tag{font-size:11px;color:#547538;font-weight:bold}
#savedAccounts{margin-bottom:10px;text-align:left}
#savedAccounts .acct-head{font-size:12px;font-weight:bold;margin:0 0 6px;opacity:.7}
`;
document.head.appendChild(style);

const modal = document.createElement("div");
modal.className = "modal-overlay";
modal.id = "accountModal";
modal.innerHTML = `<div class="profile-modal wide-modal" role="dialog" aria-modal="true">
  <button class="close-modal" data-close aria-label="Close">✕</button>
  <div class="modal-body" style="text-align:left; padding-top:34px;">
    <h3 style="margin:0;">Switch account</h3>
    <div id="accountList"></div>
    <button class="btn btn-sm" id="addAccountBtn" style="align-self:flex-start; background:#eee; color:#222;">+ Add another account</button>
    <button class="btn btn-sm btn-danger" id="signOutAllBtn" style="align-self:flex-start;">Sign out of all accounts</button>
    <div style="font-size:11px; opacity:.7;">Switching keeps your logins saved on this device. On a shared computer, use “Sign out of all accounts”.</div>
  </div></div>`;
document.body.appendChild(modal);

function acctRow(a, active) {
  const row = document.createElement("div");
  row.className = "acct-row" + (active ? " active" : "");
  row.setAttribute("role", "button"); row.tabIndex = 0;
  row.innerHTML = `<img class="profile-pic" style="width:36px;height:36px" src="${esc(avatarSrc(a.photo, a.name))}" alt="${esc(a.name)}">
    <div class="grow"><strong>${esc(a.name)}</strong><div class="user-handle-sub">${a.handle ? "@" + esc(a.handle) : esc(a.email)}</div></div>`;
  if (active) {
    row.insertAdjacentHTML("beforeend", `<span class="acct-tag">✔ Current</span>`);
  } else {
    row.onclick = () => switchAccount(a.uid);
    const x = document.createElement("button");
    x.className = "acct-x"; x.title = "Remove from this device"; x.setAttribute("aria-label", "Remove " + a.name + " from this device");
    x.textContent = "✕";
    x.onclick = (e) => { e.stopPropagation(); forgetAccount(a.uid); renderAll(); toast("Removed from this device"); };
    row.appendChild(x);
  }
  return row;
}

function renderList() {
  const box = document.getElementById("accountList");
  box.innerHTML = "";
  const cur = auth.currentUser && auth.currentUser.uid;
  loadAccounts().forEach(a => box.appendChild(acctRow(a, a.uid === cur)));
  if (!box.children.length) box.innerHTML = "<p style='font-size:13px; opacity:.7;'>No saved accounts yet.</p>";
}

// saved accounts shown at the top of the Sign In window
const savedBox = document.createElement("div");
savedBox.id = "savedAccounts";
const authBody = document.querySelector("#authModal .modal-body");
if (authBody) authBody.prepend(savedBox);
function renderSaved() {
  const cur = auth.currentUser && auth.currentUser.uid;
  const others = loadAccounts().filter(a => a.uid !== cur);
  savedBox.innerHTML = "";
  if (cur) {
    const note = document.createElement("div");
    note.className = "acct-head";
    note.textContent = "Signing in here adds another account. You can switch back any time.";
    savedBox.appendChild(note);
  }
  if (!others.length) return;
  const h = document.createElement("div");
  h.className = "acct-head"; h.textContent = "Saved accounts";
  savedBox.appendChild(h);
  others.forEach(a => savedBox.appendChild(acctRow(a, false)));
  savedBox.insertAdjacentHTML("beforeend", "<div class='auth-divider'>or sign in with another account</div>");
}
function renderAll() { renderList(); renderSaved(); }
const am = document.getElementById("authModal");
if (am) new MutationObserver(() => { if (am.classList.contains("open")) renderSaved(); }).observe(am, { attributes: true, attributeFilter: ["class"] });

function openAccounts() {
  if (!auth.currentUser) return openAuth();
  renderList();
  modal.classList.add("open");
}
function openAuth() {
  renderSaved();
  const t = document.getElementById("tabSignIn"); if (t) t.click();
  if (am) am.classList.add("open");
}

// buttons injected into the page
function mkBtn(id, label, extraStyle) {
  const b = document.createElement("button");
  b.id = id; b.className = "btn btn-sm"; b.textContent = label;
  b.style.cssText = extraStyle || "";
  b.onclick = openAccounts;
  return b;
}
const myBtn = document.getElementById("viewMyProfileBtn");
if (myBtn) myBtn.after(mkBtn("switchAcctBtn", "👥 Switch account"));
const soBtn = document.getElementById("signOutBtn");
if (soBtn) soBtn.before(mkBtn("switchAcctBtn2", "👥 Switch account", "align-self:flex-start; background:#eee; color:#222;"));

document.getElementById("addAccountBtn").onclick = () => { closeEverything(); openAuth(); };
document.getElementById("signOutAllBtn").onclick = async () => {
  if (!confirm("Sign out of all accounts on this device?")) return;
  loadAccounts().forEach(a => forgetAccount(a.uid));
  closeEverything();
  await signOut(auth);
  toast("Signed out of all accounts");
};

// Google: always let the person choose which Google account to use
document.addEventListener("click", async (e) => {
  if (!e.target.closest("#googleSignInBtn")) return;
  e.stopImmediatePropagation();
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: "select_account" });
  try { await signInWithPopup(auth, p); if (am) am.classList.remove("open"); }
  catch (err) { const m = document.getElementById("authErrorMsg"); if (m) m.textContent = err.message; }
}, true);

// Signing out (or deleting) the current account removes it from the list and switches to the next one
let lastUid, pendingOut = null;
document.addEventListener("click", (e) => {
  if (e.target.closest("#signOutBtn") || e.target.closest("#deleteAccountBtn")) pendingOut = auth.currentUser ? auth.currentUser.uid : null;
}, true);

onAuthStateChanged(auth, async (user) => {
  const prev = lastUid;
  lastUid = user ? user.uid : null;
  if (user) {
    pendingOut = null;
    await registerAccount(user);
    renderAll();
  } else if (prev && pendingOut === prev) {
    const gone = pendingOut; pendingOut = null;
    forgetAccount(gone);
    const next = loadAccounts()[0];
    if (next) { toast(`Signed out. Switched to ${next.name}.`); switchAccount(next.uid); }
  }
});
