import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

/* ======================
   Storage Helpers
====================== */
const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

const getCompanies = () => {
  const arr = readJSON("registeredCompanies", []);
  const single = readJSON("registeredCompany", null);
  if (Array.isArray(arr) && arr.length) return arr;
  return single ? [single] : [];
};

const getStudents = () =>
  (readJSON("users", []) || []).filter((u) => u.userType === "applicant");

const getJobs = () => readJSON("jobs", []);

/* ======================
   UI Components
====================== */
function Card({ title, value }) {
  return (
    <div className="hr-card">
      <div className="hr-card-title">{title}</div>
      <div className="hr-card-value">{value}</div>
    </div>
  );
}

function exportExcel(data, name) {
  if (!data.length) return alert("No data to export");
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet");
  XLSX.writeFile(wb, `${name}.xlsx`);
}

/* ======================
   HR MANAGER DASHBOARD
====================== */
export default function HRManagerDashboard() {
  const navigate = useNavigate();

  const [section, setSection] = useState("jobs");
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [viewJob, setViewJob] = useState(null);

  /* Auth Guard */
  useEffect(() => {
    const user = readJSON("currentUser", null);
    if (!user || user.role !== "hr_manager") {
      navigate("/");
      return;
    }
    setCompanies(getCompanies());
    setStudents(getStudents());
    setJobs(getJobs());
  }, [navigate]);

  /* Stats */
  const stats = useMemo(() => {
    return {
      recruiters: companies.length,
      students: students.length,
      jobs: jobs.length,
      pending: jobs.filter((j) => j.status === "pending").length,
    };
  }, [companies, students, jobs]);

  /* Actions */
  const approveJob = (idx) => {
    const list = [...jobs];
    list[idx].status = "active";
    setJobs(list);
    writeJSON("jobs", list);
    alert("Job approved");
  };

  const rejectJob = (idx) => {
    const list = [...jobs];
    list[idx].status = "inactive";
    setJobs(list);
    writeJSON("jobs", list);
    alert("Job rejected");
  };

  /* ======================
     SECTIONS
  ====================== */
  const JobsSection = () => (
    <div className="hr-panel">
      <div className="hr-panel-header">
        <h2>Job Moderation</h2>
        <button
          className="hr-btn hr-secondary"
          onClick={() =>
            exportExcel(
              jobs.map((j) => ({
                Title: j.title,
                Company: j.company,
                Status: j.status,
              })),
              "job-review"
            )
          }
        >
          Export
        </button>
      </div>

      <table className="hr-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>Status</th>
            <th style={{ width: 260 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j, idx) => (
            <tr key={j.id || idx}>
              <td>{j.title}</td>
              <td>{j.company}</td>
              <td>
                <span className={`hr-pill ${j.status}`}>
                  {j.status}
                </span>
              </td>
              <td className="hr-actions">
                <button
                  className="hr-btn hr-secondary"
                  onClick={() => setViewJob(j)}
                >
                  View
                </button>
                {j.status === "pending" && (
                  <>
                    <button
                      className="hr-btn"
                      onClick={() => approveJob(idx)}
                    >
                      Approve
                    </button>
                    <button
                      className="hr-btn hr-danger"
                      onClick={() => rejectJob(idx)}
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const CompaniesSection = () => (
    <div className="hr-panel">
      <div className="hr-panel-header">
        <h2>Recruiters</h2>
      </div>
      <table className="hr-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Email</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c, i) => (
            <tr key={i}>
              <td>{c.companyName || c.name}</td>
              <td>{c.email}</td>
              <td>{c.contact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const StudentsSection = () => (
    <div className="hr-panel">
      <div className="hr-panel-header">
        <h2>Students</h2>
      </div>
      <table className="hr-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Degree</th>
            <th>Experience</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={i}>
              <td>{`${s.firstName} ${s.lastName}`}</td>
              <td>{s.email}</td>
              <td>{s.degree}</td>
              <td>{s.experience}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="hr-layout">
      <div className="hr-cards">
        <Card title="Recruiters" value={stats.recruiters} />
        <Card title="Students" value={stats.students} />
        <Card title="Jobs" value={stats.jobs} />
        <Card title="Pending Review" value={stats.pending} />
      </div>

      <div className="hr-content">
        <aside className="hr-sidebar">
          <button
            className={`hr-nav ${section === "jobs" ? "active" : ""}`}
            onClick={() => setSection("jobs")}
          >
            Job Moderation
          </button>
          <button
            className={`hr-nav ${section === "companies" ? "active" : ""}`}
            onClick={() => setSection("companies")}
          >
            Recruiters
          </button>
          <button
            className={`hr-nav ${section === "students" ? "active" : ""}`}
            onClick={() => setSection("students")}
          >
            Students
          </button>
        </aside>

        <main className="hr-main">
          {section === "jobs" && <JobsSection />}
          {section === "companies" && <CompaniesSection />}
          {section === "students" && <StudentsSection />}
        </main>
      </div>

      {/* Job Modal */}
      {viewJob && (
        <div className="hr-modal-backdrop" onClick={() => setViewJob(null)}>
          <div
            className="hr-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{viewJob.title}</h3>
            <p><b>Company:</b> {viewJob.company}</p>
            <p><b>Description:</b> {viewJob.description || "-"}</p>
            <button
              className="hr-btn hr-secondary"
              onClick={() => setViewJob(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ======================
         FULLY ISOLATED CSS
      ====================== */}
      <style>{`
.hr-layout {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f3f6fb;
  min-height: 100vh;
}

.hr-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.hr-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.hr-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.hr-card-value {
  font-size: 28px;
  font-weight: 800;
  margin-top: 6px;
  color: #0f172a;
}

.hr-content {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
}

.hr-sidebar {
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hr-nav {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  font-weight: 600;
  cursor: pointer;
}

.hr-nav.active {
  background: #e0e7ff;
  border-color: #c7d2fe;
  color: #3730a3;
}

.hr-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hr-panel {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.hr-panel-header {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  justify-content: space-between;
}

.hr-table {
  width: 100%;
  border-collapse: collapse;
}

.hr-table th,
.hr-table td {
  padding: 12px;
  border-bottom: 1px solid #eef2f7;
  font-size: 14px;
}

.hr-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hr-btn {
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 10px;
  border: none;
  background: #4f46e5;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.hr-secondary {
  background: #fff;
  color: #1f2937;
  border: 1px solid #d1d5db;
}

.hr-danger {
  background: #ef4444;
}

.hr-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.hr-pill.active { background: #dcfce7; color: #166534; }
.hr-pill.pending { background: #fef9c3; color: #92400e; }
.hr-pill.inactive { background: #fee2e2; color: #991b1b; }

.hr-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.hr-modal {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.25);
}

@media (max-width: 900px) {
  .hr-cards { grid-template-columns: repeat(2, 1fr); }
  .hr-content { grid-template-columns: 1fr; }
}
      `}</style>
    </div>
  );
}
