import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InterSche.css';

const InterSche = () => {
  const { jobId, applicationId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [formData, setFormData] = useState({
    interview_type: 'video',
    scheduled_date: '',
    start_time: '',
    end_time: '',
    location_or_link: 'Video Call (Zoom)',
    interviewer_name: '',
    interviewer_position: '',
    notes: '',
    send_email: true,
    update_status: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingInterviews, setExistingInterviews] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentInterviewId, setCurrentInterviewId] = useState(null);

  // Fetch existing interviews when component mounts
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/applications/${applicationId}/interviews`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setExistingInterviews(response.data.interviews);
        
        // If there are existing interviews, pre-fill the form with the most recent one
        if (response.data.interviews.length > 0) {
          const latestInterview = response.data.interviews[0];
          setIsEditMode(true);
          setCurrentInterviewId(latestInterview.interview_id);
          
          const scheduledDate = new Date(latestInterview.scheduled_time);
          const endTime = new Date(scheduledDate);
          endTime.setMinutes(endTime.getMinutes() + latestInterview.duration_minutes);
          
          setFormData({
            interview_type: latestInterview.interview_type,
            scheduled_date: scheduledDate.toISOString().split('T')[0],
            start_time: scheduledDate.toTimeString().substring(0, 5),
            end_time: endTime.toTimeString().substring(0, 5),
            location_or_link: latestInterview.location_or_link,
            interviewer_name: latestInterview.interviewer_name,
            interviewer_position: latestInterview.interviewer_position,
            notes: latestInterview.feedback,
            send_email: true,
            update_status: false // Don't update status when rescheduling
          });
        }
      } catch (err) {
        console.error("Failed to fetch interviews:", err);
      }
    };
    
    fetchInterviews();
  }, [applicationId, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Combine date and time
      const scheduled_time = `${formData.scheduled_date}T${formData.start_time}`;
      
      // Calculate duration in minutes
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const duration_minutes = (end - start) / (1000 * 60);
      
      if (isEditMode && currentInterviewId) {
        // Update existing interview
        await axios.put(
          `http://localhost:5000/api/interviews/${currentInterviewId}`,
          {
            scheduled_time,
            duration_minutes,
            interview_type: formData.interview_type,
            location_or_link: formData.location_or_link,
            interviewer_name: formData.interviewer_name,
            interviewer_position: formData.interviewer_position,
            feedback: formData.notes
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new interview
        await axios.post(
          `http://localhost:5000/api/applications/${applicationId}/interviews`,
          {
            scheduled_time,
            duration_minutes,
            interview_type: formData.interview_type,
            location_or_link: formData.location_or_link,
            interviewer_name: formData.interviewer_name,
            interviewer_position: formData.interviewer_position,
            notes: formData.notes,
            update_status: formData.update_status
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Redirect back to candidate profile
      navigate(`/org/jobs/${jobId}/applicants/${applicationId}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToCandidateProfile = () => {
    navigate(`/org/jobs/${jobId}/applicants/${applicationId}`);
  };
  
  return (
    <div className="is-body">
      <div className="is-modal">
        <div className="is-modal-header">
          <h3 className="is-modal-title">
            {isEditMode ? 'Reschedule Interview' : 'Schedule Interview'}
          </h3>
          <button className="is-close-btn" onClick={handleReturnToCandidateProfile}>&times;</button>
        </div>
       
        <div className="is-modal-body">
          {error && <div className="is-error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="is-form-group">
              <label htmlFor="interview-type">Interview Type</label>
              <select 
                id="interview-type"
                name="interview_type"
                value={formData.interview_type}
                onChange={handleChange}
                required
              >
                <option value="phone">Phone Interview</option>
                <option value="video">Video Interview</option>
                <option value="in_person">In-Person Interview</option>
              </select>
            </div>
           
            <div className="is-form-group">
              <label htmlFor="interview-date">Interview Date</label>
              <input 
                type="date" 
                id="interview-date" 
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                required
              />
            </div>
           
            <div className="is-form-group">
              <label htmlFor="interview-time">Interview Time</label>
              <div className="is-time-grid">
                <label htmlFor="interview-start-time">Start</label>
                <input 
                  type="time" 
                  id="interview-start-time" 
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="interview-end-time">End</label>
                <input 
                  type="time" 
                  id="interview-end-time" 
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
           
            <div className="is-form-group">
              <label htmlFor="location">Location</label>
              <select 
                id="location"
                name="location_or_link"
                value={formData.location_or_link}
                onChange={handleChange}
                required
              >
                <option value="Video Call (Zoom)">Video Call (Zoom)</option>
                <option value="Video Call (Google Meet)">Video Call (Google Meet)</option>
                <option value="Phone Call">Phone Call</option>
                <option value="On-site - Conference Room A">On-site - Conference Room A</option>
                <option value="On-site - Conference Room B">On-site - Conference Room B</option>
              </select>
            </div>
           
            <div className="is-form-group">
              <label htmlFor="interviewer">Interviewer Name</label>
              <input
                type="text"
                id="interviewer"
                name="interviewer_name"
                value={formData.interviewer_name}
                onChange={handleChange}
                placeholder="Enter interviewer name"
                required
              />
            </div>
            
            <div className="is-form-group">
              <label htmlFor="interviewer-position">Interviewer Position</label>
              <input
                type="text"
                id="interviewer-position"
                name="interviewer_position"
                value={formData.interviewer_position}
                onChange={handleChange}
                placeholder="Enter interviewer position"
                required
              />
            </div>
           
            <div className="is-form-group">
              <label htmlFor="notes">Notes & Preparation Instructions</label>
              <textarea 
                id="notes" 
                rows="4" 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any preparation instructions for the candidate or notes for the interviewer"
              ></textarea>
            </div>
           
            {!isEditMode && (
              <div className="is-checkbox-group">
                <label className="is-checkbox-label">
                  <input 
                    type="checkbox" 
                    id="update-status"
                    name="update_status"
                    checked={formData.update_status}
                    onChange={handleChange}
                  />
                  Update application status to "interviewing"
                </label>
              </div>
            )}
           
            <div className="is-modal-footer">
              <button 
                type="button"
                className="is-btn is-btn-secondary" 
                onClick={handleReturnToCandidateProfile}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="is-btn is-btn-primary"
                disabled={loading}
              >
                {loading ? (isEditMode ? 'Updating...' : 'Scheduling...') : 
                  (isEditMode ? 'Update Interview' : 'Schedule Interview')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterSche;