import React from 'react';

export default function AboutPage() {
  const year = new Date().getFullYear();

  return (
    <>
      <section className="hero">
        <h2>About MMTIJOBS</h2>
        <p>Empowering India's youth with opportunities since 2015</p>
      </section>

      <section className="about-content" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', textAlign: 'left' }}>
        <h3>SEBI Registered</h3>
        <p>
          We operate with the highest standards of integrity and transparency.
          Our Securities and Exchange Board of India (SEBI) registration ensures that our services
          adhere to regulatory guidelines.
        </p>

        <h3>GST Compliant</h3>
        <p>
          MMT Jobs is fully GST registered, demonstrating our compliance with tax regulations
          and commitment to ethical business practices.
        </p>

        <h3>Comprehensive Registration Certificates</h3>
        <p>
          MMT Jobs holds various registration certificates, covering a wide range of legal and operational aspects.
          Whether it’s company incorporation, tax compliance, or industry-specific requirements — we’ve got you covered.
        </p>

        <h3>Why We Exist</h3>
        <p>
          At MMTIJOBS, we recognize a pressing need: connecting students to the right opportunities.
          Since our inception in 2015, we've been dedicated to making sure students have the chance to find great jobs.
          That’s why we created our job portal — a platform where students can search for jobs and learn new skills to become job-ready.
        </p>

        <h3>Call for Government Collaboration</h3>
        <p>
          We believe it's crucial for the government to partner with us. Together, we can ensure students
          receive the guidance and support they need to succeed. Let’s join hands to give the youth of this country
          the best shot at meaningful employment.
        </p>
      </section>

      <footer>
        <div className="container footer">
          <p>© {year} MMtijobs — All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
