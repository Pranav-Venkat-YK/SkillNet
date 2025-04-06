import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CandProf.css';

const CandProf = () => {
  const { jobId, applicationId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [candidateStatus, setCandidateStatus] = useState('shortlisted');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [interviews, setInterviews] = useState([]);

  // Fetch candidate data
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchCandidateData = async () => {
      try {
        // Fetch application details
        const response = await axios.get(`http://localhost:5000/api/applications/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCandidate(response.data.application);
        setCandidateStatus(response.data.application.status);
        
        // // Fetch notes
        // const notesResponse = await axios.get(
        //   `http://localhost:5000/api/applications/${applicationId}/notes`,
        //   { headers: { Authorization: `Bearer ${token}` } }
        // );
        // setNotes(notesResponse.data.notes);
        
        // Fetch interviews
        // const interviewsResponse = await axios.get(
        //   `http://localhost:5000/api/applications/${applicationId}/interviews`,
        //   { headers: { Authorization: `Bearer ${token}` } }
        // );
        // setInterviews(interviewsResponse.data.interviews);

      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch candidate data');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [applicationId, token, navigate]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCandidateStatus(newStatus);
      setCandidate({ ...candidate, status: newStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // const handleAddNote = async () => {
  //   if (!newNote.trim()) return;
    
  //   try {
  //     const response = await axios.post(
  //       `http://localhost:5000/api/applications/${applicationId}/notes`,
  //       { content: newNote },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
      
  //     setNotes([...notes, response.data.note]);
  //     setNewNote('');
  //   } catch (err) {
  //     console.error("Failed to add note:", err);
  //   }
  // };

  const handleScheduleInterview = () => {
    navigate(`/org/jobs/${jobId}/applicants/${applicationId}/schedule-interview`);
  };

  const handleBackToApplicants = () => {
    navigate(`/org/jobs/${jobId}/applicants`);
  };

  if (loading) return <div className="cp-loading">Loading candidate profile...</div>;
  if (error) return <div className="cp-error">Error: {error}</div>;
  if (!candidate) return <div className="cp-error">Candidate not found</div>;

  return (
    <div className="cp-body">
    <div className='cp-root1'>
    <div className="cp-modal">
      <div className="cp-modal-header">
        <h3 className="cp-modal-title">Candidate Profile</h3>
        <button className="cp-close-btn" onClick={handleBackToApplicants}>&times;</button>
      </div>
      
      <div className="cp-modal-body">
        {/* Candidate Header */}
        <div className="cp-candidate-header">
          <div className="cp-candidate-avatar">
            {candidate.name ? `${candidate.name.charAt(0)}${candidate.name.split(' ')[1]?.charAt(0) || ''}` : 'JS'}
          </div>
          <div className="cp-candidate-info">
            <h2>{candidate.name}</h2>
            <p>{candidate.position || 'Position not specified'}</p>
            <p>📍 {candidate.location || 'Location not specified'}</p>
            <div className="cp-candidate-status">
              <span className={`status-badge status-${candidateStatus}`}>
                {candidateStatus.charAt(0).toUpperCase() + candidateStatus.slice(1)}
              </span>
              <select 
                className="cp-status-dropdown" 
                value={candidateStatus}
                onChange={handleStatusChange}
              >
                <option disabled>Change status</option>
                <option value="applied">Applied</option>
                <option value="viewed">Viewed</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewing">Interviewing</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="cp-tabs">
          <div 
            className={`cp-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            Profile
          </div>
          <div 
            className={`cp-tab ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => handleTabChange('resume')}
          >
            Resume
          </div>
          <div 
            className={`cp-tab ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => handleTabChange('interviews')}
          >
            Interviews ({interviews.length})
          </div>
        </div>
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="cp-tab-content">
            <h4 className="cp-section-title">Contact Information</h4>
            <div className="cp-details-grid">
              <div className="cp-detail-item">
                <div className="cp-detail-label">Email</div>
                <div className="cp-detail-value">{candidate.email}</div>
              </div>
              {candidate.phone && (
                <div className="cp-detail-item">
                  <div className="cp-detail-label">Phone</div>
                  <div className="cp-detail-value">{candidate.phone}</div>
                </div>
              )}
              {candidate.linkedin_url && (
                <div className="cp-detail-item">
                  <div className="cp-detail-label">LinkedIn</div>
                  <div className="cp-detail-value">
                    <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">
                      {candidate.linkedin_url}
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <h4 className="cp-section-title">Professional Summary</h4>
            <p>{candidate.bio || 'No bio provided'}</p>
            
            <h4 className="cp-section-title">Skills</h4>
            <div className="cp-skill-tags">
              {candidate.skills?.length > 0 ? (
                candidate.skills.map(skill => (
                  <span key={skill} className="cp-skill-tag">{skill}</span>
                ))
              ) : (
                <p>No skills listed</p>
              )}
            </div>
          </div>
        )}

        {/* Resume Tab */}
        {activeTab === 'resume' && (
          <div className="cp-tab-content">
            <h4 className="cp-section-title">Resume</h4>
            {candidate.resume_url ? (
              <>
                <div className="cp-resume-preview">
                  <iframe 
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(candidate.resume_url)}&embedded=true`}
                    title="Resume Preview"
                    style={{ width: '100%', height: '500px', border: 'none' }}
                  ></iframe>
                </div>
                <a 
                  href={candidate.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cp-btn cp-btn-primary"
                >
                  Download Resume
                </a>
              </>
            ) : (
              <p>No resume uploaded</p>
            )}
          </div>
        )}
        
        
        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <div className="cp-tab-content">
            <h4 className="cp-section-title">Scheduled Interviews</h4>
            {interviews.length > 0 ? (
              interviews.map((interview) => (
                <div key={interview.id} className="cp-interview-item">
                  <div className="cp-interview-header">
                    <h5 className="cp-interview-title">{interview.type} Interview</h5>
                    <span className="cp-interview-schedule">
                      {new Date(interview.scheduled_time).toLocaleString()}
                    </span>
                  </div>
                  <div className="cp-interview-meta">
                    <span>Interviewer: {interview.interviewer_name}</span>
                    <span>Location: {interview.location_or_link}</span>
                    {interview.feedback && (
                      <div className="cp-interview-feedback">
                        <strong>Feedback:</strong> {interview.feedback}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No interviews scheduled yet</p>
            )}
            
            <button className="cp-btn cp-btn-primary" onClick={handleScheduleInterview}>
              Schedule New Interview
            </button>
          </div>
        )}
      </div>
      
      <div className="cp-modal-footer">
        <button 
          className="cp-btn cp-btn-danger" 
          onClick={() => handleStatusChange({ target: { value: 'rejected' } })}
        >
          Reject
        </button>
        <button 
          className="cp-btn cp-btn-success" 
          onClick={handleScheduleInterview}
        >
          Schedule Interview
        </button>
      </div>
    </div>
    </div>
    </div>
  );
};

export default CandProf;