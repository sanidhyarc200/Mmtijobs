// src/data/apiStore.js
// Bridges the localStorage-based frontend to the Django backend.
//
// On boot, initApiStore() pulls every synced collection from the API into
// localStorage (or seeds the server from localStorage on first ever run).
// It then patches localStorage.setItem/removeItem so any later write to a
// synced key is pushed to the API in the background. Page code keeps using
// localStorage exactly as before — no other changes needed.
//
// Device-local keys (currentUser, theme, seedVersion, pendingSignupType)
// are intentionally NOT synced: sessions stay per-browser.

const SYNC_KEYS = [
  "users",
  "jobs",
  "jobApplications",
  "registeredCompanies",
  "registeredCompany",
  "savedJobs",
  "applicants",
  "customJobTitles",
  "customQualifications",
];

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000" : null);

const PUSH_DEBOUNCE_MS = 400;
const BOOTSTRAP_TIMEOUT_MS = 6000;

let online = false;
let patched = false;
const pushTimers = {};
// Pushes are chained so only one request is in flight at a time — parallel
// writes to different keys otherwise race each other (and lock SQLite).
let pushChain = Promise.resolve();

// Bound originals so hydration writes don't loop back into queuePush()
const rawSetItem = localStorage.setItem.bind(localStorage);
const rawRemoveItem = localStorage.removeItem.bind(localStorage);

export function isApiOnline() {
  return online;
}

function notifyApp() {
  ["jobsChanged", "authChanged", "applicationsChanged", "storeHydrated"].forEach(
    (name) => {
      try {
        window.dispatchEvent(new Event(name));
      } catch {
        /* noop */
      }
    }
  );
}

async function pushKey(key) {
  const raw = localStorage.getItem(key);
  if (raw === null) return;
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    console.warn(`[apiStore] '${key}' is not valid JSON, skipping push`);
    return;
  }
  try {
    const res = await fetch(`${API_URL}/api/collections/${key}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.warn(`[apiStore] failed to sync '${key}':`, err);
  }
}

function queuePush(key) {
  if (!online) return;
  clearTimeout(pushTimers[key]);
  pushTimers[key] = setTimeout(() => {
    pushChain = pushChain.then(() => pushKey(key));
  }, PUSH_DEBOUNCE_MS);
}

function patchLocalStorage() {
  if (patched) return;
  patched = true;
  localStorage.setItem = (key, value) => {
    rawSetItem(key, value);
    if (SYNC_KEYS.includes(key)) queuePush(key);
  };
  localStorage.removeItem = (key) => {
    rawRemoveItem(key);
    if (SYNC_KEYS.includes(key)) queuePush(key);
  };
}

function hydrateFromServer(collections) {
  SYNC_KEYS.forEach((key) => {
    if (!(key in collections)) return;
    const value = collections[key];
    if (value === null || value === undefined) return;
    rawSetItem(key, JSON.stringify(value));
  });
}

async function pushLocalToServer() {
  // Sequential on purpose — see pushChain.
  for (const key of SYNC_KEYS) {
    if (localStorage.getItem(key) !== null) await pushKey(key);
  }
}

export async function initApiStore() {
  if (!API_URL) {
    console.warn("[apiStore] no VITE_API_URL configured — running offline");
    patchLocalStorage();
    return false;
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BOOTSTRAP_TIMEOUT_MS);
    const res = await fetch(`${API_URL}/api/bootstrap/`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const snapshot = await res.json();

    online = true;
    if (snapshot.hasData) {
      hydrateFromServer(snapshot.collections || {});
    } else {
      // First ever run against an empty server: publish local data
      // (including the demo seed) so it becomes the shared source of truth.
      await pushLocalToServer();
    }
    patchLocalStorage();
    notifyApp();
    return true;
  } catch (err) {
    console.warn("[apiStore] backend unreachable — running offline:", err);
    online = false;
    patchLocalStorage();
    return false;
  }
}
