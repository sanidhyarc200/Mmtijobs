import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const revealRefs = useRef([]);

  // scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      },
      { threshold: 0.2 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const sections = [
    {
      title: "About MMTI Jobs",
      text: `Since 2015, MMTI Jobs has been empowering India’s youth by connecting students with verified opportunities and preparing them for the real world. We bridge the gap between education and employment through mentorship and transparent hiring practices.`,
      img: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=1600&q=80",
    },
    
    {
      title: "SEBI Registered",
      text: "We operate with integrity and transparency. Our SEBI registration ensures all our services strictly follow regulatory and ethical guidelines.",
      img: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "GST Compliant",
      text: "Fully GST-registered — a mark of our compliance with tax regulations and commitment to ethical, accountable operations.",
      img: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Comprehensive Certificates",
      text: "From company incorporation to domain-specific certifications — our documentation is thorough, current, and audit-ready for every collaboration.",
      img: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Why We Exist",
      text: "Our mission is simple: connect students to genuine opportunities and make them truly job-ready through guidance, internships, and upskilling.",
      img: "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Our Vision",
      text: `Empowering futures, inspiring growth. We envision a world where every learner finds the right opportunity, every skill meets its purpose, and every dream becomes a fulfilling profession.`,
      pointers: [
        "Bridge the gap between education and employment.",
        "Empower students to achieve professional excellence.",
        "Foster a compassionate and inclusive job ecosystem.",
        "Be a trusted partner from learning to earning.",
      ],
      img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Our Mission",
      text: `Connecting talent with opportunity. We aim to create a transparent, student-focused ecosystem that enables aspiring professionals to thrive.`,
      pointers: [
        "Provide verified jobs and internships across sectors.",
        "Guide students in identifying and showcasing skills.",
        "Collaborate with institutions that nurture fresh talent.",
        "Use mentorship and technology to simplify hiring.",
        "Promote ethical, skill-based growth and learning.",
      ],
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Government Collaboration",
      text: "Partnering with government bodies to widen access to guidance, mentorship, and meaningful employment at scale.",
      img: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  return (
    <div className="about-root">
      <style>{`
        :root {
          --ink: #1a2742;
          --muted: #5c6c88;
          --bg: #f9fafc;
          --accent: #0b5cff;
        }
        * { box-sizing: border-box; }
        .about-root {
          background: var(--bg);
          color: var(--ink);
          font-family: "Inter", system-ui, sans-serif;
          overflow-x: hidden;
        }

        /* Hero */
        .hero {
          text-align: center;
          padding: 100px 20px 70px;
          background: linear-gradient(180deg, #ffffff, #f1f5ff);
        }
        .hero h1 {
          font-size: clamp(34px, 5vw, 58px);
          font-weight: 900;
          background: linear-gradient(90deg, #0a2c7a, var(--accent));
          -webkit-background-clip: text;
          color: transparent;
        }
        .hero p {
          margin: 14px auto 0;
          max-width: 720px;
          font-size: 18px;
          color: var(--muted);
        }
        .hero button {
          margin-top: 26px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 14px 28px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s ease;
        }
        .hero button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(11,92,255,0.25);
        }

        /* Section cards */
        .section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 50px;
          padding: 70px 8%;
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 1s ease, transform 1s ease;
        }
        .section.in-view { opacity: 1; transform: translateY(0); }
        .section:nth-child(even) { flex-direction: row-reverse; }

        .section-img {
          flex: 1;
          height: 380px;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 14px 38px rgba(0,0,0,0.12);
          transform: translateX(-60px);
          opacity: 0;
          transition: all 1s ease;
        }
        .section:nth-child(even) .section-img {
          transform: translateX(60px);
        }
        .section.in-view .section-img {
          transform: translateX(0);
          opacity: 1;
        }
        .section-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 2.5s ease;
        }
        .section.in-view .section-img img { transform: scale(1.05); }

        .section-content {
          flex: 1;
          transform: translateX(60px);
          opacity: 0;
          transition: all 1s ease;
        }
        .section:nth-child(even) .section-content {
          transform: translateX(-60px);
        }
        .section.in-view .section-content {
          transform: translateX(0);
          opacity: 1;
        }

        .section-content h2 {
          font-size: 28px;
          margin-bottom: 10px;
          background: linear-gradient(90deg, #0b5cff, #00aaff);
          -webkit-background-clip: text;
          color: transparent;
        }
        .section-content p {
          color: var(--muted);
          font-size: 16.5px;
          line-height: 1.65;
          margin-bottom: 10px;
        }
        .section-content ul {
          margin-top: 8px;
          padding-left: 20px;
        }
        .section-content li {
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 6px;
        }

        /* CTA + Footer */
        .cta {
          text-align: center;
          padding: 60px 20px 30px;
        }
        .cta button {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 14px 30px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .2s ease;
        }
        .cta button:hover { transform: translateY(-2px); }

        .footer {
          text-align: center;
          padding: 25px 10px 50px;
          color: #7b89a5;
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .section {
            flex-direction: column !important;
            text-align: center;
            padding: 50px 5%;
          }
          .section-img { height: 260px; width: 100%; transform: none !important; opacity: 1; }
          .section-content { transform: none !important; opacity: 1; }
        }
      `}</style>

      {/* Hero */}
      <section className="hero">
        <h1>About MMTI Jobs</h1>
        <p>
          Empowering India’s youth through verified opportunities, mentorship,
          and growth since 2015.
        </p>
        <button onClick={() => navigate("/jobs")}>Explore Jobs →</button>
      </section>

      {/* Dynamic Sections */}
      {sections.map((sec, i) => (
        <div
          key={i}
          className="section"
          ref={(el) => (revealRefs.current[i] = el)}
        >
          <div className="section-img">
            <img src={sec.img} alt={sec.title} />
          </div>
          <div className="section-content">
            <h2>{sec.title}</h2>
            <p>{sec.text}</p>
            {sec.pointers && (
              <ul>
                {sec.pointers.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}

      {/* CTA */}
      <div className="cta">
        <button onClick={() => navigate("/register")}>
          Join the Movement — Register Now
        </button>
      </div>

      {/* Footer */}
      <footer className="footer">
        © {year} MMTIJOBS — All Rights Reserved.
      </footer>
    </div>
  );
}
