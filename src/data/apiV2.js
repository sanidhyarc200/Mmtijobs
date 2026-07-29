// src/data/apiV2.js
// Client for the v2 domain API (token auth, hashed passwords, real domain
// logic). During the transition, writes go to v2 AND mirror into the legacy
// localStorage collections (which the old sync layer keeps uploading), so
// not-yet-migrated pages continue to work unchanged.

import { API_URL } from "./apiStore";

const TOKEN_KEY = "v2Token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function isV2Available() {
  return Boolean(API_URL);
}

async function request(method, path, body) {
  if (!API_URL) throw new Error("offline");
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/api/v2${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

/* ------------------------------------------------------------------ */
/* Session helpers                                                     */
/* ------------------------------------------------------------------ */

// Convert a v2 session payload into the legacy currentUser shape every
// existing page understands, store it, and broadcast the change.
export function adoptSession(session) {
  setToken(session.token);
  const u = session.user;
  const legacyUser = {
    id: u.client_id || `v2-${u.id}`,
    v2Id: u.id,
    userType: u.user_type,
    // Several dashboards guard on `role` (not `userType`); keep both in sync
    // so a background v2 login never bounces a signed-in admin/HR user.
    role: u.user_type,
    email: u.email,
    name: u.name,
    contact: u.contact,
    ...u.profile,
  };
  if (session.company) {
    legacyUser.company = session.company.name;
    legacyUser.companyId = session.company.id;
  }
  if (session.impersonating) legacyUser.impersonating = true;
  localStorage.setItem("currentUser", JSON.stringify(legacyUser));
  try { window.dispatchEvent(new Event("authChanged")); } catch { /* noop */ }
  return legacyUser;
}

export function clearSession() {
  const token = getToken();
  setToken("");
  if (token && API_URL) {
    // Best-effort server-side revoke
    fetch(`${API_URL}/api/v2/auth/logout/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function login(email, password) {
  const session = await request("POST", "/auth/login/", { email, password });
  return { session, user: adoptSession(session) };
}

export async function registerApplicant(payload) {
  const session = await request("POST", "/auth/register/", payload);
  return { session, user: adoptSession(session) };
}

export async function registerCompany(payload) {
  const session = await request("POST", "/auth/register-company/", payload);
  return { session, user: adoptSession(session) };
}

/* ------------------------------------------------------------------ */
/* Jobs & applications (write paths)                                   */
/* ------------------------------------------------------------------ */

export async function createJob(job) {
  return request("POST", "/jobs/", job);
}

export async function updateJob(v2JobRef, patch) {
  return request("PUT", `/jobs/${v2JobRef}/`, patch);
}

export async function setJobStatus(v2JobRef, status) {
  return request("POST", `/jobs/${v2JobRef}/status/`, { status });
}

export async function applyToJob(v2JobRef) {
  return request("POST", `/jobs/${v2JobRef}/apply/`, {});
}

// ----- Admin / staff authoritative reads (from the real v2 tables) -----
// These never lose records the way the legacy full-array mirror can.

export async function adminApplicants() {
  const rows = await request("GET", "/admin/applicants/");
  // Map to the legacy student shape the dashboards render.
  return rows.map((a) => ({
    id: a.client_id || `v2-${a.id}`,
    v2Id: a.id,
    userType: "applicant",
    email: a.email,
    name: a.name,
    contact: a.contact,
    createdAt: a.created_at,
    ...a.profile,
  }));
}

export async function adminCompanies() {
  const rows = await request("GET", "/companies/");
  return rows.map((c) => ({
    id: c.client_id || `v2-${c.id}`,
    v2Id: c.id,
    name: c.name,
    companyName: c.name,
    email: c.email,
    contact: c.contact,
    city: c.city,
    state: c.state,
    industryType: c.industry_type,
    numberOfEmployees: c.number_of_employees,
    createdAt: c.created_at,
  }));
}

export async function adminJobs() {
  const rows = await request("GET", "/jobs/");
  return rows.map((j) => ({
    id: j.client_id || `v2-${j.id}`,
    v2Id: j.id,
    title: j.title,
    company: j.company_name,
    companyEmail: j.company_email,
    status: j.status,
    location: j.location,
    salary: j.salary,
    experienceRange: j.experience,
    description: j.description,
    numberOfOpenings: j.number_of_openings,
    tags: j.tags,
    createdAt: j.created_at,
    ...j.extra,
  }));
}

export async function myApplications() {
  const apps = await request("GET", "/applications/mine/");
  // Legacy shape the dashboard renders
  return apps.map((a) => ({
    jobId: a.job,
    jobTitle: a.job_title,
    company: a.company_name,
    appliedDate: a.applied_at,
    status: a.status,
  }));
}

// Legacy jobs carry client ids; v2 endpoints take pks. client_id === pk for
// v2-created jobs; migrated jobs need a lookup, so we keep a cached map.
let jobIdMapPromise = null;

export async function v2JobIdFor(legacyId) {
  if (!jobIdMapPromise) {
    jobIdMapPromise = request("GET", "/jobs/").then((jobs) => {
      const map = {};
      jobs.forEach((j) => { if (j.client_id != null) map[j.client_id] = j.id; });
      return map;
    });
  }
  const map = await jobIdMapPromise.catch(() => ({}));
  return map[legacyId] ?? null;
}
