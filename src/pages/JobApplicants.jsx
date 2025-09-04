// src/pages/JobApplicants.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function JobApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
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
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h2 style={{ color: "#0a66c2" }}>Applicants for Job #{jobId}</h2>
      <button onClick={() => navigate(-1)} style={{ margin: "10px 0", padding: "6px 12px", borderRadius: 8, border: "1px solid #ccc" }}>
        ← Back
      </button>

      {applicants.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No applicants yet for this job.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
          {applicants.map((a, i) => (
            <div key={i} style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 12, background: "#fff" }}>
             <h3 style={{ margin: 0, color: "#111827" }}>
                {a.user
                    ? `${a.user.firstName || ""} ${a.user.lastName || ""}`.trim() || a.user.email
                    : "Unknown Candidate"}
                </h3>
              <p style={{ margin: "4px 0", color: "#6b7280" }}>{a.user?.email}</p>
              {a.user?.resume && (
                <a href={a.user.resume} target="_blank" rel="noreferrer" style={{ color: "#0a66c2", fontWeight: 600 }}>
                  View Resume
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
