import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.userType !== "recruiter") {
      navigate("/register-company", { replace: true });
      return;
    }
    setUser(currentUser);

    const savedCompany = JSON.parse(localStorage.getItem("registeredCompany"));
    if (!savedCompany) {
      // no company yet, send to register
      navigate("/register-company", { replace: true });
      return;
    }
    setCompany(savedCompany);
    setName(savedCompany.name || "");
    setEmail(savedCompany.email || "");
    setContact(savedCompany.contact || "");
  }, [navigate]);

  const save = () => {
    if (!name.trim() || !email.trim()) {
      alert("Name and Email are required.");
      return;
    }
    const updated = { ...(company || {}), name: name.trim(), email: email.trim(), contact: contact.trim() };
    localStorage.setItem("registeredCompany", JSON.stringify(updated));

    // Update recruiter in users & currentUser
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const idx = users.findIndex(u => u.id === user?.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], name: updated.name, company: updated.name, email: updated.email, contact: updated.contact };
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(users[idx]));
      window.dispatchEvent(new Event('authChanged'));
    }

    alert("Profile updated.");
  };

  if (!user || !company) return null;

  return (
    <div style={{ maxWidth: 760, margin: "60px auto", padding: "0 16px", fontFamily: "'Inter','Arial',sans-serif" }}>
      <h2 style={{ color: "#0a66c2", marginBottom: 8 }}>Company Profile</h2>

      <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 600 }}>Company Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} style={inp} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 600 }}>Company Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} style={inp} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 600 }}>Contact</label>
          <input value={contact} onChange={e=>setContact(e.target.value)} style={inp} />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/company-dashboard")} style={btnSecondary}>Back to Dashboard</button>
          <button onClick={save} style={btnPrimary}>Save</button>
        </div>
      </div>
    </div>
  );
}

const inp = { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", outline: "none" };
const btnPrimary = { padding: "10px 16px", background: "#0a66c2", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" };
const btnSecondary = { padding: "10px 16px", background: "#e5e7eb", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" };
