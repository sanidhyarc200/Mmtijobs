// src/pages/JobApplicants.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function JobApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Load job
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    setJob(jobs.find((j) => j.id === parseInt(jobId)));

    // Load applicants
    const apps = JSON.parse(localStorage.getItem("jobApplications")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const matched = apps
      .filter((a) => a.jobId === parseInt(jobId))
      .map((a) => {
        const user = users.find((u) => u.id === a.userId);
        return { ...a, user };
      });

    setApplicants(matched);
  }, [jobId]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Applicants for Job #{jobId}</h2>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
      </div>

      <div style={styles.split}>
        {/* Left: Job Info */}
        <div style={styles.jobCard}>
          {job ? (
            <>
              <h3 style={styles.jobTitle}>{job.title}</h3>
              <div style={styles.jobMeta}>
                <span style={styles.pill}>{job.location}</span>
                <span style={styles.pill}>{job.salary}</span>
                <span style={styles.pill}>{job.experienceRange}</span>
                <span style={styles.pill}>{job.jobType}</span>
              </div>
              <p style={styles.jobCompany}>{job.company}</p>
              <p style={styles.jobDesc}>{job.description}</p>
            </>
          ) : (
            <p style={styles.empty}>Job details not found.</p>
          )}
        </div>

        {/* Right: Candidates */}
        <div style={styles.candGrid}>
          {applicants.length === 0 ? (
            <p style={styles.empty}>No applicants yet for this job.</p>
          ) : (
            applicants.map((a, i) => {
              const u = a.user || {};
              const fullName =
                `${u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim() || u.email;
              return (
                <div
                  key={i}
                  style={styles.candCard}
                  onClick={() => setSelected(u)}
                >
                  <div style={styles.avatar}>
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={styles.candName}>{fullName}</h4>
                    <p style={styles.candDetail}>📧 {u.email}</p>
                    {u.contact && <p style={styles.candDetail}>📞 {u.contact}</p>}
                    <p style={styles.candDetail}>
                      🎓 {u.degree || "-"} • {u.passout || "-"}
                    </p>
                    {u.experience && (
                      <p style={styles.candDetail}>💼 {u.experience} yrs</p>
                    )}
                  </div>
                  {u.cv?.url && (
                    <span style={styles.resumeChip}>Resume</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.modalHeader}>
              <div style={styles.avatarBig}>
                {(`${selected.firstName || ""} ${selected.lastName || ""}`)
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>
                  {`${selected.firstName || ""} ${selected.middleName || ""} ${selected.lastName || ""}`.trim()}
                </h2>
                <p style={{ color: "#6b7280" }}>{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={styles.modalBody}>
              <section style={styles.section}>
                <h4 style={styles.sectionTitle}>Contact Info</h4>
                <p><strong>Phone:</strong> {selected.contact || "—"}</p>
                <p><strong>Location:</strong> {selected.location || "—"}</p>
                <p><strong>Notice Period:</strong> {selected.noticePeriod || "—"} days</p>
              </section>

              <section style={styles.section}>
                <h4 style={styles.sectionTitle}>Education</h4>
                <p><strong>Degree:</strong> {selected.degree || "—"}</p>
                <p><strong>Passout Year:</strong> {selected.passout || "—"}</p>
              </section>

              <section style={styles.section}>
                <h4 style={styles.sectionTitle}>Experience</h4>
                <p><strong>Total Exp:</strong> {selected.experience || "—"} years</p>
                <p><strong>Last Salary:</strong> {selected.lastSalary || "—"} LPA</p>
                <p><strong>Current Salary:</strong> {selected.currentSalary || "—"} LPA</p>
              </section>

              <section style={styles.section}>
                <h4 style={styles.sectionTitle}>Skills</h4>
                <p>{selected.skills || "—"}</p>
                <p><strong>Tech Stack:</strong> {selected.techstack || "—"}</p>
              </section>

              <section style={styles.section}>
                <h4 style={styles.sectionTitle}>About Candidate</h4>
                <p>{selected.description || "No description provided."}</p>
              </section>

              <section style={styles.section}>
                <h4 style={styles.sectionTitle}>Resume</h4>
                {selected.cv?.url ? (
                  <a
                    href={selected.cv.url}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.resumeLink}
                  >
                    View Resume →
                  </a>
                ) : (
                  <p>No resume uploaded.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Styles */
const styles = {
  container: { maxWidth: 1200, margin: "40px auto", padding: "0 16px", fontFamily: "'Inter','Arial',sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: "1.8rem", fontWeight: 800, color: "#0a66c2" },
  backBtn: { padding: "8px 14px", borderRadius: 8, background: "#f3f4f6", border: "1px solid #d1d5db", cursor: "pointer", fontWeight: 600 },
  split: { display: "grid", gridTemplateColumns: "2fr 3fr", gap: 20, alignItems: "flex-start" },

  // Job Card
  jobCard: { background: "#fff", padding: 20, borderRadius: 14, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" },
  jobTitle: { margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#111827" },
  jobMeta: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 },
  pill: { background: "#eff6ff", color: "#1e40af", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 },
  jobCompany: { margin: "10px 0", fontWeight: 600, color: "#374151" },
  jobDesc: { color: "#6b7280", marginTop: 10, fontSize: 15 },

  // Candidates Grid
  candGrid: { display: "grid", gap: 14 },
  candCard: { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #e5e7eb", padding: 14, borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.05)", cursor: "pointer", transition: "all 0.2s" },
  avatar: { width: 40, height: 40, borderRadius: "50%", background: "#0a66c2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 },
  candName: { margin: 0, fontSize: "1rem", fontWeight: 700, color: "#111827" },
  candDetail: { margin: "2px 0", fontSize: 13, color: "#6b7280" },
  resumeChip: { background: "#dbeafe", color: "#1e40af", padding: "4px 8px", borderRadius: 8, fontSize: 12, fontWeight: 600 },

  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 14, padding: 24, width: "90%", maxWidth: 650, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 12px 40px rgba(0,0,0,0.25)" },
  modalHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 },
  avatarBig: { width: 60, height: 60, borderRadius: "50%", background: "#0a66c2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22 },
  closeBtn: { marginLeft: "auto", border: "none", background: "#f3f4f6", borderRadius: 8, width: 32, height: 32, cursor: "pointer" },
  modalBody: { color: "#374151", fontSize: 15, lineHeight: 1.6 },
  resumeLink: { color: "#0a66c2", fontWeight: 700, textDecoration: "none" },
  section: { marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #e5e7eb" },
  sectionTitle: { margin: "0 0 8px", fontSize: "1rem", fontWeight: 700, color: "#0a66c2" },
  empty: { color: "#6b7280", textAlign: "center", marginTop: 40 },
};
