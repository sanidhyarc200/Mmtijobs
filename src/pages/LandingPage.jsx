import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const defaultTitles = [
  'Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'Data Scientist',
  'UI/UX Designer', 'DevOps Engineer', 'Mobile App Developer', 'QA Engineer',
  'Cloud Architect', 'Machine Learning Engineer', 'Security Analyst', 'React Developer',
  'Node.js Developer', 'Product Designer', 'SRE Engineer', 'Technical Writer'
];

const defaultJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'Remote',
    experience: '2-4 years',
    salary: '₹6-8 LPA',
    tags: ['React', 'JavaScript', 'CSS'],
    description: 'We are looking for a skilled Frontend Developer to join our dynamic team. You will be responsible for building user interfaces and ensuring seamless user experiences.',
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'DataSystems Ltd.',
    location: 'Bangalore',
    experience: '3-5 years',
    salary: '₹8-10 LPA',
    tags: ['Node.js', 'Express', 'MongoDB'],
    description: 'Join our backend team to develop robust server-side applications. Experience with microservices and cloud platforms is preferred.',
  },
  {
    id: 3,
    title: 'Fullstack Developer',
    company: 'WebSolutions Co.',
    location: 'Hyderabad',
    experience: '4-6 years',
    salary: '₹10-12 LPA',
    tags: ['React', 'Node.js', 'AWS'],
    description: 'We need a versatile Fullstack Developer who can work on both frontend and backend technologies. AWS experience is a plus.',
  },
  {
    id: 4,
    title: 'Data Scientist',
    company: 'AI Innovations',
    location: 'Remote',
    experience: '3-5 years',
    salary: '₹12-15 LPA',
    tags: ['Python', 'Machine Learning', 'SQL'],
    description: 'Analyze complex datasets and build machine learning models to drive business insights. Strong statistical background required.',
  },
  {
    id: 5,
    title: 'UI/UX Designer',
    company: 'Creative Minds',
    location: 'Mumbai',
    experience: '2-3 years',
    salary: '₹5-7 LPA',
    tags: ['Figma', 'Adobe XD', 'Prototyping'],
    description: 'Create intuitive and engaging user interfaces. Experience with design systems and user research is highly valued.',
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    location: 'Pune',
    experience: '3-5 years',
    salary: '₹9-11 LPA',
    tags: ['Docker', 'Kubernetes', 'CI/CD'],
    description: 'Manage and optimize our cloud infrastructure. Experience with containerization and automation tools is essential.',
  },
  {
    id: 7,
    title: 'Mobile App Developer',
    company: 'AppWorks',
    location: 'Chennai',
    experience: '2-4 years',
    salary: '₹6-9 LPA',
    tags: ['React Native', 'Swift', 'Kotlin'],
    description: 'Develop cross-platform mobile applications. Experience with both iOS and Android development is preferred.',
  },
  {
    id: 8,
    title: 'QA Engineer',
    company: 'Quality Assurance Labs',
    location: 'Chennai',
    experience: '1-3 years',
    salary: '₹4-6 LPA',
    tags: ['Selenium', 'Jest', 'Automation'],
    description: 'Ensure product quality through comprehensive testing strategies. Experience with automation frameworks is required.',
  },
];

