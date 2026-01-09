import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const readJSON = (k, f) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : f;
  } catch {
    return f;
  }
};

export default function HRRecruiterDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [activeStudent, setActiveStudent] = useState(null);

  useEffect(() => {
    const user = readJSON("currentUser", null);
    if (!user || user.role !== "hr_recruiter") {
      navigate("/");
      return;
    }

    const staticStudent = {
      id: "static-1",
      firstName: "Neelam",
      lastName: "Giri",
      email: "neelamgiri283@gmail.com",
      degree: "MBA",
      experience: "3 Years",
      location: "Bhopal",
    };

    const stored = readJSON("users", []).filter(
      (u) => u.userType === "applicant"
    );

    setStudents([staticStudent, ...stored]);
    setJobs(readJSON("jobs", []));
    setApplications(readJSON("jobApplications", []));
  }, [navigate]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [students, search]);

  const getStudentApps = (id) =>
    applications
      .filter((a) => a.userId === id)
      .map((a) => ({
        app: a,
        job: jobs.find((j) => j.id === a.jobId),
      }));

  return (
    <div className="recruiter-page">
      <header className="topbar">
        <div>
          <h1>HR Recruiter</h1>
          <p>Candidate pipeline & applications</p>
        </div>
        <input
          placeholder="Search candidates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <section className="candidate-grid">
        {filteredStudents.map((s) => {
          const apps = getStudentApps(s.id);
          return (
            <div
              key={s.id}
              className="candidate-card"
              onClick={() => setActiveStudent({ s, apps })}
            >
              <div className="avatar">
                {s.firstName?.[0]}
                {s.lastName?.[0]}
              </div>

              <h3>
                {s.firstName} {s.lastName}
              </h3>
              <p className="muted">{s.degree}</p>

              <div className="meta">
                <span>{s.experience}</span>
                <span>{s.location}</span>
              </div>

              <div className="applications">
                <strong>{apps.length}</strong> Applications
              </div>
            </div>
          );
        })}
      </section>

      {/* SIDE DRAWER */}
      {activeStudent && (
        <div className="drawer-backdrop" onClick={() => setActiveStudent(null)}>
          <aside
            className="drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <div className="avatar large">
                {activeStudent.s.firstName?.[0]}
                {activeStudent.s.lastName?.[0]}
              </div>
              <div>
                <h2>
                  {activeStudent.s.firstName}{" "}
                  {activeStudent.s.lastName}
                </h2>
                <p className="muted">{activeStudent.s.email}</p>
              </div>
            </header>

            <section className="drawer-body">
              <div className="info">
                <div><strong>Degree:</strong> {activeStudent.s.degree}</div>
                <div><strong>Experience:</strong> {activeStudent.s.experience}</div>
                <div><strong>Location:</strong> {activeStudent.s.location}</div>
              </div>

              <h4>Applications</h4>

              {activeStudent.apps.length === 0 ? (
                <p className="muted">No applications yet</p>
              ) : (
                activeStudent.apps.map(({ job, app }, i) => (
                  <div key={i} className="job-tile">
                    <div>
                      <strong>{job?.title}</strong>
                      <p className="muted">
                        {job?.company} • {job?.location}
                      </p>
                    </div>
                    {app.resume && (
                      <a href={app.resume} target="_blank">
                        Resume →
                      </a>
                    )}
                  </div>
                ))
              )}
            </section>
          </aside>
        </div>
      )}

      <style>{`
.recruiter-page {
  padding: 24px;
  background: #f4f7fb;
  min-height: 100vh;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.topbar h1 {
  font-size: 32px;
  font-weight: 900;
  color: #0a66c2;
}

.topbar input {
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  width: 260px;
}

.candidate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(260px,1fr));
  gap: 18px;
}

.candidate-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0,0,0,.08);
  transition: transform .15s ease, box-shadow .15s ease;
}

.candidate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(0,0,0,.12);
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg,#0a66c2,#0047a8);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 900;
  margin-bottom: 10px;
}

.avatar.large {
  width: 60px;
  height: 60px;
  font-size: 20px;
}

.meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #6b7280;
}

.applications {
  margin-top: 10px;
  font-size: 14px;
  color: #1d4ed8;
  font-weight: 700;
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  justify-content: flex-end;
  z-index: 9999;
}

.drawer {
  width: 420px;
  background: #fff;
  height: 100%;
  padding: 20px;
  animation: slide .25s ease;
}

@keyframes slide {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer header {
  display: flex;
  gap: 14px;
  margin-bottom: 18px;
}

.drawer-body h4 {
  margin: 16px 0 10px;
}

.job-tile {
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.job-tile a {
  color: #0a66c2;
  font-weight: 700;
}

.muted {
  color: #6b7280;
  font-size: 13px;
}
      `}</style>
    </div>
  );
}
