// PART 1/3
// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/** -------------------------
 *  LocalStorage helpers
 *  -------------------------
 *  Companies: may be stored as single object 'registeredCompany' or array 'registeredCompanies'
 *  Students:  'users' (array from onboarding)
 *  Jobs:      'jobs' (array with {status: 'pending'|'active'|'inactive'})
 *  Applications: 'jobApplications' -> [{ jobId, userId, appliedAt, resume? }]
 */

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCompanies() {
  const single = readJSON("registeredCompany", null);
  const arr = readJSON("registeredCompanies", null);
  if (Array.isArray(arr)) return arr;
  if (single && typeof single === "object") return [single];
  return [];
}

function saveCompanies(list) {
  writeJSON("registeredCompanies", list);
  if (list.length) writeJSON("registeredCompany", list[0]);
}

function getStudents() {
  const arr = readJSON("users", []);
  return Array.isArray(arr) ? arr : [];
}

function saveStudents(list) {
  writeJSON("users", list);
}

function getJobs() {
  const arr = readJSON("jobs", []);
  if (!Array.isArray(arr)) return [];
  return arr.map((j) => {
    if (j.status === "pending") return { ...j, status: "pending" };
    if (j.status === "inactive") return { ...j, status: "inactive" };
    return { ...j, status: "active" };
  });
}

function saveJobs(list) {
  writeJSON("jobs", list);
}

function getApplications() {
  const arr = readJSON("jobApplications", []);
  return Array.isArray(arr) ? arr : [];
}

function getUserById(id) {
  const users = getStudents();
  return users.find((u) => u.id === id || u.userId === id) || null;
}

function Card({ title, value, sub }) {
  return (
    <div className="analytics-card card">
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
      {sub ? <div className="card-sub">{sub}</div> : null}
    </div>
  );
}

