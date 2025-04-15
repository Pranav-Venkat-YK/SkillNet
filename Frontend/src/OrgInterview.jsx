import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './OrgApplication.css'; // Reusing the same styles

const OrgInterviews = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [interviews, setInterviews] = useState([]);
  const [avatar, setAvatar] = useState("P");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const fetchInterviews = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/org/interviews", {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("hi");
        console.log(response.data.interviews);
        setInterviews(response.data.interviews || []);
        setLoading(false); 
      } catch (error) {
        console.log("bye");
        console.error("Error fetching interviews:", error);
      } 
    };

    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/org/jobs", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(response.data.jobs || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchInterviews();
    fetchJobs();
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchOrgDetails = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/org/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.details) {
          const details = res.data.details;
          setAvatar(details.name[0].toUpperCase());
          setName(details.name);
        }
      } catch (error) {
        console.error("Error fetching organization details:", error);
      }
    };
    fetchOrgDetails();
  }, [token, navigate]);

  const filterInterviews = interviews.filter(interview => {
    // Filter by selected job
    if (selectedJob !== 'all' && interview.job_id !== selectedJob) return false;
    
    // Filter by status
    if (statusFilter !== 'all' && interview.status !== statusFilter) return false;
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        (interview.student_name && interview.student_name.toLowerCase().includes(query)) ||
        (interview.job_title && interview.job_title.toLowerCase().includes(query)) ||
        (interview.email && interview.email.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const updateInterviewStatus = async (interviewId, newStatus) => {
    try {
        if (newStatus === 'cancelled') {
            // Special handling for cancellation
            await axios.put(
              `http://localhost:5000/api/org/interviews/${interviewId}/cancel`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Remove the cancelled interview from the local state
            setInterviews(interviews.filter(int => int.interview_id !== interviewId));
          } else {
            // Normal status update for other statuses
            await axios.put(
              `http://localhost:5000/api/org/interviews/${interviewId}/status`,
              { status: newStatus },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update the local state
            setInterviews(interviews.map(int => 
              int.interview_id === interviewId ? {...int, status: newStatus} : int
            ));
          }
    } catch (error) {
      console.error("Error updating interview status:", error);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    switch(status.toLowerCase()) {
      case 'scheduled': return 'interview-scheduled';
      case 'completed': return 'interview-completed';
      case 'cancelled': return 'interview-cancelled';
      case 'rescheduled': return 'interview-rescheduled';
      default: return '';
    }
  };

  return (
    <div className='org-body1'>
      <div className="org-container">
        <div className="org-sidebar">
          <div className="org-logo">SkillNet</div>
          
          <div className="org-nav-item" onClick={() => navigate("/org/")}>
            <i className="fas fa-th-large"></i>
            Dashboard
          </div>
          
          <div className="org-nav-item" onClick={() => navigate("/org/jobs")}>
            <i className="fas fa-briefcase"></i>
            Job Postings
          </div>
          
          <div className="org-nav-item" onClick={() => navigate("/org/applications")}>
            <i className="fas fa-file-alt"></i>
            Applications
          </div>
          
          <div className="org-nav-item org-active">
            <i className="fas fa-calendar-alt"></i>
            Interviews
          </div>
          
          <div className="org-nav-item" onClick={() => navigate("/org/profile")}>
            <i className="fas fa-building"></i>
            Company Profile
          </div>
        </div>

        <div className="org-main-content">
          <div className="org-header">
            <div className="org-search-bar">
              <input 
                type="text" 
                placeholder="Search by applicant name, job title, or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="org-user-menu">
              <div className="org-icon">
                <i className="far fa-bell"></i>
                <div className="org-badge">3</div>
              </div>

              <div className="org-avatar" onClick={() => navigate("/org/profile")}>
                {avatar}
              </div>
            </div>
          </div>
          
          <div className="org-section-header">
            <h2>Interviews</h2>
            <div className="org-filters">
              {/* <select 
                value={selectedJob} 
                onChange={(e) => setSelectedJob(e.target.value)}
                className="org-job-select"
              >
                <option value="all">All Jobs</option>
                {jobs.map(job => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.title}
                  </option>
                ))}
              </select>
              
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="org-status-select"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select> */}
            </div>
          </div>
          
          <div className="org-applications-count">
            Showing {filterInterviews.length} interviews
          </div>
          
          {loading ? (
            <div className="org-loading">Loading interviews...</div>
          ) : filterInterviews.length === 0 ? (
            <div className="org-no-applications">No interviews found.</div>
          ) : (
            <div className="org-applications-container">
              {filterInterviews.map((interview) => (
                <div key={interview.interview_id} className="org-application-card">
                  <div className="org-application-header">
                    <div className="org-applicant-info">
                      <div className="org-applicant-avatar">
                      <i className="fas fa-video"></i>
                      </div>
                      <div className="org-applicant-details">
                        <h3>{interview.student_name || "Unnamed Applicant"}</h3>
                        <p>{interview.job_title || "Unnamed Position"}</p>
                      </div>
                    </div>
                    <div className={`org-application-status ${getStatusClass(interview.status)}`}>
                      {interview.status || "Scheduled"}
                    </div>
                  </div>
                  
                  <div className="org-application-content">
                    {/* <div className="org-application-field">
                      <span className="org-field-label">Email:</span>
                      <span>{interview.email || "No email provided"}</span>
                    </div>
                    
                    <div className="org-application-field">
                      <span className="org-field-label">Phone:</span>
                      <span>{interview.phone_number || "No phone provided"}</span>
                    </div> */}
                    
                    <div className="org-application-field">
                      <span className="org-field-label">Scheduled:</span>
                      <span>{formatDateTime(interview.scheduled_time)}</span>
                    </div>
{/*                     
                    <div className="org-application-field">
                      <span className="org-field-label">Experience:</span>
                      <span>{interview.years_of_experience ? `${interview.years_of_experience} years` : "Not specified"}</span>
                    </div> */}
                    
                    {interview.interview_notes && (
                      <div className="org-application-field">
                        <span className="org-field-label">Notes:</span>
                        <span>{interview.interview_notes}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="org-application-actions">
                    <button 
                      className="org-view-resume-btn"
                      onClick={() => window.open(interview.student_resume || interview.professional_resume, '_blank')}
                    >
                      <i className="fas fa-file-pdf"></i> View Resume
                    </button>
                    
                    <div className="org-status-actions">
                      {interview.status !== 'completed' && (
                        <>
                          {/* <button 
                            className="org-status-btn complete-btn"
                            onClick={() => updateInterviewStatus(interview.interview_id, 'completed')}
                          >
                            Mark Complete
                          </button> */}
                          <button 
                            className="org-status-btn reschedule-btn"
                            onClick={() => navigate(`/org/jobs/${interview.job_id}/applicants/${interview.application_id}/schedule-interview`)}
                          >
                            Reschedule
                          </button>
                          {/* <button 
                            className="org-status-btn cancel-btn"
                            onClick={() => updateInterviewStatus(interview.interview_id, 'cancelled')}
                          >
                            Cancel
                          </button> */}
                        </>
                      )}
                      {interview.status === 'completed' && (
                        <button 
                          className="org-status-btn feedback-btn"
                          onClick={() => navigate(`/org/interviews/${interview.interview_id}/feedback`)}
                        >
                          Add Feedback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgInterviews;