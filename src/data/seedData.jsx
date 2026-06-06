// src/data/seedData.js
// One-time demo seed: static clients + their jobs.
// When the backend is ready, delete this file + the seedOnce() call in App.jsx,
// then bulk-upload these records via the API.

// Use fixed, high IDs so they never collide with Date.now() ids from real posts.
const BASE = 950000;

export const SEED_COMPANIES = [
  {
    id: BASE + 1,
    name: "Bhoomika Investment Service (BIC Infra)",
    email: "Aishwaryabic43@gmail.com",
    contact: "7024222535",
    streetAddress: "6th Floor, Bansal One, Near RKMP Station",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "",
    gstNumber: "",
    industryType: "Real Estate",
    numberOfEmployees: "11-50 employees",
    companyWebsite: "",
    profilePic: null,
    createdAt: new Date().toISOString(),
    __seeded: true,
  },
  {
    id: BASE + 2,
    name: "Paras Lifestyles Pvt. Ltd",
    email: "Info@paraslifestyles.com",
    contact: "9202569942",
    streetAddress: "Bawadiya Kalan, Gulmohar Colony",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "",
    gstNumber: "",
    industryType: "Real Estate",
    numberOfEmployees: "51-200 employees",
    companyWebsite: "",
    profilePic: null,
    createdAt: new Date().toISOString(),
    __seeded: true,
  },
];

// Helper to keep job objects consistent with what the app expects.
// `idx` is used to stagger createdAt so the order is stable (newest first).
const now = Date.now();
const makeJob = (over, idx) => ({
  id: BASE + 100 + idx,
  title: "",
  company: "",
  companyEmail: "",
  location: "Bhopal",
  experience: "",
  salary: "",
  qualification: "",
  tags: [],
  hiringProcess: [],
  numberOfOpenings: "",
  gender: "Any",
  status: "active",
  activeUntil: null,
  description: "",
  // stagger so they sort newest-first but stay above older demo data
  createdAt: new Date(now - idx * 60000).toISOString(),
  __seeded: true,
  ...over,
});

