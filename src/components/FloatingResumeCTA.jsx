import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FloatingResumeCTA() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );
  // On mobile, start collapsed to a small pill so it never covers content.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const font = "Inter, system-ui, -apple-system, Segoe UI, Roboto";

  // Compact collapsed pill (mobile default)
  if (isMobile && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Build a resume"
        style={{
          position: "fixed",
          right: 14,
          bottom: 14,
          zIndex: 9999,
          background: "#0B5FFF",
          color: "#fff",
          border: "none",
          borderRadius: 999,
          padding: "12px 16px",
          fontWeight: 700,
          fontSize: 14,
          fontFamily: font,
          boxShadow: "0 8px 20px rgba(11,95,255,.35)",
          cursor: "pointer",
        }}
      >
        📄 Resume
      </button>
    );
  }

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
          position: "relative",
          background: "#0B5FFF",
          color: "#fff",
          padding: "14px 16px",
          borderRadius: 12,
          boxShadow: "0 8px 20px rgba(11,95,255,.25)",
          maxWidth: isMobile ? "calc(100vw - 32px)" : 260,
          fontFamily: font,
        }}
      >
        {isMobile && (
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 6,
              right: 8,
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: 18,
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        )}
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
