// Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [showAppModal, setShowAppModal] = useState(false); // NEW modal state

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || user.userType !== "applicant") {
      navigate("/"); // guard: only applicants
      return;
    }
    setCurrentUser(user);

    // Applications
    const allApplications =
      JSON.parse(localStorage.getItem("jobApplications")) || [];
    setApplications(allApplications.filter((app) => app.userId === user.id));

    // Saved jobs
    const allSavedJobs = JSON.parse(localStorage.getItem("savedJobs")) || [];
    setSavedJobs(allSavedJobs.filter((job) => job.userId === user.id));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  if (!currentUser) return <div>Loading...</div>;

  // --- THEME ---
  const BLUE = "#0a66c2";
  const BG = "#f8fafc";
  const baseCard = {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 6px 20px rgba(10,102,194,0.08)",
    border: "1px solid #e5e7eb",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  const HoverCard = ({ title, children }) => (
    <div
      style={{ ...baseCard }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 10px 28px rgba(10,102,194,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 6px 20px rgba(10,102,194,0.08)";
      }}
    >
      {title && (
        <div
          style={{
            borderBottom: "1px solid #f3f4f6",
            paddingBottom: "8px",
            marginBottom: "12px",
            color: BLUE,
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: BG,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 32px",
          background: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ color: BLUE, fontWeight: 600 }}>
            Welcome, {currentUser.firstName}
          </span>

          {/* NEW: Applied jobs button */}
          <button
            onClick={() => setShowAppModal(true)}
            style={{
              padding: "6px 12px",
              background: BLUE,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.85em",
            }}
          >
            Applied Jobs: {applications.length}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div
        style={{
          display: "flex",
          maxWidth: "1400px",
          margin: "24px auto",
          gap: "20px",
          padding: "0 20px",
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            width: "240px",
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            padding: "20px",
            height: "fit-content",
          }}
        >
          {["profile", "applications", "saved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                background: activeTab === tab ? "#f0f7ff" : "transparent",
                color: activeTab === tab ? BLUE : "#374151",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: activeTab === tab ? 700 : 500,
                marginBottom: "8px",
                transition: "all 0.2s ease",
              }}
            >
              {tab === "profile"
                ? "My Profile"
                : tab === "applications"
                ? "My Applications"
                : "Saved Jobs"}
            </button>
          ))}
        </aside>

        {/* Main Panel */}
        <main style={{ flex: 1, ...baseCard }}>
          {activeTab === "profile" && (
            <div>
              <h2
                style={{
                  color: BLUE,
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                My Profile
                <button
                  onClick={() => navigate("/edit-profile")}
                  style={{
                    padding: "4px 10px",
                    background: "transparent",
                    color: BLUE,
                    border: "none",
                    borderBottom: `1px solid ${BLUE}`,
                    borderRadius: "0",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: "0.8em",
                    transition:
                      "color 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#004182"; // darker blue
                    e.currentTarget.style.borderColor = "#004182";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = BLUE;
                    e.currentTarget.style.borderColor = BLUE;
                  }}
                >
                  Edit Profile
                </button>
              </h2>

              {/* Personal + Professional */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                <HoverCard title="Personal Information">
                  <p>
                    <strong>Name:</strong> {currentUser.firstName}{" "}
                    {currentUser.middleName} {currentUser.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {currentUser.email}
                  </p>
                  <p>
                    <strong>Contact:</strong> {currentUser.contact}
                  </p>
                </HoverCard>

                <HoverCard title="Professional Information">
                  <p>
                    <strong>Degree:</strong> {currentUser.degree}
                  </p>
                  <p>
                    <strong>Passout Year:</strong> {currentUser.passout}
                  </p>
                  <p>
                    <strong>Experience:</strong>{" "}
                    {currentUser.experience} years
                  </p>
                  <p>
                    <strong>Tech Stack:</strong>{" "}
                    {currentUser.techstack}
                  </p>
                </HoverCard>
              </div>

              <HoverCard title="Career Preferences">
                <p>
                  <strong>Last Salary:</strong>{" "}
                  {currentUser.lastSalary}
                </p>
                <p>
                  <strong>Expected Salary:</strong>{" "}
                  {currentUser.currentSalary}
                </p>
                <p>
                  <strong>Preferred Location:</strong>{" "}
                  {currentUser.location}
                </p>
                <p>
                  <strong>Notice Period:</strong>{" "}
                  {currentUser.noticePeriod}
                </p>
                <p>
                  <strong>Skills:</strong> {currentUser.skills}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {currentUser.description}
                </p>
              </HoverCard>
            </div>
          )}

          {activeTab === "applications" && (
            <div>
              <h2 style={{ color: BLUE, marginBottom: "20px" }}>
                My Applications ({applications.length})
              </h2>
              {applications.length > 0 ? (
                <div style={{ display: "grid", gap: "16px" }}>
                  {applications.map((app, index) => (
                    <HoverCard key={index}>
                      <h3
                        style={{
                          color: BLUE,
                          marginBottom: "5px",
                        }}
                      >
                        {app.jobTitle}
                      </h3>
                      <p
                        style={{
                          color: "#4b5563",
                          marginBottom: "5px",
                        }}
                      >
                        {app.company}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor:
                              app.status === "Applied"
                                ? "#e0f2fe"
                                : app.status === "Interview"
                                ? "#f0fdf4"
                                : app.status === "Rejected"
                                ? "#fee2e2"
                                : "#e5e7eb",
                            color:
                              app.status === "Applied"
                                ? "#0369a1"
                                : app.status === "Interview"
                                ? "#15803d"
                                : app.status === "Rejected"
                                ? "#b91c1c"
                                : "#374151",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.85em",
                          }}
                        >
                          {app.status}
                        </span>
                        <span
                          style={{
                            color: "#6b7280",
                            fontSize: "0.85em",
                          }}
                        >
                          Applied on:{" "}
                          {new Date(
                            app.appliedDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </HoverCard>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#6b7280" }}>
                  You haven't applied to any jobs yet.
                </p>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div>
              <h2 style={{ color: BLUE, marginBottom: "20px" }}>
                Saved Jobs ({savedJobs.length})
              </h2>
              {savedJobs.length > 0 ? (
                <div style={{ display: "grid", gap: "16px" }}>
                  {savedJobs.map((job, index) => (
                    <HoverCard key={index}>
                      <h3
                        style={{
                          color: BLUE,
                          marginBottom: "5px",
                        }}
                      >
                        {job.title}
                      </h3>
                      <p
                        style={{
                          color: "#4b5563",
                          marginBottom: "5px",
                        }}
                      >
                        {job.company || "Unknown Company"}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "#6b7280",
                            fontSize: "0.9em",
                          }}
                        >
                          {job.location}
                        </span>
                        <button
                          style={{
                            padding: "6px 12px",
                            background: BLUE,
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.85em",
                          }}
                        >
                          Apply Now
                        </button>
                      </div>
                    </HoverCard>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#6b7280" }}>
                  You haven't saved any jobs yet.
                </p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* NEW: Applications Modal */}
      {showAppModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              width: "500px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginTop: 0, color: BLUE }}>
              Jobs Applied ({applications.length})
            </h3>

            {applications.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {applications.map((app, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <strong>{app.jobTitle}</strong> – {app.company}
                    <br />
                    <span
                      style={{ fontSize: "0.85em", color: "#6b7280" }}
                    >
                      Status: {app.status} | Applied on:{" "}
                      {new Date(
                        app.appliedDate
                      ).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No applications yet.</p>
            )}

            <button
              onClick={() => setShowAppModal(false)}
              style={{
                marginTop: "12px",
                padding: "8px 14px",
                background: BLUE,
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