export const SEED_JOBS = [
  // ---------- Client 1: Bhoomika Investment Service (BIC Infra) ----------
  makeJob(
    {
      title: "Property Sales & Marketing Executive",
      company: "Bhoomika Investment Service (BIC Infra)",
      companyEmail: "Aishwaryabic43@gmail.com",
      location: "Bhopal",
      experience: "1-3 years",
      salary: "₹15,000 – ₹25,000/month + Incentives + Travel Allowance",
      qualification: "Bachelor's Degree",
      tags: ["Sales", "Marketing", "Real Estate", "Lead Generation", "Negotiation"],
      hiringProcess: ["Face-to-Face", "Telephonic"],
      numberOfOpenings: "4",
      gender: "Any",
      description:
        "Urgent Hiring | Property Sales & Marketing Executive. We are looking for a dynamic and result-oriented Property Sales & Marketing Executive to join our growing Real Estate team.\n\nResponsibilities:\n• Generate leads through calls, referrals, online platforms, and field marketing.\n• Meet prospective clients and understand their property requirements.\n• Explain property features, pricing, offers, and payment plans.\n• Conduct site visits and client presentations.\n• Follow up with leads and convert inquiries into sales.\n• Build and maintain strong customer relationships.\n• Coordinate with the marketing team for campaigns and promotions.\n• Maintain customer records and sales reports.\n• Achieve monthly and quarterly sales targets.\n\nEligibility:\n• Bachelor's Degree in any discipline\n• 1–3 years of experience in Real Estate Sales/Marketing (Preferred)\n• Strong communication and negotiation skills\n• Knowledge of property sales processes and documentation\n• Basic knowledge of MS Office\n• Target-oriented approach\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    0
  ),
  makeJob(
    {
      title: "Real Estate Telecaller Executive (Female)",
      company: "Bhoomika Investment Service (BIC Infra)",
      companyEmail: "Aishwaryabic43@gmail.com",
      location: "Bhopal",
      experience: "1.5-2 years",
      salary: "₹15,000 – ₹18,000/month + Incentives",
      qualification: "Graduate",
      tags: ["Telecalling", "Real Estate", "Lead Generation", "Customer Coordination"],
      hiringProcess: ["Telephonic", "Face-to-Face"],
      numberOfOpenings: "2",
      gender: "Female",
      description:
        "Urgent Hiring – Real Estate Telecaller Executive (Female).\n\nKey Responsibilities:\n• Handling telecalling activities for real estate projects\n• Lead generation, follow-ups & client coordination\n• Managing customer queries and maintaining records\n• Building strong customer relationships\n• Achieving sales and follow-up targets\n\nRequired Skills:\n• Excellent communication & convincing skills\n• Positive attitude and target-oriented approach\n• Self-motivated, disciplined & dedicated personality\n• Real estate telecalling experience will be an added advantage\n\nWhy Join Us?\n• Attractive Incentives • Growth Opportunities • Performance-Based Rewards • Supportive Team Environment\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    1
  ),

  // ---------- Client 2: Paras Lifestyles Pvt. Ltd ----------
  makeJob(
    {
      title: "Sales Executive (Female)",
      company: "Paras Lifestyles Pvt. Ltd",
      companyEmail: "Info@paraslifestyles.com",
      location: "Bhopal",
      experience: "3-4 years",
      salary: "₹25,000 – ₹35,000/month",
      qualification: "Any Graduate",
      tags: ["Sales", "Real Estate", "Customer Handling", "Tele-calling"],
      hiringProcess: ["Face-to-Face", "Telephonic"],
      numberOfOpenings: "2",
      gender: "Female",
      description:
        "We Are Hiring – Sales Executive (Female). Industry: Real Estate.\n\nKey Responsibilities:\n• Handle walk-in clients & explain project details\n• Arrange site visits and follow up with leads\n• Support sales closures with senior managers\n• Manage tele-calling and customer coordination\n• Post project updates on digital platforms\n\nRequirements:\n• 3–4 years of real estate sales experience\n• Strong communication & customer handling skills\n• Basic computer knowledge\n• Confident & target-oriented personality\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    2
  ),
  makeJob(
    {
      title: "MEP Engineer (Mechanical / Electrical / Plumbing)",
      company: "Paras Lifestyles Pvt. Ltd",
      companyEmail: "Info@paraslifestyles.com",
      location: "Bhopal",
      experience: "4-7 years",
      salary: "₹20,000 – ₹30,000/month",
      qualification: "BE / Diploma (Mechanical or Electrical)",
      tags: ["MEP", "Mechanical", "Electrical", "Plumbing", "Construction"],
      hiringProcess: ["Face-to-Face"],
      numberOfOpenings: "1",
      gender: "Any",
      description:
        "We Are Hiring – MEP Engineer. Industry: Construction / Real Estate.\n\nQualification: BE / Diploma in Mechanical or Electrical Engineering\nExperience: 4–7 Years in Construction Projects\n\nKey Responsibilities:\n• Planning, execution & supervision of all MEP works at site\n• Coordination with architects, structural consultants & contractors\n• Reviewing drawings and ensuring compliance with project specifications\n• Monitoring installation, testing & commissioning of MEP systems\n• Quality control and adherence to safety standards\n• Vendor management & material approvals\n• Resolving site-level technical issues related to MEP services\n• Preparing progress reports & maintaining documentation\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    3
  ),
  makeJob(
    {
      title: "Purchase Manager / Procurement Manager",
      company: "Paras Lifestyles Pvt. Ltd",
      companyEmail: "Info@paraslifestyles.com",
      location: "Bhopal",
      experience: "5+ years",
      salary: "₹35,000 – ₹50,000/month",
      qualification: "Any UG / Diploma in Civil Engineering",
      tags: ["Procurement", "Purchase", "Vendor Management", "Real Estate"],
      hiringProcess: ["Face-to-Face"],
      numberOfOpenings: "1",
      gender: "Any",
      description:
        "Hiring Alert | Purchase Manager / Procurement Manager – Real Estate.\n\nKey Responsibilities:\n• Manage procurement and purchasing activities for construction projects\n• Develop procurement strategies as per project requirements and budgets\n• Vendor identification, evaluation & relationship management\n• Supplier performance monitoring and contract negotiation\n• Purchase order preparation and management\n• Cost control, budget monitoring & price negotiations\n• Inventory management and stock optimization\n• Coordination with project, finance, warehouse & logistics teams\n\nQualification: Any UG Degree / Diploma in Civil Engineering\nExperience: Minimum 5+ Years in Procurement with Real Estate Developer industry experience\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    4
  ),
  makeJob(
    {
      title: "Electrician",
      company: "Paras Lifestyles Pvt. Ltd",
      companyEmail: "Info@paraslifestyles.com",
      location: "Bhopal",
      experience: "3-5 years",
      salary: "₹20,000/month",
      qualification: "ITI / Diploma",
      tags: ["Electrician", "Wiring", "Maintenance", "Construction"],
      hiringProcess: ["Face-to-Face"],
      numberOfOpenings: "1",
      gender: "Any",
      description:
        "We Are Hiring – Electrician. Industry: Construction / Real Estate.\n\nExperience: 3–5 Years in Housing Projects / Residential Buildings\n\nJob Responsibilities:\n• Electrical installation, maintenance & repair work at project site\n• Internal / external wiring and electrical fittings installation\n• Testing and troubleshooting of electrical systems\n• DG (Diesel Generator) operation and maintenance support\n• Ensuring smooth functioning of electrical equipment and services\n• Attending site-level electrical issues and repairs\n• Following safety standards and site protocols\n• All work to be executed under the supervision of Site Engineer\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    5
  ),
  makeJob(
    {
      title: "Plumber",
      company: "Paras Lifestyles Pvt. Ltd",
      companyEmail: "Info@paraslifestyles.com",
      location: "Bhopal",
      experience: "3-5 years",
      salary: "₹20,000/month",
      qualification: "ITI / Diploma",
      tags: ["Plumber", "Sanitary", "Pipeline", "Construction"],
      hiringProcess: ["Face-to-Face"],
      numberOfOpenings: "2",
      gender: "Any",
      description:
        "We Are Hiring – Plumber. Industry: Construction / Real Estate.\n\nExperience: 3–5 Years in Residential Projects\n\nJob Responsibilities:\n• On-site plumbing and sanitary work execution\n• Laying pipelines and installation of plumbing systems\n• Installation of sanitary fittings and fixtures\n• Leak detection, repair & maintenance work\n• Testing and inspection of plumbing systems\n• Troubleshooting and resolving site-level plumbing issues\n• Repair and maintenance activities as per project requirements\n• Ensuring work quality and following site safety standards\n• All work under the supervision of Site Engineer\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    6
  ),
  makeJob(
    {
      title: "Project Manager – High-Rise Building",
      company: "Paras Lifestyles Pvt. Ltd",
      companyEmail: "Info@paraslifestyles.com",
      location: "Bhopal",
      experience: "8-12 years",
      salary: "₹70,000 – ₹1,00,000/month",
      qualification: "B.E./B.Tech Civil (MBA/PMP preferred)",
      tags: ["Project Management", "Civil", "Construction", "Primavera", "AutoCAD"],
      hiringProcess: ["Face-to-Face"],
      numberOfOpenings: "1",
      gender: "Any",
      description:
        "Position: Project Manager – High-Rise Building. Industry: Real Estate / Construction.\n\nExperience: 8–12 years in high-rise residential/commercial projects\nQualification: B.E./B.Tech Civil | MBA/PMP preferred\n\nKey Responsibilities:\n• Project Execution: End-to-end ownership of high-rise building construction from excavation to handover\n• Planning & Scheduling: Prepare project plans, timelines, budgets. Monitor using MS Project/Primavera\n• Team Management: Lead site engineers, contractors, vendors & labor teams. Ensure manpower productivity\n• Quality & Safety: Compliance with structural drawings, quality standards, NBC & local building codes. Zero-incident safety culture\n• Cost Control: Monitor project budget, approvals & vendor negotiation\n\nRequired Skills:\n• Leadership, problem-solving & vendor negotiation skills\n• Proficient in AutoCAD, MS Project, Excel\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    7
  ),
  makeJob(
    {
      title: "Sales Manager",
      company: "Paras Lifestyles Pvt. Ltd",
      companyEmail: "Info@paraslifestyles.com",
      location: "Bhopal",
      experience: "5-8 years",
      salary: "₹35,000 – ₹50,000/month + Incentives",
      qualification: "Graduate / MBA (Sales & Marketing)",
      tags: ["Sales Management", "Real Estate", "RERA", "CRM", "Closing"],
      hiringProcess: ["Face-to-Face", "Telephonic"],
      numberOfOpenings: "1",
      gender: "Any",
      description:
        "Position: Sales Manager. Industry: Real Estate – Residential/Commercial Projects.\n\nExperience: 5–8 years in real estate sales\nQualification: Graduate/MBA in Sales & Marketing\n\nKey Responsibilities:\n• Revenue Generation: Achieve monthly/quarterly sales targets for high-rise & plotted projects\n• Lead Management: Handle walk-ins, site visits, CRM leads. Ensure timely follow-ups & closures\n• Site Activities: Plan & execute site visits, exhibitions, loan melas & property expos\n• Client Handling: Negotiation, price finalization, agreement coordination till registration\n• Market Intelligence: Track competitor projects, pricing, offers & local market trends\n• Reporting: Daily MIS, sales forecasting & reports to senior management\n\nRequired Skills:\n• Proven track record in real estate market\n• Excellent communication, presentation & closing skills\n• Knowledge of home loans, legal documentation & RERA\n\nCTC: ₹35,000 – ₹50,000 + incentives\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    8
  ),
];

// ===========================================================
// SEED ONCE — writes companies + jobs into localStorage,
// merging with anything already there, guarded by a version flag.
// Bump SEED_VERSION if you change the seed data and want it re-applied.
// ===========================================================
export const SEED_VERSION = "v1";

export function seedOnce() {
  try {
    const doneVersion = localStorage.getItem("seedVersion");
    if (doneVersion === SEED_VERSION) return; // already seeded this version

    // ---- Companies ----
    let companies = [];
    try { companies = JSON.parse(localStorage.getItem("registeredCompanies")) || []; } catch {}
    const companyEmails = new Set(companies.map((c) => (c.email || "").toLowerCase()));
    SEED_COMPANIES.forEach((sc) => {
      if (!companyEmails.has((sc.email || "").toLowerCase())) {
        companies.push(sc);
      }
    });
    localStorage.setItem("registeredCompanies", JSON.stringify(companies));

    // ---- Jobs ----
    let jobs = [];
    try { jobs = JSON.parse(localStorage.getItem("jobs")) || []; } catch {}
    const jobIds = new Set(jobs.map((j) => j.id));
    SEED_JOBS.forEach((sj) => {
      if (!jobIds.has(sj.id)) {
        jobs.unshift(sj); // put seeded jobs on top (newest)
      }
    });
    localStorage.setItem("jobs", JSON.stringify(jobs));

    // mark done
    localStorage.setItem("seedVersion", SEED_VERSION);

    // tell the rest of the app to refresh
    try { window.dispatchEvent(new Event("jobsChanged")); } catch {}
  } catch (err) {
    console.error("seedOnce failed:", err);
  }
}