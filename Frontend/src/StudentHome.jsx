import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentHome.css';

const StudentHome = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [activeNavItem, setActiveNavItem] = useState('Dashboard');
  const [activeJobTab, setActiveJobTab] = useState('All Jobs');
  const [avatar, setAvatar] = useState("P");
  const [searchQuery, setSearchQuery] = useState('');
  const [jobListings, setJobListings] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    applications: 0,
    savedJobs: 0,
    interviews: 0,
    offers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [studentName, setStudentName] = useState('');

  const fetchAllJobs = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/student/jobs", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.jobs;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate('/login');
      }
      throw error;
    }
  };

  const fetchStudentDetails = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/student/details", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.details;
    } catch (error) {
      console.error("Error fetching student details:", error);
      throw error;
    }
  };

  const fetchData = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [details, jobs] = await Promise.all([
        fetchStudentDetails(token),
        fetchAllJobs(token)
      ]);

      if (details) {
        setAvatar(details.name[0].toUpperCase());
        setStudentName(details.name);
      }

      setJobListings(jobs);
      
      const applicationsCount = jobs.filter(job => job.has_applied).length;
      const savedJobsCount = jobs.filter(job => job.is_bookmarked).length;
      
      setStats({
        applications: applicationsCount,
        savedJobs: savedJobsCount,
        interviews: 0,
        offers: 0
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, navigate]);

  const filteredJobs = jobListings.filter(job => {
    if (activeJobTab === 'Remote' && !job.is_remote) return false;
    if (activeJobTab === 'Recent') {
      const postedDate = new Date(job.created_at);
      const now = new Date();
      const diffDays = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        (job.company_name && job.company_name.toLowerCase().includes(query)) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(query))
      ));
    }
    
    return true;
  });

  const handleNavClick = (navItem) => {
    setActiveNavItem(navItem);
    if (navItem === 'Job Search') navigate('/std/jobs');
    else if (navItem === 'Applications') navigate('/std/applications');
    else if (navItem === 'Interviews') navigate('/std/interviews');
    else if (navItem === 'Profile') navigate('/std/profile');
    else if (navItem === 'Saved Jobs') navigate('/std/saved-jobs');
  };

  const handleJobClick = (jobId) => {
    navigate(`/std/jobs/${jobId}`);
  };

  const toggleBookmark = async (jobId, e) => {
    e.stopPropagation();
    try {
      const response = await axios.post(
        `http://localhost:5000/api/student/jobs/${jobId}/bookmark`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setJobListings(prevJobs => 
        prevJobs.map(job => 
          job.job_id === jobId ? { 
            ...job, 
            is_bookmarked: response.data.bookmarked 
          } : job
        )
      );
      
      setStats(prevStats => ({
        ...prevStats,
        savedJobs: response.data.bookmarked ? prevStats.savedJobs + 1 : prevStats.savedJobs - 1
      }));
    } catch (error) {
      console.error("Error toggling bookmark:", error);
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

  const formatInterviewTime = (time) => {
    const now = new Date();
    const interviewTime = new Date(time);
    const diffHours = Math.floor((interviewTime - now) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `In ${diffHours} hours`;
    }
    return interviewTime.toLocaleString();
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
        
        {['Dashboard', 'Job Search', 'Saved Jobs', 'Applications', 'Interviews', 'Profile'].map(item => (
          <div 
            key={item}
            className={`sh-nav-item ${activeNavItem === item ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <i className={`fas fa-${
              item === 'Dashboard' ? 'th-large' :
              item === 'Job Search' ? 'briefcase' :
              item === 'Saved Jobs' ? 'bookmark' :
              item === 'Applications' ? 'file-alt' :
              item === 'Interviews' ? 'calendar-alt' :'user'
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
              placeholder="Search for jobs, companies, or skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="sh-user-menu">
            <div className="sh-icon" onClick={() => setShowNotifications(!showNotifications)}>
              <i className="far fa-bell"></i>
              <div className="sh-badge">2</div>
            </div>
            
            <div className="sh-avatar" onClick={() => navigate("/std/profile")}>
              {avatar}
            </div>
          </div>
        </div>
        
        <div className="sh-welcome-card">
          <div className="sh-welcome-text">
            <h1><i>{getWelcomeMessage()}</i></h1>
            <p>You have {interviews.length} upcoming interviews and {jobListings.length} job opportunities.</p>
          </div>
        </div>
        
        <div className="sh-stats-container">
          {[
            { name: 'Applications', icon: 'paper-plane', value: stats.applications, className: 'applied' },
            { name: 'Saved Jobs', icon: 'bookmark', value: stats.savedJobs, className: 'saved' },
            { name: 'Interviews', icon: 'calendar-check', value: stats.interviews, className: 'interviews' },
            { name: 'Job Offers', icon: 'file-signature', value: stats.offers, className: 'offers' }
          ].map(stat => (
            <div className="sh-stat-card" key={stat.name}>
              <div className={`sh-icon sh-${stat.className}`}>
                <i className={`fas fa-${stat.icon}`}></i>
              </div>
              <h2>{stat.value}</h2>
              <p>{stat.name}</p>
            </div>
          ))}
        </div>
        
        <div className="sh-section-header">
          <h2>Available Jobs</h2>
        </div>
        
        <div className="sh-tabs">
          {['All Jobs', 'Recent', 'Remote'].map(tab => (
            <div 
              key={tab}
              className={`sh-tab ${activeJobTab === tab ? 'active' : ''}`}
              onClick={() => setActiveJobTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        
        {loading ? (
          <div className="sh-loading">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="sh-no-jobs">No jobs found matching your criteria.</div>
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
                  >
                    <i className={job.is_bookmarked ? "fas fa-bookmark" : "far fa-bookmark"}></i>
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
                  Posted {new Date(job.created_at).toLocaleDateString()}
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
        
        <div className="sh-upcoming-interviews">
          <div className="sh-section-header">
            <h2>Upcoming Interviews</h2>
          </div>
          
          {loading ? (
            <div className="sh-loading">Loading interviews...</div>
          ) : interviews.length === 0 ? (
            <div className="sh-no-interviews">No upcoming interviews</div>
          ) : (
            interviews.map(interview => (
              <div className="sh-interview-item" key={interview.interview_id}>
                <div className="sh-interview-icon">
                  <i className={`fas fa-${interview.interview_type === 'video' ? 'video' : interview.interview_type === 'phone' ? 'phone' : 'users'}`}></i>
                </div>
                <div className="sh-interview-details">
                  <h4>{interview.company_name || 'Company'}</h4>
                  <p>{interview.job_title || 'Position'}</p>
                </div>
                <div className="sh-interview-time">
                  {formatInterviewTime(interview.scheduled_time)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;