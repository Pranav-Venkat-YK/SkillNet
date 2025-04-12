import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentApplications.css';

const StudentApplications = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [activeNavItem, setActiveNavItem] = useState('Applications');
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatar, setAvatar] = useState("P");
  const [filterStatus, setFilterStatus] = useState('All');
  const [studentName, setStudentName] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState({});

  // Fetch student details
  const fetchStudentDetails = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/student/details", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data.details.name);
      setAvatar(response.data.details.name[0].toUpperCase());
      setStudentName(response.data.details.name);
      return response.data;
    } catch (error) {
      console.error("Error fetching student details:", error);
      throw error;
    }
  };

  // Fetch all applications for the student
  const fetchApplications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/student/applications", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.applications;
    } catch (error) {
      console.error("Error fetching applications:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate('/login');
      }
      throw error;
    }
  };

  // Initial data loading
  const fetchData = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      
      const [details, applicationData] = await Promise.all([
        fetchStudentDetails(),
        fetchApplications()
      ]);
  
      // if (details) {
      //   setAvatar(response.data.name[0].toUpperCase());
      //   setStudentName(response.data.name);
      // }

      setApplications(applicationData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, navigate]);

  // Handle navigation
  const handleNavClick = (navItem) => {
    setActiveNavItem(navItem);
    if (navItem === 'Dashboard') navigate('/std/');
    // else if (navItem === 'Job Search') navigate('/std/');
    else if (navItem === 'Applications') navigate('/std/applications');
    else if (navItem === 'Interviews') navigate('/std/interviews');
    else if (navItem === 'Profile') navigate('/std/profile');
    else if (navItem === 'Saved Jobs') navigate('/std/saved-jobs');
  };

  // Navigate to job details
  const handleJobClick = (jobId) => {
    navigate(`/std/jobs/${jobId}`);
  };

  // Withdraw an application
  const handleWithdrawApplication = async (applicationId, e) => {
    e.stopPropagation();
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (!window.confirm("Are you sure you want to withdraw this application?")) {
      return;
    }

    try {
      setWithdrawLoading(prev => ({ ...prev, [applicationId]: true }));
      
      await axios.delete(
        `http://localhost:5000/api/student/applications/${applicationId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Update the applications state
      setApplications(prevApplications => 
        prevApplications.filter(app => app.application_id !== applicationId)
      );

    } catch (error) {
      console.error("Error withdrawing application:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate('/login');
      } else {
        setError("Failed to withdraw application. Please try again.");
      }
    } finally {
      setWithdrawLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  // Get CSS class for status badge
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'status-applied';
      case 'viewed':
        return 'status-viewed';
      case 'shortlisted':
        return 'status-shortlisted';
      case 'interviewing':
        return 'status-interviewing';
      case 'hired':
        return 'status-hired';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-applied';
    }
  };

  // Filter applications based on search and status
  const filteredApplications = applications.filter(app => {
    // Filter by status
    if (filterStatus !== 'All' && app.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        app.job_title.toLowerCase().includes(query) ||
        app.company_name.toLowerCase().includes(query) ||
        app.status.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Get welcome message based on time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Welcome back';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    return `${greeting}, ${studentName || 'Student'}!!!`;
  };

  if (error) {
    return (
      <div className="sa-error-container">
        <div className="sa-error-message">{error}</div>
        <button onClick={fetchData} className="sa-retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="sa-container">
      <div className="sa-sidebar">
        <div className="sa-logo">SkillNet</div>
        
        {['Dashboard', 
        // 'Job Search', 
        'Saved Jobs', 'Applications', 'Interviews', 'Profile'].map(item => (
          <div 
            key={item}
            className={`sa-nav-item ${activeNavItem === item ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <i className={`fas fa-${
              item === 'Dashboard' ? 'th-large' :
              // item === 'Job Search' ? 'briefcase' :
              item === 'Saved Jobs' ? 'bookmark' :
              item === 'Applications' ? 'file-alt' :
              item === 'Interviews' ? 'calendar-alt' : 'user'
            }`}></i>
            {item}
          </div>
        ))}
      </div>
      
      <div className="sa-main-content">
        <div className="sa-header">
          <div className="sa-search-bar">
            <input 
              type="text" 
              placeholder="Search applications by job title, company, or status..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="sa-user-menu">
            <div className="sa-avatar" onClick={() => navigate("/std/profile")}>
              {avatar}
            </div>
          </div>
        </div>
        
        <div className="sa-welcome-card">
          <div className="sa-welcome-text">
            <h1><i>{getWelcomeMessage()}</i></h1>
            <p>You have {applications.length} job applications.</p>
          </div>
        </div>
        
        <div className="sa-filter-options">
          <div className="sa-filter-label">Filter by status:</div>
          <div className="sa-status-filters">
            {['All', 'Applied', 'Viewed', 'Shortlisted', 'Interviewing', 'Hired', 'Rejected'].map(status => (
              <div 
                key={status}
                className={`sa-status-filter ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </div>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="sa-loading">Loading applications...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="sa-no-applications">
            <div className="sa-empty-state">
              <i className="fas fa-file-alt sa-empty-icon"></i>
              <h3>No applications found</h3>
              {filterStatus !== 'All' ? (
                <p>No applications with "{filterStatus}" status. Try a different filter.</p>
              ) : searchQuery ? (
                <p>No applications match your search query. Try a different search.</p>
              ) : (
                <div>
                  <p>You haven't applied to any jobs yet.</p>
                  <button className="sa-browse-jobs-btn" onClick={() => navigate('/std/jobs')}>
                    Browse Jobs
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="sa-applications-list">
            {filteredApplications.map(app => (
              <div 
                className="sa-application-card" 
                key={app.application_id}
                onClick={() => handleJobClick(app.job_id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="sa-company-logo">
                  {app.company_name}
                </div>
                
                <div className="sa-application-details">
                  <h3>{app.job_title}</h3>
                  <div className="sa-company-name">{app.company_name}</div>
                  
                  <div className="sa-application-meta">
                    <div className="sa-detail">
                      <i className="fas fa-calendar-alt"></i>
                      Applied on {new Date(app.applied_at).toLocaleDateString()}
                    </div>
                    
                    <div className="sa-detail">
                      <i className="fas fa-map-marker-alt"></i>
                      {app.location || 'Remote'}
                    </div>
                    
                    {app.updated_at && (
                      <div className="sa-detail">
                        <i className="fas fa-clock"></i>
                        Updated {new Date(app.updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="sa-application-status">
                  <div className={`sa-status-badge ${getStatusClass(app.status)}`}>
                    {app.status}
                  </div>
                  
                  {['applied', 'viewed', 'shortlisted'].includes(app.status.toLowerCase()) && (
                    <button 
                      className="sa-withdraw-button"
                      onClick={(e) => handleWithdrawApplication(app.application_id, e)}
                      disabled={withdrawLoading[app.application_id]}
                    >
                      {withdrawLoading[app.application_id] ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        'Withdraw'
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredApplications.length > 0 && (
          <div className="sa-application-stats">
            <div className="sa-stat-box">
              <h4>Total Applications</h4>
              <div className="sa-stat-value">{applications.length}</div>
            </div>
            
            <div className="sa-stat-box">
              <h4>Under Review</h4>
              <div className="sa-stat-value">
                {applications.filter(app => ['applied', 'viewed', 'shortlisted'].includes(app.status.toLowerCase())).length}
              </div>
            </div>
            
            <div className="sa-stat-box">
              <h4>Interviewing</h4>
              <div className="sa-stat-value">
                {applications.filter(app => app.status.toLowerCase() === 'interviewing').length}
              </div>
            </div>
            
            <div className="sa-stat-box">
              <h4>Offers</h4>
              <div className="sa-stat-value">
                {applications.filter(app => app.status.toLowerCase() === 'hired').length}
              </div>
            </div>
            
            <div className="sa-stat-box">
              <h4>Rejected</h4>
              <div className="sa-stat-value">
                {applications.filter(app => app.status.toLowerCase() === 'rejected').length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentApplications;