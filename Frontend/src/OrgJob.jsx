import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import './OrgJob.css';

const OrgJob = ({ organisationId }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location: '',
    is_remote: false,
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    employment_type: 'full-time',
    experience_level: 'entry',
    education_level: '12th',
    domain_of_study: 'CS/IT',
    application_deadline: '',
    status: 'open'
  });

  // Redirect if token is missing (or handle it differently)
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [navigate, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/org/jobs', 
        {
          ...formData,
          // Although we pass organisationId, you can also use the id from the token on the backend
          orgId: organisationId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Job posted successfully!");
      // Optionally refresh job list or redirect
      navigate("/org");
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error("Failed to post job. Please try again.");
    }
  };

  return (
    <div className="oj-modal-overlay">
      <div className="oj-modal">
        <div className="oj-modal-header">
          <h2>Post New Job</h2>
          <button className="oj-close-btn" onClick={() => navigate("/org")}>&times;</button>
        </div>
        
        <div className="oj-modal-body">
          <form id="job-form" onSubmit={handleSubmit}>
            <div className="oj-form-grid">
              <div className="oj-form-group oj-full-width">
                <label htmlFor="title">Job Title *</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="oj-form-group oj-full-width">
                <label htmlFor="description">Job Description *</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="oj-form-group oj-full-width">
                <label htmlFor="requirements">Requirements</label>
                <textarea 
                  id="requirements" 
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                />
              </div>
              
              <div className="oj-form-group oj-full-width">
                <label htmlFor="responsibilities">Responsibilities</label>
                <textarea 
                  id="responsibilities" 
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                />
              </div>
          
              <div className="oj-form-group">
                <label htmlFor="location">Location</label>
                <input 
                  type="text" 
                  id="location" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
          
              <div className="oj-form-group" id="is-remote">
                <label className="oj-checkbox-group">
                  <input 
                    type="checkbox" 
                    id="is_remote" 
                    name="is_remote"
                    checked={formData.is_remote}
                    onChange={handleChange}
                  />
                  Remote Position
                </label>
              </div>
              
              <div className="oj-form-group">
                <label htmlFor="salary_min">Minimum Salary</label>
                <input 
                  type="number" 
                  id="salary_min" 
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                />
              </div>
              
              <div className="oj-form-group">
                <label htmlFor="salary_max">Maximum Salary</label>
                <input 
                  type="number" 
                  id="salary_max" 
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                />
              </div>
              
              <div className="oj-form-group">
                <label htmlFor="salary_currency">Currency</label>
                <select 
                  id="salary_currency" 
                  name="salary_currency"
                  value={formData.salary_currency}
                  onChange={handleChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              
              <div className="oj-form-group">
                <label htmlFor="employment_type">Employment Type</label>
                <select 
                  id="employment_type" 
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
              </div>
              
              <div className="oj-form-group">
                <label htmlFor="experience_level">Experience Level</label>
                <select 
                  id="experience_level" 
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              
              <div className="oj-form-group">
                <label htmlFor="education_level">Education Level</label>
                <select 
                  id="education_level" 
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleChange}
                >
                  <option value="12th">12th</option>
                  <option value="UnderGraduate">Undergraduate</option>
                  <option value="PostGraduate">Postgraduate</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              
              <div className="oj-form-group">
                <label htmlFor="domain_of_study">Domain of Study</label>
                <select 
                  id="domain_of_study" 
                  name="domain_of_study"
                  value={formData.domain_of_study}
                  onChange={handleChange}
                >
                  <option value="CS/IT">CS/IT</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Civil">Civil</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="oj-form-group">
                <label htmlFor="application_deadline">Application Deadline</label>
                <input 
                  type="date" 
                  id="application_deadline" 
                  name="application_deadline"
                  value={formData.application_deadline}
                  onChange={handleChange}
                />
              </div>
              
              <div className="oj-form-group">
                <label htmlFor="status">Status</label>
                <select 
                  id="status" 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        
        <div className="oj-modal-footer">
          <button className="oj-btn oj-btn-cancel" onClick={() => navigate("/org")}>Cancel</button>
          <button className="oj-btn oj-btn-primary" onClick={handleSubmit}>Post Job</button>
        </div>
      </div>
    </div>
  );
};

export default OrgJob;
