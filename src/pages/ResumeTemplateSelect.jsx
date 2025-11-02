import React from "react";
import { useNavigate } from "react-router-dom";

export default function TemplateSelect() {
  const navigate = useNavigate();

  const selectTemplate = (key) => {
    sessionStorage.setItem("selectedTemplate", key);
    navigate("/resume-builder");
  };

  return (
    <div className="choose-wrapper">
      <style>{`
        body { background:#f8fafc;font-family:'Inter',system-ui; }
        .choose-wrapper{
          min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:40px;text-align:center;
        }
        .choose-wrapper h1{font-size:28px;font-weight:800;margin-bottom:10px;}
        .choose-wrapper p{color:#64748b;margin-bottom:40px;}
        .tpl-grid{
          display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
          gap:24px;width:100%;max-width:800px;
        }
        .tpl-card{
          background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px;
          box-shadow:0 8px 20px rgba(0,0,0,0.05);cursor:pointer;transition:all .2s ease;
        }
        .tpl-card:hover{
          transform:translateY(-4px);
          box-shadow:0 12px 24px rgba(0,0,0,0.1);
        }
        .tpl-preview{
          height:300px;background:#f1f5f9;border-radius:8px;margin-bottom:14px;
          display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:13px;
        }
        .tpl-card h3{margin:0;font-size:16px;font-weight:700;}
        .tpl-btn{
          margin-top:12px;padding:10px 14px;background:#0b5fff;color:#fff;border:none;border-radius:8px;
          font-weight:700;cursor:pointer;
        }
      `}</style>

      <h1>Choose a Template</h1>
      <p>Select your resume style — you can preview and edit later anytime.</p>

      <div className="tpl-grid">
        <div className="tpl-card" onClick={() => selectTemplate("classic")}>
          <div className="tpl-preview">Classic Layout Preview</div>
          <h3>Classic Template</h3>
          <button className="tpl-btn">Use Template</button>
        </div>
        <div className="tpl-card" onClick={() => selectTemplate("modern")}>
          <div className="tpl-preview">Modern Layout Preview</div>
          <h3>Modern Template</h3>
          <button className="tpl-btn">Use Template</button>
        </div>
      </div>
    </div>
  );
}
