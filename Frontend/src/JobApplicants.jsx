import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JobApplicants.css';

const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // State for job and applicants data
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modals
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // State for filters and tabs
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all statuses');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch job and applicants data
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch job details
        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJob(jobResponse.data.job);

        // Fetch applicants for this job
        const applicantsResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}/applicants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplicants(applicantsResponse.data.applicants);

      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, token, navigate]);

  // Handle viewing a candidate profile
  const handleViewCandidate = (candidate) => {
    navigate(`/org/jobs/${jobId}/applicants/${candidate.id}`);
  };


  // Handle scheduling an interview
  const handleScheduleInterview = (candidate) => {
    setSelectedCandidate(candidate);
    setShowInterviewScheduler(true);
  };

  // Close all modals
  const closeModals = () => {
    setShowCandidateProfile(false);
    setShowInterviewScheduler(false);
  };

  // Update applicant status
  const updateApplicantStatus = async (applicationId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplicants(applicants.map(applicant => 
        applicant.id === applicationId ? { ...applicant, status: newStatus } : applicant
      ));
    } catch (err) {
      console.error("Failed to update application status:", err);
    }
  };

  // Handle primary action buttons
  const handleActionButton = async (applicantId, currentStatus) => {
    const applicant = applicants.find(app => app.id === applicantId);
    
    let newStatus;
    let action;

    switch (currentStatus) {
      case 'applied':
        newStatus = 'reviewed';
        action = 'Review';
        break;
      case 'reviewed':
        newStatus = 'shortlisted';
        action = 'Shortlist';
        break;
      case 'shortlisted':
        newStatus = 'interviewing';
        action = 'Interview';
        handleScheduleInterview(applicant);
        break;
      case 'interviewing':
        action = 'Schedule';
        handleScheduleInterview(applicant);
        return; // Don't update status, just open scheduler
      default:
        return;
    }

    await updateApplicantStatus(applicantId, newStatus);
  };

  // Filter applicants based on active tab, status filter, and search term
  const filteredApplicants = applicants.filter(applicant => {
    // Tab filter
    if (activeTab !== 'all' && applicant.status !== activeTab) {
      return false;
    }
    
    // Search filter
    if (searchTerm && 
        !applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(applicant.position && applicant.position.toLowerCase().includes(searchTerm.toLowerCase())) ){
      return false;
    }
    
    return true;
  });

  // Calculate stats
  const stats = {
    applied: applicants.filter(a => a.status === 'applied').length,
    reviewed: applicants.filter(a => a.status === 'reviewed').length,
    shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
    interviewing: applicants.filter(a => a.status === 'interviewing').length,
    total: applicants.length
  };

  if (loading) {
    return (
      <div className="ja-loading-container">
        <div className="ja-loading-spinner"></div>
        <p>Loading job applicants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ja-error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="ja-not-found">
        <h2>Job Not Found</h2>
        <p>The job you're looking for doesn't exist or may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="ja-employer-home-page">

       {/* <div className="ja-headers">
        <div className="ja-header-container">
          <button className="ja-back-button" onClick={() => navigate(-1)} aria-label="Go back">
            <svg className="ja-icon" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <div className="ja-logo">SkillNet</div>
          
          <button className="ja-icon-button" aria-label="More options">
            <svg className="ja-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
      </div> */}
    <div className='ja-body'>
      <div className="ja-container">
        {/* Header Section */}
        <div className="ja-header">
          <h1>Applicant Management</h1>
          <div className="ja-header-actions">
            <button className="ja-btn ja-btn-primary" onClick={() => navigate('/org')}>
              Back to Jobs
            </button>

          </div>
        </div>
        
        {/* Job Details Panel */}
        <div className="ja-job-details">
          <h2 className="ja-job-title">{job.title}</h2>
          <div className="ja-job-meta">
            <span>📍 {job.location || 'Location not specified'}</span>
            {job.salary_min && job.salary_max && (
              <span>💰 {job.salary_currency} {job.salary_min} - {job.salary_max}</span>
            )}
            <span>🕒 {job.employment_type}</span>
            {job.application_deadline && (
              <span>📅 Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
            )}
          </div>
          <div className="ja-job-stats">
            <div className="ja-stat-box">
              <span className="ja-stat-number">{job.views_count || 0}</span>
              <span className="ja-stat-label">Views</span>
            </div>
            <div className="ja-stat-box">
              <span className="ja-stat-number">{stats.total}</span>
              <span className="ja-stat-label">Applications</span>
            </div>
            <div className="ja-stat-box">
              <span className="ja-stat-number">{stats.shortlisted}</span>
              <span className="ja-stat-label">Shortlisted</span>
            </div>
            <div className="ja-stat-box">
              <span className="ja-stat-number">{stats.interviewing}</span>
              <span className="ja-stat-label">Interviewing</span>
            </div>
          </div>
        </div>
        
        {/* Filter Section */}
        <div className="ja-filters">
          <div className="ja-filter-group">
            <select 
              onChange={(e) => {
                const status = e.target.value.toLowerCase();
                setStatusFilter(status);
                if (status !== 'all statuses') {
                  setActiveTab(status);
                } else {
                  setActiveTab('all');
                }
              }}
              value={statusFilter}
            >
              <option>All Statuses</option>
              <option>Applied</option>
              <option>Reviewed</option>
              <option>Shortlisted</option>
              <option>Interviewing</option>
            </select>
          </div>
          
          <div className="ja-filter-group">
            <select>
              <option>Any</option>
              <option>0-2 Years</option>
              <option>3-5 Years</option>
              <option>5+ Years</option>
            </select>
          </div>
          
          <div className="ja-filter-group">
            <select>
              <option>All</option>
              <option>Undergraduate</option>
              <option>Postgraduate</option>
              <option>PhD</option>
            </select>
          </div>
          
          <div className="ja-search-box">
            <input 
              type="text" 
              placeholder="Search by name, position..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Applicants List */}
        <div className="ja-applicants-list">
          <div className="ja-tabs">
            <div 
              className={`ja-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({stats.total})
            </div>
            <div 
              className={`ja-tab ${activeTab === 'applied' ? 'active' : ''}`}
              onClick={() => setActiveTab('applied')}
            >
              Applied ({stats.applied})
            </div>
            <div 
              className={`ja-tab ${activeTab === 'reviewed' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviewed')}
            >
              Reviewed ({stats.reviewed})
            </div>
            <div 
              className={`ja-tab ${activeTab === 'shortlisted' ? 'active' : ''}`}
              onClick={() => setActiveTab('shortlisted')}
            >
              Shortlisted ({stats.shortlisted})
            </div>
            <div 
              className={`ja-tab ${activeTab === 'interviewing' ? 'active' : ''}`}
              onClick={() => setActiveTab('interviewing')}
            >
              Interviewing ({stats.interviewing})
            </div>
          </div>
          
          {filteredApplicants.length === 0 ? (
            <div className="ja-no-applicants">
              <i className="fas fa-user-friends"></i>
              <p>No applicants match your current filters</p>
              <button 
                className="ja-btn btn-outline"
                onClick={() => {
                  setActiveTab('all');
                  setSearchTerm('');
                  setStatusFilter('all statuses');
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <table className="ja-applicants-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Experience</th>
                  <th>Current Position</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map(applicant => (
                  <tr key={applicant.id}>
                    <td 
                      className="ja-candidate-cell"
                      onClick={() => handleViewCandidate(applicant)}
                    >
                      <div className="ja-candidate-name">{applicant.name}</div>
                      <div className="ja-candidate-email">{applicant.email}</div>
                    </td>
                    <td>{applicant.experience || 'N/A'}</td>
                    <td>{applicant.position || 'N/A'}</td>
                    <td>{applicant.appliedDate || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${applicant.status}`}>
                        {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="ja-action-buttons">
                        <button 
                          className="ja-btn ja-btn-outline"
                          onClick={() => handleViewCandidate(applicant)}
                        >
                          <i className="fas fa-eye"></i> View
                        </button>
                        <button 
                          className="ja-btn ja-btn-primary"
                          onClick={() => handleActionButton(applicant.id, applicant.status)}
                        >
                          {applicant.status === 'applied' ? (
                            <><i className="fas fa-check"></i> Review</>
                          ) : applicant.status === 'reviewed' ? (
                            <><i className="fas fa-thumbs-up"></i> Shortlist</>
                          ) : applicant.status === 'shortlisted' ? (
                            <><i className="fas fa-calendar-alt"></i> Interview</>
                          ) : (
                            <><i className="fas fa-clock"></i> Reschedule</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
      {/* Candidate Profile Modal */}
      {showCandidateProfile && selectedCandidate && (
        <div className="ja-modal-overlay">
          <div className="ja-modal">
            <div className="ja-modal-header">
              <h3>{selectedCandidate.name}'s Profile</h3>
              <button className="ja-close-btn" onClick={closeModals}>
                &times;
              </button>
            </div>
            <div className="ja-modal-body">
              <div className="ja-candidate-profile">
                <div className="ja-profile-section">
                  <h4>Contact Information</h4>
                  <p><strong>Email:</strong> {selectedCandidate.email}</p>
                  {selectedCandidate.phone && <p><strong>Phone:</strong> {selectedCandidate.phone}</p>}
                </div>
                
                <div className="ja-profile-section">
                  <h4>Professional Information</h4>
                  <p><strong>Current Position:</strong> {selectedCandidate.position || 'N/A'}</p>
                  <p><strong>Company:</strong> {selectedCandidate.company || 'N/A'}</p>
                  <p><strong>Experience:</strong> {selectedCandidate.experience || 'N/A'}</p>
                </div>
                
                {selectedCandidate.resume_url && (
                  <div className="ja-profile-section">
                    <h4>Resume</h4>
                    <a 
                      href={selectedCandidate.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ja-btn ja-btn-outline"
                    >
                      <i className="fas fa-file-pdf"></i> View Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="ja-modal-footer">
              <button 
                className="ja-btn ja-btn-primary"
                onClick={() => {
                  closeModals();
                  handleScheduleInterview(selectedCandidate);
                }}
              >
                Schedule Interview
              </button>
              <button className="ja-btn ja-btn-outline" onClick={closeModals}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduler Modal */}
      {showInterviewScheduler && selectedCandidate && (
        <div className="ja-modal-overlay">
          <div className="ja-modal">
            <div className="ja-modal-header">
              <h3>Schedule Interview with {selectedCandidate.name}</h3>
              <button className="ja-close-btn" onClick={closeModals}>
                &times;
              </button>
            </div>
            <div className="ja-modal-body">
              <form className="ja-interview-form">
                <div className="ja-form-group">
                  <label>Date</label>
                  <input type="date" required />
                </div>
                
                <div className="ja-form-group">
                  <label>Time</label>
                  <input type="time" required />
                </div>
                
                <div className="ja-form-group">
                  <label>Interview Type</label>
                  <select>
                    <option>Video Call</option>
                    <option>Phone Call</option>
                    <option>In-Person</option>
                  </select>
                </div>
                
                <div className="ja-form-group">
                  <label>Duration (minutes)</label>
                  <input type="number" defaultValue={30} min={15} step={15} />
                </div>
                
                <div className="ja-form-group">
                  <label>Additional Notes</label>
                  <textarea placeholder="Any special instructions..."></textarea>
                </div>
              </form>
            </div>
            <div className="ja-modal-footer">
              <button 
                className="ja-btn ja-btn-primary"
                onClick={() => {
                  updateApplicantStatus(selectedCandidate.id, 'interviewing');
                  closeModals();
                  // In a real app, you would send the interview details to your backend
                }}
              >
                Confirm Schedule
              </button>
              <button className="ja-btn ja-btn-outline" onClick={closeModals}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicants;