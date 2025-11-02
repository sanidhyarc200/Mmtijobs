import React, { useState, useEffect, useMemo } from "react";
import TemplateClassic from "../components/resume/templates/TemplateClassic";
import TemplateModern from "../components/resume/templates/TemplateMorden";
import PaymentModal from "../components/PaymentModal";

export default function ResumeBuilder() {
    const selected = sessionStorage.getItem("selectedTemplate");
    const empty = { title: "", subtitle: "", start: "", end: "", details: "" };
  
    const defaultData = {
      basics: { fullName: "", headline: "", email: "", phone: "", location: "", website: "" },
      summary: "",
      skills: "",
      experience: [empty],
      education: [empty],
      projects: [empty],
      template: selected || "classic",
      photo: null,
    };
  
    const [data, setData] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem("resumeDraft")) || defaultData;
      } catch {
        return defaultData;
      }
    });
    const [section, setSection] = useState("basics");
    const [showPayModal, setShowPayModal] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [theme, setTheme] = useState({ color: "#0b5fff", font: "Inter", spacing: "normal" });
    const [saveStatus, setSaveStatus] = useState("Saved ✓");
    let saveTimer;
  
    // --- Auto-save with debounce ---
    const scheduleSave = () => {
      setSaveStatus("Saving…");
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        localStorage.setItem("resumeDraft", JSON.stringify(data));
        setSaveStatus("Saved ✓");
      }, 700);
    };
  
    useEffect(() => scheduleSave(), [data]);
  
    const update = (path, val) => {
      setData((d) => {
        const copy = structuredClone(d);
        let t = copy;
        for (let i = 0; i < path.length - 1; i++) t = t[path[i]];
        t[path[path.length - 1]] = val;
        return copy;
      });
    };
  
    const skillList = useMemo(() => data.skills.split(",").map((s) => s.trim()).filter(Boolean), [data.skills]);
    const handleDownload = () => setShowPayModal(true);
    const handlePhotoUpload = (e) => {
      const f = e.target.files[0];
      if (f) update(["photo"], URL.createObjectURL(f));
    };
    const resetResume = () => {
      if (window.confirm("Clear all fields and start fresh?")) {
        setData(defaultData);
        localStorage.removeItem("resumeDraft");
      }
    };
  
    return (
      <div className="studio">
        <style>{`
          body { background:#f7f8fa;font-family:${theme.font},system-ui;color:#111; }
          .studio {display:flex;flex-direction:column;min-height:100vh;}
          /* --- Topbar --- */
          .topbar {
            display:flex;justify-content:space-between;align-items:center;
            background:#fff;border-bottom:1px solid #e5e7eb;padding:12px 24px;
            position:sticky;top:0;z-index:20;
          }
          .title h1{font-size:18px;font-weight:700;margin:0;}
          .status{font-size:13px;color:#64748b;margin-top:2px;}
          .actions button{
            margin-left:8px;padding:8px 14px;border-radius:8px;font-weight:600;cursor:pointer;
            border:1px solid #dbe3ef;background:#fff;
          }
          .actions button.primary{background:${theme.color};color:#fff;border:none;}
          /* --- Layout --- */
          .main{flex:1;display:grid;grid-template-columns:300px 1fr;max-height:calc(100vh - 64px);}
          @media(max-width:960px){.main{grid-template-columns:1fr}}
          .sidebar{
            background:#fff;border-right:1px solid #e5e7eb;padding:16px;overflow:auto;
          }
          .preview{
            background:#fff;padding:32px;overflow:auto;
          }
          /* --- Sections --- */
          .sec{border:1px solid #e5e7eb;border-radius:10px;margin-bottom:12px;}
          .sec-head{
            padding:10px 14px;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;
            background:#fafafa;border-radius:10px;
          }
          .sec-body{padding:14px;animation:fadeIn .2s ease;}
          .sec-body input,.sec-body textarea{
            width:100%;padding:9px 12px;margin-bottom:8px;border:1px solid #dbe3ef;border-radius:8px;font:inherit;
          }
          .sec-body input:focus,.sec-body textarea:focus{outline:1.5px solid ${theme.color};}
          .photo{display:flex;flex-direction:column;align-items:center;margin-bottom:12px;}
          .photo img{width:90px;height:90px;border-radius:9999px;object-fit:cover;margin-bottom:6px;}
          .photo .remove{font-size:12px;color:#ef4444;cursor:pointer;}
          .add-btn{background:#f9fafb;border:1px dashed #d0d7e0;border-radius:8px;padding:6px 8px;font-size:13px;cursor:pointer;}
          /* --- Drawer --- */
          .drawer{
            position:fixed;right:0;top:0;height:100%;width:280px;background:#fff;
            box-shadow:-4px 0 20px rgba(0,0,0,.1);transform:translateX(${showDrawer ? 0 : 100}%);
            transition:transform .3s ease;z-index:50;padding:20px;
          }
          .drawer h3{margin-top:0;font-size:16px;}
          .drawer label{font-size:13px;font-weight:600;margin-top:10px;display:block;}
          .drawer input[type=color]{width:100%;height:40px;border:none;margin-top:4px;}
          .drawer select{width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px;}
          @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
        `}</style>
  
        {/* --- Topbar --- */}
        <div className="topbar">
          <div className="title">
            <h1>MMTI Resume Studio</h1>
            <div className="status">{saveStatus}</div>
          </div>
          <div className="actions">
            <button onClick={resetResume}>Reset</button>
            <button onClick={() => setShowDrawer(true)}>Customize</button>
            <button className="primary" onClick={handleDownload}>Download</button>
          </div>
        </div>
  
        {/* --- Main Grid --- */}
        <div className="main">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="photo">
              {data.photo ? (
                <>
                  <img src={data.photo} alt="profile" />
                  <div className="remove" onClick={() => update(["photo"], null)}>Remove photo</div>
                </>
              ) : (
                <label style={{fontSize:13,color:theme.color,cursor:"pointer"}}>
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoUpload}/>
                  Upload photo
                </label>
              )}
            </div>
  
            {[
              {key:"basics",label:"Personal Information"},
              {key:"summary",label:"Professional Summary"},
              {key:"experience",label:"Experience"},
              {key:"education",label:"Education"},
              {key:"skills",label:"Skills"},
              {key:"projects",label:"Projects"}
            ].map((sec)=>(
              <div className="sec" key={sec.key}>
                <div className="sec-head" onClick={()=>setSection(sec.key)}>
                  {sec.label}<span>{section===sec.key?"−":"+"}</span>
                </div>
                {section===sec.key&&(
                  <div className="sec-body">
                    {sec.key==="basics"&&(
                      <>
                        <input placeholder="Full name" value={data.basics.fullName} onChange={e=>update(["basics","fullName"],e.target.value)}/>
                        <input placeholder="Job title" value={data.basics.headline} onChange={e=>update(["basics","headline"],e.target.value)}/>
                        <input placeholder="Email" value={data.basics.email} onChange={e=>update(["basics","email"],e.target.value)}/>
                        <input placeholder="Phone" value={data.basics.phone} onChange={e=>update(["basics","phone"],e.target.value)}/>
                        <textarea placeholder="Address" rows={2} value={data.basics.location} onChange={e=>update(["basics","location"],e.target.value)}/>
                        <input placeholder="Website / Portfolio" value={data.basics.website} onChange={e=>update(["basics","website"],e.target.value)}/>
                      </>
                    )}
                    {sec.key==="summary"&&(
                      <textarea placeholder="Write a short professional summary…" rows={4} value={data.summary} onChange={e=>update(["summary"],e.target.value)}/>
                    )}
                    {sec.key==="experience"&&(
                      <>
                        {data.experience.map((ex,i)=>(
                          <div key={i}>
                            <input placeholder="Role / Company" value={ex.title} onChange={e=>update(["experience",i,"title"],e.target.value)}/>
                            <textarea placeholder="Highlights" rows={2} value={ex.details} onChange={e=>update(["experience",i,"details"],e.target.value)}/>
                          </div>
                        ))}
                        <div className="add-btn" onClick={()=>setData(d=>({...d,experience:[...d.experience,{...empty}]}))}>+ Add Experience</div>
                      </>
                    )}
                    {sec.key==="education"&&(
                      <>
                        {data.education.map((ed,i)=>(
                          <input key={i} placeholder="Degree / College" value={ed.title} onChange={e=>update(["education",i,"title"],e.target.value)}/>
                        ))}
                        <div className="add-btn" onClick={()=>setData(d=>({...d,education:[...d.education,{...empty}]}))}>+ Add Education</div>
                      </>
                    )}
                    {sec.key==="skills"&&(
                      <input placeholder="Skills (comma separated)" value={data.skills} onChange={e=>update(["skills"],e.target.value)}/>
                    )}
                    {sec.key==="projects"&&(
                      <>
                        {data.projects.map((p,i)=>(
                          <input key={i} placeholder="Project title" value={p.title} onChange={e=>update(["projects",i,"title"],e.target.value)}/>
                        ))}
                        <div className="add-btn" onClick={()=>setData(d=>({...d,projects:[...d.projects,{...empty}]}))}>+ Add Project</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
  
          {/* Preview */}
          <div className="preview print-area" style={{"--color":theme.color}}>
            {data.template==="classic" ? (
              <TemplateClassic data={{ ...data, skills: skillList, theme }} />
            ) : (
              <TemplateModern data={{ ...data, skills: skillList, theme }} />
            )}
          </div>
        </div>
  
        {/* Drawer */}
        <div className="drawer">
          <h3>Customize</h3>
          <label>Primary Color</label>
          <input type="color" value={theme.color} onChange={(e)=>setTheme(t=>({...t,color:e.target.value}))}/>
          <label>Font Family</label>
          <select value={theme.font} onChange={(e)=>setTheme(t=>({...t,font:e.target.value}))}>
            <option>Inter</option><option>Poppins</option><option>Roboto</option><option>Georgia</option>
          </select>
          <label>Spacing</label>
          <select value={theme.spacing} onChange={(e)=>setTheme(t=>({...t,spacing:e.target.value}))}>
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="roomy">Roomy</option>
          </select>
          <button style={{marginTop:16,padding:"8px 14px",border:"none",background:theme.color,color:"#fff",borderRadius:8,cursor:"pointer"}} onClick={()=>setShowDrawer(false)}>Close</button>
        </div>
  
        {/* Payment Modal */}
        {showPayModal && (
          <PaymentModal
            onClose={()=>setShowPayModal(false)}
            onSuccess={()=>window.print()}
          />
        )}
      </div>
    );
  }