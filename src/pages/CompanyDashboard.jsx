// src/pages/CompanyDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    contact: "",
    description: "",
    address: "",
    website: "",
    profilePic: "",
  });

  const BLUE = "#0a66c2";

  useEffect(() => {
    const cu = JSON.parse(localStorage.getItem("currentUser"));
    const comp = JSON.parse(localStorage.getItem("registeredCompany"));

    setCurrentUser(cu);
    setCompany(comp);

    if (comp) {
      setEditData({
        name: comp.name || "",
        contact: comp.contact || "",
        description: comp.description || "",
        address: comp.address || "",
        website: comp.website || "",
        profilePic: comp.profilePic || "",
      });
    }

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

      {/* MAIN CONTENT */}
      <div
        style={{
          maxWidth: 1100,
          margin: "100px auto 60px",
          padding: "0 16px",
        }}
      >

        {/* ACTION BAR */}
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

          <button onClick={() => navigate("/post-job")} style={btnPrimary}>
            + Post New Job
          </button>
        </div>

        {/* PROFILE + STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* PROFILE CARD */}
          <div style={card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={h3}>Company Profile</h3>

              <button
                onClick={() => setShowEditModal(true)}
                style={{
                  ...btnPrimarySmall,
                  padding: "6px 12px",
                  background: BLUE,
                  fontSize: 13,
                }}
              >
                Edit
              </button>
            </div>

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

          {/* STATS CARD */}
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

        {/* JOB LIST */}
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
                style={{ ...btnLink, marginLeft: 6 }}
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

      {/* ======================================================
         EDIT PROFILE MODAL — Correct Placement
      ======================================================= */}
      {showEditModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: 500,
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <h3 style={{ marginTop: 0, color: BLUE, fontWeight: 800 }}>
              Edit Company Profile
            </h3>

            <label style={labelStyle}>Company Name</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              style={inputStyle}
            />

            <label style={labelStyle}>Email (Locked)</label>
            <input
              type="text"
              value={company.email}
              disabled
              style={{
                ...inputStyle,
                background: "#f3f4f6",
                cursor: "not-allowed",
              }}
            />

            <label style={labelStyle}>Contact</label>
            <input
              type="text"
              value={editData.contact}
              onChange={(e) =>
                setEditData({ ...editData, contact: e.target.value })
              }
              style={inputStyle}
            />

            <label style={labelStyle}>Description</label>
            <textarea
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              style={{ ...inputStyle, height: 80 }}
            />

            <label style={labelStyle}>Address</label>
            <textarea
              value={editData.address}
              onChange={(e) =>
                setEditData({ ...editData, address: e.target.value })
              }
              style={{ ...inputStyle, height: 70 }}
            />

            <label style={labelStyle}>Website</label>
            <input
              type="text"
              value={editData.website}
              onChange={(e) =>
                setEditData({ ...editData, website: e.target.value })
              }
              style={inputStyle}
            />

            <label style={labelStyle}>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = () =>
                  setEditData({ ...editData, profilePic: reader.result });

                reader.readAsDataURL(file);
              }}
              style={inputStyle}
            />

            {editData.profilePic && (
              <img
                src={editData.profilePic}
                alt="preview"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  marginTop: 10,
                  objectFit: "cover",
                  border: "2px solid #ddd",
                }}
              />
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
                gap: 10,
              }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  ...btnPrimarySmall,
                  background: "#e5e7eb",
                  color: "#374151",
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const updated = { ...company, ...editData };
                  localStorage.setItem(
                    "registeredCompany",
                    JSON.stringify(updated)
                  );
                  setCompany(updated);
                  setShowEditModal(false);
                }}
                style={{ ...btnPrimarySmall, background: BLUE, color: "#fff" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== COMPONENTS ===== */

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
      <div style={{ fontSize: 26, fontWeight: 800, color: "#111827" }}>
        {value}
      </div>
    </div>
  );
}

/* ===== HELPERS ===== */

function countApplicants(jobs) {
  const apps = JSON.parse(localStorage.getItem("jobApplications")) || [];
  const ids = new Set(jobs.map((j) => j.id));
  return apps.filter((a) => ids.has(a.jobId)).length;
}

function countApplicantsForJob(jobId) {
  const apps = JSON.parse(localStorage.getItem("jobApplications")) || [];
  return apps.filter((a) => a.jobId === jobId).length;
}

/* ===== STYLES ===== */

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

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  marginTop: 6,
  fontSize: 14,
};

const labelStyle = {
  fontWeight: 600,
  marginTop: 12,
};
