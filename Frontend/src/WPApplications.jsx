import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentApplications.css';

const WPApplications = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [activeNavItem, setActiveNavItem] = useState('Applications');
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatar, setAvatar] = useState("P");
  const [activeFilter, setActiveFilter] = useState(''); // Set default to lowercase 'applied'
  const [studentName, setStudentName] = useState('');

  // Fetch student details
  const fetchStudentDetails = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/workingprofessional/details", {
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
      console.log(response.data.applications);
      return response.data.applications;
    } catch (error) {
      console.error("Error fetching applications:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate('/');
      }
      throw error;
    }
  };

  // Initial data loading
  const fetchData = async () => {
    if (!token) {
      navigate("/");
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      
      const [details, applicationData] = await Promise.all([
        fetchStudentDetails(),
        fetchApplications()
      ]);

      setApplications(applicationData);
      console.log(applicationData);
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
    if (navItem === 'Dashboard') navigate('/wp/');
    else if (navItem === 'Applications') navigate('/wp/applications');
    else if (navItem === 'Interviews') navigate('/wp/interviews');
    else if (navItem === 'Profile') navigate('/wp/profile');
    else if (navItem === 'Saved Jobs') navigate('/wp/saved-jobs');
  };

  // Navigate to job details
  const handleJobClick = (jobId) => {
    navigate(`/std/jobs/${jobId}`);
  };

  // Get CSS class for status badge


  // Filter applications based on active filter and search
  const filteredApplications = applications.filter(app => {
    // Only filter by status now (removed All Applications, Recent, Remote filters)
    // if (activeFilter !== app.status.toLowerCase()) {
    //   return false;
    // }
    
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
        
        {['Dashboard', 'Saved Jobs', 'Applications', 'Interviews', 'Profile'].map(item => (
          <div 
            key={item}
            className={`sa-nav-item ${activeNavItem === item ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <i className={`fas fa-${
              item === 'Dashboard' ? 'th-large' :
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
            <div className="sa-avatar" onClick={() => navigate("/wp/profile")}>
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
        
        <div className="sa-section-header">
          <h2>My Applications</h2>
        </div>
        
        
        {console.log(filteredApplications)}
        {loading ? (
          <div className="sa-loading">Loading applications...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="sa-no-applications">
            <div className="sa-empty-state">
              <i className="fas fa-file-alt sa-empty-icon"></i>
              <h3>No applications found</h3>
              <p>No applications with "{activeFilter}" status. Try a different filter.</p>
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
                  {/* <div className={`sa-status-badge ${getStatusClass(app.status)}`}>
                    {app.status}
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WPApplications;