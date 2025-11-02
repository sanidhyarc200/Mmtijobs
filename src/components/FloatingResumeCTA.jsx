import React from "react";
import { useNavigate } from "react-router-dom";

export default function FloatingResumeCTA() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          background: "#0B5FFF",
          color: "#fff",
          padding: "14px 16px",
          borderRadius: 12,
          boxShadow: "0 8px 20px rgba(11,95,255,.25)",
          maxWidth: 260,
          fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
          Build a pro resume →
        </div>
        <div style={{ opacity: 0.95, fontSize: 12, lineHeight: 1.3 }}>
          Create an ATS-friendly resume in minutes. Pick a template and export.
        </div>
        <button
          onClick={() => navigate("/resume-builder/start")}
          style={{
            marginTop: 10,
            width: "100%",
            background: "#fff",
            color: "#0B5FFF",
            border: "1px solid #dfe6ff",
            padding: "10px 12px",
            borderRadius: 10,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Use Resume Builder
        </button>
      </div>
    </div>
  );
}
