import React, { useState, useEffect } from 'react';
import './StudentHome.css';

const StudentHome = () => {
  // State variables for component
  const [activeNavItem, setActiveNavItem] = useState('Dashboard');
  const [activeJobTab, setActiveJobTab] = useState('All Jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobListings, setJobListings] = useState([
    {
      id: 1,
      title: 'Senior Software Engineer',
      match: 95,
      company: 'TechSolutions Inc.',
      logo: 'TS',
      location: 'San Francisco, CA',
      salary: '$120K - $150K',
      type: 'Full-time',
      isRemote: false,
      postedDate: '2 weeks ago',
      tags: ['JavaScript', 'React', 'Node.js', 'Cloud Computing', 'AWS'],
      isBookmarked: false
    },
    {
      id: 2,
      title: 'Cloud Solutions Architect',
      match: 89,
      company: 'DataCloud Systems',
      logo: 'DC',
      location: 'Remote',
      salary: '$130K - $170K',
      type: 'Full-time',
      isRemote: true,
      postedDate: '1 week ago',
      tags: ['AWS', 'Azure', 'DevOps', 'Kubernetes', 'Docker'],
      isBookmarked: false
    },
    {
      id: 3,
      title: 'Frontend Developer',
      match: 92,
      company: 'WebDev Solutions',
      logo: 'WD',
      location: 'New York, NY',
      salary: '$90K - $120K',
      type: 'Full-time',
      isRemote: false,
      postedDate: '3 days ago',
      tags: ['HTML', 'CSS', 'JavaScript', 'React', 'UI/UX'],
      isBookmarked: false
    }
  ]);
  const [interviews, setInterviews] = useState([
    {
      id: 1,
      company: 'WebDev Solutions',
      position: 'Frontend Developer Position',
      type: 'video',
      time: 'Tomorrow, 10:00 AM',
      timeStatus: '',
    },
    {
      id: 2,
      company: 'DataCloud Systems',
      position: 'Cloud Solutions Architect Position',
      type: 'phone',
      time: 'Apr 6, 2:30 PM',
      timeStatus: '',
    },
    {
      id: 3,
      company: 'TechSolutions Inc.',
      position: 'Senior Software Engineer Position',
      type: 'users',
      time: 'Apr 10, 11:00 AM',
      timeStatus: '',
    }
  ]);
  const [stats, setStats] = useState({
    applications: 12,
    savedJobs: 24,
    interviews: 3,
    offers: 1
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // Filter jobs based on active tab and search query
  const filteredJobs = jobListings.filter(job => {
    // First apply tab filter
    if (activeJobTab === 'Remote' && !job.isRemote) return false;
    if (activeJobTab === 'Recent' && !job.postedDate.includes('days')) return false;
    if (activeJobTab === 'Matching Skills' && job.match < 90) return false;
    
    // Then apply search filter if there's a query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesTitle = job.title.toLowerCase().includes(query);
      const matchesCompany = job.company.toLowerCase().includes(query);
      const matchesTags = job.tags.some(tag => tag.toLowerCase().includes(query));
      return matchesTitle || matchesCompany || matchesTags;
    }
    
    return true;
  });

  // Navigation click handler
  const handleNavClick = (navItem) => {
    setActiveNavItem(navItem);
    // In a real app, this would navigate to a new page
    console.log(`Navigating to ${navItem} page`);
  };

  // Tab selection handler
  const handleTabClick = (tab) => {
    setActiveJobTab(tab);
  };

  // Search handler
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Bookmark toggle handler
  const toggleBookmark = (jobId) => {
    setJobListings(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
      )
    );
  };

  // Apply button handler
  const handleApply = (jobId) => {
    const job = jobListings.find(job => job.id === jobId);
    console.log(`Applied for ${job.title} at ${job.company}`);
    
    // Update application stat
    setStats(prevStats => ({
      ...prevStats,
      applications: prevStats.applications + 1
    }));
  };

  // Show filter modal handler
  const showFilterModal = () => {
    console.log('Filter modal opened');
    // In a real app, this would show a modal using React components
    // For this demo, we'll just log to console
  };

  // Welcome message with time-based greeting
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Welcome back';
    
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    return `${greeting}, Alex!`;
  };

  // Update interview countdowns
  useEffect(() => {
    const updateInterviewTimes = () => {
      setInterviews(prevInterviews => {
        return prevInterviews.map(interview => {
          if (interview.time.includes('Tomorrow')) {
            // Extract hour from time string
            const timeParts = interview.time.split(', ')[1].split(':');
            const hourStr = timeParts[0];
            const minuteStr = timeParts[1].split(' ')[0];
            const isPM = interview.time.includes('PM');
            
            let hour = parseInt(hourStr);
            const minute = parseInt(minuteStr);
            
            if (isPM && hour !== 12) hour += 12;
            if (!isPM && hour === 12) hour = 0;
            
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(hour);
            tomorrow.setMinutes(minute);
            
            const hoursUntil = Math.floor((tomorrow - now) / (1000 * 60 * 60));
            
            if (hoursUntil < 24) {
              return {
                ...interview,
                timeStatus: `In ${hoursUntil} hours`
              };
            }
          }
          return interview;
        });
      });
    };

    // Initial update
    updateInterviewTimes();
    
    // Set interval for updates
    const intervalId = setInterval(updateInterviewTimes, 60000);
    
    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">SkillNet</div>
        
        {['Dashboard', 'Job Search', 'Saved Jobs', 'Applications', 'Interviews', 
          'Career Path', 'Profile', 'Settings', 'Help Center'].map(item => (
          <div 
            key={item}
            className={`nav-item ${activeNavItem === item ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <i className={`fas fa-${
              item === 'Dashboard' ? 'th-large' :
              item === 'Job Search' ? 'briefcase' :
              item === 'Saved Jobs' ? 'bookmark' :
              item === 'Applications' ? 'file-alt' :
              item === 'Interviews' ? 'calendar-alt' :
              item === 'Career Path' ? 'chart-line' :
              item === 'Profile' ? 'user' :
              item === 'Settings' ? 'cog' : 'question-circle'
            }`}></i>
            {item}
          </div>
        ))}
      </div>
      
      <div className="main-content">
        <div className="header">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search for jobs, companies, or skills..." 
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <div className="user-menu">
            <div className="icon" onClick={() => setShowNotifications(!showNotifications)}>
              <i className="far fa-bell"></i>
              <div className="badge">2</div>
            </div>
            
            <div className="icon" onClick={() => setShowMessages(!showMessages)}>
              <i className="far fa-envelope"></i>
              <div className="badge">4</div>
            </div>
            
            <div className="avatar">
              A
            </div>
          </div>
        </div>
        
        <div className="welcome-card">
          <div className="welcome-text">
            <h1>{getWelcomeMessage()}</h1>
            <p>You have 3 interview invitations and 7 new job recommendations based on your profile.</p>
          </div>
        </div>
        
        <div className="stats-container">
          {[
            { name: 'Applications', icon: 'paper-plane', value: stats.applications, className: 'applied' },
            { name: 'Saved Jobs', icon: 'bookmark', value: stats.savedJobs, className: 'saved' },
            { name: 'Interviews', icon: 'calendar-check', value: stats.interviews, className: 'interviews' },
            { name: 'Job Offers', icon: 'file-signature', value: stats.offers, className: 'offers' }
          ].map(stat => (
            <div className="stat-card" key={stat.name}>
              <div className={`icon ${stat.className}`}>
                <i className={`fas fa-${stat.icon}`}></i>
              </div>
              <h2>{stat.value}</h2>
              <p>{stat.name}</p>
            </div>
          ))}
        </div>
        
        <div className="section-header">
          <h2>Recommended Jobs</h2>
          <div className="filter-button" onClick={showFilterModal}>
            <i className="fas fa-filter"></i>
            Filters
          </div>
        </div>
        
        <div className="tabs">
          {['All Jobs', 'Recent', 'Matching Skills', 'Remote'].map(tab => (
            <div 
              key={tab}
              className={`tab ${activeJobTab === tab ? 'active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        
        {filteredJobs.map(job => (
          <div className="job-card" key={job.id}>
            <div className="title-row">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="company-logo">{job.logo}</div>
                <div className="title-company">
                  <h3>{job.title} <span className="recommended">{job.match}% Match</span></h3>
                  <div className="company-name">{job.company}</div>
                </div>
              </div>
              
              <div className="action-buttons">
                <div className="action-button" onClick={() => toggleBookmark(job.id)}>
                  <i className={job.isBookmarked ? "fas fa-bookmark" : "far fa-bookmark"}></i>
                </div>
              </div>
            </div>
            
            <div className="details">
              <div className="detail">
                <i className="fas fa-map-marker-alt"></i>
                {job.location}
              </div>
              
              <div className="detail">
                <i className="fas fa-money-bill-wave"></i>
                {job.salary}
              </div>
              
              <div className="detail">
                <i className="fas fa-clock"></i>
                {job.type}
              </div>
              
              <div className="detail">
                <i className="far fa-calendar-alt"></i>
                {'Posted ' + job.postedDate}
              </div>
            </div>
            
            <div className="tags">
              {job.tags.map(tag => (
                <div className="tag" key={tag}>{tag}</div>
              ))}
            </div>
            
            <div className="bottom-row">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="easy-apply">
                  <i className="fas fa-bolt"></i>
                  Easy Apply
                </div>
                <div className="date">{job.postedDate}</div>
              </div>
              
              <button className="apply-button" onClick={() => handleApply(job.id)}>Apply Now</button>
            </div>
          </div>
        ))}
        
        <div className="upcoming-interviews">
          <div className="section-header">
            <h2>Upcoming Interviews</h2>
          </div>
          
          {interviews.map(interview => (
            <div className="interview-item" key={interview.id}>
              <div className="interview-icon">
                <i className={`fas fa-${interview.type}`}></i>
              </div>
              <div className="interview-details">
                <h4>{interview.company}</h4>
                <p>{interview.position}</p>
              </div>
              <div className="interview-time" style={
                interview.timeStatus ? { backgroundColor: '#ffe8ec', color: '#ff5252' } : {}
              }>
                {interview.timeStatus || interview.time}
              </div>
            </div>
          ))}
        </div>
        
        {showNotifications && (
          <div className="notifications-panel">
            <div className="panel-header">
              <h3>Notifications</h3>
            </div>
            <div className="notification-item">
              <div className="notification-title">New interview invitation</div>
              <div className="notification-text">TechSolutions Inc. invited you to a final round interview</div>
              <div className="notification-time">10 minutes ago</div>
            </div>
            <div className="notification-item">
              <div className="notification-title">Application viewed</div>
              <div className="notification-text">WebDev Solutions viewed your application</div>
              <div className="notification-time">1 hour ago</div>
            </div>
          </div>
        )}
        
        {showMessages && (
          <div className="messages-panel">
            <div className="panel-header">
              <h3>Messages</h3>
            </div>
            <div className="message-item">
              <div className="message-sender">Sarah Johnson (TechSolutions)</div>
              <div className="message-preview">Hi Alex, we're excited to move forward with your application...</div>
              <div className="message-time">25 minutes ago</div>
            </div>
            <div className="message-item">
              <div className="message-sender">SkillNet Team</div>
              <div className="message-preview">Congratulations on completing your profile! You've unlocked...</div>
              <div className="message-time">Yesterday</div>
            </div>
            <div className="message-item">
              <div className="message-sender">David Miller (WebDev)</div>
              <div className="message-preview">Thanks for applying! We'd like to schedule an initial interview...</div>
              <div className="message-time">2 days ago</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;