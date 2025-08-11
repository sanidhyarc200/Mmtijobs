// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      navigate('/');
      return;
    }
    
    setCurrentUser(user);
    
    // Load applications
    const allApplications = JSON.parse(localStorage.getItem('jobApplications')) || [];
    const userApplications = allApplications.filter(app => app.userId === user.id);
    setApplications(userApplications);
    
    // Load saved jobs (if implemented)
    const allSavedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];
    const userSavedJobs = allSavedJobs.filter(job => job.userId === user.id);
    setSavedJobs(userSavedJobs);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#0a66c2', margin: 0 }}>MMtijobs Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#0a66c2' }}>Welcome, {currentUser.firstName}</span>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header> */}

      {/* Main Content */}
      <div style={{
        display: 'flex',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          marginRight: '20px',
          height: 'fit-content'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: activeTab === 'profile' ? '#f0f7ff' : 'transparent',
                color: activeTab === 'profile' ? '#0a66c2' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'profile' ? 600 : 400
              }}
            >
              My Profile
            </button>
            <button 
              onClick={() => setActiveTab('applications')}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: activeTab === 'applications' ? '#f0f7ff' : 'transparent',
                color: activeTab === 'applications' ? '#0a66c2' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'applications' ? 600 : 400
              }}
            >
              My Applications
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: activeTab === 'saved' ? '#f0f7ff' : 'transparent',
                color: activeTab === 'saved' ? '#0a66c2' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'saved' ? 600 : 400
              }}
            >
              Saved Jobs
            </button>
          </div>
        </div>

        {/* Main Panel */}
        <div style={{
          flex: 1,
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '25px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ color: '#0a66c2', marginBottom: '20px' }}>My Profile</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <h3 style={{ color: '#374151', marginBottom: '10px' }}>Personal Information</h3>
                  <p><strong>Name:</strong> {currentUser.firstName} {currentUser.middleName} {currentUser.lastName}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Contact:</strong> {currentUser.contact}</p>
                </div>
                <div>
                  <h3 style={{ color: '#374151', marginBottom: '10px' }}>Professional Information</h3>
                  <p><strong>Degree:</strong> {currentUser.degree}</p>
                  <p><strong>Experience:</strong> {currentUser.experience}</p>
                  <p><strong>Tech Stack:</strong> {currentUser.techstack}</p>
                </div>
              </div>
              <div>
                <h3 style={{ color: '#374151', marginBottom: '10px' }}>Career Preferences</h3>
                <p><strong>Expected Salary:</strong> {currentUser.currentSalary}</p>
                <p><strong>Preferred Location:</strong> {currentUser.location}</p>
                <p><strong>Notice Period:</strong> {currentUser.noticePeriod}</p>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div>
              <h2 style={{ color: '#0a66c2', marginBottom: '20px' }}>My Applications ({applications.length})</h2>
              {applications.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gap: '15px'
                }}>
                  {applications.map((app, index) => (
                    <div key={index} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '15px',
                      transition: 'all 0.2s ease'
                    }}>
                      <h3 style={{ color: '#0a66c2', marginBottom: '5px' }}>{app.jobTitle}</h3>
                      <p style={{ color: '#4b5563', marginBottom: '5px' }}>{app.company}</p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          backgroundColor: app.status === 'Applied' ? '#e0f2fe' : 
                                         app.status === 'Interview' ? '#f0fdf4' : 
                                         app.status === 'Rejected' ? '#fee2e2' : '#e5e7eb',
                          color: app.status === 'Applied' ? '#0369a1' : 
                                 app.status === 'Interview' ? '#15803d' : 
                                 app.status === 'Rejected' ? '#b91c1c' : '#374151',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.85em'
                        }}>
                          {app.status}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '0.85em' }}>
                          Applied on: {new Date(app.appliedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>You haven't applied to any jobs yet.</p>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              <h2 style={{ color: '#0a66c2', marginBottom: '20px' }}>Saved Jobs ({savedJobs.length})</h2>
              {savedJobs.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gap: '15px'
                }}>
                  {savedJobs.map((job, index) => (
                    <div key={index} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '15px',
                      transition: 'all 0.2s ease'
                    }}>
                      <h3 style={{ color: '#0a66c2', marginBottom: '5px' }}>{job.title}</h3>
                      <p style={{ color: '#4b5563', marginBottom: '5px' }}>{job.company || 'Unknown Company'}</p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ color: '#6b7280', fontSize: '0.85em' }}>
                          {job.location}
                        </span>
                        <button style={{
                          padding: '5px 10px',
                          background: '#0a66c2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85em'
                        }}>
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>You haven't saved any jobs yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}