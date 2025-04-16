import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentInterview.css'; // Reusing the same CSS

const WPInterviews = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [activeNavItem, setActiveNavItem] = useState('Interviews');
  const [avatar, setAvatar] = useState("P");
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

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

  const fetchInterviews = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/student/interviews", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("hi");
      console.log(response.data.interviews);
      return response.data.interviews;
    } catch (error) {
      console.error("Error fetching interviews:", error);
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
      
      const [details, interviewData] = await Promise.all([
        fetchStudentDetails(token),
        fetchInterviews(token)
      ]);
  
      if (details) {
        setAvatar(details.name[0].toUpperCase());
        setStudentName(details.name);
      }
  
      setInterviews(interviewData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load interviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, navigate]);

  const filteredInterviews = interviews.filter(interview => {
    const now = new Date();
    const interviewTime = new Date(interview.scheduled_time);
    
    if (activeTab === 'upcoming') {
      return interviewTime > now;
    } else if (activeTab === 'past') {
      return interviewTime <= now;
    }
    return true;
  });

  const handleNavClick = (navItem) => {
    setActiveNavItem(navItem);
    if (navItem === 'Dashboard') navigate('/wp/');
    // else if (navItem === 'Job Search') navigate('/std/jobs');
    else if (navItem === 'Applications') navigate('/wp/applications');
    else if (navItem === 'Saved Jobs') navigate('/wp/saved-jobs');
    else if (navItem === 'Profile') navigate('/wp/profile');
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

  const getInterviewStatus = (time, status) => {
    const now = new Date();
    const interviewTime = new Date(time);
    
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'completed') return 'Completed';
    if (interviewTime <= now) return 'Completed';
    return 'Upcoming';
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
      <div className="si-error-container">
        <div className="si-error-message">{error}</div>
        <button onClick={fetchData} className="si-retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="si-container">
      <div className="si-sidebar">
        <div className="si-logo">SkillNet</div>
        
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
            //   item === 'Job Search' ? 'briefcase' :
              item === 'Saved Jobs' ? 'bookmark' :
              item === 'Applications' ? 'file-alt' :
              item === 'Interviews' ? 'calendar-alt' : 'user'
            }`}></i>
            {item}
          </div>
        ))}
      </div>
      
      <div className="si-main-content">
        <div className="si-header">
          <div className="si-search-bar">
            <input 
              type="text" 
              placeholder="Search your interviews..." 
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="si-user-menu">
            <div className="si-icon">
              <i className="far fa-bell"></i>
              <div className="si-badge">2</div>
            </div>
            
            <div className="si-avatar" onClick={() => navigate("/wp/profile")}>
              {avatar}
            </div>
          </div>
        </div>
        
        <div className="si-welcome-card">
          <div className="si-welcome-text">
            <h1><i>{getWelcomeMessage()}</i></h1>
            <p>You have {interviews.filter(i => new Date(i.scheduled_time) > new Date()).length} upcoming interviews.</p>
          </div>
        </div>
        
        <div className="si-tabs">
          {['upcoming', 'past'].map(tab => (
            <div 
              key={tab}
              className={`sh-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>
        
        {loading ? (
          <div className="si-loading">Loading your interviews...</div>
        ) : filteredInterviews.length === 0 ? (
          <div className="si-no-jobs">
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming interviews scheduled."
              : "No past interviews found."}
          </div>
        ) : (
          <div className="si-interviews-container">
            {filteredInterviews.map(interview => (
              <div 
                className="si-interview-card" 
                key={interview.interview_id}
              >
                <div className="si-interview-header">
                  <div className="si-interview-icon">
                    <i className={`fas fa-${
                      interview.interview_type === 'video' ? 'video' : 
                      interview.interview_type === 'phone' ? 'phone' : 'users'
                    }`}></i>
                  </div>
                  <div className="si-interview-title">
                    <h3>{interview.job_title || 'Interview'}</h3>
                    <p>{interview.organisation_name || 'Company'}</p>
                  </div>
                  <div className={`sh-interview-status ${getInterviewStatus(interview.scheduled_time, interview.status).toLowerCase()}`}>
                    {getInterviewStatus(interview.scheduled_time, interview.status)}
                  </div>
                </div>
                
                <div className="si-interview-details">
                  <div className="si-interview-detail">
                    <i className="far fa-calendar"></i>
                    {new Date(interview.scheduled_time).toLocaleDateString()}
                  </div>
                  <div className="si-interview-detail">
                    <i className="far fa-clock"></i>
                    {new Date(interview.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="si-interview-detail">
                    <i className="fas fa-hourglass-half"></i>
                    {interview.duration_minutes} minutes
                  </div>
                  <div className="si-interview-detail">
                    <i className="fas fa-user-tie"></i>
                    {interview.interviewer_name || 'Interviewer'}
                  </div>
                </div>
                
                <div className="si-interview-footer">
                  <div className="si-interview-type">
                    {interview.interview_type === 'video' ? 'Video Call' : 
                     interview.interview_type === 'phone' ? 'Phone Call' : 'In-Person'}
                  </div>
                  <div className="si-interview-actions">
                    {interview.interview_type === 'video' && interview.location_or_link && (
                      <a 
                        href={interview.location_or_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="si-interview-button"
                      >
                        <i className="fas fa-video"></i> Join Meeting
                      </a>
                    )}
                    <button 
                      className="si-interview-button"
                      onClick={() => navigate(`/std/jobs/${interview.job_id}`)}
                    >
                      <i className="fas fa-briefcase"></i> View Job
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WPInterviews;