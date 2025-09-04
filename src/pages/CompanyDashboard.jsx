// src/pages/CompanyDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem("currentUser")));
    setCompany(JSON.parse(localStorage.getItem("registeredCompany")));
    setJobs(JSON.parse(localStorage.getItem("jobs")) || []);
  }, []);

  const myJobs = useMemo(() => {
    if (!company && !currentUser) return [];
    const email = currentUser?.email || company?.email;
    const uid = currentUser?.id;
    return (jobs || []).filter(j => j.companyEmail === email || j.postedBy === uid);
  }, [jobs, company, currentUser]);

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: "0 16px", fontFamily: "'Inter','Arial',sans-serif" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, color: "#0a66c2" }}>{company?.name || currentUser?.company || "Your Company"}</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
            Manage your profile and job postings.
          </p>
        </div>
        <button onClick={() => navigate("/post-job")} style={btnPrimary}>Post a Job</button>
      </header>

      {/* Profile + Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={card}>
          <h3 style={h3}>Company Profile</h3>
          {company ? (
            <div style={{ display: "grid", gap: 8 }}>
              <Row label="Name" value={company.name} />
              <Row label="Email" value={company.email} />
              <Row label="Contact" value={company.contact} />
            </div>
          ) : (
            <div style={{ color: "#6b7280" }}>No company info found. Please register your company.</div>
          )}
        </div>

        <div style={card}>
          <h3 style={h3}>Quick Stats</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Stat label="Active Jobs" value={myJobs.length} />
            <Stat label="Applicants" value={countApplicants(myJobs)} />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <section style={card}>
        <h3 style={h3}>Your Job Posts</h3>
        {myJobs.length === 0 ? (
          <div style={{ color: "#6b7280" }}>
            You haven’t posted any jobs yet.
            <button onClick={() => navigate("/post-job")} style={{ ...btnLink, marginLeft: 8 }}>Post one now →</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
         {myJobs.map(job => (
          <div key={job.id} style={jobCard}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h4 style={{ margin: 0, color: "#0a66c2" }}>{job.title}</h4>
                <span style={pill}>{job.location}</span>
                <span style={pill}>{job.experienceRange}</span>
                {job.salary && <span style={pill}>{job.salary}</span>}
              </div>
              <div style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
                Posted on {new Date(job.createdAt || Date.now()).toLocaleDateString()} • {job.company}
              </div>

              <button
                onClick={() => navigate(`/job-applicants/${job.id}`)}
                style={{ ...btnPrimary, marginTop: 10 }}
              >
                View Applicants
              </button>
            </div>
          </div>
        ))}

          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ minWidth: 90, color: "#6b7280" }}>{label}</div>
      <div style={{ color: "#111827", fontWeight: 600 }}>{value || "-"}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <div style={{ color: "#6b7280", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#111827" }}>{value}</div>
    </div>
  );
}

function countApplicants(jobs) {
  const apps = JSON.parse(localStorage.getItem("jobApplications")) || [];
  const ids = new Set(jobs.map(j => j.id));
  return apps.filter(a => ids.has(a.jobId)).length;
}

/* styles */
const card = { background: "#fff", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", padding: 16 };
const h3 = { marginTop: 0, color: "#111827" };
const btnPrimary = { padding: "10px 16px", background: "#0a66c2", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" };
const btnLink = { background: "none", border: "none", color: "#0a66c2", fontWeight: 700, cursor: "pointer", padding: 0 };
const jobCard = { background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 14 };
const pill = { background: "#f3f4f6", color: "#374151", borderRadius: 999, padding: "3px 10px", fontSize: 12 };
const tag = { background: "#e5e7eb", color: "#374151", borderRadius: 12, padding: "3px 8px", fontSize: 12 };
