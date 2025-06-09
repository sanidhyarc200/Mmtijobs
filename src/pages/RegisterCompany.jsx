// src/pages/RegisterCompany.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterCompany() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");

  const [registered, setRegistered] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedCompany = JSON.parse(localStorage.getItem("registeredCompany"));
    if (savedCompany) {
      setCompanyName(savedCompany.name);
      setCompanyEmail(savedCompany.email);
      setContact(savedCompany.contact);
      setRegistered(true);
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!companyName.trim()) newErrors.companyName = "Company Name is required";
    if (!companyEmail.trim()) {
      newErrors.companyEmail = "Company Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(companyEmail.trim())
    ) {
      newErrors.companyEmail = "Invalid email address";
    }
    if (!contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!/^\d{10}$/.test(contact.trim())) {
      newErrors.contact = "Contact number must be 10 digits";
    }
    if (!password.trim()) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerCompany = () => {
    if (!validate()) return;

    const companyData = {
      name: companyName.trim(),
      email: companyEmail.trim(),
      contact: contact.trim(),
      password,
    };

    localStorage.setItem("registeredCompany", JSON.stringify(companyData));
    setRegistered(true);
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "80px auto",
        padding: 30,
        backgroundColor: "white",
        borderRadius: 10,
        boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
        fontFamily: "'Arial', sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#0a66c2" }}>
        Register Your Company
      </h2>

      <div style={{ marginBottom: 15 }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}
        >
          Company Name
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: errors.companyName ? "1.5px solid red" : "1px solid #ccc",
          }}
          disabled={registered}
        />
        {errors.companyName && (
          <p style={{ color: "red", marginTop: 5 }}>{errors.companyName}</p>
        )}
      </div>

      <div style={{ marginBottom: 15 }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}
        >
          Company Email
        </label>
        <input
          type="email"
          value={companyEmail}
          onChange={(e) => setCompanyEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: errors.companyEmail ? "1.5px solid red" : "1px solid #ccc",
          }}
          disabled={registered}
        />
        {errors.companyEmail && (
          <p style={{ color: "red", marginTop: 5 }}>{errors.companyEmail}</p>
        )}
      </div>

      <div style={{ marginBottom: 15 }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}
        >
          Contact Number
        </label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: errors.contact ? "1.5px solid red" : "1px solid #ccc",
          }}
          disabled={registered}
        />
        {errors.contact && (
          <p style={{ color: "red", marginTop: 5 }}>{errors.contact}</p>
        )}
      </div>

      <div style={{ marginBottom: 15 }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}
        >
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: errors.password ? "1.5px solid red" : "1px solid #ccc",
          }}
          disabled={registered}
        />
        {errors.password && (
          <p style={{ color: "red", marginTop: 5 }}>{errors.password}</p>
        )}
      </div>

      {!registered ? (
        <button
          onClick={registerCompany}
          style={{
            padding: "12px 20px",
            backgroundColor: "#0a66c2",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Register
        </button>
      ) : (
        <>
          <button
            onClick={() => navigate("/post-job")}
            style={{
              padding: "12px 20px",
              backgroundColor: "#198754",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%",
              marginBottom: 10,
            }}
          >
            Post a Job
          </button>

          <button
            onClick={() => navigate("/company-profile")}
            style={{
              padding: "12px 20px",
              backgroundColor: "#rgb(10, 102, 194)",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%",
            }}
          >
            View Profile
          </button>
        </>
      )}
    </div>
  );
}