export default function LandingPage() {
  const [year] = useState(new Date().getFullYear());
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState(defaultJobs);
  const [titleSuggestions, setTitleSuggestions] = useState(defaultTitles);
  const navigate = useNavigate();

  // Filter jobs based on search criteria
  useEffect(() => {
    const storedTitles = JSON.parse(sessionStorage.getItem('searchedTitles')) || [];
    setTitleSuggestions([...new Set([...defaultTitles, ...storedTitles])]);
  
    let filtered = defaultJobs.filter((job) => {
      const keywordLower = keyword.toLowerCase();
      const matchesKeyword =
        job.title.toLowerCase().includes(keywordLower) ||
        job.tags.some((tag) => tag.toLowerCase().includes(keywordLower));
      const matchesLocation = location
        ? job.location.toLowerCase().includes(location.toLowerCase())
        : true;

      const experienceMap = {
        '0-1 years': [0, 1],
        '1-3 years': [1, 3],
        '2-3 years': [2, 3],
        '2-4 years': [2, 4],
        '3-5 years': [3, 5],
        '4-6 years': [4, 6],
        '5+ years': [5, Infinity],
      };

      let matchesExperience = true;
      if (experience && experienceMap[experience]) {
        const [minExp, maxExp] = experienceMap[experience];
        const [jobMinExp, jobMaxExp] = job.experience
          .split(' ')[0]
          .split('-')
          .map(Number);
        matchesExperience =
          (jobMinExp >= minExp && jobMinExp <= maxExp) ||
          (jobMaxExp >= minExp && jobMaxExp <= maxExp);
      }

      return matchesKeyword && matchesLocation && matchesExperience;
    });

    setFilteredJobs(filtered);
  }, [keyword, location, experience]);

  const handleApply = (job) => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      // Save application to localStorage
      const applications = JSON.parse(localStorage.getItem('jobApplications')) || [];
      const existingApplication = applications.find(app => 
        app.jobId === job.id && app.userId === user.id
      );
      
      if (existingApplication) {
        alert(`You've already applied for ${job.title}`);
        return;
      }

      const newApplication = {
        jobId: job.id,
        userId: user.id,
        jobTitle: job.title,
        company: job.company || 'Unknown Company',
        appliedDate: new Date().toISOString(),
        status: 'Applied'
      };
      
      localStorage.setItem('jobApplications', JSON.stringify([...applications, newApplication]));
      alert(`Successfully applied for ${job.title}`);
    } else {
      navigate('/onboarding');
    }
  };
  
  const handleView = (job) => {
    setSelectedJob(job);
    setShowViewModal(true);
  };

  return (
    <div className="landing-page">
      <style>
        {`
          .landing-page {
            font-family: 'Inter', sans-serif;
            max-width: 100%;
            overflow-x: hidden;
          }
          
          .hero-section {
            position: relative;
            min-height: 350px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, rgba(10, 102, 194, 0.9), rgba(0, 65, 130, 0.8)), 
                       url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            color: white;
            text-align: center;
            padding: 30px 20px;
          }
          
          .hero-title {
            font-size: 2.2em;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 2px 2px 10px rgba(0,0,0,0.3);
            line-height: 1.2;
          }
          
          .hero-subtitle {
            font-size: 1.1em;
            margin-bottom: 20px;
            text-shadow: 1px 1px 5px rgba(0,0,0,0.3);
            opacity: 0.95;
            font-weight: 400;
          }
          
          .search-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 15px 20px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            width: 90%;
            max-width: 1200px;
            border: 1px solid rgba(255,255,255,0.2);
          }
          
          .search-row {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
          }
          
          .search-input {
            flex: 1;
            min-width: 200px;
            padding: 10px 15px;
            border: 2px solid transparent;
            border-radius: 8px;
            font-size: 1em;
            background: white;
            color: #1f2937;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            height: 42px;
          }
          
          .search-input:focus {
            border-color: #0a66c2;
            box-shadow: 0 4px 15px rgba(10, 102, 194, 0.3);
            outline: none;
          }
          
          .search-button {
            padding: 10px 20px;
            background: linear-gradient(135deg, #0a66c2, #004182);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(10, 102, 194, 0.4);
            height: 42px;
            white-space: nowrap;
          }
          
          .search-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(10, 102, 194, 0.5);
          }
          
          .job-listings {
            background: #f8fafc;
            padding: 30px 0;
          }
          
          .job-listings h3 {
            font-size: 1.8em;
            margin-bottom: 20px;
            text-align: center;
            color: #1f2937;
            font-weight: 700;
          }
          
          .job-listings-container {
            width: 90%;
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
          
          .job-card {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 12px 15px;
            margin-bottom: 12px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            transition: all 0.2s ease;
            border: 1px solid #e5e7eb;
            width: 100%;
            max-width: 800px;
          }
          
          .job-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #0a66c2;
          }
          
          .job-title {
            color: #0a66c2;
            font-size: 1.1em;
            margin-bottom: 4px;
            font-weight: 600;
          }
          
          .job-company {
            color: #4b5563;
            font-size: 0.9em;
            margin-bottom: 4px;
          }
          
          .job-meta {
            color: #4b5563;
            font-size: 0.85em;
            margin-bottom: 6px;
            display: flex;
            gap: 10px;
          }
          
          .job-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 8px;
          }
          
          .job-tag {
            background: #e5e7eb;
            color: #374151;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.75em;
          }
          
          .job-description {
            color: #4b5563;
            font-size: 0.85em;
            line-height: 1.4;
            margin-bottom: 10px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .job-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
          }
          
          .view-btn {
            background-color: #e5e7eb;
            color: #374151;
            padding: 6px 12px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.85em;
            transition: all 0.2s ease;
          }
          
          .view-btn:hover {
            background-color: #d1d5db;
          }
          
          .apply-btn {
            background-color: #0a66c2;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.85em;
            transition: all 0.2s ease;
          }
          
          .apply-btn:hover {
            background-color: #004182;
          }
          
          .hire-section {
            background: linear-gradient(135deg, #0a66c2, #004182);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          
          .hire-section h2 {
            font-size: 1.8em;
            margin-bottom: 15px;
            font-weight: 700;
          }
          
          .hire-section p {
            font-size: 1em;
            margin-bottom: 0;
            max-width: 700px;
            margin: 0 auto 20px;
          }
          
          footer {
            background-color: #ffffff;
            border-top: 1px solid #e5e7eb;
            padding: 15px 0;
            text-align: center;
            color: #6b7280;
            font-size: 0.85em;
          }
          
          datalist {
            max-height: 150px;
            overflow-y: auto;
          }
                      
          /* Modal styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          
          .modal-box {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          }
          
          /* Responsive adjustments */
          @media (min-width: 768px) {
            .hero-section {
              min-height: 380px;
            }
            
            .hero-title {
              font-size: 2.5em;
            }
            
            .hero-subtitle {
              font-size: 1.2em;
            }
            
            .search-row {
              flex-wrap: nowrap;
            }
            
            .job-card {
              padding: 15px 20px;
            }
          }

          @media (min-width: 1200px) {
            .job-listings-container {
              align-items: flex-start;
              padding-right: 400px;
            }
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="hero-section">
        <div>
          <h1 className="hero-title">Find Your Dream Job Today</h1>
          <p className="hero-subtitle">
            Thousands of jobs from top companies. Your next career move is just a click away.
          </p>
        </div>

        <div className="search-container">
          <div className="search-row">
            <input
              type="text"
              className="search-input"
              placeholder="Job title or keywords"
              value={keyword}
              onChange={(e) => {
                const val = e.target.value;
                setKeyword(val);
                if (val.length >= 3 && !defaultTitles.includes(val)) {
                  const stored = JSON.parse(sessionStorage.getItem('searchedTitles')) || [];
                  if (!stored.includes(val)) {
                    const updated = [...stored, val];
                    sessionStorage.setItem('searchedTitles', JSON.stringify(updated));
                    setTitleSuggestions([...new Set([...defaultTitles, ...updated])]);
                  }
                }
              }}
              list="title-suggestions"
            />
            <datalist id="title-suggestions">
              {titleSuggestions.map((title, idx) => (
                <option key={idx} value={title} />
              ))}
            </datalist>

            <input
              type="text"
              className="search-input"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <select
              className="search-input"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Experience</option>
              <option value="0-1 years">0-1 years</option>
              <option value="1-3 years">1-3 years</option>
              <option value="2-3 years">2-3 years</option>
              <option value="2-4 years">2-4 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="4-6 years">4-6 years</option>
              <option value="5+ years">5+ years</option>
            </select>
            <button
              className="search-button"
              onClick={() => console.log('Search triggered')}
            >
              Search Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="job-listings">
        <h3>Latest Job Opportunities</h3>
        <div className="job-listings-container">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="job-card">
                <h3 className="job-title">{job.title}</h3>
                {job.company && <div className="job-company">{job.company}</div>}
                <div className="job-meta">
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.experience}</span>
                  <span>•</span>
                  <span>{job.salary}</span>
                </div>
                <div className="job-tags">
                  {job.tags.map((tag, index) => (
                    <span key={index} className="job-tag">{tag}</span>
                  ))}
                </div>
                <p className="job-description">{job.description}</p>
                <div className="job-buttons">
                  <button
                    className="view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(job);
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className="apply-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(job);
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
              <p>No jobs found matching your criteria. Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recruiter Section */}
      <section className="hire-section">
        <h2>Are you a recruiter?</h2>
        <p>
          Want to post a job? Register now and use the post a job feature in the header to continue!
        </p>
      </section>

      {/* Footer */}
      <footer>
        <div>
          <p>© {year} MMtijobs — All rights reserved.</p>
        </div>
      </footer>

      {/* View Job Modal */}
      {showViewModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#0a66c2', marginBottom: '15px', textAlign: 'center' }}>{selectedJob.title}</h2>
            {selectedJob.company && <div style={{ marginBottom: '10px', textAlign: 'center' }}><strong>{selectedJob.company}</strong></div>}
            <div style={{ marginBottom: '10px' }}><strong>Location:</strong> {selectedJob.location}</div>
            <div style={{ marginBottom: '10px' }}><strong>Experience:</strong> {selectedJob.experience}</div>
            <div style={{ marginBottom: '10px' }}><strong>Salary:</strong> {selectedJob.salary}</div>
            <div style={{ marginBottom: '10px' }}><strong>Skills:</strong> {selectedJob.tags.join(', ')}</div>
            <div style={{ marginBottom: '15px' }}><strong>Description:</strong></div>
            <p style={{ color: '#4b5563', lineHeight: '1.5', marginBottom: '20px' }}>
              {selectedJob.description}
            </p>
            <button 
              style={{
                width: '100%',
                padding: '10px',
                background: '#0a66c2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => setShowViewModal(false)}
            >
              Close
            </button>
            <button
              style={{
                width: '100%',
                padding: '10px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '10px'
              }}
              onClick={() => {
                setShowViewModal(false);
                handleApply(selectedJob);
              }}
            >
              Apply Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}