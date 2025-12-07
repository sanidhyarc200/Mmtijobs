// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [showEdit, setShowEdit] = useState(false);

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
        background: "#eef3f9",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: `linear-gradient(135deg, ${BLUE}, #0047a8)`,
          color: "#fff",
          padding: "70px 20px 120px",
          textAlign: "center",
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          boxShadow: "0 10px 50px rgba(10,102,194,0.25)",
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
          {/* Perfect circular fixed-size image */}
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: "50%",
              overflow: "hidden",
              border: "5px solid #fff",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
              background: "#fff",
            }}
          >
            <img
              src={
                currentUser?.profilePic ||
                "https://via.placeholder.com/130.png?text=Profile"
              }
              alt="profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        <h1 style={{ marginTop: 60, fontWeight: 900, fontSize: 32 }}>
          {currentUser.firstName} {currentUser.lastName}
        </h1>
        <p style={{ margin: "6px 0 0", opacity: 0.9 }}>
          Track your applications & saved jobs.
        </p>
      </div>

      {/* BODY */}
      <div
        style={{
          maxWidth: 1100,
          margin: "80px auto 60px",
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
          <h2 style={{ color: BLUE, fontWeight: 800 }}>Dashboard Overview</h2>
          <button style={btnPrimary} onClick={() => navigate("/jobs")}>
            Browse Jobs →
          </button>
        </div>

        {/* PROFILE + STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 18,
            marginBottom: 24,
          }}
        >
          {/* PROFILE CARD */}
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

            <button
              onClick={() => setShowEdit(true)}
              style={{
                marginTop: 16,
                padding: "9px 16px",
                background: BLUE,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                boxShadow: "0 4px 16px rgba(10,102,194,0.3)",
              }}
            >
              Edit Profile
            </button>
          </div>

          {/* STATS CARD */}
          <div style={card}>
            <h3 style={h3}>Quick Stats</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                textAlign: "center",
              }}
            >
              <Stat label="Applied Jobs" value={applications.length} />
              <Stat label="Saved Jobs" value={savedJobs.length} />
            </div>
          </div>
        </div>

        {/* APPLICATIONS */}
        <section style={card}>
          <h3 style={h3}>Your Applications</h3>

          {applications.length === 0 ? (
            <div style={emptyText}>No applications yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {applications.map((app, index) => (
                <div key={index} style={jobCard}>
                  <h4 style={{ margin: 0, color: BLUE, fontWeight: 800 }}>
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

        {/* SAVED JOBS */}
        <section style={{ ...card, marginTop: 24 }}>
          <h3 style={h3}>Saved Jobs</h3>

          {savedJobs.length === 0 ? (
            <div style={emptyText}>No saved jobs.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {savedJobs.map((job, index) => (
                <div key={index} style={jobCard}>
                  <h4 style={{ margin: 0, color: BLUE, fontWeight: 800 }}>
                    {job.title}
                  </h4>
                  <p style={{ margin: 0, color: "#4b5563" }}>{job.company}</p>

                  <div style={{
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ color: "#6b7280", fontSize: 14 }}>{job.location}</span>

                    <button style={btnPrimarySmall} onClick={() => navigate(`/job/${job.id}`)}>
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEdit && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setShowEdit(false)}
          onSave={(updatedUser) => {
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));

            let allApplicants = JSON.parse(localStorage.getItem("applicants")) || [];
            allApplicants = allApplicants.map((a) =>
              a.id === updatedUser.id ? updatedUser : a
            );

            localStorage.setItem("applicants", JSON.stringify(allApplicants));

            setCurrentUser(updatedUser);
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <div style={{ minWidth: 90, color: "#6b7280" }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value || "-"}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      padding: 20,
      border: "1px solid #e5e7eb",
      boxShadow: "0 4px 15px rgba(0,0,0,0.06)"
    }}>
      <div style={{ color: "#6b7280", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

/* ---------------- EDIT PROFILE MODAL ---------------- */

function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ ...user });
  const [preview, setPreview] = useState(user.profilePic || null);

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleFileUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      updateField("profilePic", reader.result); // Base64 stored
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.firstName || !form.email) {
      alert("Name & Email are required!");
      return;
    }
    onSave(form);
  };

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <h2 style={{ margin: 0, fontWeight: 800, color: "#0a66c2" }}>
          Edit Profile
        </h2>

        {/* SCROLLABLE CONTENT */}
        <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 8, marginTop: 16 }}>
          <div style={{ display: "grid", gap: 12 }}>

            {/* Profile Pic Preview */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  overflow: "hidden",
                  margin: "auto",
                  border: "4px solid #e5e7eb",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                }}
              >
                <img
                  src={preview}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <input
                type="file"
                accept="image/*"
                style={{ marginTop: 10 }}
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
            </div>

            <Input label="First Name" value={form.firstName} onChange={(v) => updateField("firstName", v)} />
            <Input label="Last Name" value={form.lastName} onChange={(v) => updateField("lastName", v)} />
            <Input label="Email" value={form.email} onChange={(v) => updateField("email", v)} />
            <Input label="Contact" value={form.contact} onChange={(v) => updateField("contact", v)} />
            <Input label="Degree" value={form.degree} onChange={(v) => updateField("degree", v)} />
            <Input label="Experience" value={form.experience} onChange={(v) => updateField("experience", v)} />
            <Input label="Location" value={form.location} onChange={(v) => updateField("location", v)} />
          </div>
        </div>

        {/* BUTTON ROW */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button style={btnCancel} onClick={onClose}>Cancel</button>
          <button style={btnSave} onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600 }}>{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={input}
      />
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const card = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
};

const h3 = {
  marginTop: 0,
  fontSize: 18,
  fontWeight: 800,
  color: "#111827",
};

const btnPrimary = {
  padding: "10px 18px",
  background: "#0a66c2",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(10,102,194,0.35)",
};

const btnPrimarySmall = {
  padding: "8px 14px",
  background: "#0a66c2",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

const emptyText = {
  textAlign: "center",
  padding: "20px 0",
  color: "#6b7280",
};

const pill = {
  background: "#e0f2fe",
  color: "#0369a1",
  padding: "4px 10px",
  borderRadius: 50,
  fontWeight: 600,
  fontSize: "0.85rem",
};

const jobCard = {
  background: "#fff",
  borderRadius: 16,
  padding: 18,
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 18px rgba(0,0,0,0.05)",
};

/* ---- MODAL ---- */
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalBox = {
  width: "95%",
  maxWidth: 480,
  background: "rgba(255,255,255,0.96)",
  borderRadius: 20,
  padding: "26px 24px",
  boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
};

const input = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  outline: "none",
};

const btnCancel = {
  padding: "8px 16px",
  background: "#e5e7eb",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
  cursor: "pointer",
};

const btnSave = {
  padding: "8px 16px",
  background: "#0a66c2",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(10,102,194,0.3)",
};
