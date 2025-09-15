// src/pages/EditProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();
  const BLUE = "#0a66c2";

  const [formData, setFormData] = useState({
    experience: "",
    currentSalary: "",
    expectedSalary: "",
    location: "",
    techstack: "",
    description: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user && user.userType === "applicant") {
      setFormData({
        experience: user.experience || "",
        currentSalary: user.currentSalary || "",
        expectedSalary: user.expectedSalary || "",
        location: user.location || "",
        techstack: user.techstack || "",
        description: user.description || "",
      });
    } else {
      navigate("/"); // redirect if not applicant
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.experience || isNaN(formData.experience)) return "Enter valid experience";
    if (!formData.currentSalary || isNaN(formData.currentSalary)) return "Enter valid current salary";
    if (!formData.expectedSalary || isNaN(formData.expectedSalary)) return "Enter valid expected salary";
    if (!formData.techstack) return "Enter your skills / tech stack";
    if (formData.description.length < 30) return "Description must be at least 30 characters";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    users = users.map((u) =>
      u.email === currentUser.email ? { ...u, ...formData } : u
    );
    currentUser = { ...currentUser, ...formData };

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    alert("Profile updated successfully!");
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#f8fafc",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px 40px",
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(10,102,194,0.15)",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <h2
          style={{
            color: BLUE,
            fontWeight: 800,
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          ✏️ Edit Your Profile
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
          {/* Experience */}
          <div>
            <label style={{ fontWeight: 600, color: "#374151" }}>
              Experience (years)
            </label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* Current Salary */}
          <div>
            <label style={{ fontWeight: 600, color: "#374151" }}>
              Current Salary
            </label>
            <input
              type="number"
              name="currentSalary"
              value={formData.currentSalary}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* Expected Salary */}
          <div>
            <label style={{ fontWeight: 600, color: "#374151" }}>
              Expected Salary
            </label>
            <input
              type="number"
              name="expectedSalary"
              value={formData.expectedSalary}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* Location */}
          <div>
            <label style={{ fontWeight: 600, color: "#374151" }}>
              Preferred Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label style={{ fontWeight: 600, color: "#374151" }}>
              Tech Stack / Skills
            </label>
            <input
              type="text"
              name="techstack"
              value={formData.techstack}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontWeight: 600, color: "#374151" }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              style={{
                ...inputStyle,
                resize: "none",
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              background: BLUE,
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#004182")}
            onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  marginTop: "6px",
  fontSize: "0.95em",
  outline: "none",
  transition: "border-color 0.2s ease",
};
