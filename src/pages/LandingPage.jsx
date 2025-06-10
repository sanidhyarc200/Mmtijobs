import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const defaultJobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'MMTI Jobs',
      location: 'Remote',
      experience: '2-4 years',
      salary: '₹6-8 LPA',
      tags: ['React', 'JavaScript', 'CSS'],
    },
    {
      id: 2,
      title: 'Backend Developer',
      company: 'TechStack',
      location: 'Bangalore',
      experience: '3-5 years',
      salary: '₹8-10 LPA',
      tags: ['Node.js', 'Express', 'MongoDB'],
    },
    {
      id: 3,
      title: 'Fullstack Developer',
      company: 'InnovateX',
      location: 'Hyderabad',
      experience: '4-6 years',
      salary: '₹10-12 LPA',
      tags: ['React', 'Node.js', 'AWS'],
    },
    {
      id: 4,
      title: 'Data Scientist',
      company: 'DataPros',
      location: 'Remote',
      experience: '3-5 years',
      salary: '₹12-15 LPA',
      tags: ['Python', 'Machine Learning', 'SQL'],
    },
    {
      id: 5,
      title: 'UI/UX Designer',
      company: 'Creative Minds',
      location: 'Mumbai',
      experience: '2-3 years',
      salary: '₹5-7 LPA',
      tags: ['Figma', 'Adobe XD', 'Prototyping'],
    },
    {
      id: 6,
      title: 'DevOps Engineer',
      company: 'CloudWorks',
      location: 'Pune',
      experience: '3-5 years',
      salary: '₹9-11 LPA',
      tags: ['Docker', 'Kubernetes', 'CI/CD'],
    },
    {
      id: 7,
      title: 'Mobile App Developer',
      company: 'AppVenture',
      location: 'Chennai',
      experience: '2-4 years',
      salary: '₹6-9 LPA',
      tags: ['React Native', 'Swift', 'Kotlin'],
    },
    {
      id: 8,
      title: 'QA Engineer',
      company: 'Quality First',
      location: 'Chennai',
      experience: '1-3 years',
      salary: '₹4-6 LPA',
      tags: ['Selenium', 'Jest', 'Automation'],
    },
  ];
  
export default function LandingPage() {
  const [year] = useState(new Date().getFullYear());

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filteredJobs, setFilteredJobs] = useState(defaultJobs);
  const navigate = useNavigate();

  useEffect(() => {
    let filtered = defaultJobs.filter((job) => {
      const keywordLower = keyword.toLowerCase();
      const matchesKeyword =
        job.title.toLowerCase().includes(keywordLower) ||
        job.company.toLowerCase().includes(keywordLower) ||
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

  const handlePostJobClick = () => navigate('/post-job');
  const handleApply = () => alert('Please login or sign up to apply.');
  const handleView = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  return (
    <>
      <section className="hero">
        <h2>Find your dream job today</h2>
        <p>Thousands of jobs from top companies. Your next career move is just a click away.</p>
      </section>

      <section className="search-bar-container" style={{ marginTop: '-20px' }}>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Job title, keywords, or company"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
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
        </div>
      </section>

      <section className="job-listings">
        <h3>Latest Jobs</h3>
        <div className="jobs">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div className="job-card" key={job.id} style={{ width: '100%' }}>
                <div className="job-header">
                  <h4>{job.title}</h4>
                  <span className="badge">{job.salary}</span>
                </div>
                <div className="company">{job.company}</div>
                <div className="tags">{job.tags.join(', ')}</div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => handleView(job)}>View</button>
                  <button onClick={handleApply}>Apply</button>
                </div>
              </div>
            ))
          ) : (
            <p>No jobs found matching your criteria.</p>
          )}
        </div>
      </section>

      <section className="hire-section">
        <h2>Are you a recruiter?</h2>
        <p>
          Want to post a job? register now !! use the post a job fetaure in the header to continue !!!
        </p>
        {/* <button className="hire-button" onClick={handlePostJobClick}>
          Post a Job
        </button> */}
      </section>

      <footer>
        <div className="container footer">
          <p>© {year} MMtijobs — All rights reserved.</p>
        </div>
      </footer>

      {showModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedJob.title}</h2>
            <p><strong>Company:</strong> {selectedJob.company}</p>
            <p><strong>Location:</strong> {selectedJob.location}</p>
            <p><strong>Experience:</strong> {selectedJob.experience}</p>
            <p><strong>Salary:</strong> {selectedJob.salary}</p>
            <p><strong>Skills:</strong> {selectedJob.tags.join(', ')}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

