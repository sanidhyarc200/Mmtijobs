import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

/* ===============================
   STORAGE HELPERS (ADMIN-LEVEL)
================================ */
const readJSON = (k, f) => {
  try {
    const r = localStorage.getItem(k);
    return r ? JSON.parse(r) : f;
  } catch {
    return f;
  }
};
const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const getCompanies = () => {
  const single = readJSON("registeredCompany", null);
  const arr = readJSON("registeredCompanies", []);
  if (Array.isArray(arr) && arr.length) return arr;
  return single ? [single] : [];
};
const getStudents = () =>
  (readJSON("users", []) || []).filter((u) => u.userType === "applicant");
const getJobs = () => readJSON("jobs", []);
const getApplications = () => readJSON("jobApplications", []);

/* ===============================
   UI ATOMS
================================ */
const StatCard = ({ label, value }) => (
  <div className="gm-stat">
    <div className="gm-stat-label">{label}</div>
    <div className="gm-stat-value">{value}</div>
  </div>
);

/* ===============================
   HR MANAGER DASHBOARD (GOD MODE)
================================ */
export default function HRManagerDashboard() {
  const navigate = useNavigate();

  const [section, setSection] = useState("jobs");
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [edit, setEdit] = useState(null);

  /* AUTH */
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

  /* STATS */
  const stats = useMemo(() => ({
    companies: companies.length,
    students: students.length,
    jobs: jobs.length,
    pending: jobs.filter(j => j.status === "pending").length,
  }), [companies, students, jobs]);

  /* ACTIONS */
  const saveEdit = () => {
    if (edit.type === "job") {
      const list = [...jobs];
      list[edit.index] = edit.data;
      setJobs(list);
      writeJSON("jobs", list);
    }
    if (edit.type === "company") {
      const list = [...companies];
      list[edit.index] = edit.data;
      setCompanies(list);
      writeJSON("registeredCompanies", list);
    }
    if (edit.type === "student") {
      const list = [...students];
      list[edit.index] = edit.data;
      setStudents(list);
      writeJSON("users", list);
    }
    setEdit(null);
  };

  /* ===============================
     SECTIONS
================================ */
  const Jobs = () => (
    <div className="gm-panel">
      <h2>Jobs Control Center</h2>
      <table className="gm-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>Status</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j, i) => (
            <tr key={i}>
              <td>{j.title}</td>
              <td>{j.company}</td>
              <td><span className={`gm-pill ${j.status}`}>{j.status}</span></td>
              <td>{j.location}</td>
              <td className="gm-actions">
                <button onClick={() => setEdit({ type:"job", index:i, data:{...j} })}>Edit</button>
                <button onClick={() => {
                  const l=[...jobs]; l[i].status="active"; setJobs(l); writeJSON("jobs",l);
                }}>Approve</button>
                <button className="danger" onClick={() => {
                  const l=[...jobs]; l[i].status="inactive"; setJobs(l); writeJSON("jobs",l);
                }}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const Companies = () => (
    <div className="gm-panel">
      <h2>Recruiters</h2>
      <table className="gm-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Contact</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {companies.map((c,i)=>(
            <tr key={i}>
              <td>{c.companyName||c.name}</td>
              <td>{c.email}</td>
              <td>{c.contact}</td>
              <td>
                <button onClick={()=>setEdit({type:"company",index:i,data:{...c}})}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const Students = () => (
    <div className="gm-panel">
      <h2>Students</h2>
      <table className="gm-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Degree</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {students.map((s,i)=>(
            <tr key={i}>
              <td>{s.firstName} {s.lastName}</td>
              <td>{s.email}</td>
              <td>{s.degree}</td>
              <td>
                <button onClick={()=>setEdit({type:"student",index:i,data:{...s}})}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="gm-layout">
      <header className="gm-top">
        <h1>HR Operations Dashboard</h1>
      </header>

      <div className="gm-stats">
        <StatCard label="Recruiters" value={stats.companies} />
        <StatCard label="Students" value={stats.students} />
        <StatCard label="Jobs" value={stats.jobs} />
        <StatCard label="Pending Jobs" value={stats.pending} />
      </div>

      <div className="gm-body">
        <aside className="gm-sidebar">
          <button onClick={()=>setSection("jobs")} className={section==="jobs"?"active":""}>Jobs</button>
          <button onClick={()=>setSection("companies")} className={section==="companies"?"active":""}>Companies</button>
          <button onClick={()=>setSection("students")} className={section==="students"?"active":""}>Students</button>
        </aside>

        <main className="gm-main">
          {section==="jobs" && <Jobs/>}
          {section==="companies" && <Companies/>}
          {section==="students" && <Students/>}
        </main>
      </div>

      {edit && (
        <div className="gm-modal-bg" onClick={()=>setEdit(null)}>
          <div className="gm-modal" onClick={e=>e.stopPropagation()}>
            <h3>Edit {edit.type}</h3>
            {Object.keys(edit.data).map(k=>(
              typeof edit.data[k]==="string" &&
              <input key={k} value={edit.data[k]} onChange={e=>{
                setEdit({...edit,data:{...edit.data,[k]:e.target.value}});
              }} placeholder={k}/>
            ))}
            <button onClick={saveEdit}>Save</button>
          </div>
        </div>
      )}

      <style>{`
/* GOD MODE CSS */
.gm-layout{min-height:100vh;background:#0f172a;color:#fff;padding:24px}
.gm-top h1{margin:0;font-size:26px}
.gm-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:20px 0}
.gm-stat{background:#111827;padding:20px;border-radius:14px}
.gm-stat-label{opacity:.7}
.gm-stat-value{font-size:34px;font-weight:800}
.gm-body{display:grid;grid-template-columns:240px 1fr;gap:20px}
.gm-sidebar{background:#020617;padding:16px;border-radius:14px;display:flex;flex-direction:column;gap:10px}
.gm-sidebar button{all:unset;padding:12px;border-radius:10px;cursor:pointer}
.gm-sidebar .active{background:#4f46e5}
.gm-panel{background:#020617;padding:20px;border-radius:16px}
.gm-table{width:100%;border-collapse:collapse}
.gm-table th,.gm-table td{padding:14px;border-bottom:1px solid #1e293b}
.gm-actions button{margin-right:6px}
.gm-pill.active{color:#22c55e}
.gm-pill.pending{color:#facc15}
.gm-pill.inactive{color:#ef4444}
.gm-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center}
.gm-modal{background:#020617;padding:20px;border-radius:14px;width:420px}
.gm-modal input{width:100%;margin-bottom:8px;padding:10px}
@media(max-width:900px){
  .gm-body{grid-template-columns:1fr}
  .gm-stats{grid-template-columns:repeat(2,1fr)}
}
      `}</style>
    </div>
  );
}
