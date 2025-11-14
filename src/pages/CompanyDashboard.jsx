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
    return (jobs || []).filter(
      (j) => j.companyEmail === email || j.postedBy === uid
    );
  }, [jobs, company, currentUser]);

  const BLUE = "#0a66c2";

  return (
    <div
      style={{
        fontFamily: "'Inter','Arial',sans-serif",
        background: "#f3f6fb",
        minHeight: "100vh",
      }}
    >
      {/* --- HEADER SECTION --- */}
      <div
        style={{
          background: `linear-gradient(135deg, ${BLUE}, #0047a8)`,
          color: "#fff",
          padding: "60px 20px 100px",
          textAlign: "center",
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          boxShadow: "0 8px 40px rgba(10,102,194,0.25)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <img
            src={
              company?.profilePic ||
              currentUser?.profilePic ||
              "https://via.placeholder.com/120x120.png?text=Logo"
            }
            alt="profile"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: "4px solid #fff",
              objectFit: "cover",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
              background: "#fff",
            }}
          />
        </div>
        <h1 style={{ margin: 0, fontWeight: 900, fontSize: 30 }}>
          {company?.name || currentUser?.company || "Your Company"}
        </h1>
        <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
          Manage your profile, job listings, and applicants with ease.
        </p>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "100px auto 60px",
          padding: "0 16px",
        }}
      >
        {/* --- ACTION BAR --- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ color: BLUE, fontWeight: 800, margin: "8px 0" }}>
            Dashboard Overview
          </h2>
          <button
            onClick={() => navigate("/post-job")}
            style={btnPrimary}
          >
            + Post New Job
          </button>
        </div>

        {/* --- PROFILE + STATS --- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Company Profile */}
          <div style={card}>
            <h3 style={h3}>Company Profile</h3>
            {company ? (
              <div style={{ display: "grid", gap: 10 }}>
                <Row label="Name" value={company.name} />
                <Row label="Email" value={company.email} />
                <Row label="Contact" value={company.contact} />
              </div>
            ) : (
              <div style={{ color: "#6b7280" }}>
                No company info found. Please register your company.
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={card}>
            <h3 style={h3}>Quick Stats</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                textAlign: "center",
              }}
            >
              <Stat label="Active Jobs" value={myJobs.length} />
              <Stat label="Applicants" value={countApplicants(myJobs)} />
            </div>
          </div>
        </div>

        {/* --- JOBS LIST --- */}
        <section style={card}>
          <h3 style={h3}>Your Job Posts</h3>
          {myJobs.length === 0 ? (
            <div
              style={{
                color: "#6b7280",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              You haven’t posted any jobs yet.
              <button
                onClick={() => navigate("/post-job")}
                style={{
                  ...btnLink,
                  marginLeft: 6,
                }}
              >
                Post one now →
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {myJobs.map((job) => {
                const applicantCount = countApplicantsForJob(job.id);
                return (
                  <div key={job.id} style={jobCard}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Job Details */}
                      <div>
                        <h4
                          style={{
                            margin: "0 0 4px",
                            color: BLUE,
                            fontWeight: 800,
                          }}
                        >
                          {job.title}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                            marginBottom: 4,
                          }}
                        >
                          <span style={pill}>{job.location}</span>
                          <span style={pill}>{job.experienceRange}</span>
                          {job.salary && <span style={pill}>{job.salary}</span>}
                          <span
                            style={{
                              ...pill,
                              background:
                                job.status === "active"
                                  ? "#dcfce7"
                                  : job.status === "pending"
                                  ? "#fef9c3"
                                  : "#fee2e2",
                              color:
                                job.status === "active"
                                  ? "#166534"
                                  : job.status === "pending"
                                  ? "#92400e"
                                  : "#991b1b",
                              fontWeight: 600,
                            }}
                          >
                            {job.status
                              ? job.status.charAt(0).toUpperCase() +
                                job.status.slice(1)
                              : "Unknown"}
                          </span>
                        </div>
                        <div
                          style={{
                            color: "#6b7280",
                            fontSize: 14,
                            marginBottom: 8,
                          }}
                        >
                          Posted on{" "}
                          {new Date(
                            job.createdAt || Date.now()
                          ).toLocaleDateString()}{" "}
                          • {job.company}
                        </div>
                        <button
                          onClick={() =>
                            navigate(`/job-applicants/${job.id}`)
                          }
                          style={btnPrimarySmall}
                        >
                          View Applicants
                        </button>
                      </div>

                      {/* Applicant Count */}
                      <div
                        style={{
                          minWidth: 46,
                          height: 46,
                          borderRadius: "50%",
                          background: "#e0f2fe",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontWeight: 700,
                          color: "#0369a1",
                          fontSize: "0.95em",
                          boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {applicantCount}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* --- COMPONENTS --- */
function Row({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 90, color: "#6b7280" }}>{label}</div>
      <div style={{ color: "#111827", fontWeight: 600 }}>{value || "-"}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 18,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ color: "#6b7280", fontSize: 14 }}>{label}</div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "#111827",
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* --- HELPERS --- */
function countApplicants(jobs) {
  const apps = JSON.parse(localStorage.getItem("jobApplications")) || [];
  const ids = new Set(jobs.map((j) => j.id));
  return apps.filter((a) => ids.has(a.jobId)).length;
}

function countApplicantsForJob(jobId) {
  const apps = JSON.parse(localStorage.getItem("jobApplications")) || [];
  return apps.filter((a) => a.jobId === jobId).length;
}

/* --- STYLES --- */
const card = {
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
  padding: 18,
};

const h3 = {
  marginTop: 0,
  color: "#111827",
  fontWeight: 800,
  fontSize: 18,
};

const btnPrimary = {
  padding: "10px 18px",
  background: "#0a66c2",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(10,102,194,0.3)",
};

const btnPrimarySmall = {
  padding: "8px 14px",
  background: "#0a66c2",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

const btnLink = {
  background: "none",
  border: "none",
  color: "#0a66c2",
  fontWeight: 700,
  cursor: "pointer",
  padding: 0,
};
const pill = {
  background: "#e5e7eb",
  color: "#111827",
  padding: "4px 10px",
  borderRadius: "50px",
  fontSize: "0.85rem",
  fontWeight: 600,
  display: "inline-block",
};

const jobCard = {
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  padding: 16,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  boxShadow: "0 6px 14px rgba(0,0,0,0.05)",
};
