// Org.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './Org.css';

const Org = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [jobs, setJobs] = useState([]);
  const [avatar,setAvatar] = useState("P");
  const [loading, setLoading] = useState(true);

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
  }, [token, navigate]);


  // const token1 = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchStudentDetails = async () => {
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
    fetchStudentDetails();
  });

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">SkillNet</div>
        
        <div className="nav-item active">
          <i className="fas fa-th-large"></i>
          Dashboard
        </div>
        
        <div className="nav-item">
          <i className="fas fa-briefcase"></i>
          Job Postings
        </div>
        
        <div className="nav-item">
          <i className="fas fa-file-alt"></i>
          Applications
        </div>
        
        <div className="nav-item">
          <i className="fas fa-calendar-alt"></i>
          Interviews
        </div>
        
        <div className="nav-item">
          <i className="fas fa-users"></i>
          Candidates
        </div>
        
        <div className="nav-item">
          <i className="fas fa-chart-line"></i>
          Analytics
        </div>
        
        <div className="nav-item">
          <i className="fas fa-building"></i>
          Company Profile
        </div>
        
        <div className="nav-item">
          <i className="fas fa-cog"></i>
          Settings
        </div>
        
        <div className="nav-item">
          <i className="fas fa-question-circle"></i>
          Help Center
        </div>
      </div>
      
      <div className="main-content">
        <div className="header">
          <div className="search-bar">
            <input type="text" placeholder="Search for candidates, jobs, or applications..." />
          </div>
          
          <div className="user-menu">
            <div className="icon">
              <i className="far fa-bell"></i>
              <div className="badge">3</div>
            </div>
            
            <div className="icon">
              <i className="far fa-envelope"></i>
              <div className="badge">5</div>
            </div>
            
            <div className="avatar" onClick={() => navigate("/org/profile")}>
                {avatar}
            </div>
          </div>
        </div>
        
        <div className="welcome-card">
          <h1>Welcome back, TechSolutions Inc.</h1>
          <p>You have 32 new applications and 8 interviews scheduled this week.</p>
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="icon jobs">
              <i className="fas fa-briefcase"></i>
            </div>
            <h2>{jobs.length}</h2>
            <p>Active Jobs</p>
          </div>
          
          <div className="stat-card">
            <div className="icon applications">
              <i className="fas fa-file-alt"></i>
            </div>
            <h2>143</h2>
            <p>Total Applications</p>
          </div>
          
          <div className="stat-card">
            <div className="icon interviews">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h2>18</h2>
            <p>Scheduled Interviews</p>
          </div>
          
          <div className="stat-card">
            <div className="icon hired">
              <i className="fas fa-user-check"></i>
            </div>
            <h2>5</h2>
            <p>Hired This Month</p>
          </div>
        </div>
        
        <div className="section-header">
          <h2>Job Postings</h2>
          <button onClick={() => navigate("/org/job")}>+ Add New Job</button>
        </div>
        
        <div className="tabs">
          <div className="tab active">All Jobs ({jobs.length})</div>
          <div className="tab">Active</div>
          <div className="tab">Closed</div>
          <div className="tab">Drafts</div>
        </div>
        
        {loading ? (
          <div>Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div>No jobs found.</div>
        ) : (
          jobs.map((job) => (
            <div key={job.job_id} className="job-card">
              <div className="title-row">
                <h3>{job.title}</h3>
                <div className={`status ${job.status}`}>{job.status}</div>
              </div>
              
              <div className="details">
                <div className="detail">
                  <i className="fas fa-map-marker-alt"></i>
                  {job.location || "Location not specified"}
                </div>
                
                <div className="detail">
                  <i className="fas fa-money-bill-wave"></i>
                  {job.salary_min && job.salary_max
                    ? `${job.salary_currency} ${job.salary_min} - ${job.salary_currency} ${job.salary_max}`
                    : "Salary not specified"}
                </div>
                
                <div className="detail">
                  <i className="fas fa-clock"></i>
                  {job.employment_type}
                </div>
                
                <div className="detail">
                  <i className="far fa-calendar-alt"></i>
                  {job.application_deadline ? `Deadline: ${job.application_deadline}` : "No deadline"}
                </div>
              </div>
              
              <div className="stats">
                <div className="stat">
                  <h4>{job.views_count}</h4>
                  <p>Views</p>
                </div>
                
                <div className="stat">
                  <h4>{job.applications_count}</h4>
                  <p>Applications</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Org;
