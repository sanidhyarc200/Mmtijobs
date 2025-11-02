import React from "react";

export default function TemplateClassic({ data }) {
  const { basics, summary, skills, experience, education, projects, theme, photo } = data;
  const color = theme?.color || "#0b5fff";

  return (
    <div style={{
      fontFamily: theme?.font || "Inter",
      lineHeight: theme?.spacing === "compact" ? "1.2" : theme?.spacing === "roomy" ? "1.8" : "1.5",
      color: "#1f2937"
    }}>
      <style>{`
        .head-bar{
          background:${color};color:#fff;border-radius:8px;padding:12px 20px;
          display:flex;align-items:center;gap:12px;margin-bottom:20px;
        }
        .head-bar img{
          width:70px;height:70px;border-radius:50%;object-fit:cover;border:2px solid #fff;
        }
        .head-meta{font-size:13px;margin-top:4px;color:#e0e7ff;}
        h2{margin:0 0 6px 0;}
        h3{color:${color};margin-bottom:6px;margin-top:20px;}
        ul{margin:4px 0 0 16px;padding:0;}
        ul li{margin-bottom:4px;}
        .chip{
          display:inline-block;padding:4px 10px;border-radius:999px;background:#eef2ff;
          color:${color};font-size:13px;margin:4px;
        }
      `}</style>

      {/* Header */}
      <div className="head-bar">
        {photo && <img src={photo} alt="profile" />}
        <div>
          <h2>{basics.fullName || "Your Name"}</h2>
          <div>{basics.headline}</div>
          <div className="head-meta">
            {basics.email && basics.email} {basics.phone && `• ${basics.phone}`}
          </div>
        </div>
      </div>

      {summary && (
        <>
          <h3>Summary</h3>
          <p>{summary}</p>
        </>
      )}

      {skills?.length ? (
        <>
          <h3>Skills</h3>
          <div>
            {skills.map((s, i) => (
              <span key={i} className="chip">{s}</span>
            ))}
          </div>
        </>
      ) : null}

      {experience?.filter(e => e.title).length ? (
        <>
          <h3>Experience</h3>
          {experience.filter(e => e.title).map((e, i) => (
            <div key={i}>
              <strong>{e.title}</strong>
              <ul>{e.details.split("\n").map((b, j) => <li key={j}>{b}</li>)}</ul>
            </div>
          ))}
        </>
      ) : null}

      {education?.filter(ed => ed.title).length ? (
        <>
          <h3>Education</h3>
          {education.filter(ed => ed.title).map((ed, i) => (
            <div key={i}><strong>{ed.title}</strong></div>
          ))}
        </>
      ) : null}

      {projects?.filter(p => p.title).length ? (
        <>
          <h3>Projects</h3>
          {projects.filter(p => p.title).map((p, i) => (
            <div key={i}><strong>{p.title}</strong></div>
          ))}
        </>
      ) : null}
    </div>
  );
}
