import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JobDetails.css';

const JobDetails = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const [jobResponse, bookmarkResponse, applicationResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/jobs/${jobId}/bookmark-status`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/jobs/${jobId}/application-status`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        console.log(jobResponse.data.job);
        setJob(jobResponse.data.job);
        setIsBookmarked(bookmarkResponse.data.isBookmarked);
        setHasApplied(applicationResponse.data.hasApplied);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const toggleBookmark = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/jobs/${jobId}/bookmark`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsBookmarked(response.data.bookmarked);
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => {
    setIsPopupOpen(false);
    if (isSubmitted) {
      setTimeout(() => {
        setIsSubmitted(false);
        setFileSelected(false);
        setShowError(false);
      }, 300);
    }
  };

  const handleFileChange = (e) => setFileSelected(e.target.files.length > 0);

  const submitApplication = async () => {
    if (!fileSelected) return;
    
    setIsSubmitting(true);
    setShowError(false);
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      const fileInput = document.querySelector('#resumeInput');
      formData.append('resume', fileInput.files[0]);

      await axios.post(
        `http://localhost:5000/api/jobs/${jobId}/apply`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsSubmitted(true);
      setHasApplied(true);
    } catch (err) {
      console.error("Error submitting application:", err);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="jd-loading">Loading job details...</div>;
  }

  if (error) {
    return <div className="jd-error">{error}</div>;
  }

  if (!job) {
    return <div className="jd-error">Job not found</div>;
  }

  return (
    <>
      <div className="jd-header">
        <div className="jd-header-container">
          <button className="jd-back-button" onClick={() => navigate(-1)} aria-label="Go back">
            <svg className="jd-icon" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <div className="jd-logo">SkillNet</div>
          
          <button className="jd-icon-button" aria-label="Bookmark job" onClick={toggleBookmark}>
            <svg className="jd-icon" viewBox="0 0 24 24">
              <path 
                className="jd-bookmark-icon" 
                d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" 
                fill={isBookmarked ? "currentColor" : "none"} 
                stroke="currentColor"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="jd-main">
        <div className="jd-card">
          <div className="jd-job-header">
            <div className="jd-company-logo">
              {job.organisations?.name ? job.organisations.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h2 className="jd-job-title">{job.title}</h2>
              <p className="jd-company-name">{job.company_name|| 'Unknown Company'}</p>
              <div className="jd-job-meta">
                <span className="jd-meta-item">
                  <span className="jd-meta-icon">📍</span>
                  {job.is_remote ? 'Remote' : job.location || 'Location not specified'}
                </span>
                <span className="jd-meta-item">
                  <span className="jd-meta-icon">💰</span>
                  {job.salary_min && job.salary_max 
                    ? `${job.salary_currency || ''}${job.salary_min} - ${job.salary_max}`
                    : 'Salary not specified'}
                </span>
                <span className="jd-meta-item">
                  <span className="jd-meta-icon">⏱️</span>
                  {job.employment_type || 'Full-time'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="jd-action-buttons">
            <button 
              className={`jd-apply-button ${hasApplied ? 'applied' : ''}`} 
              onClick={openPopup}
              disabled={hasApplied}
            >
              {hasApplied ? 'Applied' : 'Apply Now'}
            </button>
          </div>
        </div>

        <div className="jd-card">
          <h3 className="jd-section-title">Job Description</h3>
          <p className="jd-section-content">
            {job.description || 'No description provided.'}
          </p>
          
          <h3 className="jd-section-title">Responsibilities</h3>
          <ul className="jd-section-content">
            {job.responsibilities ? (
              job.responsibilities.split('\n').map((item, index) => (
                <li key={index}>{item}</li>
              ))
            ) : (
              <li>No responsibilities listed.</li>
            )}
          </ul>
          
          <h3 className="jd-section-title">Requirements</h3>
          <ul className="jd-section-content">
            {job.requirements ? (
              job.requirements.split('\n').map((item, index) => (
                <li key={index}>{item}</li>
              ))
            ) : (
              <li>No requirements listed.</li>
            )}
          </ul>
          
          <h3 className="jd-section-title">Additional Information</h3>
          <div className="jd-info-grid">
            <div>
              <p className="jd-info-item-label">Education Level:</p>
              <p className="jd-info-item-value">{job.education_level || 'Not specified'}</p>
            </div>
            <div>
              <p className="jd-info-item-label">Domain of Study:</p>
              <p className="jd-info-item-value">{job.domain_of_study || 'Not specified'}</p>
            </div>
            <div>
              <p className="jd-info-item-label">Experience Level:</p>
              <p className="jd-info-item-value">{job.experience_level || 'Not specified'}</p>
            </div>
            <div>
              <p className="jd-info-item-label">Application Deadline:</p>
              <p className="jd-info-item-value">
                {job.application_deadline 
                  ? new Date(job.application_deadline).toLocaleDateString() 
                  : 'No deadline'}
              </p>
            </div>
          </div>
        </div>

        { (
  <div className="jd-card">
    <h3 className="jd-section-title">About {job.company_name}</h3>
    <p className="jd-section-content">
      {job.company_description || 'No company description available.'}
    </p>
    {
    // job.organisations.website_url &&
     
      <a 
        className="jd-company-link" 
        href={job.company_website} 
      >
        Visit company website
        <svg className="jd-icon jd-icon-small jd-link-icon" viewBox="0 0 24 24">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    }
  </div>
)}
      </div>

      <div className="jd-mobile-apply-bar">
        <div>
          <p className="jd-mobile-job-title">{job.title}</p>
          <p className="jd-mobile-company-name">{job.organisations?.name || 'Unknown Company'}</p>
        </div>
        <button 
          className={`jd-mobile-apply-button ${hasApplied ? 'applied' : ''}`} 
          onClick={openPopup}
          disabled={hasApplied}
        >
          {hasApplied ? 'Applied' : 'Apply'}
        </button>
      </div>

      <div className={`jd-popup-overlay ${isPopupOpen ? 'jd-active' : ''}`} onClick={(e) => {
        if (e.target.className.includes('jd-popup-overlay')) {
          closePopup();
        }
      }}>
        <div className="jd-application-popup">
          <div className="jd-popup-header">
            <h2 className="jd-popup-job-title">Apply for {job.title}</h2>
            <div className="jd-popup-company-name">{job.organisations?.name || 'Unknown Company'}</div>
            <button className="jd-popup-close" onClick={closePopup}>×</button>
          </div>
          
          {!isSubmitted ? (
            <div id="applicationForm">
              <div className="jd-popup-body">
                {showError && (
                  <div className="jd-error-message jd-active">
                    Failed to submit application. Please try again.
                  </div>
                )}
                
                <div className="jd-form-group">
                  <label className="jd-form-label">Resume</label>
                  <div className="jd-file-input-container">
                    <input 
                      type="file" 
                      id="resumeInput" 
                      className="jd-file-input" 
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="resumeInput" className="jd-file-input-label">Upload Resume</label>
                    <span className={`jd-file-selected ${fileSelected ? 'active' : ''}`}>✓ File selected</span>
                  </div>
                </div>
              </div>
              
              <div className="jd-popup-footer">
                <button className="jd-cancel-btn" onClick={closePopup}>Cancel</button>
                <button 
                  className="jd-submit-btn" 
                  disabled={!fileSelected || isSubmitting} 
                  onClick={submitApplication}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          ) : (
            <div className="jd-success-container jd-active">
              <div className="jd-success-icon">✓</div>
              <h3 className="jd-success-title">Application Submitted!</h3>
              <p className="jd-success-message">Your application has been successfully submitted.</p>
              <button className="jd-success-btn" onClick={closePopup}>Close</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDetails;