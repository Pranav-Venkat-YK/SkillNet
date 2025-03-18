import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landingpage.css";

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="logo">SkillNet</div>
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <nav className={menuOpen ? "active" : ""}>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Work</a></li>
            <li><a href="#">Info</a></li>
          </ul>
        </nav>
      </div>
      
      <section className="main">
        <div className="text-content">
          <h1 className="caption"><span className="highlight">Your Gateway</span> to Smart Hiring & Career Growth</h1>
          <p className="description">
            SkillNet helps professionals and recruiters connect seamlessly <br />  
            <span className="bold-text"> Schedule interviews, track candidates, and unlock career opportunities</span> — all in one place.  
          </p>

          <button className="get-started" onClick={() => navigate("/explore")}>
            Explore Now
          </button>
        </div>
        
        <div className="image-content">
          <img src="\public\interview2.jpg" alt="Job Interview Illustration" />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;