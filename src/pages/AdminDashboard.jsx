// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

/** -------------------------
 *  LocalStorage helpers
 *  -------------------------
 *  Companies: may be stored as single object 'registeredCompany' or array 'registeredCompanies'
 *  Students:  'users' (array from onboarding)
 *  Jobs:      'jobs' (array with {status: 'active'|'inactive'})
 */

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCompanies() {
  const single = readJSON("registeredCompany", null);
  const arr = readJSON("registeredCompanies", null);
  if (Array.isArray(arr)) return arr;
  if (single && typeof single === "object") return [single];
  return [];
}

function saveCompanies(list) {
  // Prefer array form going forward
  writeJSON("registeredCompanies", list);
  // Keep 'registeredCompany' as the first one for backward-compat if needed
  if (list.length) writeJSON("registeredCompany", list[0]);
}

function getStudents() {
  const arr = readJSON("users", []);
  return Array.isArray(arr) ? arr : [];
}

function saveStudents(list) {
  writeJSON("users", list);
}

function getJobs() {
  const arr = readJSON("jobs", []);
  // Ensure status defaults to 'active' if missing
  const normalized = (Array.isArray(arr) ? arr : []).map(j => ({
    ...j,
    status: j.status === "inactive" ? "inactive" : "active",
  }));
  if (JSON.stringify(arr) !== JSON.stringify(normalized)) {
    writeJSON("jobs", normalized);
  }
  return normalized;
}

function saveJobs(list) {
  writeJSON("jobs", list);
}

