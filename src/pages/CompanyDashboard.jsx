// src/pages/CompanyDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);

  // Edit Profile Modal State — fields now mirror RegisterCompany
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    contact: "",
    streetAddress: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    industryType: "",
    numberOfEmployees: "",
    companyWebsite: "",
    profilePic: "",
  });

  const BLUE = "#0a66c2";

  // Same options as RegisterCompany — kept in sync
  const industries = [
    "Information Technology","Healthcare","Finance & Banking","Education",
    "Manufacturing","Retail","Real Estate","Transportation",
    "Hospitality","Media & Entertainment","Consulting","Other"
  ];
  const companySizes = [
    "1-10 employees","11-50 employees","51-200 employees",
    "201-500 employees","501-1000 employees","1000+ employees"
  ];

  useEffect(() => {
    const logged = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(logged);
    setJobs(JSON.parse(localStorage.getItem("jobs")) || []);

    if (logged && logged.userType === "recruiter") {
      const saved = JSON.parse(localStorage.getItem("registeredCompany")) || {};

      const comp = {
        name:              logged.company || logged.name || saved.name,
        email:             logged.email,
        contact:           logged.contact || saved.contact,
        streetAddress:     logged.streetAddress || saved.streetAddress || "",
        city:              logged.city || saved.city || "",
        state:             logged.state || saved.state || "",
        pincode:           logged.pincode || saved.pincode || "",
        gstNumber:         logged.gstNumber || saved.gstNumber || "",
        industryType:      logged.industryType || saved.industryType || "",
        numberOfEmployees: logged.numberOfEmployees || saved.numberOfEmployees || "",
        companyWebsite:    logged.companyWebsite || saved.companyWebsite || "",
        profilePic:        saved.profilePic || logged.profilePic || "",
      };

      setCompany(comp);

      setEditData({
        name:              comp.name,
        contact:           comp.contact,
        streetAddress:     comp.streetAddress,
        city:              comp.city,
        state:             comp.state,
        pincode:           comp.pincode,
        gstNumber:         comp.gstNumber,
        industryType:      comp.industryType,
        numberOfEmployees: comp.numberOfEmployees,
        companyWebsite:    comp.companyWebsite,
        profilePic:        comp.profilePic,
      });
    }
  }, []);

  const myJobs = useMemo(() => {
    if (!company && !currentUser) return [];
    const email = currentUser?.email || company?.email;
    const uid = currentUser?.id;
    return (jobs || []).filter(
      (j) => j.companyEmail === email || j.postedBy === uid
    );
  }, [jobs, company, currentUser]);

  // ── SAVE: writes to users[], currentUser, AND registeredCompany
  const handleEditSave = () => {
    const logged = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];

    users = users.map((u) => {
      if (u.email.toLowerCase() === logged.email.toLowerCase()) {
        return {
          ...u,
          company:           editData.name,
          name:              editData.name,
          contact:           editData.contact,
          streetAddress:     editData.streetAddress,
          city:              editData.city,
          state:             editData.state,
          pincode:           editData.pincode,
          gstNumber:         editData.gstNumber,
          industryType:      editData.industryType,
          numberOfEmployees: editData.numberOfEmployees,
          companyWebsite:    editData.companyWebsite,
          profilePic:        editData.profilePic,
        };
      }
      return u;
    });
    localStorage.setItem("users", JSON.stringify(users));

    const updatedUser = users.find(
      (u) => u.email.toLowerCase() === logged.email.toLowerCase()
    );
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    const savedCompany = JSON.parse(localStorage.getItem("registeredCompany")) || {};
    localStorage.setItem("registeredCompany", JSON.stringify({
      ...savedCompany,
      name:              editData.name,
      contact:           editData.contact,
      streetAddress:     editData.streetAddress,
      city:              editData.city,
      state:             editData.state,
      pincode:           editData.pincode,
      gstNumber:         editData.gstNumber,
      industryType:      editData.industryType,
      numberOfEmployees: editData.numberOfEmployees,
      companyWebsite:    editData.companyWebsite,
      profilePic:        editData.profilePic,
    }));

    setCompany({ ...editData, email: logged.email });
    setShowEditModal(false);
  };

  return (
    <>
    <div style={{ fontFamily: "'Inter','Arial',sans-serif", background: "#f3f6fb", minHeight: "100vh" }}>

      {/* --- HEADER --- */}
      <div style={{
        background: `linear-gradient(135deg, ${BLUE}, #0047a8)`,
        color: "#fff",
        padding: "60px 20px 100px",
        textAlign: "center",
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        boxShadow: "0 8px 40px rgba(10,102,194,0.25)",
        position: "relative",
      }}>
        <div style={{ position: "absolute", bottom: "-60px", left: "50%", transform: "translateX(-50%)" }}>
          <img
            src={company?.profilePic || currentUser?.profilePic || "https://via.placeholder.com/120x120.png?text=Logo"}
            alt="profile"
            style={{ width: 120, height: 120, borderRadius: "50%", border: "4px solid #fff", objectFit: "cover", boxShadow: "0 10px 25px rgba(0,0,0,0.25)", background: "#fff" }}
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
      <div style={{ maxWidth: 1100, margin: "100px auto 60px", padding: "0 16px" }}>

        {/* ACTION BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <h2 style={{ color: BLUE, fontWeight: 800, margin: "8px 0" }}>Dashboard Overview</h2>
          <button onClick={() => navigate("/post-job")} style={btnPrimary}>+ Post New Job</button>
        </div>

        {/* PROFILE + STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 24 }}>

          {/* PROFILE CARD */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={h3}>Company Profile</h3>
              <button onClick={() => setShowEditModal(true)} style={{ ...btnPrimarySmall, padding: "6px 12px", background: BLUE, fontSize: 13 }}>
                Edit
              </button>
            </div>

            {company ? (
              <div style={{ display: "grid", gap: 10 }}>
                <Row label="Name"    value={company.name} />
                <Row label="Email"   value={company.email} />
                <Row label="Contact" value={company.contact} />
                {(company.streetAddress || company.city || company.state || company.pincode) && (
                  <Row label="Address" value={[company.streetAddress, company.city, company.state, company.pincode].filter(Boolean).join(", ")} />
                )}
                {company.industryType && <Row label="Industry" value={company.industryType} chip />}
                {company.numberOfEmployees && <Row label="Size" value={company.numberOfEmployees} chip />}
                {company.gstNumber && <Row label="GST" value={company.gstNumber} chip />}
                {company.companyWebsite && <Row label="Website" value={company.companyWebsite} link />}
              </div>
            ) : (
              <div style={{ color: "#6b7280" }}>No company info found. Please register your company.</div>
            )}
          </div>

          {/* STATS CARD */}
          <div style={card}>
            <h3 style={h3}>Quick Stats</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "center" }}>
              <Stat label="Active Jobs" value={myJobs.length} />
              <Stat label="Applicants" value={countApplicants(myJobs)} />
            </div>
          </div>
        </div>

        {/* JOB LIST */}
        <section style={card}>
          <h3 style={h3}>Your Job Posts</h3>
          {myJobs.length === 0 ? (
            <div style={{ color: "#6b7280", textAlign: "center", padding: "20px 0" }}>
              You haven't posted any jobs yet.
              <button onClick={() => navigate("/post-job")} style={{ ...btnLink, marginLeft: 6 }}>Post one now →</button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {myJobs.map((job) => {
                const applicantCount = countApplicantsForJob(job.id);
                return (
                  <div key={job.id} style={jobCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                      <div>
                        <h4 style={{ margin: "0 0 4px", color: BLUE, fontWeight: 800 }}>{job.title}</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={pill}>{job.location}</span>
                          <span style={pill}>{job.experienceRange}</span>
                          {job.salary && <span style={pill}>{job.salary}</span>}
                        </div>
                        <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 8 }}>
                          Posted on {new Date(job.createdAt || Date.now()).toLocaleDateString()} • {job.company}
                        </div>
                        <button onClick={() => navigate(`/job-applicants/${job.id}`)} style={btnPrimarySmall}>View Applicants</button>
                      </div>
                      <div style={{ minWidth: 46, height: 46, borderRadius: "50%", background: "#e0f2fe", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: 700, color: "#0369a1", fontSize: "0.95em", boxShadow: "0 3px 8px rgba(0,0,0,0.1)" }}>
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
    {/* ============================================================
       EDIT MODAL — rendered OUTSIDE root div (sibling via fragment)
       so box-shadow stacking contexts on the header cannot block it
    ============================================================ */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", width: 500, maxWidth: "95vw", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

            {/* HEADER */}
            <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <h3 style={{ margin: 0, color: BLUE, fontWeight: 800, fontSize: 18 }}>Edit Company Profile</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>×</button>
            </div>

            {/* SCROLL BODY — maxHeight instead of flex:1 so it actually scrolls */}
            <div style={{ padding: "18px 24px 24px", overflowY: "auto", maxHeight: "calc(90vh - 130px)" }}>

              {/* Logo preview + upload */}
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <img
                  src={editData.profilePic || "https://via.placeholder.com/100x100.png?text=Logo"}
                  alt="preview"
                  style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 8 }}
                />
                <div>
                  <label style={{ color: BLUE, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    Change Logo
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setEditData({ ...editData, profilePic: reader.result });
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div style={sectionBadge}>Company Information</div>

              <label style={labelStyle}>Company Name</label>
              <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>Email (Locked)</label>
              <input type="text" value={company?.email || ""} disabled style={{ ...inputStyle, background: "#f3f4f6", cursor: "not-allowed", color: "#6b7280" }} />

              <label style={labelStyle}>Contact Number</label>
              <input type="tel" value={editData.contact} onChange={(e) => setEditData({ ...editData, contact: e.target.value })} style={inputStyle} placeholder="9876543210" />

              <div style={{ ...sectionBadge, marginTop: 20 }}>Business Address</div>

              <label style={labelStyle}>Street Address</label>
              <input type="text" value={editData.streetAddress} onChange={(e) => setEditData({ ...editData, streetAddress: e.target.value })} style={inputStyle} placeholder="123 Business Street" />

              <label style={labelStyle}>City</label>
              <input type="text" value={editData.city} onChange={(e) => setEditData({ ...editData, city: e.target.value })} style={inputStyle} placeholder="Mumbai" />

              <label style={labelStyle}>State</label>
              <input type="text" value={editData.state} onChange={(e) => setEditData({ ...editData, state: e.target.value })} style={inputStyle} placeholder="Maharashtra" />

              <label style={labelStyle}>Postal Code</label>
              <input type="text" value={editData.pincode} onChange={(e) => setEditData({ ...editData, pincode: e.target.value })} style={inputStyle} placeholder="400001" />

              <div style={{ ...sectionBadge, marginTop: 20 }}>Organization Details</div>

              <label style={labelStyle}>GST Number (Optional)</label>
              <input type="text" value={editData.gstNumber} onChange={(e) => setEditData({ ...editData, gstNumber: e.target.value })} style={inputStyle} placeholder="27AABCU9603R1ZX" />

              <label style={labelStyle}>Industry Type</label>
              <select value={editData.industryType} onChange={(e) => setEditData({ ...editData, industryType: e.target.value })} style={inputStyle}>
                <option value="">Select industry</option>
                {industries.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>

              <label style={labelStyle}>Company Size</label>
              <select value={editData.numberOfEmployees} onChange={(e) => setEditData({ ...editData, numberOfEmployees: e.target.value })} style={inputStyle}>
                <option value="">Select size</option>
                {companySizes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <label style={labelStyle}>Website (Optional)</label>
              <input type="url" value={editData.companyWebsite} onChange={(e) => setEditData({ ...editData, companyWebsite: e.target.value })} style={inputStyle} placeholder="https://acme.com" />
            </div>

            {/* FIXED FOOTER */}
            <div style={{ padding: "12px 24px", borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 10, background: "#fff", flexShrink: 0 }}>
              <button onClick={() => setShowEditModal(false)} style={{ ...btnPrimarySmall, background: "#e5e7eb", color: "#374151" }}>Cancel</button>
              <button onClick={handleEditSave} style={{ ...btnPrimarySmall, background: BLUE, color: "#fff" }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===== COMPONENTS ===== */
function Row({ label, value, chip, link }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ minWidth: 90, color: "#6b7280", fontSize: 14, fontWeight: 600 }}>{label}</div>
      <div>
        {link ? (
          <a href={value} target="_blank" rel="noreferrer" style={{ color: "#0a66c2", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>{value}</a>
        ) : chip ? (
          <span style={{ display: "inline-block", background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: 50, fontSize: 13, fontWeight: 600 }}>{value}</span>
        ) : (
          <span style={{ color: "#111827", fontWeight: 600, fontSize: 14 }}>{value || "-"}</span>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <div style={{ color: "#6b7280", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#111827" }}>{value}</div>
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
const card = { background: "#fff", borderRadius: 14, boxShadow: "0 8px 25px rgba(0,0,0,0.05)", padding: 18 };
const h3 = { marginTop: 0, color: "#111827", fontWeight: 800, fontSize: 18 };
const btnPrimary = { padding: "10px 18px", background: "#0a66c2", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 14px rgba(10,102,194,0.3)" };
const btnPrimarySmall = { padding: "8px 14px", background: "#0a66c2", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 };
const btnLink = { background: "none", border: "none", color: "#0a66c2", fontWeight: 700, cursor: "pointer", padding: 0 };
const pill = { background: "#e5e7eb", color: "#111827", padding: "4px 10px", borderRadius: "50px", fontSize: "0.85rem", fontWeight: 600, display: "inline-block" };
const jobCard = { background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16, transition: "transform 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 6px 14px rgba(0,0,0,0.05)" };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", marginTop: 6, fontSize: 14, fontFamily: "inherit", outline: "none" };
const labelStyle = { fontWeight: 600, marginTop: 14, display: "block", fontSize: 14, color: "#374151" };
const sectionBadge = { fontSize: 11, fontWeight: 700, color: "#fff", background: "#0a66c2", padding: "4px 10px", borderRadius: 6, marginTop: 6, marginBottom: 2, letterSpacing: "0.5px", textTransform: "uppercase", display: "inline-block" };