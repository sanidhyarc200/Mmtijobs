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
  {
    id: BASE + 3,
    name: "Solar Energy Company",
    email: "humanresourcesgos@gmail.com",
    contact: "9993826661",             // portal contact used in JD
    streetAddress: "",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "",
    gstNumber: "",
    industryType: "Renewable Energy / Solar",
    numberOfEmployees: "11-50 employees",
    companyWebsite: "",
    profilePic: null,
    createdAt: new Date().toISOString(),
    __seeded: true,
  },
  {
    id: BASE + 4,
    name: "Bharat Airtel",
    email: "",                          // TODO: client's real email
    contact: "9993826661",              // portal contact
    streetAddress: "",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "",
    gstNumber: "",
    industryType: "Telecom / Broadband",
    numberOfEmployees: "51-200 employees",
    companyWebsite: "",
    profilePic: null,
    createdAt: new Date().toISOString(),
    __seeded: true,
  },
  {
    id: BASE + 5,
    name: "Avenue Supermarts Ltd",
    email: "",                          // TODO: client's real email
    contact: "9993826661",              // portal contact
    streetAddress: "",
    city: "Indore",
    state: "Madhya Pradesh",
    pincode: "",
    gstNumber: "",
    industryType: "Retail / Supermarket",
    numberOfEmployees: "201-500 employees",
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
  // Future-dated so seeded jobs always sort above default/static jobs,
  // and idx keeps them stable in the order given (first = newest).
  createdAt: new Date(now + (1000 - idx) * 60000).toISOString(),
  seedPriority: 1000 - idx, // explicit ordering hint (higher = top)
  __seeded: true,
  ...over,
});