const StableFilterBar = React.memo(function StableFilterBar({ children }) {
  return (
    <div className="admin-filter-bar">
      <div className="admin-filter-grid">
        {children}
      </div>
    </div>
  );
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [activeSection, setActiveSection] = useState("jobs");
  const [companyFilters, setCompanyFilters] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [studentFilters, setStudentFilters] = useState({
    name: "",
    email: "",
    location: "",
  });

  const [jobFilters, setJobFilters] = useState({
    title: "",
    company: "",
    status: "",
  });

  const [editModal, setEditModal] = useState({
    open: false,
    type: null,
    item: null,
    index: -1,
  });

  // New: view company modal state (read-only company dashboard inside modal)
  const [viewCompany, setViewCompany] = useState({
    open: false,
    company: null,
    companyJobs: [],
    companyApplicantsMap: {}, // jobId -> [app objects with user]
  });
  // New: view job modal
  const [viewJob, setViewJob] = useState({
    open: false,
    job: null,
    applicants: [],
  });

  useEffect(() => {
    const user = readJSON("currentUser", null);
    setCurrentUser(user);
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    // --- Permanent static clients ---
    const staticClients = [
      {
        companyName: "Medinatridle heath IIB",
        email: "contact@medinitriddlehealth.com",
        contact: "8989954397",
        hrName: "HR Manager",
      },
      {
        companyName: "Samarth Electrocare",
        email: "samathelectrocare@gmail.com",
        contact: "7755990767",
        hrName: "HR Manager",
      },
      {
        companyName: "Neelanj business Solution LLP",
        email: "neelanjbusinesssolution@gmail.com",
        contact: "7998406170",
        hrName: "HR Manager",
      },
      {
        companyName: "RAJRUDRA Enterprises pvt ltd",
        email: "rajrudraenterprises.mandeep@gmail.com",
        contact: "9752319442",
        hrName: "HR Manager",
      },
      {
        companyName: "Orphic Solution, Bhopal",
        email: "hr@orphicsolution.com",
        contact: "9584360388",
        hrName: "HR Manager",
      },
      {
        companyName: "yokohama pvt ltd engine",
        email: "yokohama pvt ltd engine",
        contact: "7697651756",
        hrName: "HR Manager",
      },
      {
        companyName: "Raj Seeds Trades",
        email: "hr@rajseeds.co.in",
        contact: "626200198",
        hrName: "HR Manager",
      },
      {
        companyName: "Sasthi Enterprises Pvt. Ltd.",
        email: "hr@harenply.com",
        contact: "9259538852",
        hrName: "HR Manager",
      },
      {
        companyName: "GENTRIGO SOLUTIONs",
        email: "Info.gentrigo@gmail.com",
        contact: "6265389979",
        hrName: "HR Manager",
      },
      {
        companyName: "Tendonifoodchemical",
        email: "tendonifoodchemical@gmail.com",
        contact: "6269990150",
        hrName: "HR Manager",
      },
      {
        companyName: "Confidential Company",
        email: "confidential.hr@example.com",
        contact: "9000000001",
        hrName: "HR Manager",
      },
      {
        companyName: "Fitness Tycoon",
        email: "hr@fitnesstycoon.com",
        contact: "9000000002",
        hrName: "HR Manager",
      },
      {
        companyName: "Paraglider Media Private Limited",
        email: "jobs@paraglider.in",
        contact: "8269893693",
        hrName: "HR Team",
        address: "E2/228, E-2, Arera Colony, Bhopal, Madhya Pradesh 462016",
      }
    ];

    // --- Local companies (new signups)
    const storedCompanies = getCompanies();

    // --- Merge static + dynamic (static always on top)
    setCompanies([...staticClients, ...storedCompanies]);

    setStudents(getStudents().filter((u) => u.userType === "applicant"));

    setJobs(getJobs());
    // --- Inject static jobs for admin (one-time) ---
const existingJobs = getJobs();

const staticJobs = [
  {
    id: "static-1",
    title: "HR & Operations Executive",
    company: "Confidential Company",
    location: "Bhopal, Madhya Pradesh",
    experienceRange: "2+ years",
    salary: "₹2,00,000 – ₹3,00,000 per annum",
    tags: ["HR", "Operations", "Team Management", "MS Office"],
    description:
      "We are hiring an experienced HR & Operations Executive to handle HR functions and oversee daily office operations. Key responsibilities include recruitment, onboarding, attendance & payroll management, HR documentation, office coordination, supporting sales teams, creating reports, and ensuring smooth inter-department communication. Required skills: strong team management, communication, HR operations knowledge, MS Office proficiency, and basic understanding of sales processes. Documents required: Experience Certificate, last 3 months’ pay slips, previous company offer letter, Aadhaar & PAN card.",
    status: "active",
    createdAt: Date.now(),
  },
  {
    id: "static-2",
    title: "Nutritionist",
    company: "Fitness Tycoon",
    location: "Mansarover Complex, MF-12, Bhopal",
    experienceRange: "0-3 years",
    salary: "₹1.5 LPA – ₹3 LPA",
    tags: ["Nutrition", "Diet Planning", "Client Handling", "Wellness"],
    description:
      "Fitness Tycoon is hiring a qualified Nutritionist for a full-time office role. Responsibilities include creating customized diet plans, conducting nutritional assessments, collaborating with fitness trainers, monitoring client progress, maintaining records, educating clients on nutrition, and staying updated with latest nutrition research. Required qualifications include a Bachelor’s or Master’s degree in Nutrition/Dietetics, experience in personalized diet planning, and strong understanding of macro & micronutrients. Skills: excellent communication, counseling, knowledge of Indian diets, and basic computer proficiency.",
    status: "active",
    createdAt: Date.now(),
  },
  {
    id: 910001,
    title: "Graphic Designer",
    company: "Paraglider Media Private Limited",
    companyEmail: "jobs@paraglider.in",
    location: "Bhopal",
    experienceRange: "0–2 years",
    salary: "As per industry standards",
    status: "active",
    description:
      "Create high-quality graphics, illustrations, social media creatives, banners, posters, and marketing materials using Adobe Photoshop and Illustrator.",
    tags: ["Photoshop", "Illustrator", "Graphic Design"],
    createdAt: Date.now(),
  },
  {
    id: 910002,
    title: "Motion Graphics Designer (After Effects)",
    company: "Paraglider Media Private Limited",
    companyEmail: "jobs@paraglider.in",
    location: "Bhopal / Indore",
    experienceRange: "1–3 years",
    salary: "As per industry standards",
    status: "active",
    description:
      "Create motion graphics, animations, explainer videos, logo animations, and visual assets using Adobe After Effects and Premiere Pro.",
    tags: ["After Effects", "Motion Graphics", "Animation"],
    createdAt: Date.now(),
  },
  
];

// prevent duplicate injection
const STATIC_JOB_IDS = [910001, 910002, 900001, 900002];

const alreadyAdded = existingJobs.some((j) =>
  STATIC_JOB_IDS.includes(j.id)
);


if (!alreadyAdded) {
  const updatedJobs = [...staticJobs, ...existingJobs];
  saveJobs(updatedJobs);
  setJobs(updatedJobs);
}

  }, [navigate]);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const active = jobs.filter((j) => j.status === "active").length;
    const inactive = jobs.filter((j) => j.status === "inactive").length;
    const pending = jobs.filter((j) => j.status === "pending").length;

    return {
      totalCompanies: companies.length,
      totalStudents: students.length,
      totalJobs,
      activeJobs: active,
      inactiveJobs: inactive,
      pendingJobs: pending,
    };
  }, [companies, students, jobs]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const name = (c.companyName || c.name || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      const phone = (c.contact || c.phone || "").toLowerCase();

      return (
        name.includes(companyFilters.name.toLowerCase()) &&
        email.includes(companyFilters.email.toLowerCase()) &&
        phone.includes(companyFilters.phone.toLowerCase())
      );
    });
  }, [companies, companyFilters]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const name = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
      const email = (s.email || "").toLowerCase();
      const location = (s.location || "").toLowerCase();

      return (
        name.includes(studentFilters.name.toLowerCase()) &&
        email.includes(studentFilters.email.toLowerCase()) &&
        location.includes(studentFilters.location.toLowerCase())
      );
    });
  }, [students, studentFilters]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      return (
        j.title?.toLowerCase().includes(jobFilters.title.toLowerCase()) &&
        j.company?.toLowerCase().includes(jobFilters.company.toLowerCase()) &&
        (jobFilters.status ? j.status === jobFilters.status : true)
      );
    });
  }, [jobs, jobFilters]);

  function openEdit(type, index, item) {
    setEditModal({ open: true, type, item: { ...item }, index });
  }

  function closeEdit() {
    setEditModal({ open: false, type: null, item: null, index: -1 });
  }

  function handleDelete(type, index) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    if (type === "company") {
      const list = [...companies];
      list.splice(index, 1);
      setCompanies(list);
      saveCompanies(list);
    } else if (type === "student") {
      const list = [...students];
      list.splice(index, 1);
      setStudents(list);
      saveStudents(list);
    } else if (type === "job") {
      const list = [...jobs];
      list.splice(index, 1);
      setJobs(list);
      saveJobs(list);
    }
  }

  function handleToggleJobStatus(index) {
    const list = [...jobs];
    const j = list[index];
    list[index] = {
      ...j,
      status: j.status === "active" ? "inactive" : "active",
    };
    setJobs(list);
    saveJobs(list);
  }

  function approveJob(index) {
    const list = [...jobs];
    list[index] = { ...list[index], status: "active" };
    setJobs(list);
    saveJobs(list);
    alert(`✅ Job "${list[index].title}" approved!`);
  }

  function handleEditSave() {
    const { type, index, item } = editModal;
    if (type === "company") {
      const list = [...companies];
      list[index] = item;
      setCompanies(list);
      saveCompanies(list);
    } else if (type === "student") {
      const list = [...students];
      list[index] = item;
      setStudents(list);
      saveStudents(list);
    } else if (type === "job") {
      const updated = {
        ...item,
        status:
          item.status === "pending"
            ? "pending"
            : item.status === "inactive"
            ? "inactive"
            : "active",
      };
      const list = [...jobs];
      list[index] = updated;
      setJobs(list);
      saveJobs(list);
    }
    closeEdit();
  }

  // -----------------------
  // New: Open company view modal
  // -----------------------
  function openCompanyView(company) {
    // Determine company's email and/or name to find jobs posted by them, matching CompanyDashboard logic.
    // CompanyDashboard used: j.companyEmail === email || j.postedBy === uid
    const jobsList = getJobs();
    const apps = getApplications();
    const users = getStudents();

    const email = company?.email || company?.companyEmail || "";
    const uid = company?.id || company?.userId || company?.postedBy;

    const companyJobs = jobsList.filter(
      (j) =>
        (j.companyEmail && j.companyEmail === email) ||
        (j.postedBy && j.postedBy === uid) ||
        (j.company &&
          (j.company === company.companyName || j.company === company.name))
    );

    // Build map jobId -> applicants array with full user details
    const map = {};
    for (const job of companyJobs) {
      const jobApps = apps.filter((a) => a.jobId === job.id);
      map[job.id] = jobApps.map((a) => {
        const user =
          users.find((u) => u.id === a.userId || u.userId === a.userId) || null;
        return {
          application: a,
          user,
        };
      });
    }

    setViewCompany({
      open: true,
      company,
      companyJobs,
      companyApplicantsMap: map,
    });
  }
  // --- View Job Modal Open ---
  function openJobView(job) {
    const apps = getApplications();
    const users = getStudents();

    const applicants = apps
      .filter((a) => a.jobId === job.id)
      .map((a) => ({
        application: a,
        user:
          users.find((u) => u.id === a.userId || u.userId === a.userId) || null,
      }));

    setViewJob({
      open: true,
      job,
      applicants,
    });
  }

  function closeJobView() {
    setViewJob({
      open: false,
      job: null,
      applicants: [],
    });
  }

  function closeCompanyView() {
    setViewCompany({
      open: false,
      company: null,
      companyJobs: [],
      companyApplicantsMap: {},
    });
  }

  function Sidebar() {
    return (
      <aside className="admin-sidebar">
        <div className="sidebar-title">Admin</div>
        <nav className="sidebar-nav">
          <button
            className={`sidebar-btn ${
              activeSection === "recruiters" ? "active" : ""
            }`}
            onClick={() => setActiveSection("recruiters")}
          >
            Recruiters / Clients
          </button>
          <button
            className={`sidebar-btn ${
              activeSection === "students" ? "active" : ""
            }`}
            onClick={() => setActiveSection("students")}
          >
            Students
          </button>
          <button
            className={`sidebar-btn ${
              activeSection === "jobs" ? "active" : ""
            }`}
            onClick={() => setActiveSection("jobs")}
          >
            Jobs
          </button>
        </nav>
      </aside>
    );
  }

  function TopCards() {
    return (
      <div className="cards-row">
        <Card title="Total Recruiters" value={stats.totalCompanies} />
        <Card title="Total Students" value={stats.totalStudents} />
        <Card title="Total Jobs" value={stats.totalJobs} />
        <Card
          title="Active / Pending / Inactive"
          value={`${stats.activeJobs} / ${stats.pendingJobs} / ${stats.inactiveJobs}`}
        />
      </div>
    );
  }

  function CompaniesTable() {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Recruiters / Clients</h2>
        </div>
        {/* FILTERS (UI ONLY) */}
        
        <StableFilterBar>
  <div className="admin-filter-field">
    <label>Company</label>
    <input
      value={companyFilters.name}
      onChange={(e) =>
        setCompanyFilters((f) => ({ ...f, name: e.target.value }))
      }
    />
  </div>

  <div className="admin-filter-field">
    <label>Email</label>
    <input
      value={companyFilters.email}
      onChange={(e) =>
        setCompanyFilters((f) => ({ ...f, email: e.target.value }))
      }
    />
  </div>

  <div className="admin-filter-field">
    <label>Phone</label>
    <input
      value={companyFilters.phone}
      onChange={(e) =>
        setCompanyFilters((f) => ({ ...f, phone: e.target.value }))
      }
    />
  </div>

  <div className="admin-filter-actions">
    <button
      className="admin-filter-clear"
      onClick={() =>
        setCompanyFilters({ name: "", email: "", phone: "" })
      }
    >
      Clear
    </button>
  </div>
</StableFilterBar>


        <div className="table-wrap">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>HR Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Jobs Posted</th>
                <th style={{ width: 260 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.length ? (
                filteredCompanies.map((c, idx) => {
                  const jobsCount = jobs.filter(
                    (j) =>
                      (j.company || "").trim() ===
                        (c.companyName || c.name || "").trim() ||
                      (j.companyEmail && j.companyEmail === c.email)
                  ).length;
                  return (
                    <tr key={idx}>
                      <td>{c.companyName || c.name || "-"}</td>
                      <td>{c.hrName || c.hr || "-"}</td>
                      <td>{c.email || "-"}</td>
                      <td>{c.contact || c.phone || "-"}</td>
                      <td>{jobsCount}</td>
                      <td className="actions">
                        {/* NEW: Eye view button */}
                        <button
                          className="btn secondary"
                          onClick={() => openCompanyView(c)}
                        >
                          👁️ View
                        </button>
                        <button
                          className="btn secondary"
                          onClick={() => openEdit("company", idx, c)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn danger"
                          onClick={() => handleDelete("company", idx)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="empty">
                    No recruiters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function StudentsTable() {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Students</h2>
        </div>
        {/* FILTERS (UI ONLY) */}
        <StableFilterBar>
  <div className="admin-filter-field">
    <label>Name</label>
    <input
      value={studentFilters.name}
      onChange={(e) =>
        setStudentFilters((f) => ({ ...f, name: e.target.value }))
      }
    />
  </div>

  <div className="admin-filter-field">
    <label>Email</label>
    <input
      value={studentFilters.email}
      onChange={(e) =>
        setStudentFilters((f) => ({ ...f, email: e.target.value }))
      }
    />
  </div>

  <div className="admin-filter-field">
    <label>Location</label>
    <input
      value={studentFilters.location}
      onChange={(e) =>
        setStudentFilters((f) => ({ ...f, location: e.target.value }))
      }
    />
  </div>

  <div className="admin-filter-actions">
    <button
      className="admin-filter-clear"
      onClick={() =>
        setStudentFilters({ name: "", email: "", location: "" })
      }
    >
      Clear
    </button>
  </div>
</StableFilterBar>


        <div className="table-wrap">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Degree</th>
                <th>Experience</th>
                <th>Location</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length ? (
                filteredStudents.map((s, idx) => {
                  const name =
                    [s.firstName, s.middleName, s.lastName]
                      .filter(Boolean)
                      .join(" ") ||
                    s.name ||
                    "-";
                  return (
                    <tr key={idx}>
                      <td>{name}</td>
                      <td>{s.email || "-"}</td>
                      <td>{s.degree || "-"}</td>
                      <td>{s.experience || "-"}</td>
                      <td>{s.location || "-"}</td>
                      <td className="actions">
                        <button
                          className="btn secondary"
                          onClick={() => openEdit("student", idx, s)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn danger"
                          onClick={() => handleDelete("student", idx)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="empty">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function JobsTable() {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Jobs</h2>
        </div>
        {/* FILTERS (UI ONLY) */}
        <StableFilterBar>
  <div className="admin-filter-field">
    <label>Job Title</label>
    <input
      value={jobFilters.title}
      onChange={(e) =>
        setJobFilters((f) => ({ ...f, title: e.target.value }))
      }
    />
  </div>

  <div className="admin-filter-field">
    <label>Company</label>
    <input
      value={jobFilters.company}
      onChange={(e) =>
        setJobFilters((f) => ({ ...f, company: e.target.value }))
      }
    />
  </div>

  <div className="admin-filter-field">
    <label>Status</label>
    <select
      value={jobFilters.status}
      onChange={(e) =>
        setJobFilters((f) => ({ ...f, status: e.target.value }))
      }
    >
      <option value="">Any</option>
      <option value="active">Active</option>
      <option value="pending">Pending</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>

  <div className="admin-filter-actions">
    <button
      className="admin-filter-clear"
      onClick={() =>
        setJobFilters({ title: "", company: "", status: "" })
      }
    >
      Clear
    </button>
  </div>
</StableFilterBar>


        <div className="table-wrap">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Location</th>
                <th>Experience</th>
                <th>Salary</th>
                <th style={{ width: 280 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length ? (
                filteredJobs.map((j, idx) => (
                  <tr key={j.id || idx}>
                    <td>{j.title || "-"}</td>
                    <td>{j.company || "-"}</td>
                    <td>
                      <span
                        className={`pill ${
                          j.status === "active"
                            ? "ok"
                            : j.status === "pending"
                            ? "pending"
                            : "warn"
                        }`}
                      >
                        {j.status === "active"
                          ? "Active"
                          : j.status === "pending"
                          ? "Pending"
                          : "Inactive"}
                      </span>
                    </td>
                    <td>{j.location || "-"}</td>
                    <td>{j.experienceRange || "-"}</td>
                    <td>{j.salary || "-"}</td>
                    <td className="actions">
                      <button
                        className="btn secondary"
                        onClick={() => openJobView(j)}
                      >
                        👁️ View
                      </button>

                      {j.status === "pending" ? (
                        <button className="btn" onClick={() => approveJob(idx)}>
                          Approve
                        </button>
                      ) : (
                        <button
                          className="btn"
                          onClick={() => handleToggleJobStatus(idx)}
                        >
                          {j.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      <button
                        className="btn secondary"
                        onClick={() => openEdit("job", idx, j)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => handleDelete("job", idx)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {jobs.some((j) => j.status === "pending") && (
        <div
          style={{
            background: "#fff8e1",
            border: "1px solid #fcd34d",
            padding: "12px 16px",
            borderRadius: "10px",
            color: "#92400e",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          ⚠️ {jobs.filter((j) => j.status === "pending").length} job(s) pending
          approval
        </div>
      )}

      <TopCards />
      <div className="content-row">
        <Sidebar />
        <main className="admin-main">
          {activeSection === "recruiters" && <CompaniesTable />}
          {activeSection === "students" && <StudentsTable />}
          {activeSection === "jobs" && <JobsTable />}
        </main>
      </div>

      {/* EDIT MODAL and COMPANY VIEW MODAL will follow in PART 2 */}
      {/* ============================
      COMPANY VIEW MODAL (READ-ONLY DASHBOARD)
============================ */}
      {viewCompany.open && (
        <div className="modal-backdrop" onClick={closeCompanyView}>
          <div
            className="company-view-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "1050px",
              maxHeight: "90vh",
              background: "#fff",
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                background: "linear-gradient(135deg, #0a66c2, #0047a8)",
                color: "#fff",
                padding: "60px 20px 80px",
                textAlign: "center",
                position: "relative",
              }}
            >
              {/* PROFILE PIC FIXED CIRCLE */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-55px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    border: "4px solid #fff",
                    background: "#e5e7eb",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
                  }}
                >
                  {viewCompany.company?.profilePic ? (
                    <img
                      src={viewCompany.company.profilePic}
                      alt="profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        color: "#6b7280",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      No Image
                    </span>
                  )}
                </div>
              </div>

              <h2 style={{ fontSize: 28, marginTop: 20, fontWeight: 900 }}>
                {viewCompany.company.name ||
                  viewCompany.company.companyName ||
                  "Company"}
              </h2>
              <p style={{ opacity: 0.85 }}>
                Admin view of company dashboard — read-only.
              </p>
            </div>

            {/* BODY (scrollable) */}
            <div
              style={{
                padding: "80px 30px 40px",
                overflowY: "auto",
                flex: 1,
                background: "#f3f6fb",
              }}
            >
              <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                {/* Company Info */}
                <div
                  style={{
                    background: "#fff",
                    padding: 20,
                    borderRadius: 14,
                    marginBottom: 20,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 20,
                      marginTop: 0,
                      fontWeight: 800,
                      color: "#0a66c2",
                    }}
                  >
                    Company Profile
                  </h3>

                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <strong>Email:</strong> {viewCompany.company.email}
                    </div>
                    <div>
                      <strong>Contact:</strong> {viewCompany.company.contact}
                    </div>
                    <div>
                      <strong>Website:</strong>{" "}
                      {viewCompany.company.website || "-"}
                    </div>
                    <div>
                      <strong>Address:</strong>{" "}
                      {viewCompany.company.address || "-"}
                    </div>
                    <div>
                      <strong>Description:</strong>{" "}
                      {viewCompany.company.description || "-"}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div
                  style={{
                    background: "#fff",
                    padding: 20,
                    borderRadius: 14,
                    marginBottom: 20,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 20,
                      marginTop: 0,
                      fontWeight: 800,
                      color: "#0a66c2",
                    }}
                  >
                    Quick Stats
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        background: "#f8fafc",
                        padding: 18,
                        borderRadius: 12,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div style={{ color: "#6b7280" }}>Active Jobs</div>
                      <div style={{ fontSize: 26, fontWeight: 800 }}>
                        {viewCompany.companyJobs.length}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#f8fafc",
                        padding: 18,
                        borderRadius: 12,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div style={{ color: "#6b7280" }}>Applicants</div>
                      <div style={{ fontSize: 26, fontWeight: 800 }}>
                        {
                          Object.values(viewCompany.companyApplicantsMap).flat()
                            .length
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job List */}
                <div
                  style={{
                    background: "#fff",
                    padding: 20,
                    borderRadius: 14,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 20,
                      marginTop: 0,
                      fontWeight: 800,
                      color: "#0a66c2",
                    }}
                  >
                    Job Posts
                  </h3>

                  {viewCompany.companyJobs.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 20,
                        color: "#6b7280",
                      }}
                    >
                      No jobs posted.
                    </div>
                  ) : (
                    viewCompany.companyJobs.map((job) => {
                      const applicants =
                        viewCompany.companyApplicantsMap[job.id] || [];

                      return (
                        <div
                          key={job.id}
                          style={{
                            marginBottom: 20,
                            background: "#f9fbff",
                            border: "1px solid #e5e9ff",
                            padding: 18,
                            borderRadius: 14,
                          }}
                        >
                          <h4
                            style={{
                              margin: 0,
                              marginBottom: 6,
                              color: "#0a66c2",
                              fontWeight: 800,
                            }}
                          >
                            {job.title}
                          </h4>

                          <div style={{ marginBottom: 10, color: "#6b7280" }}>
                            {job.location} • {job.experienceRange} •{" "}
                            {job.salary}
                          </div>

                          <div
                            style={{
                              fontSize: 14,
                              marginBottom: 10,
                            }}
                          >
                            Posted on{" "}
                            {new Date(
                              job.createdAt || Date.now()
                            ).toLocaleDateString()}
                          </div>

                          <hr style={{ opacity: 0.3, margin: "10px 0" }} />

                          {/* Applicants */}
                          <h5
                            style={{
                              margin: 0,
                              marginBottom: 8,
                              fontWeight: 700,
                            }}
                          >
                            Applicants ({applicants.length})
                          </h5>

                          {applicants.length === 0 ? (
                            <div
                              style={{
                                padding: "8px 0",
                                fontSize: 14,
                                color: "#9ca3af",
                              }}
                            >
                              No applicants yet.
                            </div>
                          ) : (
                            applicants.map(({ user, application }, i) => (
                              <div
                                key={i}
                                style={{
                                  background: "#fff",
                                  padding: 12,
                                  borderRadius: 10,
                                  border: "1px solid #e5e7eb",
                                  marginBottom: 10,
                                }}
                              >
                                <div style={{ fontWeight: 700 }}>
                                  {user?.firstName} {user?.lastName}
                                </div>
                                <div>Email: {user?.email}</div>
                                <div>Degree: {user?.degree}</div>
                                <div>Experience: {user?.experience}</div>

                                {application.resume && (
                                  <a
                                    href={application.resume}
                                    target="_blank"
                                    style={{
                                      color: "#0a66c2",
                                      fontWeight: 700,
                                      fontSize: 14,
                                      marginTop: 6,
                                      display: "inline-block",
                                    }}
                                  >
                                    View Resume →
                                  </a>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={closeCompanyView}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "rgba(255,255,255,0.8)",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: 8,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ============================
      EDIT MODAL (UPDATED WITH PROFILE PIC UPLOAD)
============================ */}
      {editModal.open && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit {editModal.type}</h3>
              <button className="icon-btn" onClick={closeEdit}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* COMPANY EDIT */}
              {editModal.type === "company" && (
                <div className="form-grid">
                  <label>
                    Company Name
                    <input
                      value={
                        editModal.item.companyName || editModal.item.name || ""
                      }
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: {
                            ...m.item,
                            companyName: e.target.value,
                            name: e.target.value,
                          },
                        }))
                      }
                    />
                  </label>

                  <label>
                    HR Name
                    <input
                      value={editModal.item.hrName || editModal.item.hr || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, hrName: e.target.value },
                        }))
                      }
                    />
                  </label>

                  <label>
                    Email
                    <input
                      value={editModal.item.email || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, email: e.target.value },
                        }))
                      }
                    />
                  </label>

                  <label>
                    Phone
                    <input
                      value={
                        editModal.item.contact || editModal.item.phone || ""
                      }
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, contact: e.target.value },
                        }))
                      }
                    />
                  </label>

                  {/* NEW: PROFILE PIC UPLOAD */}
                  <label>
                    Profile Picture
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onload = () =>
                          setEditModal((m) => ({
                            ...m,
                            item: { ...m.item, profilePic: reader.result },
                          }));
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  {editModal.item.profilePic && (
                    <div>
                      <img
                        src={editModal.item.profilePic}
                        alt="preview"
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          marginTop: 6,
                          objectFit: "cover",
                          border: "2px solid #ddd",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STUDENT EDIT */}
              {editModal.type === "student" && (
                <div className="form-grid">
                  <label>
                    First Name
                    <input
                      value={editModal.item.firstName || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, firstName: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Last Name
                    <input
                      value={editModal.item.lastName || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, lastName: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Email
                    <input
                      value={editModal.item.email || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, email: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Degree
                    <input
                      value={editModal.item.degree || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, degree: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Experience
                    <input
                      value={editModal.item.experience || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, experience: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Location
                    <input
                      value={editModal.item.location || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, location: e.target.value },
                        }))
                      }
                    />
                  </label>
                </div>
              )}

              {/* JOB EDIT */}
              {editModal.type === "job" && (
                <div className="form-grid">
                  <label>
                    Title
                    <input
                      value={editModal.item.title || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, title: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Company
                    <input
                      value={editModal.item.company || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, company: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Location
                    <input
                      value={editModal.item.location || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, location: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Experience
                    <input
                      value={editModal.item.experienceRange || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, experienceRange: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Salary
                    <input
                      value={editModal.item.salary || ""}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, salary: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={editModal.item.status || "pending"}
                      onChange={(e) =>
                        setEditModal((m) => ({
                          ...m,
                          item: { ...m.item, status: e.target.value },
                        }))
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={handleEditSave}>
                Save
              </button>
              <button className="btn secondary" onClick={closeEdit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ============================
      JOB VIEW MODAL
============================ */}
      {viewJob.open && (
        <div className="modal-backdrop" onClick={closeJobView}>
          <div
            className="company-view-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "850px",
              maxHeight: "90vh",
              background: "#fff",
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                background: "linear-gradient(135deg, #0a66c2, #0047a8)",
                color: "#fff",
                padding: "40px 20px",
                textAlign: "center",
              }}
            >
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>
                {viewJob.job.title}
              </h2>
              <div style={{ opacity: 0.85, fontSize: 14, marginTop: 4 }}>
                {viewJob.job.company} • {viewJob.job.location}
              </div>
            </div>

            {/* BODY */}
            <div
              style={{
                padding: "22px",
                overflowY: "auto",
                flex: 1,
                background: "#f3f6fb",
              }}
            >
              {/* Job Details */}
              <div
                style={{
                  background: "#fff",
                  padding: 20,
                  borderRadius: 14,
                  marginBottom: 20,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#0a66c2",
                  }}
                >
                  Job Details
                </h3>

                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <strong>Title:</strong> {viewJob.job.title}
                  </div>
                  <div>
                    <strong>Company:</strong> {viewJob.job.company}
                  </div>
                  <div>
                    <strong>Location:</strong> {viewJob.job.location}
                  </div>
                  <div>
                    <strong>Experience:</strong> {viewJob.job.experienceRange}
                  </div>
                  <div>
                    <strong>Salary:</strong> {viewJob.job.salary}
                  </div>
                  <div>
                    <strong>Description:</strong>{" "}
                    {viewJob.job.description || "-"}
                  </div>
                </div>
              </div>

              {/* Applicants */}
              <div
                style={{
                  background: "#fff",
                  padding: 20,
                  borderRadius: 14,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#0a66c2",
                  }}
                >
                  Applicants ({viewJob.applicants.length})
                </h3>

                {viewJob.applicants.length === 0 ? (
                  <div style={{ padding: 10, color: "#6b7280" }}>
                    No applicants yet.
                  </div>
                ) : (
                  viewJob.applicants.map(({ user, application }, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: 14,
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                      }}
                    >
                      <strong>
                        {user?.firstName} {user?.lastName}
                      </strong>
                      <div>Email: {user?.email}</div>
                      <div>Degree: {user?.degree}</div>
                      <div>Experience: {user?.experience}</div>

                      {application.resume && (
                        <a
                          href={application.resume}
                          target="_blank"
                          style={{
                            color: "#0a66c2",
                            fontWeight: 700,
                            display: "inline-block",
                            marginTop: 4,
                          }}
                        >
                          View Resume →
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CLOSE */}
            <button
              onClick={closeJobView}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "rgba(255,255,255,0.8)",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: 8,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ============================
      STYLES (FULL FILE BOTTOM)
============================ */}
      <style>{`
.admin-filter-bar {
  padding: 14px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #eef2f7;
}

.admin-filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  align-items: end;
}

.admin-filter-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-filter-field label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.admin-filter-field input,
.admin-filter-field select {
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 14px;
}

.admin-filter-actions {
  display: flex;
  gap: 8px;
}

.admin-filter-clear {
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-weight: 600;
  cursor: pointer;
}

  .admin-layout { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

  .cards-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0,1fr));
    gap: 12px;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  }

  .card-title { font-size: 14px; color: #3b82f6; font-weight: 600; }
  .card-value { font-size: 28px; font-weight: 800; margin-top: 6px; }
  .card-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }

  .content-row {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 16px;
  }

  .admin-sidebar {
    background: #ffffff;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  }

  .sidebar-title { font-weight: 700; color: #1f2937; margin-bottom: 8px; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 8px; }

  .sidebar-btn {
    text-align: left;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    cursor: pointer;
    font-weight: 600;
    color: #1f2937;
    transition: 0.25s all ease;
  }

  .sidebar-btn.active, .sidebar-btn:hover {
    background: #e8f0ff;
    border-color: #bfdbfe;
    color: #1d4ed8;
  }

  .admin-main { display: flex; flex-direction: column; gap: 16px; }

  .panel {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  }

  .panel-header {
    padding: 14px 16px;
    border-bottom: 1px solid #eef2f7;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 18px;
    color: #111827;
  }

  .table-wrap { width: 100%; overflow: auto; }

  .nice-table {
    width: 100%;
    border-collapse: collapse;
  }

  .nice-table th,
  .nice-table td {
    padding: 12px 10px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
    text-align: left;
  }

  .nice-table th {
    font-weight: 700;
    color: #1f2937;
    background: #f8fafc;
  }

  .nice-table tr:hover td { background: #f9fbff; }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 4px 8px;
    font-size: 12px;
    border: 1px solid #3b82f6;
    background: #3b82f6;
    color: #fff;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn.secondary {
    background: #fff;
    color: #1f2937;
    border-color: #d1d5db;
  }

  .btn.danger {
    background: #ef4444;
    border-color: #ef4444;
    color: #fff;
  }

  .icon-btn {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
  }

  .pill {
    display: inline-block;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
  }

  .pill.ok {
    background: #ecfdf5;
    color: #065f46;
    border-color: #a7f3d0;
  }
  .pill.pending {
    background: #fef9c3;
    color: #92400e;
    border-color: #fde68a;
  }
  .pill.warn {
    background: #fef2f2;
    color: #991b1b;
    border-color: #fecaca;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 9999;
  }

  .modal {
    width: 100%;
    max-width: 720px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.20);
    overflow: hidden;
  }

  .modal-header {
    padding: 12px 16px;
    border-bottom: 1px solid #eef2f7;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-body { padding: 16px; max-height: 60vh; overflow-y: auto; }

  .modal-footer {
    padding: 12px 16px;
    border-top: 1px solid #eef2f7;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    background: #fff;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 12px;
  }

  .form-grid label {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    color: #374151;
    font-weight: 600;
  }

  .form-grid input,
  .form-grid select {
    margin-top: 6px;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
  }

  .empty { text-align: center; color: #6b7280; padding: 18px 0; }

  /* COMPANY VIEW MODAL STYLE */
  .company-view-modal::-webkit-scrollbar { width: 8px; }
  .company-view-modal::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 8px;
  }

  @media (max-width: 980px) {
    .cards-row { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .content-row { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
  }
`}</style>
    </div>
  );
}
