import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ---------------- helpers ---------------- */
const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export default function HRRecruiterDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    location: "",
  });

  const [viewStudent, setViewStudent] = useState(null);

  /* ---------------- auth + data ---------------- */
  useEffect(() => {
    const user = readJSON("currentUser", null);
    if (!user || user.role !== "hr_recruiter") {
      navigate("/");
      return;
    }

    const staticStudent = {
      id: "static-student-1",
      firstName: "Neelam",
      lastName: "Giri",
      email: "neelamgiri283@gmail.com",
      degree: "MBA",
      experience: "3 Years",
      location: "Bhopal",
    };

    const storedStudents = readJSON("users", []).filter(
      (u) => u.userType === "applicant"
    );

    const alreadyExists = storedStudents.some(
      (s) => s.email === staticStudent.email
    );

    setStudents(
      alreadyExists ? storedStudents : [staticStudent, ...storedStudents]
    );

    setJobs(readJSON("jobs", []));
    setApplications(readJSON("jobApplications", []));
  }, [navigate]);

  /* ---------------- derived ---------------- */
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const name = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
      return (
        name.includes(filters.name.toLowerCase()) &&
        (s.email || "")
          .toLowerCase()
          .includes(filters.email.toLowerCase()) &&
        (s.location || "")
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    });
  }, [students, filters]);

  const getApplicationsForStudent = (studentId) => {
    return applications
      .filter((a) => a.userId === studentId)
      .map((a) => ({
        application: a,
        job: jobs.find((j) => j.id === a.jobId),
      }));
  };

  /* ---------------- ui ---------------- */
  return (
    <div className="admin-layout">
      <h2>HR Recruiter Dashboard</h2>
      <p className="subtitle">
        View students and the jobs they have applied to
      </p>

      {/* STATS */}
      <div className="cards-row">
        <div className="card">
          <div className="card-title">Total Students</div>
          <div className="card-value">{students.length}</div>
        </div>
        <div className="card">
          <div className="card-title">Total Applications</div>
          <div className="card-value">{applications.length}</div>
        </div>
      </div>

      {/* PANEL */}
      <div className="panel">
        <div className="panel-header">
          <h3>Students</h3>
        </div>

        {/* FILTER BAR */}
        <div className="filter-bar">
          <input
            placeholder="Name"
            value={filters.name}
            onChange={(e) =>
              setFilters((f) => ({ ...f, name: e.target.value }))
            }
          />
          <input
            placeholder="Email"
            value={filters.email}
            onChange={(e) =>
              setFilters((f) => ({ ...f, email: e.target.value }))
            }
          />
          <input
            placeholder="Location"
            value={filters.location}
            onChange={(e) =>
              setFilters((f) => ({ ...f, location: e.target.value }))
            }
          />
        </div>

        {/* TABLE */}
        <div className="table-wrap">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Degree</th>
                <th>Experience</th>
                <th>Applications</th>
                <th style={{ width: 120 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length ? (
                filteredStudents.map((s, i) => {
                  const apps = getApplicationsForStudent(s.id);
                  return (
                    <tr key={i}>
                      <td>
                        {s.firstName} {s.lastName}
                      </td>
                      <td>{s.email}</td>
                      <td>{s.degree || "-"}</td>
                      <td>{s.experience || "-"}</td>
                      <td>
                        <span className="pill">{apps.length}</span>
                      </td>
                      <td>
                        <button
                          className="btn secondary"
                          onClick={() =>
                            setViewStudent({ student: s, apps })
                          }
                        >
                          👁 View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="empty">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW STUDENT MODAL */}
      {viewStudent && (
        <div className="modal-backdrop" onClick={() => setViewStudent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {viewStudent.student.firstName}{" "}
                {viewStudent.student.lastName}
              </h3>
              <button onClick={() => setViewStudent(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="info-grid">
                <div><strong>Email:</strong> {viewStudent.student.email}</div>
                <div><strong>Degree:</strong> {viewStudent.student.degree}</div>
                <div><strong>Experience:</strong> {viewStudent.student.experience}</div>
                <div><strong>Location:</strong> {viewStudent.student.location}</div>
              </div>

              <h4 style={{ marginTop: 20 }}>
                Applied Jobs ({viewStudent.apps.length})
              </h4>

              {viewStudent.apps.length === 0 ? (
                <div className="empty">No applications yet</div>
              ) : (
                viewStudent.apps.map(({ job, application }, i) => (
                  <div key={i} className="job-card">
                    <div className="job-title">{job?.title}</div>
                    <div className="job-sub">
                      {job?.company} • {job?.location}
                    </div>
                    {application.resume && (
                      <a
                        href={application.resume}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Resume →
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
.admin-layout { padding: 20px; max-width: 1500px; margin: auto; }
.subtitle { color:#6b7280; margin-bottom:16px; }

.cards-row {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:14px;
  margin-bottom:16px;
}
.card {
  background:#fff;
  padding:16px;
  border-radius:14px;
  box-shadow:0 6px 20px rgba(0,0,0,.08);
}
.card-title { font-size:14px; color:#3b82f6; font-weight:700; }
.card-value { font-size:28px; font-weight:900; }

.panel {
  background:#fff;
  border-radius:14px;
  box-shadow:0 6px 20px rgba(0,0,0,.08);
}

.panel-header {
  padding:14px 16px;
  border-bottom:1px solid #eef2f7;
}

.filter-bar {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
  gap:12px;
  padding:16px;
  background:#f8fafc;
}

.filter-bar input {
  height:42px;
  padding:0 12px;
  border-radius:10px;
  border:1px solid #e5e7eb;
}

.table-wrap { overflow:auto; }
.nice-table { width:100%; border-collapse:collapse; }
.nice-table th, .nice-table td {
  padding:12px;
  border-bottom:1px solid #eef2f7;
}
.nice-table th { background:#f8fafc; font-weight:800; }
.nice-table tr:hover td { background:#f1f7ff; }

.btn {
  padding:6px 10px;
  border-radius:10px;
  border:1px solid #d1d5db;
  background:#fff;
  cursor:pointer;
  font-weight:600;
}
.btn.secondary:hover { background:#eef2ff; }

.pill {
  padding:4px 10px;
  border-radius:999px;
  background:#eef2ff;
  color:#1d4ed8;
  font-weight:700;
  font-size:12px;
}

.empty { text-align:center; padding:24px; color:#6b7280; }

.modal-backdrop {
  position:fixed; inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:9999;
}
.modal {
  width:100%;
  max-width:700px;
  background:#fff;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 20px 50px rgba(0,0,0,.3);
}
.modal-header {
  padding:14px 16px;
  border-bottom:1px solid #eef2f7;
  display:flex;
  justify-content:space-between;
}
.modal-body { padding:16px; max-height:70vh; overflow:auto; }

.info-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

.job-card {
  margin-top:12px;
  padding:14px;
  border-radius:12px;
  background:#f9fafb;
  border:1px solid #e5e7eb;
}
.job-title { font-weight:800; color:#0a66c2; }
.job-sub { font-size:13px; color:#6b7280; margin-bottom:6px; }
.job-card a { color:#0a66c2; font-weight:700; }
`}</style>
    </div>
  );
}
