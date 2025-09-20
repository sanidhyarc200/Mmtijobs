// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/** -------------------------
 *  LocalStorage helpers
 *  -------------------------
 *  Companies: may be stored as single object 'registeredCompany' or array 'registeredCompanies'
 *  Students:  'users' (array from onboarding)
 *  Jobs:      'jobs' (array with {status: 'pending'|'active'|'inactive'})
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
  writeJSON("registeredCompanies", list);
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
  if (!Array.isArray(arr)) return [];
  return arr.map((j) => {
    if (j.status === "pending") return { ...j, status: "pending" };
    if (j.status === "inactive") return { ...j, status: "inactive" };
    return { ...j, status: "active" };
  });
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

  const [activeSection, setActiveSection] = useState("jobs");

  const [editModal, setEditModal] = useState({
    open: false,
    type: null,
    item: null,
    index: -1,
  });

  useEffect(() => {
    const user = readJSON("currentUser", null);
    setCurrentUser(user);
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    setCompanies(getCompanies());
    setStudents(getStudents());
    setJobs(getJobs());
  }, [navigate]);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const active = jobs.filter((j) => j.status === "active").length;
    const inactive = jobs.filter((j) => j.status === "inactive").length;
    const pending = jobs.filter((j) => j.status === "pending").length;

    return {
      totalCompanies: companies.length,
      totalStudents: students.length,
      totalJobs,
      activeJobs: active,
      inactiveJobs: inactive,
      pendingJobs: pending,
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
    list[index] = {
      ...j,
      status: j.status === "active" ? "inactive" : "active",
    };
    setJobs(list);
    saveJobs(list);
  }

  function approveJob(index) {
    const list = [...jobs];
    list[index] = { ...list[index], status: "active" };
    setJobs(list);
    saveJobs(list);
    alert(`✅ Job "${list[index].title}" approved!`);
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
      const updated = {
        ...item,
        status:
          item.status === "pending"
            ? "pending"
            : item.status === "inactive"
            ? "inactive"
            : "active",
      };
      const list = [...jobs];
      list[index] = updated;
      setJobs(list);
      saveJobs(list);
    }
    closeEdit();
  }

  function Sidebar() {
    return (
      <aside className="admin-sidebar">
        <div className="sidebar-title">Admin</div>
        <nav className="sidebar-nav">
          <button
            className={`sidebar-btn ${
              activeSection === "recruiters" ? "active" : ""
            }`}
            onClick={() => setActiveSection("recruiters")}
          >
            Recruiters / Clients
          </button>
          <button
            className={`sidebar-btn ${
              activeSection === "students" ? "active" : ""
            }`}
            onClick={() => setActiveSection("students")}
          >
            Students
          </button>
          <button
            className={`sidebar-btn ${
              activeSection === "jobs" ? "active" : ""
            }`}
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
        <Card
          title="Active / Pending / Inactive"
          value={`${stats.activeJobs} / ${stats.pendingJobs} / ${stats.inactiveJobs}`}
        />
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
              {companies.length ? (
                companies.map((c, idx) => {
                  const jobsCount = jobs.filter(
                    (j) =>
                      (j.company || "").trim() ===
                      (c.companyName || c.name || "").trim()
                  ).length;
                  return (
                    <tr key={idx}>
                      <td>{c.companyName || c.name || "-"}</td>
                      <td>{c.hrName || c.hr || "-"}</td>
                      <td>{c.email || "-"}</td>
                      <td>{c.contact || c.phone || "-"}</td>
                      <td>{jobsCount}</td>
                      <td className="actions">
                        <button
                          className="btn secondary"
                          onClick={() => openEdit("company", idx, c)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn danger"
                          onClick={() => handleDelete("company", idx)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="empty">
                    No recruiters found.
                  </td>
                </tr>
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
              {students.length ? (
                students.map((s, idx) => {
                  const name =
                    [s.firstName, s.middleName, s.lastName]
                      .filter(Boolean)
                      .join(" ") || s.name || "-";
                  return (
                    <tr key={idx}>
                      <td>{name}</td>
                      <td>{s.email || "-"}</td>
                      <td>{s.degree || "-"}</td>
                      <td>{s.experience || "-"}</td>
                      <td>{s.location || "-"}</td>
                      <td className="actions">
                        <button
                          className="btn secondary"
                          onClick={() => openEdit("student", idx, s)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn danger"
                          onClick={() => handleDelete("student", idx)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="empty">
                    No students found.
                  </td>
                </tr>
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
              {jobs.length ? (
                jobs.map((j, idx) => (
                  <tr key={j.id || idx}>
                    <td>{j.title || "-"}</td>
                    <td>{j.company || "-"}</td>
                    <td>
                      <span
                        className={`pill ${
                          j.status === "active"
                            ? "ok"
                            : j.status === "pending"
                            ? "pending"
                            : "warn"
                        }`}
                      >
                        {j.status === "active"
                          ? "Active"
                          : j.status === "pending"
                          ? "Pending"
                          : "Inactive"}
                      </span>
                    </td>
                    <td>{j.location || "-"}</td>
                    <td>{j.experienceRange || "-"}</td>
                    <td>{j.salary || "-"}</td>
                    <td className="actions">
                      {j.status === "pending" ? (
                        <button
                          className="btn"
                          onClick={() => approveJob(idx)}
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          className="btn"
                          onClick={() => handleToggleJobStatus(idx)}
                        >
                          {j.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      <button
                        className="btn secondary"
                        onClick={() => openEdit("job", idx, j)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => handleDelete("job", idx)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Toast for pending jobs */}
      {jobs.some((j) => j.status === "pending") && (
        <div
          style={{
            background: "#fff8e1",
            border: "1px solid #fcd34d",
            padding: "12px 16px",
            borderRadius: "10px",
            color: "#92400e",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          ⚠️ {jobs.filter((j) => j.status === "pending").length} job(s) pending
          approval
        </div>
      )}

      <TopCards />
      <div className="content-row">
        <Sidebar />
        <main className="admin-main">
          {activeSection === "recruiters" && <CompaniesTable />}
          {activeSection === "students" && <StudentsTable />}
          {activeSection === "jobs" && <JobsTable />}
        </main>
      </div>

      {editModal.open && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit {editModal.type}</h3>
              <button className="icon-btn" onClick={closeEdit}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {editModal.type === "company" && (
                <div className="form-grid">
                  <label>
                    Company Name
                    <input
                      value={
                        editModal.item.companyName || editModal.item.name || ""
                      }
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, companyName: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    HR Name
                    <input
                      value={editModal.item.hrName || editModal.item.hr || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, hrName: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Email
                    <input
                      value={editModal.item.email || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, email: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      value={editModal.item.contact || editModal.item.phone || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, contact: e.target.value },
                        }))
                      }
                    />
                  </label>
                </div>
              )}

              {editModal.type === "student" && (
                <div className="form-grid">
                  <label>
                    First Name
                    <input
                      value={editModal.item.firstName || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, firstName: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Last Name
                    <input
                      value={editModal.item.lastName || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, lastName: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Email
                    <input
                      value={editModal.item.email || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, email: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Degree
                    <input
                      value={editModal.item.degree || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, degree: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Experience
                    <input
                      value={editModal.item.experience || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, experience: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Location
                    <input
                      value={editModal.item.location || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, location: e.target.value },
                        }))
                      }
                    />
                  </label>
                </div>
              )}

              {editModal.type === "job" && (
                <div className="form-grid">
                  <label>
                    Title
                    <input
                      value={editModal.item.title || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, title: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Company
                    <input
                      value={editModal.item.company || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, company: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Location
                    <input
                      value={editModal.item.location || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, location: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Experience
                    <input
                      value={editModal.item.experienceRange || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, experienceRange: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Salary
                    <input
                      value={editModal.item.salary || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, salary: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={editModal.item.status || "pending"}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, status: e.target.value },
                        }))
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={handleEditSave}>
                Save
              </button>
              <button className="btn secondary" onClick={closeEdit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline CSS */}
      <style>{`
        .admin-layout { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
        .cards-row { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
        .card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
        .card-title { font-size: 14px; color: #3b82f6; font-weight: 600; }
        .card-value { font-size: 28px; font-weight: 800; margin-top: 6px; }
        .card-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .content-row { display: grid; grid-template-columns: 220px 1fr; gap: 16px; }
        .admin-sidebar { background: #ffffff; border-radius: 12px; padding: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
        .sidebar-title { font-weight: 700; color: #1f2937; margin-bottom: 8px; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 8px; }
        .sidebar-btn { text-align: left; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb; background: #f9fafb; cursor: pointer; font-weight: 600; color: #1f2937; }
        .sidebar-btn.active, .sidebar-btn:hover { background: #e8f0ff; border-color: #bfdbfe; color: #1d4ed8; }
        .admin-main { display: flex; flex-direction: column; gap: 16px; }
        .panel { background: #fff; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
        .panel-header { padding: 14px 16px; border-bottom: 1px solid #eef2f7; }
        .panel-header h2 { margin: 0; font-size: 18px; color: #111827; }
        .table-wrap { width: 100%; overflow: auto; }
        .nice-table { width: 100%; border-collapse: collapse; }
        .nice-table th, .nice-table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: left; }
        .nice-table th { font-weight: 700; color: #1f2937; background: #f8fafc; }
        .nice-table tr:hover td { background: #f9fbff; }
        .actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn { padding: 8px 12px; border: 1px solid #3b82f6; background: #3b82f6; color: #fff; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .btn.secondary { background: #fff; color: #1f2937; border-color: #d1d5db; }
        .btn.danger { background: #ef4444; border-color: #ef4444; color: #fff; }
        .icon-btn { background: transparent; border: none; font-size: 18px; cursor: pointer; }
        .pill { display: inline-block; font-size: 12px; padding: 4px 8px; border-radius: 999px; border: 1px solid #e5e7eb; }
        .pill.ok { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
        .pill.pending { background: #fef9c3; color: #92400e; border-color: #fde68a; }
        .pill.warn { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50; }
        .modal { width: 100%; max-width: 720px; background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .modal-header { padding: 12px 16px; border-bottom: 1px solid #eef2f7; display: flex; align-items: center; justify-content: space-between; }
        .modal-body { padding: 16px; }
        .modal-footer { padding: 12px 16px; border-top: 1px solid #eef2f7; display: flex; gap: 8px; justify-content: flex-end; }
        .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
        .form-grid label { display: flex; flex-direction: column; font-size: 12px; color: #374151; font-weight: 600; }
        .form-grid input, .form-grid select { margin-top: 6px; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; }
        .empty { text-align: center; color: #6b7280; padding: 18px 0; }
        @media (max-width: 980px) {
          .cards-row { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .content-row { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
