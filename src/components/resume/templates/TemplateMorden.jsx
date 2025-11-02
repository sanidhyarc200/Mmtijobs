import React from "react";

export default function TemplateModern({ data }) {
  const { basics, summary, skills, experience, education, projects, theme, photo } = data;
  const color = theme?.color || "#0b5fff";

  return (
    <div style={{
      fontFamily: theme?.font || "Inter",
      lineHeight: theme?.spacing === "compact" ? "1.2" : theme?.spacing === "roomy" ? "1.8" : "1.5",
      color: "#111827"
    }}>
      <style>{`
        .mod-head{
          display:flex;align-items:center;gap:16px;border-bottom:3px solid ${color};
          padding-bottom:12px;margin-bottom:20px;
        }
        .mod-head img{width:80px;height:80px;border-radius:50%;object-fit:cover;}
        .mod-contact{font-size:13px;color:#475569;margin-top:4px;}
        h2{margin:0;}
        h3{margin-top:20px;color:${color};}
        ul{margin:4px 0 0 16px;padding:0;}
        .tag{
          display:inline-block;padding:4px 10px;margin:3px;
          border-radius:999px;background:${color}10;color:${color};font-size:13px;
        }
      `}</style>

      {/* Header */}
      <div className="mod-head">
        {photo && <img src={photo} alt="profile" />}
        <div>
          <h2>{basics.fullName || "Your Name"}</h2>
          <div>{basics.headline}</div>
          <div className="mod-contact">
            {basics.email} {basics.phone && `• ${basics.phone}`} {basics.location && `• ${basics.location}`}
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
          <h3>Core Skills</h3>
          <div>{skills.map((s, i) => <span key={i} className="tag">{s}</span>)}</div>
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

      {projects?.filter(p => p.title).length ? (
        <>
          <h3>Projects</h3>
          {projects.filter(p => p.title).map((p, i) => (
            <div key={i}><strong>{p.title}</strong></div>
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
    </div>
  );
}
