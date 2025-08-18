import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  // ---- Card Data (orderable) ----
  const initial = useMemo(
    () => [
      {
        id: "sebi",
        title: "SEBI Registered",
        text:
          "We operate with integrity and transparency. Our SEBI registration ensures services strictly follow regulatory guidelines.",
      },
      {
        id: "gst",
        title: "GST Compliant",
        text:
          "Fully GST-registered — demonstrating compliance with tax regulations and a commitment to ethical business practices.",
      },
      {
        id: "certs",
        title: "Comprehensive Certificates",
        text:
          "From incorporation to industry-specific requirements — our documentation is thorough, current, and audit-ready.",
      },
      {
        id: "why",
        title: "Why We Exist",
        text:
          "Since 2015, our mission is simple: connect students to real opportunities and make them truly job-ready.",
        wide: true,
      },
      {
        id: "gov",
        title: "Call for Government Collaboration",
        text:
          "Partnering with government can widen access to guidance, mentorship, and meaningful employment at scale.",
        full: true,
      },
    ],
    []
  );
  const [cards, setCards] = useState(initial);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  // ---- DnD Handlers ----
  const onDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e, index) => {
    e.preventDefault();
    setOverIndex(index);
    e.dataTransfer.dropEffect = "move";
  };
  const onDrop = (e, index) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(from) || from === index) return;
    const next = [...cards];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    setCards(next);
    setDragIndex(null);
    setOverIndex(null);
  };
  const onDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="AboutRoot">
      {/* ====== INLINE CSS ====== */}
      <style>{`
        :root{
          --bg-top:#f7fbff;
          --bg-mid:#e8f1ff;
          --bg-bottom:#dfe8ff;
          --ink:#0a1a3a;
          --ink-soft:#3a4b73;
          --primary:#0b5cff;
          --primary-2:#4b7cff;
          --accent:#00d4ff;
          --white:#ffffff;
          --glass: rgba(255,255,255,.65);
          --glass-dark: rgba(14,30,60,.22);
          --ring: rgba(11,92,255,.35);
          --shadow: 0 10px 30px rgba(8, 25, 70, .12);
          --radius:18px;
        }

        .AboutRoot{
          color: var(--ink);
          background:
            radial-gradient(900px 400px at 15% -5%, rgba(11,92,255, .10), transparent 60%),
            radial-gradient(700px 360px at 85% 0%, rgba(0,212,255,.10), transparent 60%),
            linear-gradient(180deg, var(--bg-top), var(--bg-mid) 40%, var(--bg-bottom));
          min-height: 100dvh;
          font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        /* ===== Hero ===== */
        .hero{
          position:relative;
          padding: 96px 20px 64px;
          text-align:center;
          overflow:hidden;
          isolation:isolate;
        }
        .hero::before{
          content:"";
          position:absolute; inset: -20% -10% auto -10%;
          height: 70%;
          background:
            radial-gradient(ellipse at 50% 50%, rgba(11,92,255,.12), rgba(11,92,255,0) 60%),
            radial-gradient(ellipse at 40% 55%, rgba(0,212,255,.12), rgba(0,212,255,0) 60%);
          filter: blur(6px);
          z-index:-1;
        }
        .hero h1{
          margin:0;
          font-weight: 900;
          font-size: clamp(32px, 5vw, 64px);
          letter-spacing:.3px;
          line-height:1.05;
          background: linear-gradient(90deg, #061334, #0a2c7a 25%, #0b5cff 55%, #00d4ff 90%);
          -webkit-background-clip:text; background-clip:text; color:transparent;
        }
        .hero h1 b{
          background: linear-gradient(90deg, #0b5cff, #00d4ff);
          -webkit-background-clip:text; background-clip:text; color:transparent;
        }
        .hero p{
          margin: 14px auto 0;
          max-width: 820px;
          font-size: clamp(15px, 1.6vw, 19px);
          color: var(--ink-soft);
        }
        .cta{
          margin-top:28px;
          padding: 14px 22px;
          font-weight: 800;
          border-radius: 14px;
          border: 1px solid rgba(11,92,255,.25);
          background:
            linear-gradient(180deg, #ffffff, #f2f6ff);
          box-shadow: 0 8px 20px rgba(11,92,255,.15);
          color: #062147;
          cursor:pointer;
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease, border-color .18s ease;
        }
        .cta:hover{ transform: translateY(-2px) scale(1.02); box-shadow: 0 14px 34px rgba(11,92,255,.25); border-color: var(--ring); }
        .cta:active{ transform: translateY(0) scale(.99); }

        .tip{
          margin: 18px auto 0;
          display:inline-flex; gap:10px; align-items:center;
          padding: 8px 12px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,.7), rgba(255,255,255,.45));
          border: 1px solid rgba(11,92,255,.15);
          box-shadow: 0 6px 20px rgba(6,19,52,.08);
          color: #24406f;
          font-size: 13px;
          backdrop-filter: blur(6px);
        }
        .pill-dot{ width:8px; height:8px; border-radius:50%; background: #19d68f; box-shadow: 0 0 0 6px rgba(25,214,143,.14); }

        /* ===== Grid ===== */
        .wrap{ max-width: 1200px; margin: 30px auto 80px; padding: 0 20px; }
        .grid{
          display:grid; gap:20px;
          grid-template-columns: repeat(12, 1fr);
        }

        /* ===== Cards (glass + neon ring) ===== */
        .card{
          grid-column: span 4;
          position:relative;
          background:
            linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,.70)),
            linear-gradient(180deg, rgba(255,255,255,.3), rgba(255,255,255,0));
          border: 1px solid rgba(11,92,255,.14);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 22px 22px 20px;
          backdrop-filter: blur(10px);
          transform: translateZ(0);
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease;
        }
        .card::before{
          /* subtle neon edge */
          content:"";
          position:absolute; inset:-1px; border-radius: inherit;
          padding:1px;
          background: linear-gradient(135deg, rgba(11,92,255,.35), rgba(0,212,255,.25));
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity:.55; pointer-events:none;
        }
        .card:hover{
          transform: translateY(-6px);
          box-shadow: 0 20px 44px rgba(8, 25, 70, .18);
          border-color: rgba(11,92,255,.28);
          background:
            linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.78));
        }
        .card h3{
          margin:4px 0 8px;
          font-size: 20px;
          letter-spacing:.2px;
          background: linear-gradient(90deg, #0a2c7a, #0b5cff 55%, #00b7ff);
          -webkit-background-clip:text; background-clip:text; color:transparent;
        }
        .card p{
          color:#2d3c63;
          line-height:1.65;
          font-size: 15.5px;
        }

        /* Size variants */
        .card.wide{ grid-column: span 8; }
        .card.full{ grid-column: 1 / -1; }

        /* Drag affordances */
        .draggable{ cursor: grab; }
        .dragging{ cursor: grabbing; transform: scale(.995) rotate(-.2deg); opacity:.92; }
        .over{
          outline: 2px dashed rgba(11,92,255,.45);
          outline-offset: 6px;
        }

        /* ===== Footer ===== */
        .footer{
          margin-top: 30px;
          text-align:center;
          color:#46619e;
          border-top: 1px solid rgba(11,92,255,.12);
          padding: 20px;
          background: linear-gradient(180deg, rgba(255,255,255,.6), rgba(255,255,255,0));
        }

        /* Responsive */
        @media (max-width: 1024px){
          .card{ grid-column: span 6; }
          .card.wide{ grid-column: span 12; }
        }
        @media (max-width: 640px){
          .card, .card.wide, .card.full{ grid-column: span 12; }
          .hero{ padding: 80px 16px 54px; }
        }
      `}</style>

      {/* ===== HERO ===== */}
      <section className="hero">
        <h1>
          About <b>MMTIJOBS</b>
        </h1>
        <p>Empowering India's youth with opportunities since 2015 — now with a UI that looks like it ships itself.</p>
        <button className="cta" onClick={() => navigate("/jobs")}>
          Explore Jobs →
        </button>
        <div className="tip"><span className="pill-dot" />Tip: drag the cards below to rearrange</div>
      </section>

      {/* ===== CARDS ===== */}
      <div className="wrap">
        <div className="grid">
          {cards.map((c, idx) => (
            <article
              key={c.id}
              className={[
                "card",
                c.wide ? "wide" : "",
                c.full ? "full" : "",
                "draggable",
                dragIndex === idx ? "dragging" : "",
                overIndex === idx && dragIndex !== null ? "over" : "",
              ].join(" ")}
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDrop={(e) => onDrop(e, idx)}
              onDragEnd={onDragEnd}
            >
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </article>
          ))}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <p>© {year} MMTIJOBS — All rights reserved.</p>
      </footer>
    </div>
  );
}