export const SEED_JOBS = [
  // ---------- Client 4: Bharat Airtel (newest — force on top everywhere) ----------
  makeJob(
    {
      title: "CRA Customer Recovery Advisor",
      company: "Bharat Airtel",
      seedPriority: 1013,
      createdAt: new Date(now + 1103 * 60000).toISOString(),
      companyEmail: "",
      location: "Bhopal",
      experience: "0-2 years",
      salary: "₹13,000 – ₹15,000/month",
      qualification: "12th Pass / Graduate / Diploma",
      tags: ["Customer Relationship Management", "Payment Recovery", "Negotiation", "Field Operations", "Communication"],
      hiringProcess: ["Face-to-Face", "Telephonic"],
      numberOfOpenings: "2",
      gender: "Any",
      description:
        "CRA – Customer Recovery Advisor | Bharat Airtel, Bhopal.\n\nKey Responsibilities:\n• Visit customers with overdue broadband accounts and assist in payment recovery.\n• Build positive relationships with customers while resolving payment-related concerns.\n• Educate customers about available payment options and service continuity.\n• Coordinate with internal teams to ensure timely issue resolution.\n• Maintain accurate records of customer visits, collections, and recovery status.\n• Achieve assigned recovery and collection targets.\n• Ensure all recovery activities comply with company policies and ethical standards.\n\nEligibility:\n• 12th Pass, Graduate, or Diploma holders can apply.\n• Freshers and experienced candidates are welcome.\n• Good communication and negotiation skills.\n• Willingness to travel within the assigned area.\n• Basic knowledge of smartphones and digital payment methods is preferred.\n\nRequired Skills: Customer Relationship Management • Negotiation & Persuasion • Communication Skills • Problem Solving • Time Management • Documentation & Reporting • Field Operations\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    20
  ),
  makeJob(
    {
      title: "Installation Engineer",
      company: "Bharat Airtel",
      seedPriority: 1012,
      createdAt: new Date(now + 1102 * 60000).toISOString(),
      companyEmail: "",
      location: "Bhopal",
      experience: "0-3 years",
      salary: "₹20,500 – ₹24,300/month",
      qualification: "ITI / Diploma / Graduate (Electronics, Electrical, CS, Networking)",
      tags: ["Broadband Installation", "Fiber", "Router Configuration", "Networking", "Troubleshooting"],
      hiringProcess: ["Face-to-Face"],
      numberOfOpenings: "2",
      gender: "Any",
      description:
        "Installation Engineer | Bharat Airtel, Bhopal.\n\nKey Responsibilities:\n• Install Airtel Broadband and Fiber connections at customer locations.\n• Configure Wi-Fi routers, ONTs, and networking devices.\n• Test internet connectivity and ensure service quality.\n• Troubleshoot installation and connectivity issues.\n• Provide customers with a demonstration of broadband setup and usage.\n• Complete installation reports and service documentation.\n• Coordinate with the technical support team for issue resolution.\n• Follow company safety standards and installation procedures.\n\nEligibility:\n• ITI/Diploma/Graduate in Electronics, Electrical, Computer Science, Networking, or any relevant field.\n• Freshers and experienced candidates are welcome to apply.\n• Basic knowledge of networking, routers, and fiber installation is preferred.\n• Good communication and customer-handling skills.\n• Willingness to travel within the assigned area.\n\nSkills Required: Basic Networking Knowledge • Fiber Broadband Installation • Router Configuration • Troubleshooting Skills • Customer Service • Time Management • Teamwork\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    21
  ),

  // ---------- Client 5: Avenue Supermarts Ltd ----------
  makeJob(
    {
      title: "Credit Card Sales",
      company: "Avenue Supermarts Ltd",
      seedPriority: 1011,
      createdAt: new Date(now + 1101 * 60000).toISOString(),
      companyEmail: "",
      location: "Indore",
      experience: "0-3 years",
      salary: "₹14,000 – ₹18,000/month",
      qualification: "High School / Graduate (Business Administration preferred)",
      tags: ["Sales", "Credit Cards", "Financial Products", "Negotiation", "Customer Service"],
      hiringProcess: ["Face-to-Face", "Telephonic"],
      numberOfOpenings: "3",
      gender: "Any",
      description:
        "Credit Card Sales | Avenue Supermarts Ltd, Indore.\n\nKey Responsibilities:\n• Identify potential customers for credit card sales through various channels.\n• Explain the features and benefits of different credit card products to customers.\n• Persuade customers to purchase credit cards and complete the application process.\n• Achieve or exceed monthly sales targets set by management.\n• Provide excellent customer service and promote a positive company image.\n• Follow up with customers to ensure satisfaction and obtain feedback.\n• Keep up to date with product knowledge and market trends.\n• Maintain accurate and timely records of sales activities and customer interactions.\n\nQualifications:\n• High school diploma or equivalent; Bachelor's degree in Business Administration or related field is preferred.\n• Proven experience in sales, preferably in financial products or services.\n• Strong communication, negotiation, and interpersonal skills.\n• Customer-focused with the ability to understand and meet customers' needs.\n• Ability to work independently and as part of a team.\n• Results-oriented with a strong drive to achieve sales targets.\n\nSkills: Sales techniques • Customer relationship management • Communication skills • Negotiation • Product knowledge • Time management • Analytical thinking • Problem-solving\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    22
  ),
  makeJob(
    {
      title: "Cashier (Shop)",
      company: "Avenue Supermarts Ltd",
      seedPriority: 1010,
      createdAt: new Date(now + 1100 * 60000).toISOString(),
      companyEmail: "",
      location: "Indore",
      experience: "0-2 years",
      salary: "₹12,000 – ₹14,000/month",
      qualification: "12th Pass / Graduate",
      tags: ["Cashier", "POS", "Billing", "Retail", "Customer Service"],
      hiringProcess: ["Face-to-Face"],
      numberOfOpenings: "2",
      gender: "Any",
      description:
        "Cashier (Shop) | Avenue Supermarts Ltd, Indore.\n\nKey Responsibilities:\n• Transaction Management: Scan products, weigh items, apply discounts/coupons, and process cash, card, and digital payments.\n• Customer Service: Greet customers warmly, assist with inquiries, and handle merchandise returns or exchanges according to store policy.\n• Till Reconciliation: Count the cash drawer at the beginning and end of the shift to ensure the balance matches daily sales reports.\n• Inventory & Store Support: Maintain a clean, organized checkout area, assist with restocking shelves, and alert management to low-stock items.\n\nRequired Skills:\n• Basic Mathematics: Ability to calculate change, discounts, and percentages quickly and accurately.\n• Technical Proficiency: Familiarity with POS systems, barcode scanners, and digital payment apps like UPI.\n• Interpersonal Skills: A friendly, patient attitude with excellent verbal communication skills.\n• Attention to Detail: High accuracy in handling money and balancing registers.\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    23
  ),

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

  // ---------- Client 3: Solar Energy Company ----------
  makeJob(
    {
      title: "Sales Executive – Solar",
      company: "Solar Energy Company",
      seedPriority: 1004,  // force Solar (newest) on top
      companyEmail: "humanresourcesgos@gmail.com",
      location: "Bhopal",
      experience: "0-2 years",
      salary: "₹10,000 – ₹14,000/month + Incentives",
      qualification: "12th Pass / Graduate (preferred)",
      tags: ["Sales", "Solar", "Lead Generation", "Customer Handling"],
      hiringProcess: ["Face-to-Face", "Telephonic"],
      numberOfOpenings: "3",
      gender: "Any",
      description:
        "Sales Executive – Solar Company. Timing: 10:30 AM to 6:00 PM.\n\nJob Responsibilities:\n• Generate leads and identify potential customers for solar solutions.\n• Meet residential, commercial, and industrial clients.\n• Explain solar products and services to customers.\n• Conduct site visits and customer presentations.\n• Prepare quotations and follow up with prospects.\n• Achieve monthly sales targets.\n• Maintain customer relationships and provide after-sales support.\n• Coordinate with the installation team for smooth project execution.\n• Update sales records and reports regularly.\n\nRequirements:\n• Minimum 12th Pass / Graduate preferred.\n• Good communication and negotiation skills.\n• Target-oriented approach.\n\nContact: 9993826661",
    },
    9
  ),
  makeJob(
    {
      title: "Site Installation Manager – Solar",
      company: "Solar Energy Company",
      seedPriority: 1003,  // force Solar (newest) on top
      companyEmail: "humanresourcesgos@gmail.com",
      location: "Bhopal",
      experience: "1-3 years",
      salary: "₹18,000 – ₹20,000/month",
      qualification: "Diploma / B.Tech (Electrical, Mechanical, Civil)",
      tags: ["Solar Installation", "Site Management", "Electrical", "Project Execution", "HSE"],
      hiringProcess: ["Face-to-Face"],
      numberOfOpenings: "1",
      gender: "Any",
      description:
        "Site Installation Manager – Solar Company. Timing: 10:30 AM to 6:00 PM. Reporting To: Vikas Kumar.\n\nJob Description:\n• Manage on-site solar panel installation projects.\n• Supervise technicians, electricians, and subcontractors.\n• Plan daily work schedules and allocate manpower effectively.\n• Ensure installations meet quality, technical, and safety standards.\n• Coordinate with engineering, procurement, and project teams.\n• Monitor project progress and resolve site-related issues.\n• Maintain site reports, work records, and material consumption records.\n• Conduct technical site surveys, shadow analysis, and feasibility assessments.\n• Ensure compliance with local regulations and safety guidelines.\n• Manage material dispatch and return of unused materials.\n• Ensure plant cleanliness and proper site housekeeping.\n• Maintain daily logbooks and follow company SOPs.\n\nRequirements:\n• Diploma/B.Tech in Electrical, Mechanical, Civil, or related field.\n• 1–3 years in solar installation, electrical projects, or site management.\n• Knowledge of rooftop solar systems and installation procedures.\n• Ability to manage field teams and coordinate multiple sites.\n• Strong problem-solving and communication skills.\n• Two-wheeler preferred; willingness to travel.\n\nKRAs: Project planning & execution, team supervision, quality assurance & compliance, HSE, cost control, customer coordination, documentation & reporting, commissioning & handover, continuous improvement.\n\nContact: 9993826661",
    },
    10
  ),
  makeJob(
    {
      title: "Sales Manager – Solar",
      company: "Solar Energy Company",
      seedPriority: 1002,  // force Solar (newest) on top
      companyEmail: "humanresourcesgos@gmail.com",
      location: "Bhopal",
      experience: "2-5 years",
      salary: "₹20,000 – ₹25,000/month + Incentives",
      qualification: "Graduate / MBA (Sales, Marketing, Business Admin)",
      tags: ["Sales Management", "Solar", "Team Leadership", "Business Development", "CRM"],
      hiringProcess: ["Face-to-Face", "Telephonic"],
      numberOfOpenings: "1",
      gender: "Any",
      description:
        "Sales Manager – Solar Company. Timing: 10:30 AM to 6:00 PM.\n\nJob Responsibilities:\n• Develop and execute sales strategies to achieve monthly, quarterly, and annual targets.\n• Identify new business opportunities in residential, commercial, industrial, and government sectors.\n• Build and maintain a strong sales pipeline.\n• Conduct client meetings, site visits, and product presentations.\n• Prepare proposals, BOQs, quotations, and techno-commercial offers.\n• Negotiate pricing, contracts, and payment terms.\n• Lead, train, motivate, and guide the sales team.\n• Track market trends, government policies, subsidies, and MNRE guidelines.\n• Analyze competitor activities and provide market intelligence.\n• Coordinate with engineering, procurement, accounts, and finance.\n• Submit MIS reports, sales forecasts, and performance reports.\n\nRequirements:\n• Graduate/MBA in Sales, Marketing, Business Administration, or related field.\n• 2–5 years of sales experience, preferably in Solar, Electrical, Energy, or EPC.\n• Strong leadership, communication, and negotiation skills.\n• Knowledge of solar products, government schemes, and industry trends preferred.\n• Proficiency in MS Office and CRM software.\n• Two-wheeler and willingness to travel.\n\nKRAs: Revenue & target achievement, team management, business development, sales planning & strategy, customer relationship management, reporting & documentation, coordination & compliance.\n\nContact: 9993826661",
    },
    11
  ),
  makeJob(
    {
      title: "Tele Caller / Back Office Executive (Female)",
      company: "Solar Energy Company",
      seedPriority: 1001,  // force Solar (newest) on top
      companyEmail: "humanresourcesgos@gmail.com",
      location: "Bhopal",
      experience: "1-2 years",
      salary: "₹12,000 – ₹15,000/month",
      qualification: "Graduate (Mandatory)",
      tags: ["Telecalling", "Back Office", "Data Entry", "MS Excel", "Customer Handling"],
      hiringProcess: ["Telephonic", "Face-to-Face"],
      numberOfOpenings: "1",
      gender: "Female",
      description:
        "We Are Hiring – Tele Caller / Back Office Executive (Female). Solar Energy Company.\n\nGender: Female Only | Age Limit: Below 30 Years | Qualification: Graduate (Mandatory)\nExperience: Telecalling, Back Office Operations, Data Management, Customer Handling.\nOffice Timing: 10:30 AM – 6:00 PM | Weekly Off: Sunday | Preferred within 5–10 KM of office.\n\nJob Responsibilities:\n• Daily marketing data calling and customer follow-up\n• Coordination with Sales & Operations Team\n• Handle emails, calls, and office support activities\n• Maintain calling records and Excel databases\n• Data Entry & Record Maintenance; prepare Customer Detail Files (CDF)\n• Feedback calling & customer support\n• Maintain files, documents, and office records\n• Follow company SOPs and maintain professionalism\n\nKRAs: Data entry & record management, MIS & reporting support, coordination & communication, billing & documentation support, process compliance & accuracy, administrative support.\n\nRequired Skills:\n• Excellent communication • Telecalling experience • Back office operations\n• MS Excel & computer proficiency • Data entry & documentation • Customer handling & follow-up • Organized & detail-oriented\n\nContact: 9993826661 / 9516422456\nEmail: mmtijobs@gmail.com",
    },
    12
  ),
];

// ===========================================================
// SEED ONCE — writes companies + jobs into localStorage,
// merging with anything already there, guarded by a version flag.
// Bump SEED_VERSION if you change the seed data and want it re-applied.
// ===========================================================
export const SEED_VERSION = "v5";

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