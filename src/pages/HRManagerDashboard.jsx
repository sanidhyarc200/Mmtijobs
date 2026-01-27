import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */
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
  const single = readJSON("registeredCompany", null);
  const arr = readJSON("registeredCompanies", []);
  if (Array.isArray(arr) && arr.length) return arr;
  return single ? [single] : [];
};
const getStudents = () =>
  (readJSON("users", []) || []).filter(u => u.userType === "applicant");
const getJobs = () => readJSON("jobs", []);
const getApplications = () => readJSON("jobApplications", []);

/* =========================================================
   UI ATOMS
========================================================= */
const StatCard = ({ label, value, accent }) => (
  <div className={`hr-stat-card ${accent}`}>
    <div className="hr-stat-label">{label}</div>
    <div className="hr-stat-value">{value}</div>
  </div>
);

/* =========================================================
   HR MANAGER DASHBOARD (FINAL FORM)
========================================================= */
export default function HRManagerDashboard() {
  const navigate = useNavigate();

  const [section, setSection] = useState("jobs");
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [viewJob, setViewJob] = useState(null);
  const [editModal, setEditModal] = useState({
    type: null,  
    data: null,
    index: null,
  });
  const [viewCompany, setViewCompany] = useState({
    open: false,
    company: null,
    companyJobs: [],
    companyApplicantsMap: {},
  });
  
  const [viewStudent, setViewStudent] = useState({
    open: false,
    student: null,
    applications: [],
  });
  

  /* =========================================================
     AUTH + STATIC DATA INJECTION (ADMIN PARITY)
  ========================================================= */
  useEffect(() => {
    const user = readJSON("currentUser", null);
    if (!user || user.role !== "hr_manager") {
      navigate("/");
      return;
    }

    /* ---------- STATIC COMPANIES ---------- */
    const staticCompanies = [
      { companyName:"Medinatridle heath IIB", email:"contact@medinitriddlehealth.com", contact:"8989954397" },
      { companyName:"Samarth Electrocare", email:"samathelectrocare@gmail.com", contact:"7755990767" },
      { companyName:"Neelanj business Solution LLP", email:"neelanjbusinesssolution@gmail.com", contact:"7998406170" },
      { companyName:"RAJRUDRA Enterprises pvt ltd", email:"rajrudraenterprises.mandeep@gmail.com", contact:"9752319442" },
      { companyName:"Orphic Solution, Bhopal", email:"hr@orphicsolution.com", contact:"9584360388" },
      { companyName:"yokohama pvt ltd engine", email:"yokohama pvt ltd engine", contact:"7697651756" },
      { companyName:"Raj Seeds Trades", email:"hr@rajseeds.co.in", contact:"626200198" },
      { companyName:"Sasthi Enterprises Pvt. Ltd.", email:"hr@harenply.com", contact:"9259538852" },
      { companyName:"GENTRIGO SOLUTIONs", email:"Info.gentrigo@gmail.com", contact:"6265389979" },
      { companyName:"Tendonifoodchemical", email:"tendonifoodchemical@gmail.com", contact:"6269990150" },
      { companyName:"Confidential Company", email:"confidential.hr@example.com", contact:"9000000001" },
      { companyName:"Fitness Tycoon", email:"hr@fitnesstycoon.com", contact:"9000000002" },
      { companyName:"Paraglider Media Private Limited", email:"jobs@paraglider.in", contact:"8269893693" }
    ];
    setCompanies([...staticCompanies, ...getCompanies()]);

    /* ---------- STATIC STUDENT ---------- */
    const staticStudent = {
      id:"static-student-1",
      userType:"applicant",
      firstName:"Neelam",
      lastName:"Giri",
      email:"neelamgiri283@gmail.com",
      degree:"MBA",
      experience:"3 Years",
      skills:"Data Analyst, Operations, Excel",
    };
    const storedStudents = getStudents();
    setStudents(
      storedStudents.some(s => s.email === staticStudent.email)
        ? storedStudents
        : [staticStudent, ...storedStudents]
    );

    /* ---------- STATIC JOBS ---------- */
    const staticJobs = [
      { id:"static-1", title:"HR & Operations Executive", company:"Confidential Company", location:"Bhopal", experienceRange:"2+ years", salary:"₹2–3 LPA", status:"active" },
      { id:"static-2", title:"Nutritionist", company:"Fitness Tycoon", location:"Bhopal", experienceRange:"0–3 years", salary:"₹1.5–3 LPA", status:"active" },
      { id:910001, title:"Graphic Designer", company:"Paraglider Media Private Limited", location:"Bhopal", experienceRange:"0–2 years", salary:"As per industry", status:"active" },
      { id:910002, title:"Motion Graphics Designer", company:"Paraglider Media Private Limited", location:"Bhopal / Indore", experienceRange:"1–3 years", salary:"As per industry", status:"active" },
    ];

    const existingJobs = getJobs();
    const hasStatic = existingJobs.some(j => staticJobs.some(sj => sj.id === j.id));
    const mergedJobs = hasStatic ? existingJobs : [...staticJobs, ...existingJobs];
    if (!hasStatic) writeJSON("jobs", mergedJobs);

    setJobs(mergedJobs);
    setApplications(getApplications());
  }, [navigate]);

  /* =========================================================
     STATS
  ========================================================= */
  const stats = useMemo(() => ({
    recruiters: companies.length,
    applicants: students.length,
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === "active").length,
    pendingJobs: jobs.filter(j => j.status === "pending").length,
  }), [companies, students, jobs]);

  /* =========================================================
     JOB ACTIONS
  ========================================================= */
  const approveJob = (idx) => {
    const list = [...jobs];
    list[idx].status = "active";
    setJobs(list);
    writeJSON("jobs", list);
  };
  const deactivateJob = (idx) => {
    const list = [...jobs];
    list[idx].status = "inactive";
    setJobs(list);
    writeJSON("jobs", list);
  };


  function openCompanyView(company) {
    const jobsList = getJobs();
    const apps = getApplications();
    const users = students;
  
    const email = company?.email || "";
    const name = company?.companyName || company?.name || "";
  
    const companyJobs = jobsList.filter(
      (j) =>
        j.companyEmail === email ||
        j.company === name
    );
  
    const map = {};
    for (const job of companyJobs) {
      const jobApps = apps.filter((a) => a.jobId === job.id);
      map[job.id] = jobApps.map((a) => ({
        application: a,
        user: users.find(
          (u) => u.id === a.userId || u.userId === a.userId
        ),
      }));
    }
  
    setViewCompany({
      open: true,
      company,
      companyJobs,
      companyApplicantsMap: map,
    });
  }
  
  function closeCompanyView() {
    setViewCompany({
      open: false,
      company: null,
      companyJobs: [],
      companyApplicantsMap: {},
    });
  }

  function openStudentView(student) {
    const apps = getApplications();
    const jobsList = getJobs();
  
    const studentApps = apps
      .filter(
        (a) => a.userId === student.id || a.userId === student.userId
      )
      .map((a) => ({
        application: a,
        job: jobsList.find((j) => j.id === a.jobId),
      }));
  
    setViewStudent({
      open: true,
      student,
      applications: studentApps,
    });
  }
  
  function closeStudentView() {
    setViewStudent({
      open: false,
      student: null,
      applications: [],
    });
  }
  
  /* =========================================================
     DERIVED MODAL DATA
  ========================================================= */
  const jobApplicants = viewJob
    ? applications
        .filter(a => a.jobId === viewJob.id)
        .map(a => ({
          ...a,
          user: students.find(s => s.id === a.userId || s.userId === a.userId),
        }))
    : [];

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="hr-layout">
      <div className="hr-content">
        {/* SIDEBAR (ADMIN STYLE) */}
        <aside className="hr-sidebar">
          <div className="sidebar-title">HR Manager</div>
          <button className={section==="jobs"?"active":""} onClick={()=>setSection("jobs")}>Jobs</button>
          <button className={section==="companies"?"active":""} onClick={()=>setSection("companies")}>Recruiters</button>
          <button className={section==="students"?"active":""} onClick={()=>setSection("students")}>Applicants</button>
        </aside>

        {/* MAIN */}
        <main className="hr-main">
        <div className="hr-dashboard-header">
          <h1>HR Operations Dashboard</h1>
        </div>

          {/* STATS */}
          <div className="hr-stats">
            <StatCard label="Recruiters" value={stats.recruiters} accent="blue" />
            <StatCard label="Applicants" value={stats.applicants} accent="green" />
            <StatCard label="Total Jobs" value={stats.totalJobs} accent="indigo" />
            <StatCard label="Active Jobs" value={stats.activeJobs} accent="emerald" />
            <StatCard label="Pending Jobs" value={stats.pendingJobs} accent="amber" />
          </div>

          {/* JOBS */}
          {section==="jobs" && (
            <div className="panel">
              <h2>Jobs</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th><th>Company</th><th>Status</th><th>Applicants</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j,i)=>(
                    <tr key={j.id || i}>
                      <td>{j.title}</td>
                      <td>{j.company}</td>
                      <td><span className={`pill ${j.status}`}>{j.status}</span></td>
                      <td>{applications.filter(a=>a.jobId===j.id).length}</td>
                      <td className="actions">
                        <button className="btn ghost" onClick={()=>setViewJob(j)}>View</button>
                        <button
                          className="btn ghost"
                          onClick={() =>
                            setEditModal({ type: "job", data: { ...j }, index: i })
                          }
                        >
                          Edit
                        </button>

                        {j.status==="pending" && <button className="btn" onClick={()=>approveJob(i)}>Approve</button>}
                        {j.status==="active" && <button className="btn warn" onClick={()=>deactivateJob(i)}>Deactivate</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          

          {/* COMPANIES */}
          {section==="companies" && (
  <div className="panel">
    <h2>Recruiters</h2>

    <table className="table">
      <thead>
        <tr>
          <th>Company</th>
          <th>Email</th>
          <th>Contact</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {companies.map((c, i) => (
          <tr key={i}>
            <td>{c.companyName}</td>
            <td>{c.email}</td>
            <td>{c.contact}</td>
           
            <td>
            <button
            className="btn ghost"
            onClick={() => openCompanyView(c)}
          >
            👁️ View
          </button>
              <button
                className="btn ghost"
                onClick={() =>
                  setEditModal({
                    type: "company",
                    data: { ...c },
                    index: i
                  })
                }
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


          {/* STUDENTS */}
          {section==="students" && (
            <div className="panel">
              <h2>Applicants</h2>
              <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Degree</th>
                  <th>Experience</th>
                  <th>Actions</th>
                </tr>
              </thead>

                <tbody>
                  {students.map((s,i)=>(
                    <tr key={i}>
                    <td>{s.firstName} {s.lastName}</td>
                    <td>{s.email}</td>
                    <td>{s.degree}</td>
                    <td>{s.experience}</td>
                  

                    <td>
                    <button
                    className="btn ghost"
                    onClick={() => openStudentView(s)}
                  >
                    👁️ View
                  </button>
                      <button
                        className="btn ghost"
                        onClick={() =>
                          setEditModal({ type: "student", data: { ...s }, index: i })
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                  
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {editModal.data && (
  <div className="modal-bg" onClick={() => setEditModal({ type:null, data:null, index:null })}>
    <div className="edit-modal" onClick={e => e.stopPropagation()}>

      <div className="edit-modal-header">
        <h2>Edit {editModal.type}</h2>
        <p>Update details carefully</p>
      </div>

      <div className="edit-modal-body">
        {Object.entries(editModal.data).map(([key, value]) =>
          typeof value === "string" ? (
            <div className="edit-field" key={key}>
              <label>{key}</label>
              <input
                value={value}
                onChange={e =>
                  setEditModal(m => ({
                    ...m,
                    data: { ...m.data, [key]: e.target.value }
                  }))
                }
              />
            </div>
          ) : null
        )}
      </div>

      <div className="edit-modal-footer">
        <button
          className="btn ghost"
          onClick={() => setEditModal({ type:null, data:null, index:null })}
        >
          Cancel
        </button>
        <button
          className="btn"
          onClick={() => {
            if (editModal.type === "job") {
              const list = [...jobs];
              list[editModal.index] = editModal.data;
              setJobs(list);
              writeJSON("jobs", list);
            }
            if (editModal.type === "company") {
              const list = [...companies];
              list[editModal.index] = editModal.data;
              setCompanies(list);
            }
            if (editModal.type === "student") {
              const list = [...students];
              list[editModal.index] = editModal.data;
              setStudents(list);
              writeJSON("users", list);
            }
            setEditModal({ type:null, data:null, index:null });
          }}
        >
          Save Changes
        </button>
      </div>

      <button
        className="close-btn"
        onClick={() => setEditModal({ type:null, data:null, index:null })}
      >
        ✕
      </button>

    </div>
  </div>
)}

        </main>
      </div>

{/* ================= JOB VIEW MODAL (PREMIUM) ================= */}
{viewJob && (
  <div className="modal-bg" onClick={() => setViewJob(null)}>
    <div className="job-modal" onClick={(e) => e.stopPropagation()}>
      <div className="job-modal-header">
        <h2>{viewJob.title}</h2>
        <p>{viewJob.company} • {viewJob.location}</p>
      </div>

      <div className="job-modal-body">
        <div className="job-meta">
          <div>
            <strong>Experience</strong>
            <span>{viewJob.experienceRange}</span>
          </div>
          <div>
            <strong>Salary</strong>
            <span>{viewJob.salary}</span>
          </div>
          <div>
            <strong>Status</strong>
            <span className={`pill ${viewJob.status}`}>{viewJob.status}</span>
          </div>
        </div>

        <h3>Applicants ({jobApplicants.length})</h3>
        {jobApplicants.length === 0 && (
          <p className="muted">No applicants yet.</p>
        )}

        {jobApplicants.map((a, i) => (
          <div key={i} className="applicant-card">
            <div className="name">
              {a.user?.firstName} {a.user?.lastName}
            </div>
            <div className="email">{a.user?.email}</div>
            <div className="meta">
              {a.user?.degree} · {a.user?.experience}
            </div>
          </div>
        ))}
      </div>

      <button className="close-btn" onClick={() => setViewJob(null)}>
        ✕
      </button>
    </div>
  </div>
)}

{/* ================= COMPANY VIEW MODAL ================= */}
{viewCompany.open && (
  <div className="modal-bg" onClick={closeCompanyView}>
    <div
      className="company-view-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="company-view-header">
        <h2>{viewCompany.company?.companyName}</h2>
        <p>HR read-only company dashboard</p>
      </div>

      <div className="company-view-body">
        <div className="company-card">
          <h3>Company Profile</h3>
          <p><strong>Email:</strong> {viewCompany.company?.email}</p>
          <p><strong>Contact:</strong> {viewCompany.company?.contact}</p>
        </div>

        <div className="company-card">
          <h3>Stats</h3>
          <div className="stats-grid">
            <div>
              <span>Jobs</span>
              <strong>{viewCompany.companyJobs.length}</strong>
            </div>
            <div>
              <span>Applicants</span>
              <strong>
                {Object.values(viewCompany.companyApplicantsMap).flat().length}
              </strong>
            </div>
          </div>
        </div>

        <div className="company-card">
          <h3>Job Posts</h3>

          {viewCompany.companyJobs.length === 0 && (
            <p className="muted">No jobs posted.</p>
          )}

          {viewCompany.companyJobs.map((job) => (
            <div key={job.id} className="job-block">
              <h4>{job.title}</h4>
              <p>{job.location} • {job.experienceRange}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="close-btn" onClick={closeCompanyView}>
        ✕
      </button>
    </div>
  </div>
)}

{/* ================= STUDENT VIEW MODAL ================= */}
{viewStudent.open && (
  <div className="modal-bg" onClick={closeStudentView}>
    <div
      className="company-view-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="company-view-header">
        <h2>
          {viewStudent.student?.firstName}{" "}
          {viewStudent.student?.lastName}
        </h2>
        <p>Applicant profile · HR view</p>
      </div>

      <div className="company-view-body">
        <div className="company-card">
          <h3>Profile</h3>
          <p><strong>Email:</strong> {viewStudent.student?.email}</p>
          <p><strong>Degree:</strong> {viewStudent.student?.degree}</p>
          <p><strong>Experience:</strong> {viewStudent.student?.experience}</p>
        </div>

        <div className="company-card">
          <h3>Applications</h3>

          {viewStudent.applications.length === 0 && (
            <p className="muted">No applications yet.</p>
          )}

          {viewStudent.applications.map(({ job }, i) => (
            <div key={i} className="job-block">
              <strong>{job?.title}</strong>
              <p>{job?.company} • {job?.location}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="close-btn" onClick={closeStudentView}>
        ✕
      </button>
    </div>
  </div>
)}


      {/* ================= FULL CSS ================= */}
      <style>{`
.hr-layout{background:#f3f6fb;min-height:100vh;padding:16px}
.hr-content{display:grid;grid-template-columns:220px 1fr;gap:16px}
/* ===== PREMIUM SIDEBAR ===== */
.hr-sidebar{
  background:linear-gradient(180deg,#ffffff,#f8fafc);
  border-radius:16px;
  padding:16px 12px;
  box-shadow:
    0 10px 30px rgba(0,0,0,.08),
    inset 0 1px 0 rgba(255,255,255,.6);
  display:flex;
  flex-direction:column;
  gap:6px;
}

.sidebar-title{
  font-weight:800;
  font-size:14px;
  letter-spacing:.08em;
  text-transform:uppercase;
  color:#475569;
  padding:8px 10px 14px;
  border-bottom:1px solid #e5e7eb;
  margin-bottom:6px;
}

/* Sidebar buttons */
.hr-sidebar button{
  all:unset;
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 14px;
  border-radius:12px;
  font-weight:600;
  font-size:14px;
  color:#334155;
  cursor:pointer;
  transition:all .2s ease;
  position:relative;
}

/* Hover */
.hr-sidebar button:hover{
  background:#f1f5ff;
  color:#1d4ed8;
}

/* Active */
.hr-sidebar button.active{
  background:linear-gradient(135deg,#2563eb,#1d4ed8);
  color:#ffffff;
  box-shadow:
    0 8px 20px rgba(37,99,235,.35);
}

/* Active left indicator */
.hr-sidebar button.active::before{
  content:"";
  position:absolute;
  left:0;
  top:8px;
  bottom:8px;
  width:4px;
  border-radius:4px;
  background:#ffffff;
}

.hr-dashboard-header {
  padding: 20px 28px;
  background: linear-gradient(135deg, #f8fafc, #eef2f7);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.hr-dashboard-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #0f172a; /* dark slate */
  letter-spacing: 0.2px;
}

.hr-dashboard-header p {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #475569; /* muted authority */
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.hr-dashboard-header {
  border-left: 4px solid #2563eb; /* calm admin blue */
}

.hr-main{display:flex;flex-direction:column;gap:16px}
.hr-header h1{margin:0;font-size:26px}
.hr-header p{margin:4px 0 0;color:#64748b}

.hr-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.hr-stat-card{background:#fff;border-radius:12px;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,.06);border-left:6px solid}
.hr-stat-card.blue{border-color:#3b82f6}
.hr-stat-card.green{border-color:#22c55e}
.hr-stat-card.indigo{border-color:#6366f1}
.hr-stat-card.emerald{border-color:#10b981}
.hr-stat-card.amber{border-color:#f59e0b}
.hr-stat-label{font-size:13px;color:#64748b}
.hr-stat-value{font-size:28px;font-weight:800}

.panel{background:#fff;border-radius:12px;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,.06)}
.panel h2{margin:0 0 12px}

.table{width:100%;border-collapse:collapse}
.table th{font-size:12px;color:#64748b;text-transform:uppercase;padding:12px;border-bottom:1px solid #e5e7eb}
.table td{padding:12px;border-bottom:1px solid #f1f5f9}

/* ===================== TABLE UI IMPROVEMENTS ===================== */

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
}

/* Header */
.table thead th {
  text-align: left;
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #475569;
  background: linear-gradient(180deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

/* Body cells */
.table tbody td {
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  white-space: nowrap;
}

/* Last row cleanup */
.table tbody tr:last-child td {
  border-bottom: none;
}

/* Row hover */
.table tbody tr {
  transition: background 0.15s ease;
}

.table tbody tr:hover {
  background: #f8fafc;
}

/* Actions column fix */
.table td.actions,
.table th.actions {
  text-align: right;
  padding-right: 20px;
}

/* Action buttons alignment */
.table td.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

/* Pills inside tables */
.table .pill {
  display: inline-block;
  font-weight: 700;
  font-size: 12px;
  text-transform: capitalize;
}

/* Column visual rhythm */
.table td,
.table th {
  box-sizing: border-box;
}

/* Improve readability on narrow screens */
@media (max-width: 900px) {
  .table {
    display: block;
    overflow-x: auto;
  }

  .table thead th,
  .table tbody td {
    padding: 12px 14px;
  }
}
/* ===================== TABLE POLISH ===================== */

/* Slight row separation for breathing room */
.table tbody tr {
  background: #ffffff;
}

.table tbody tr:not(:last-child) td {
  border-bottom: 1px solid #eef2f7;
}

/* Zebra – VERY subtle (enterprise style) */
.table tbody tr:nth-child(even) {
  background: #fbfdff;
}

/* Hover = soft highlight, not aggressive */
.table tbody tr:hover {
  background: #f1f5ff;
}

/* ===================== ACTIONS COLUMN ===================== */

.table th.actions {
  text-align: right;
  padding-right: 22px;
}

.table td.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px; /* improved spacing */
}

/* ===================== BUTTON REFINEMENT ===================== */

.table .btn {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 10px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s ease;
  white-space: nowrap;
}

/* Ghost buttons (View / Edit) */
.table .btn.ghost {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #dbeafe;
}

.table .btn.ghost:hover {
  background: #dbeafe;
  color: #1e40af;
  transform: translateY(-1px);
}

/* Primary buttons (Approve / Activate) */
.table .btn:not(.ghost):not(.warn) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.table .btn:not(.ghost):not(.warn):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.45);
}

/* Warning buttons (Deactivate) */
.table .btn.warn {
  background: #fff1f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.table .btn.warn:hover {
  background: #fee2e2;
  transform: translateY(-1px);
}

/* ===================== TABLE HEADER POLISH ===================== */

.table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}

/* ===================== EMPTY STATE (OPTIONAL BUT NICE) ===================== */

.table tbody tr.empty-row td {
  text-align: center;
  padding: 26px;
  font-size: 14px;
  color: #64748b;
  background: #f8fafc;
}

/* ===================== MOBILE FRIENDLY ===================== */

@media (max-width: 900px) {
  .table td.actions {
    gap: 6px;
  }

  .table .btn {
    padding: 6px 10px;
    font-size: 11px;
  }
}

/* ===================== HARD ALIGNMENT FIX ===================== */

/* Force identical box model for th & td */
.table th,
.table td {
  padding-left: 18px !important;
  padding-right: 18px !important;
  box-sizing: border-box;
  vertical-align: middle;
}

/* Text alignment consistency */
.table th {
  text-align: left;
}

.table td {
  text-align: left;
}

/* Fix flex content (buttons / pills) shifting left */
.table td > *,
.table td span,
.table td div {
  margin-left: 0;
}

/* Actions column: isolate alignment */
.table th.actions,
.table td.actions {
  text-align: right !important;
}

/* Prevent flex from breaking column alignment */
.table td.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-left: 18px !important;
}

/* Pills alignment normalization */
.table td .pill {
  position: relative;
  top: 1px; /* visual centering */
}

/* Prevent invisible whitespace from fonts */
.table th,
.table td {
  line-height: 1.4;
}

/* Kill browser default table quirks */
.table {
  table-layout: fixed;
}

/* Optional: consistent column rhythm */
.table th:nth-child(1),
.table td:nth-child(1) { padding-left: 20px !important; }

.table th:last-child,
.table td:last-child { padding-right: 20px !important; }

.actions{display:flex;gap:8px}
.btn{padding:6px 12px;border-radius:8px;border:none;font-weight:600;cursor:pointer;background:#0a66c2;color:#fff}
.btn.warn{background:#fee2e2;color:#991b1b}
.btn.ghost{background:#eff6ff;color:#0a66c2}

.pill.active{color:#16a34a;font-weight:700}
.pill.pending{color:#ca8a04;font-weight:700}
.pill.inactive{color:#dc2626;font-weight:700}

.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:50}
.job-modal{background:#fff;width:720px;max-height:90vh;border-radius:16px;overflow:hidden;position:relative}
.job-modal-header{background:linear-gradient(135deg,#0a66c2,#0047a8);color:#fff;padding:24px}
.job-modal-body{padding:24px}
.job-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
.job-meta div{background:#f8fafc;padding:12px;border-radius:10px}
.job-meta strong{display:block;font-size:12px;color:#64748b}
.applicant-card{border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin-bottom:10px}
.applicant-card .name{font-weight:700}
.applicant-card .email{color:#2563eb;font-size:13px}
.applicant-card .meta{font-size:13px;color:#64748b}
.close-btn{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.9);border:none;border-radius:8px;padding:4px 8px;cursor:pointer}

@media(max-width:1000px){
  .hr-content{grid-template-columns:1fr}
  .hr-stats{grid-template-columns:repeat(2,1fr)}
  
}

/* ===== EDIT MODAL ===== */
.edit-modal{
  background:#fff;
  width:620px;
  max-height:85vh;
  border-radius:18px;
  overflow:hidden;
  position:relative;
  box-shadow:0 30px 80px rgba(0,0,0,.25);
}

.edit-modal-header{
  padding:24px;
  background:linear-gradient(135deg,#2563eb,#1d4ed8);
  color:#fff;
}

.edit-modal-header h2{
  margin:0;
  font-size:20px;
}

.edit-modal-header p{
  margin-top:6px;
  font-size:13px;
  opacity:.85;
}

.edit-modal-body{
  padding:24px;
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:16px;
}

.edit-field{
  display:flex;
  flex-direction:column;
  gap:6px;
}

.edit-field label{
  font-size:12px;
  font-weight:600;
  color:#475569;
  text-transform:capitalize;
}

.edit-field input{
  padding:10px 12px;
  border-radius:10px;
  border:1px solid #e5e7eb;
  font-weight:500;
}

.edit-modal-footer{
  padding:16px 24px;
  display:flex;
  justify-content:flex-end;
  gap:12px;
  border-top:1px solid #e5e7eb;
}
  .company-view-modal{
  background:#fff;
  width:900px;
  max-height:90vh;
  border-radius:16px;
  overflow:hidden;
  position:relative;
}

.company-view-header{
  background:linear-gradient(135deg,#0a66c2,#0047a8);
  color:#fff;
  padding:40px;
  text-align:center;
}

.company-view-body{
  padding:24px;
  background:#f3f6fb;
  overflow-y:auto;
}

.company-card{
  background:#fff;
  padding:20px;
  border-radius:14px;
  margin-bottom:16px;
  box-shadow:0 6px 20px rgba(0,0,0,.06);
}

.stats-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  text-align:center;
}

.job-block{
  background:#f9fbff;
  border:1px solid #e5e9ff;
  padding:14px;
  border-radius:12px;
  margin-bottom:10px;
}


      `}</style>
    </div>
  );
}
