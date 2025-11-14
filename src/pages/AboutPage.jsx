import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const revealRefs = useRef([]);
  const [modalData, setModalData] = useState(null); // MODAL STATE

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        }),
      { threshold: 0.15 }
    );

    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-root">
      <style>{`
        :root {
          --ink: #121723;
          --muted: #6f7485;
          --bg: #f8fbff;
          --accent: #0b5cff;
          --accent2: #00aaff;
          --card: #ffffff;
        }
        * { box-sizing: border-box; }

        body, .about-root {
          font-family: "Inter", system-ui, sans-serif;
          color: var(--ink);
          background: var(--bg);
        }

        /* === HERO === */
        .hero {
          position: relative;
          padding: 100px 10% 120px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          background: linear-gradient(160deg, #ffffff 0%, #eef3ff 100%);
        }

        .hero::after {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 140%;
          height: 100%;
          background: radial-gradient(circle at center,
            rgba(11,92,255,0.10) 0%,
            rgba(0,0,0,0) 70%);
          pointer-events: none;
        }

        .hero-img {
          flex: 1;
          min-width: 320px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 18px 35px rgba(0,0,0,0.08);
        }

        .hero-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.04);
          transition: transform 2.8s ease;
        }

        .hero-content {
          flex: 1;
          padding: 0 40px;
          min-width: 320px;
        }

        .hero-content h1 {
          font-size: clamp(42px, 6vw, 60px);
          font-weight: 900;
          letter-spacing: -1px;
          background: linear-gradient(90deg, #0a1b71, var(--accent));
          -webkit-background-clip: text;
          color: transparent;
        }

        .hero-content p {
          margin: 16px 0 36px;
          color: var(--muted);
          font-size: 17px;
          line-height: 1.65;
        }

        .hero-stats {
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
        }

        .stat h3 {
          font-size: 30px;
          color: var(--accent);
          margin-bottom: 4px;
        }

        /* === COMPLIANCE GRID === */
        .grid-section {
          padding: 80px 10%;
          background: var(--card);
        }

        .grid-section h2 {
          text-align: center;
          font-size: 30px;
          margin-bottom: 40px;
          font-weight: 800;
          background: linear-gradient(90deg, #0a2c7a, var(--accent));
          -webkit-background-clip: text;
          color: transparent;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .grid-card {
          background: #fff;
          border-radius: 14px;
          padding: 26px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.05);
          opacity: 0;
          transform: translateY(40px);
          transition: all .8s ease;
          text-align: center;
          cursor: pointer;
        }

        .grid-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.1);
        }

        .grid-section.in-view .grid-card {
          opacity: 1;
          transform: translateY(0);
        }

        /* === TWO-COLUMN SECTIONS === */
        .section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 50px;
          padding: 80px 10%;
          opacity: 0;
          transform: translateY(40px);
          transition: 1s ease;
        }

        .section.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .section:nth-child(even) {
          flex-direction: row-reverse;
        }

        .section-img {
          flex: 1;
          height: 330px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 14px 34px rgba(0,0,0,0.08);
        }

        .section-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 2.2s ease;
        }

        .section.in-view .section-img img {
          transform: scale(1.06);
        }

        .section-content {
          flex: 1;
        }

        .section-content h2 {
          font-size: 26px;
          margin-bottom: 12px;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          color: transparent;
        }

        .section-content p {
          color: var(--muted);
          line-height: 1.65;
          margin-bottom: 12px;
        }

        /* === TESTIMONIALS === */
        .testimonials {
          padding: 100px 10%;
          background: #f1f6ff;
          text-align: center;
        }

        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
        }

        .testimonial-card {
          background: #fff;
          padding: 22px;
          border-radius: 14px;
          box-shadow: 0 10px 28px rgba(0,0,0,0.07);
          transition: transform .3s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-4px);
        }

        .testimonial-card img {
          width: 100%;
          border-radius: 12px;
          margin-bottom: 12px;
        }

        /* === CTA === */
        .cta {
          padding: 80px 10% 60px;
          text-align: center;
        }

        .cta button {
          background: linear-gradient(120deg, var(--accent), var(--accent2));
          border: none;
          border-radius: 10px;
          padding: 14px 34px;
          color: #fff;
          font-weight: 800;
          font-size: 16px;
          transition: transform .2s ease, box-shadow .2s ease;
          box-shadow: 0 12px 24px rgba(11,92,255,0.25);
        }

        .cta button:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 32px rgba(11,92,255,0.35);
        }

        .footer {
          padding: 40px 10%;
          text-align: center;
          color: #7e879a;
          font-size: 14px;
        }

        /* ===== MODAL ===== */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.55);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          backdrop-filter: blur(3px);
        }

        .modal-box {
          background: #fff;
          padding: 30px;
          border-radius: 14px;
          max-width: 480px;
          width: 90%;
          position: relative;
          box-shadow: 0 18px 40px rgba(0,0,0,0.25);
          animation: modalPop .25s ease;
        }

        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .close-btn {
          background: #f3f4f6;
          border: none;
          position: absolute;
          top: 12px;
          right: 12px;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          cursor: pointer;
          font-size: 16px;
        }

        .modal-box h2 {
          margin-top: 10px;
          font-size: 22px;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          color: transparent;
          font-weight: 800;
        }

        .modal-box p {
          margin-top: 14px;
          color: var(--muted);
          line-height: 1.6;
        }

        .modal-cta {
          margin-top: 20px;
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          box-shadow: 0 8px 20px rgba(11,92,255,0.25);
        }

        .modal-cta:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 900px) {
          .hero {
            flex-direction: column;
            text-align: center;
            padding-top: 70px;
          }
          .hero-content {
            padding: 0;
          }
          .section {
            flex-direction: column !important;
            text-align: center;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>Empowering India's Youth Since 2015</h1>
          <p>
            MMTI Jobs bridges the gap between students, aspirants, and
            real-world opportunities. With a decade of experience, we’ve built
            pathways that empower thousands to step confidently into industry.
          </p>
          <div className="hero-stats">
            <div className="stat"><h3>10+</h3><p>Years of Impact</p></div>
            <div className="stat"><h3>50K+</h3><p>Youth Empowered</p></div>
          </div>
        </div>

        <div className="hero-img">
          <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1600&q=80" alt="MMTI team" />
        </div>
      </section>

      {/* COMPLIANCE GRID */}
      <section
        className="grid-section"
        ref={(el) => (revealRefs.current[0] = el)}
      >
        <h2>Registered & Compliant</h2>

        <div className="grid">
          {[
            ["Corporate Identification No (CIN)", "Unique corporate identity number assigned by the Registrar of Companies."],
            ["PAN", "Permanent Account Number used for taxation and verification."],
            ["TAN", "Tax Collection/ Deduction Account Number issued by the Income Tax Department."],
            ["Certificate of Incorporation", "Official document issued upon company registration."],
            ["Section 8 License", "Certification for registered non-profit organizations."],
            ["MCA Master Data", "Official Ministry of Corporate Affairs registration details."],
            ["EPF Registration", "Employee Provident Fund compliance for workforce security."],
            ["ESIC Registration", "Employee State Insurance Corporation compliance for employee health benefits."],
          ].map(([title, desc], i) => (
            <div
              key={i}
              className="grid-card"
              onClick={() => setModalData({ title, desc })}
            >
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEBI / GST */}
      <div className="section" ref={(el) => (revealRefs.current[1] = el)}>
        <div className="section-img">
          <img src="https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=1600&q=80" alt="SEBI" />
        </div>

        <div className="section-content">
          <h2>SEBI Registered</h2>
          <p>
            MMTI Jobs adheres to the highest ethical and regulatory standards.
            Our SEBI registration strengthens our foundation of trust.
          </p>

          <h2>GST Compliant</h2>
          <p>
            Fully registered under GST — proof of our transparent practices and
            responsible business operations.
          </p>
        </div>
      </div>

      {/* CERTIFICATES */}
      <div className="section" ref={(el) => (revealRefs.current[2] = el)}>
        <div className="section-content">
          <h2>Comprehensive Documentation</h2>
          <p>
            From incorporations to sector-specific compliances, our
            certifications are fully updated and audit-ready for any
            collaboration.
          </p>

          <h2>A Decade of Trust</h2>
          <p>
            Our track record speaks for itself: transforming job seekers into
            skilled professionals and contributing to India’s workforce.
          </p>
        </div>

        <div className="section-img">
          <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1600&q=80" alt="Certification" />
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section
        className="testimonials"
        ref={(el) => (revealRefs.current[3] = el)}
      >
        <h2>What Our Partners Say</h2>
        <div className="testimonial-grid">
          {[
            {
              img: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80",
              name: "NextGen Industries",
              quote: "Their structured mentorship and candidate quality are unmatched.",
            },
            {
              img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
              name: "Digital Ventures",
              quote: "A transparent and reliable hiring partner for years.",
            },
          ].map((t, i) => (
            <div key={i} className="testimonial-card">
              <img src={t.img} alt={t.name} />
              <h4>{t.name}</h4>
              <p>“{t.quote}”</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <button onClick={() => navigate("/register")}>
          Join the Movement — Register Now
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        © {year} MMTI JOBS — All Rights Reserved.
      </footer>

      {/* MODAL */}
      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setModalData(null)}>✕</button>
            <h2>{modalData.title}</h2>
            <p>{modalData.desc}</p>

            <button className="modal-cta" onClick={() => setModalData(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
