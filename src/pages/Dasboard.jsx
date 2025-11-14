// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || user.userType !== "applicant") {
      navigate("/");
      return;
    }
    setCurrentUser(user);

    const apps = JSON.parse(localStorage.getItem("jobApplications")) || [];
    setApplications(apps.filter((a) => a.userId === user.id));

    const saved = JSON.parse(localStorage.getItem("savedJobs")) || [];
    setSavedJobs(saved.filter((s) => s.userId === user.id));
  }, []);

  if (!currentUser) return <div>Loading...</div>;

  const BLUE = "#0a66c2";

  return (
    <div
      style={{
        fontFamily: "'Inter','Arial',sans-serif",
        background: "#f3f6fb",
        minHeight: "100vh",
      }}
    >
      {/* --- HEADER SECTION (Same as Company Dashboard) --- */}
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
              currentUser?.profilePic ||
              "https://via.placeholder.com/120x120.png?text=Profile"
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
          {currentUser.firstName} {currentUser.lastName}
        </h1>
        <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
          Your personalized space to track applications, saved jobs & career growth.
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
          <h2 style={{ color: BLUE, fontWeight: 800 }}>Dashboard Overview</h2>
          <button
            onClick={() => navigate("/jobs")}
            style={btnPrimary}
          >
            Browse Jobs →
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
          {/* Profile */}
          <div style={card}>
            <h3 style={h3}>Your Profile</h3>
            <div style={{ display: "grid", gap: 10 }}>
              <Row label="Name" value={`${currentUser.firstName} ${currentUser.lastName}`} />
              <Row label="Email" value={currentUser.email} />
              <Row label="Contact" value={currentUser.contact} />
              <Row label="Degree" value={currentUser.degree} />
              <Row label="Experience" value={`${currentUser.experience} years`} />
              <Row label="Location" value={currentUser.location} />
            </div>
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
              <Stat label="Applied Jobs" value={applications.length} />
              <Stat label="Saved Jobs" value={savedJobs.length} />
            </div>
          </div>
        </div>

        {/* --- APPLICATIONS LIST --- */}
        <section style={card}>
          <h3 style={h3}>Your Applications</h3>

          {applications.length === 0 ? (
            <div style={{ textAlign: "center", color: "#6b7280", padding: "20px 0" }}>
              No applications yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {applications.map((app, index) => (
                <div key={index} style={jobCard}>
                  <h4 style={{ margin: "0 0 4px", color: BLUE, fontWeight: 800 }}>
                    {app.jobTitle}
                  </h4>
                  <p style={{ margin: 0, color: "#4b5563" }}>{app.company}</p>

                  <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={pill}>{app.status}</span>
                    <span style={{ color: "#6b7280", fontSize: 14 }}>
                      Applied on: {new Date(app.appliedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- SAVED JOBS LIST --- */}
        <section style={{ ...card, marginTop: 24 }}>
          <h3 style={h3}>Saved Jobs</h3>

          {savedJobs.length === 0 ? (
            <div style={{ textAlign: "center", color: "#6b7280", padding: "20px 0" }}>
              No saved jobs.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {savedJobs.map((job, index) => (
                <div key={index} style={jobCard}>
                  <h4 style={{ margin: "0 0 4px", color: BLUE, fontWeight: 800 }}>
                    {job.title}
                  </h4>
                  <p style={{ margin: 0, color: "#4b5563" }}>{job.company}</p>

                  <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280", fontSize: 14 }}>{job.location}</span>
                    <button
                      style={btnPrimarySmall}
                      onClick={() => navigate(`/job/${job.id}`)}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
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

const pill = {
  background: "#e0f2fe",
  color: "#0369a1",
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
