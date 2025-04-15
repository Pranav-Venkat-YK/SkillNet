import React, { act, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const JobPostings = ()=>{
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [avatar,setAvatar] = useState("P");
    const [activeNavItem,setActiveNavItem] = useState('Job Postings');

    const handleNavClick = (navItem) => {
        setActiveNavItem(navItem);
        if (navItem === 'Dashboard') navigate('/org');
        else if (navItem === 'Job Postings') navigate('/org/jobs');
        else if (navItem === 'Applications') navigate('/org/applications');
        else if (navItem === 'Interviews') navigate('/org/interviews');
        else if (navItem === 'Profile') navigate('/org/profile');
      };

    useEffect(() => {
        if (!token) {
          navigate("/");
          return;
        }
    
        const fetchJobs = async () => {
          try {
            const response = await axios.get("http://localhost:5000/api/org/jobs", {
              headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(response.data.jobs);
          } catch (error) {
            console.error("Error fetching jobs:", error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchJobs();

        const fetchOrgDetails = async () => {
            try {
              const res = await axios.get("http://localhost:5000/api/org/details", {
                headers: { Authorization: `Bearer ${token}` },
              });
              // console.log(res);
              if (res.data.details) {
                const details = res.data.details;
                setAvatar(details.name[0].toUpperCase());
              //   console.log(details.name[0].toUpperCase());
              }
            } catch (error) {
              console.error("Error fetching student details:", error);
            }
          };
          fetchOrgDetails();
      }, [token, navigate]);

      const filterJobs = jobs.filter(job=>{
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          return (
            job.title.toLowerCase().includes(query)
           );
        }
        return true;
      })
      return (
        <div className='org-body1'>
        <div className="org-container">
          <div className="org-sidebar">
            <div className="org-logo">SkillNet</div>
            
            <div className="org-nav-item "onClick={()=>navigate("/org")}>
              <i className="fas fa-th-large"></i>
              Dashboard
            </div>
            
            <div className="org-nav-item org-active" onClick={()=>navigate("/org/jobs")}>
              <i className="fas fa-briefcase"></i>
              Job Postings
            </div>
            
            <div className="org-nav-item" onClick={()=>navigate("/org/applications")}>
              <i className="fas fa-file-alt"></i>
              Applications
            </div>
            
            <div className="org-nav-item" onClick={()=>navigate("/org/interviews")}>
              <i className="fas fa-calendar-alt"></i>
              Interviews
            </div>
            
            {/* <div className="org-nav-item">
              <i className="fas fa-users"></i>
              Candidates
            </div> */}
            
            <div className="org-nav-item"  onClick={() => navigate("/org/profile")}>
              <i className="fas fa-building"></i>
              Company Profile
            </div>
          </div>
          

        {/* {['Dashboard', 'Job Postings', 'Applications', 'Interviews',"candidates",'Company Profile'].map(item => (
          <div 
            key={item}
            className={`org-nav-item ${activeNavItem === item ? 'org-active' : ''}`}
            onClick={() => handleNavClick(item)}
            >
            <i className={`fas fa-${
              item === 'Dashboard' ? 'th-large' :
              item === 'Job Posting' ? 'briefcase' :
              item === 'Applications' ? 'file-alt' :
              item === 'Interviews' ? 'calendar-alt' :
              item === 'Canddidates' ? 'users' : 'building'
            }`}></i>
            {item}
          </div>
        ))}
      </div> */}
          <div className="org-main-content">
            <div className="org-header">
              <div className="org-search-bar">
                <input type="text" 
                placeholder="Search for candidates, jobs, or applications..." 
                value = {searchQuery}
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
              {loading ? (
          <div>Loading jobs...</div>
        ) : filterJobs.length === 0 ? (
          <div>No jobs found.</div>
        ) : (
          filterJobs.map((job) => (
            <div 
              key={job.job_id} 
              className="org-job-card"
              onClick={() => navigate(`/org/jobs/${job.job_id}/applicants`)}
              style={{ cursor: 'pointer' }} // Add pointer cursor to indicate clickable
            >
              <div className="org-title-row">
                <h3>{job.title}</h3>
                <div className={`status ${job.status}`}>   {job.status}</div>
              </div>
              
              <div className="org-details">
                <div className="org-detail">
                  <i className="fas fa-map-marker-alt"></i>
                  {job.location || "Location not specified"}
                </div>
                
                <div className="org-detail">
                  <i className="fas fa-money-bill-wave"></i>
                  {job.salary_min && job.salary_max
                    ? `${job.salary_currency} ${job.salary_min} - ${job.salary_currency} ${job.salary_max}`
                    : "Salary not specified"}
                </div>
                
                <div className="org-detail">
                  <i className="fas fa-clock"></i>
                  {job.employment_type}
                </div>
                
                <div className="org-detail">
                  <i className="far fa-calendar-alt"></i>
                  {job.application_deadline ? `Deadline: ${job.application_deadline}` : "No deadline"}
                </div>
              </div>
              
              <div className="org-stats">
                <div className="org-stat">
                  <h4>{job.views_count}</h4>
                  <p>Views</p>
                </div>
                
                <div className="org-stat">
                  <h4>{job.applications_count}</h4>
                  <p>Applications</p>
                </div>
              </div>
            </div>
          ))
        )}
         </div>
    </div>
    </div>
    );
};

export default JobPostings;