function Card({ title, value, sub }) {
  return (
    <div className="analytics-card card">
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
      {sub ? <div className="card-sub">{sub}</div> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [activeSection, setActiveSection] = useState("jobs"); // 'recruiters' | 'students' | 'jobs'

  // Edit modal state
  const [editModal, setEditModal] = useState({
    open: false,
    type: null, // 'company' | 'student' | 'job'
    item: null,
    index: -1,
  });

  useEffect(() => {
    const user = readJSON("currentUser", null);
    setCurrentUser(user);
    if (!user || user.role !== "admin") {
      // guard
      navigate("/");
      return;
    }

    setCompanies(getCompanies());
    setStudents(getStudents());
    setJobs(getJobs());
  }, [navigate]);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const active = jobs.filter(j => j.status === "active").length;
    const inactive = totalJobs - active;

    // companies: unique by email or name
    const totalCompanies = companies.length;
    const totalStudents = students.length;

    return {
      totalCompanies,
      totalStudents,
      totalJobs,
      activeJobs: active,
      inactiveJobs: inactive,
    };
  }, [companies, students, jobs]);

  function openEdit(type, index, item) {
    setEditModal({ open: true, type, item: { ...item }, index });
  }

  function closeEdit() {
    setEditModal({ open: false, type: null, item: null, index: -1 });
  }

  function handleDelete(type, index) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    if (type === "company") {
      const list = [...companies];
      list.splice(index, 1);
      setCompanies(list);
      saveCompanies(list);
    } else if (type === "student") {
      const list = [...students];
      list.splice(index, 1);
      setStudents(list);
      saveStudents(list);
    } else if (type === "job") {
      const list = [...jobs];
      list.splice(index, 1);
      setJobs(list);
      saveJobs(list);
    }
  }

  function handleToggleJobStatus(index) {
    const list = [...jobs];
    const j = list[index];
    list[index] = { ...j, status: j.status === "active" ? "inactive" : "active" };
    setJobs(list);
    saveJobs(list);
  }

  function handleEditSave() {
    const { type, index, item } = editModal;
    if (type === "company") {
      const list = [...companies];
      list[index] = item;
      setCompanies(list);
      saveCompanies(list);
    } else if (type === "student") {
      const list = [...students];
      list[index] = item;
      setStudents(list);
      saveStudents(list);
    } else if (type === "job") {
      // Ensure status normalized
      const updated = { ...item, status: item.status === "inactive" ? "inactive" : "active" };
      const list = [...jobs];
      list[index] = updated;
      setJobs(list);
      saveJobs(list);
    }
    closeEdit();
  }

  // ---- Rendering helpers ----

  function Sidebar() {
    return (
      <aside className="admin-sidebar">
        <div className="sidebar-title">Admin</div>
        <nav className="sidebar-nav">
          <button
            className={`sidebar-btn ${activeSection === "recruiters" ? "active" : ""}`}
            onClick={() => setActiveSection("recruiters")}
          >
            Recruiters / Clients
          </button>
          <button
            className={`sidebar-btn ${activeSection === "students" ? "active" : ""}`}
            onClick={() => setActiveSection("students")}
          >
            Students
          </button>
          <button
            className={`sidebar-btn ${activeSection === "jobs" ? "active" : ""}`}
            onClick={() => setActiveSection("jobs")}
          >
            Jobs
          </button>
        </nav>
      </aside>
    );
  }

  function TopCards() {
    return (
      <div className="cards-row">
        <Card title="Total Recruiters" value={stats.totalCompanies} />
        <Card title="Total Students" value={stats.totalStudents} />
        <Card title="Total Jobs" value={stats.totalJobs} />
        <Card title="Active / Inactive" value={`${stats.activeJobs} / ${stats.inactiveJobs}`} />
      </div>
    );
  }

  function CompaniesTable() {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Recruiters / Clients</h2>
        </div>
        <div className="table-wrap">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>HR Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Jobs Posted</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.length ? companies.map((c, idx) => {
                const jobsCount = jobs.filter(j => (j.company || "").trim() === (c.companyName || c.name || "").trim()).length;
                return (
                  <tr key={idx}>
                    <td>{c.companyName || c.name || "-"}</td>
                    <td>{c.hrName || c.hr || "-"}</td>
                    <td>{c.email || "-"}</td>
                    <td>{c.contact || c.phone || "-"}</td>
                    <td>{jobsCount}</td>
                    <td className="actions">
                      <button className="btn secondary" onClick={() => openEdit("company", idx, c)}>Edit</button>
                      <button className="btn danger" onClick={() => handleDelete("company", idx)}>Delete</button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6} className="empty">No recruiters found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function StudentsTable() {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Students</h2>
        </div>
        <div className="table-wrap">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Degree</th>
                <th>Experience</th>
                <th>Location</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length ? students.map((s, idx) => {
                const name = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || s.name || "-";
                return (
                  <tr key={idx}>
                    <td>{name}</td>
                    <td>{s.email || "-"}</td>
                    <td>{s.degree || "-"}</td>
                    <td>{s.experience || "-"}</td>
                    <td>{s.location || "-"}</td>
                    <td className="actions">
                      <button className="btn secondary" onClick={() => openEdit("student", idx, s)}>Edit</button>
                      <button className="btn danger" onClick={() => handleDelete("student", idx)}>Delete</button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6} className="empty">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function JobsTable() {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Jobs</h2>
        </div>
        <div className="table-wrap">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Location</th>
                <th>Experience</th>
                <th>Salary</th>
                <th style={{ width: 280 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length ? jobs.map((j, idx) => (
                <tr key={j.id || idx}>
                  <td>{j.title || "-"}</td>
                  <td>{j.company || "-"}</td>
                  <td>
                    <span className={`pill ${j.status === "active" ? "ok" : "warn"}`}>
                      {j.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{j.location || "-"}</td>
                  <td>{j.experience || "-"}</td>
                  <td>{j.salary || "-"}</td>
                  <td className="actions">
                    <button className="btn" onClick={() => handleToggleJobStatus(idx)}>
                      {j.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button className="btn secondary" onClick={() => openEdit("job", idx, j)}>Edit</button>
                    <button className="btn danger" onClick={() => handleDelete("job", idx)}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="empty">No jobs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <TopCards />
      <div className="content-row">
        <Sidebar />
        <main className="admin-main">
          {activeSection === "recruiters" && <CompaniesTable />}
          {activeSection === "students" && <StudentsTable />}
          {activeSection === "jobs" && <JobsTable />}
        </main>
      </div>

      {/* Lightweight Edit Modal (inline, theme-friendly) */}
      {editModal.open && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit {editModal.type}</h3>
              <button className="icon-btn" onClick={closeEdit}>✕</button>
            </div>
            <div className="modal-body">
              {editModal.type === "company" && (
                <div className="form-grid">
                  <label>Company Name
                    <input value={editModal.item.companyName || editModal.item.name || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, companyName: e.target.value}}))}/>
                  </label>
                  <label>HR Name
                    <input value={editModal.item.hrName || editModal.item.hr || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, hrName: e.target.value}}))}/>
                  </label>
                  <label>Email
                    <input value={editModal.item.email || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, email: e.target.value}}))}/>
                  </label>
                  <label>Phone
                    <input value={editModal.item.contact || editModal.item.phone || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, contact: e.target.value}}))}/>
                  </label>
                </div>
              )}

              {editModal.type === "student" && (
                <div className="form-grid">
                  <label>First Name
                    <input value={editModal.item.firstName || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, firstName: e.target.value}}))}/>
                  </label>
                  <label>Last Name
                    <input value={editModal.item.lastName || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, lastName: e.target.value}}))}/>
                  </label>
                  <label>Email
                    <input value={editModal.item.email || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, email: e.target.value}}))}/>
                  </label>
                  <label>Degree
                    <input value={editModal.item.degree || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, degree: e.target.value}}))}/>
                  </label>
                  <label>Experience
                    <input value={editModal.item.experience || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, experience: e.target.value}}))}/>
                  </label>
                  <label>Location
                    <input value={editModal.item.location || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, location: e.target.value}}))}/>
                  </label>
                </div>
              )}

              {editModal.type === "job" && (
                <div className="form-grid">
                  <label>Title
                    <input value={editModal.item.title || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, title: e.target.value}}))}/>
                  </label>
                  <label>Company
                    <input value={editModal.item.company || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, company: e.target.value}}))}/>
                  </label>
                  <label>Location
                    <input value={editModal.item.location || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, location: e.target.value}}))}/>
                  </label>
                  <label>Experience
                    <input value={editModal.item.experience || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, experience: e.target.value}}))}/>
                  </label>
                  <label>Salary
                    <input value={editModal.item.salary || ""}
                           onChange={e => setEditModal(m => ({...m, item: {...m.item, salary: e.target.value}}))}/>
                  </label>
                  <label>Status
                    <select value={editModal.item.status || "active"}
                            onChange={e => setEditModal(m => ({...m, item: {...m.item, status: e.target.value}}))}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={handleEditSave}>Save</button>
              <button className="btn secondary" onClick={closeEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Minimal styles that play nice with your blue theme ---
   If you already have similar classes, this will blend in.
   Otherwise drop these in your index.css or AdminDashboard.css.
   (You can tweak spacings/colors to match your exact theme.)
*/
