import React, { useState } from 'react';
import './InterSche.css';

const InterSche = ({ candidate, onClose }) => {
  const [activeJobTab, setActiveJobTab] = useState('all');
  
  // Function to handle return to candidate profile
  const handleReturnToCandidateProfile = () => {
    onClose(); // This will close the interview schedule modal and return to candidate profile
  };
  
  return (
    <div className = "is-body">
    <div className="is-modal">
      <div className="is-modal-header">
        <h3 className="is-modal-title">Schedule Interview</h3>
        <button className="is-close-btn" onClick={handleReturnToCandidateProfile}>&times;</button>
      </div>
     
      <div className="is-modal-body">
        {/* Candidate Information */}
        <div className="is-candidate-info">
          <div className="is-candidate-name">{candidate?.name || 'Jane Smith'}</div>
          <div className="is-candidate-position">Candidate for Senior Software Engineer</div>
        </div>
       
        {/* Interview Form */}
        <form>
          <div className="is-form-group">
            <label htmlFor="interview-type">Interview Type</label>
            <select id="interview-type">
              <option>Technical Interview</option>
              <option>Behavioral Interview</option>
              <option>Initial Screening</option>
              <option>Final Round</option>
            </select>
          </div>
         
          <div className="is-form-group">
            <label htmlFor="interview-date">Interview Date</label>
            <input type="date" id="interview-date" required/>
          </div>
         
          <div className="is-form-group">
            <label htmlFor="interview-time">Interview Time</label>
            <div className="is-time-grid">
              <label htmlFor="interview-start-time">Start</label>
              <input type="time" id="interview-start-time" required/>
              <label htmlFor="interview-end-time">End</label>
              <input type="time" id="interview-end-time" required/>
            </div>
          </div>
         
          <div className="is-form-group">
            <label htmlFor="location">Location</label>
            <select id="location">
              <option>Video Call (Zoom)</option>
              <option>Video Call (Google Meet)</option>
              <option>Phone Call</option>
              <option>On-site - Conference Room A</option>
              <option>On-site - Conference Room B</option>
            </select>
          </div>
         
          <div className="is-form-group">
            <label htmlFor="interviewer">Interviewer</label>
            <select id="interviewer">
              <option>Select an interviewer</option>
              <option>John Doe (Engineering Manager)</option>
              <option>Emily Chen (Senior Developer)</option>
              <option>Michael Johnson (Tech Lead)</option>
              <option>Sarah Williams (HR Director)</option>
            </select>
          </div>
         
          <div className="is-form-group">
            <label htmlFor="notes">Notes & Preparation Instructions</label>
            <textarea id="notes" rows="4" placeholder="Add any preparation instructions for the candidate or notes for the interviewer"></textarea>
          </div>
         
          <div className="is-form-group">
            <label htmlFor="resume">Resume Link</label>
            <input type="text" id="resume" placeholder="https://example.com/resume.pdf" readOnly/>
          </div>
         
          <div className="is-checkbox-group">
            <label className="is-checkbox-label">
              <input type="checkbox" id="send-email"/>
              Send email notification to candidate
            </label>
          </div>
         
          <div className="is-checkbox-group">
            <label className="is-checkbox-label">
              <input type="checkbox" id="update-status"/>
              Update application status to "interviewing"
            </label>
          </div>
        </form>
      </div>
     
      <div className="is-modal-footer">
        <button className="is-btn is-btn-secondary" onClick={handleReturnToCandidateProfile}>Cancel</button>
        <button className="is-btn is-btn-primary">Schedule Interview</button>
      </div>
    </div>
    </div>
  );
};

export default InterSche;