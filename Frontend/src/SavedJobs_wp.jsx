import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentHome.css'; // Reusing the same CSS

const SavedJobs_wp = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [activeNavItem, setActiveNavItem] = useState('Saved Jobs');
  const [avatar, setAvatar] = useState("P");
  const [searchQuery, setSearchQuery] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [bookmarkLoading, setBookmarkLoading] = useState({});

  const fetchStudentDetails = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/workingprofessional/details", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.details;
    } catch (error) {
      console.error("Error fetching student details:", error);
      throw error;
    }
  };

  const fetchSavedJobs = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/student/saved-jobs", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.jobs;
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate('/');
      }
      throw error;
    }
  };

  const fetchData = async () => {
    if (!token) {
      navigate("/");
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      
      const [details, jobs] = await Promise.all([
        fetchStudentDetails(token),
        fetchSavedJobs(token)
      ]);
  
      if (details) {
        setAvatar(details.name[0].toUpperCase());
        setStudentName(details.name);
      }
  
      setSavedJobs(jobs);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load saved jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, navigate]);

  const filteredJobs = savedJobs.filter(job => {
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        (job.company_name && job.company_name.toLowerCase().includes(query)) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(query)))
      );
    }
    return true;
  });

  const handleNavClick = (navItem) => {
    setActiveNavItem(navItem);
    if (navItem === 'Dashboard') navigate('/wp/');
    // else if (navItem === 'Job Search') navigate('/std/');
    else if (navItem === 'Applications') navigate('/wp/applications');
    else if (navItem === 'Interviews') navigate('/wp/interviews');
    else if (navItem === 'Profile') navigate('/wp/profile');
  };

  const handleJobClick = (jobId) => {
    navigate(`/std/jobs/${jobId}`);
  };

  const toggleBookmark = async (jobId, e) => {
    e.stopPropagation();
    
    if (!token) {
      navigate('/');
      return;
    }

    try {
      setBookmarkLoading(prev => ({ ...prev, [jobId]: true }));
      
      const response = await axios.post(
        `http://localhost:5000/api/student/jobs/${jobId}/bookmark`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Remove the job from saved jobs list
      setSavedJobs(prevJobs => prevJobs.filter(job => job.job_id !== jobId));
      
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate('/');
      } else {
        setError("Failed to remove bookmark. Please try again.");
      }
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [jobId]: false }));
    }
  };

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
      <div className="sh-error-container">
        <div className="sh-error-message">{error}</div>
        <button onClick={fetchData} className="sh-retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="sh-container">
      <div className="sh-sidebar">
        <div className="sh-logo">SkillNet</div>
        
        {['Dashboard',
        //  'Job Search',
          'Saved Jobs', 'Applications', 'Interviews', 'Profile'].map(item => (
          <div 
            key={item}
            className={`sh-nav-item ${activeNavItem === item ? 'active' : ''}`}
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
      
      <div className="sh-main-content">
        <div className="sh-header">
          <div className="sh-search-bar">
            <input 
              type="text" 
              placeholder="Search your saved jobs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="sh-user-menu">
            <div className="sh-icon">
              <i className="far fa-bell"></i>
              <div className="sh-badge">2</div>
            </div>
            
            <div className="sh-avatar" onClick={() => navigate("/wp/profile")}>
              {avatar}
            </div>
          </div>
        </div>
        
        <div className="sh-welcome-card">
          <div className="sh-welcome-text">
            <h1><i>{getWelcomeMessage()}</i></h1>
            <p>You have {savedJobs.length} saved job opportunities.</p>
          </div>
        </div>
        
        <div className="sh-section-header">
          <h2>Your Saved Jobs</h2>
        </div>
        
        {loading ? (
          <div className="sh-loading">Loading your saved jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="sh-no-jobs">
            {searchQuery.trim() === '' 
              ? "You haven't saved any jobs yet. Start saving jobs to see them here!"
              : "No saved jobs match your search criteria."}
          </div>
        ) : (
          filteredJobs.map(job => (
            <div 
              className="sh-job-card" 
              key={job.job_id}
              onClick={() => handleJobClick(job.job_id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="sh-title-row">
                <div className="sh-title-company">
                  <h3>{job.title}</h3>
                  <div className="sh-company-name">{job.company_name || 'Unknown Company'}</div>
                </div>
                
                <div className="sh-action-buttons">
                  <div 
                    className="sh-action-button" 
                    onClick={(e) => toggleBookmark(job.job_id, e)}
                    disabled={bookmarkLoading[job.job_id]}
                  >
                    {bookmarkLoading[job.job_id] ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-bookmark"></i> // Always filled since these are saved jobs
                    )}
                  </div>
                </div>
              </div>
              
              <div className="sh-details">
                <div className="sh-detail">
                  <i className="fas fa-map-marker-alt"></i>
                  {job.is_remote ? 'Remote' : job.location || 'Location not specified'}
                </div>
                
                <div className="sh-detail">
                  <i className="fas fa-money-bill-wave"></i>
                  {job.salary_min && job.salary_max 
                    ? `${job.salary_currency} ${job.salary_min} - ${job.salary_currency} ${job.salary_max}`
                    : 'Salary not specified'}
                </div>
                
                <div className="sh-detail">
                  <i className="fas fa-clock"></i>
                  {job.employment_type || 'Full-time'}
                </div>
                
                <div className="sh-detail">
                  <i className="far fa-calendar-alt"></i>
                  {job.application_deadline 
                    ? `Deadline: ${new Date(job.application_deadline).toLocaleDateString()}` 
                    : 'No deadline'}
                </div>
              </div>
              
              <div className="sh-tags">
                {job.skills && job.skills.map((skill, index) => (
                  <div className="sh-tag" key={index}>{skill}</div>
                ))}
              </div>
              
              <div className="sh-bottom-row">
                <div className="sh-date">
                  Saved on {new Date(job.bookmarked_at || job.created_at).toLocaleDateString()}
                </div>
                
                <button 
                  className={`sh-apply-button ${job.has_applied ? 'applied' : ''}`} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJobClick(job.job_id);
                  }}
                  disabled={job.has_applied}
                >
                  {job.has_applied ? 'Applied' : 'Apply Now'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedJobs_wp;