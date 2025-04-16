// OrgApplications.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './OrgApplication.css';

const OrgApplications = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [applications, setApplications] = useState([]);
  const [avatar, setAvatar] = useState("P");
  const [interviews, setInterviews] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
//   const [activeNavItem, setActiveNavItem] = useState('Applications');
//   const [activeTab, setActiveTab] = useState('All Applications');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('all');

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

    const fetchApplications = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/org/applications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(response.data.applications);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/org/jobs", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(response.data.jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchInterviews();
    fetchApplications();
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

  const filterApplications = applications.filter(application => {
    // Filter by status tab
    // if (activeTab === 'Pending' && application.status !== 'pending') return false;
    // if (activeTab === 'Reviewed' && application.status !== 'reviewed') return false;
    // if (activeTab === 'Shortlisted' && application.status !== 'shortlisted') return false;
    // if (activeTab === 'Rejected' && application.status !== 'rejected') return false;
    
    // Filter by selected job
    if (selectedJob !== 'all' && application.job_id.toString() !== selectedJob) return false;
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        (application.student_name && application.student_name.toLowerCase().includes(query)) ||
        (application.job_title && application.job_title.toLowerCase().includes(query)) ||
        (application.skills && application.skills.some(skill => skill.toLowerCase().includes(query)))
      );
    }
    return true;
  });

//   const getStatusClass = (status) => {
//     switch(status.toLowerCase()) {
//       case 'pending': return 'application-pending';
//       case 'reviewed': return 'application-reviewed';
//       case 'shortlisted': return 'application-shortlisted';
//       case 'rejected': return 'application-rejected';
//       default: return '';
//     }
//   };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/org/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local state
      setApplications(applications.map(app => 
        app.application_id === applicationId ? {...app, status: newStatus} : app
      ));
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  return (
    <div className='org-body1'>
      <div className="org-container">
        <div className="org-sidebar">
          <div className="org-logo">SkillNet</div>
          
          <div className="org-nav-item" onClick={() => navigate("/org")}>
            <i className="fas fa-th-large"></i>
            Dashboard
          </div>
          
          <div className="org-nav-item" onClick={() => navigate("/org/jobs")}>
            <i className="fas fa-briefcase"></i>
            Job Postings
          </div>
          
          <div className="org-nav-item org-active">
            <i className="fas fa-file-alt"></i>
            Applications
          </div>
          
          <div className="org-nav-item" onClick={() => navigate("/org/interviews")}>
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
                placeholder="Search by applicant name, job title, or skills..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="org-user-menu">
              {/* <div className="org-icon">
                <i className="far fa-bell"></i>
                <div className="org-badge">3</div>
              </div> */}

              <div className="org-avatar" onClick={() => navigate("/org/profile")}>
                {avatar}
              </div>
            </div>
          </div>
          
          <div className="org-section-header">
            <h2>Applications</h2>
            <div className="org-job-filter">
              <select 
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
            </div>
          </div>
          
          {/* <div className="org-tabs">
            {["All Applications", "Pending", "Reviewed", "Shortlisted", "Rejected"].map(tab => (
              <div 
                key={tab}
                className={`org-tab ${activeTab === tab ? 'org-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div> */}
          
          <div className="org-applications-count">
            Showing {filterApplications.length} applications
          </div>
          
          {loading ? (
            <div className="org-loading">Loading applications...</div>
          ) : filterApplications.length === 0 ? (
            <div className="org-no-applications">No applications found.</div>
          ) : (
            <div className="org-applications-container">
              {filterApplications.map((application) => (
                <div key={application.application_id} className="org-application-card">
                  <div className="org-application-header">
                    <div className="org-applicant-info">
                      <div className="org-applicant-avatar">
                        {application.student_name ? application.student_name[0].toUpperCase() : "A"}
                      </div>
                      <div className="org-applicant-details">
                        <h3>{application.student_name || "Unnamed Applicant"}</h3>
                        <p>{application.job_title || "Unnamed Position"}</p>
                      </div>
                    </div>
                    {/* <div className={`org-application-status ${getStatusClass(application.status)}`}>
                      {application.status || "Pending"}
                    </div> */}
                  </div>
                  
                  <div className="org-application-content">
                    <div className="org-application-field">
                      <span className="org-field-label">Email:</span>
                      <span>{application.email || "No email provided"}</span>
                    </div>
                    
                    <div className="org-application-field">
                      <span className="org-field-label">Phone:</span>
                      <span>{application.phone || "No phone provided"}</span>
                    </div>
                    
                    <div className="org-application-field">
                      <span className="org-field-label">Applied on:</span>
                      <span>{application.applied_at || "Unknown date"}</span>
                    </div>
                    
                    <div className="org-application-field">
                      <span className="org-field-label">Experience:</span>
                      <span>{application.years_of_experience ? `${application.years_of_experience} years` : "Not specified"}</span>
                    </div>
                  </div>
                  
                  <div className="org-application-skills">
                    {application.skills && application.skills.map((skill, index) => (
                      <div key={index} className="org-skill-tag">
                        {skill}
                      </div>
                    ))}
                  </div>
                  
                  <div className="org-application-actions">
                    <button 
                      className="org-view-resume-btn"
                      onClick={() => window.open(application.resume_url, '_blank')}
                    >
                      <i className="fas fa-file-pdf"></i> View Resume
                    </button>
                    
                   
                      {/* <button 
                        className="org-status-btn review-btn"
                        onClick={() => updateApplicationStatus(application.application_id, 'reviewed')}
                      >
                        Review
                      </button>
                      <button 
                        className="org-status-btn shortlist-btn"
                        onClick={() => updateApplicationStatus(application.application_id, 'shortlisted')}
                      >
                        Shortlist
                      </button>
                      <button 
                        className="org-status-btn reject-btn"
                        onClick={() => updateApplicationStatus(application.application_id, 'rejected')}
                      >
                        Reject
                      </button> */}
                      <button 
                        className="org-status-btn schedule-btn"
                        onClick={() => navigate(`/org/jobs/${application.job_id}/applicants/${application.application_id}/schedule-interview`)}
                      >
                       { interviews.some(i => i.application_id === application.application_id)? "Reschedule Interview": "Schedule Interview"}

                        {/* Schedule Interview */}
                      </button>
    
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

export default OrgApplications;