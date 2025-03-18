import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "./ExplorePage.css";

function ExplorePage() {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const navigate = useNavigate(); // Corrected usage

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
  };

  return (
    <div className = "epskillnet-app">
      <div className='epheader'>
        <a href="/" className = "eplogo">SkillNet</a>
        <button className = "epmenu-toggle" aria-label="Toggle menu" onClick={toggleMenu}>☰</button>
        <nav>
          <ul className={`menu ${isMenuActive ? 'active' : ''}`}>
            <li><a href="/">Home</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Work</a></li>
            <li><a href="#">Info</a></li>
          </ul>
        </nav>
      </div>

      <main>
        <div className = "epchoice-header">
          <h1>Choose Your <span className = "ephighlight">Path</span></h1>
          <p>Whether you're looking to hire top talent or advance your career, SkillNet has the tools you need to succeed in today's competitive landscape.</p>
        </div>

        <div className = "epoptions-container">
          {/* Organization Card */}
          <div className = "epoption-card organization">
            <div className = "epoption-icon">🏢</div>
            <h2>Organizations</h2>
            <p>Find top talent and streamline your hiring process</p>
            <div className = "epoption-features">
              <div className = "epfeature-item">
                <span className = "epfeature-icon">✓</span>
                <span>Post unlimited job openings</span>
              </div>
              <div className = "epfeature-item">
                <span className = "epfeature-icon">✓</span>
                <span>Schedule interviews seamlessly</span>
              </div>
              <div className = "epfeature-item">
                <span className = "epfeature-icon">✓</span>
                <span>Track applicants in one place</span>
              </div>
            </div>
            <button className = "epbtn epbtn-secondary" onClick={() => navigate("/org-auth")}>Organization Login</button>
          </div>

          {/* Student Card */}
          <div className = "epoption-card student">
            <div className = "epoption-icon">👨‍🎓</div>
            <h2>Students</h2>
            <p>Find opportunities and advance your career</p>
            <div className = "epoption-features">
              <div className = "epfeature-item">
                <span className = "epfeature-icon">✓</span>
                <span>Create professional profile</span>
              </div>
              <div className = "epfeature-item">
                <span className = "epfeature-icon">✓</span>
                <span>Discover personalized job matches</span>
              </div>
              <div className = "epfeature-item">
                <span className = "epfeature-icon">✓</span>
                <span>Track applications and interviews</span>
              </div>
            </div>
            <button className = "epbtn epbtn-primary" onClick={() => navigate("/user-auth")}>Student Login</button>
          </div>
        </div>

        <button className = "epback-link" onClick={() => navigate("/")}>← Back to Home</button>
      </main>

      <footer>
        <p>&copy; 2025 SkillNet. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ExplorePage;
