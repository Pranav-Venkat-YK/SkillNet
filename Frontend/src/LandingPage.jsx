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
    <div className="lp-container">
      <div className="lp-header">
        <div className="lp-logo">SkillNet</div>
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        <div className="lp-mobile-menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <nav className={menuOpen ? "active" : ""}>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/aboutus">About Us</a></li>
          </ul>
        </nav>
      </div>
      
      <section className="lp-main">
        <div className="lp-text-content">
          <h1 className="lp-caption"><span className="lp-highlight">Your Gateway</span> to Smart Hiring & Career Growth</h1>
          <p className="lp-description">
            SkillNet helps professionals and recruiters connect seamlessly <br />  
            <span className="lp-bold-text"> Schedule interviews, track candidates, and unlock career opportunities</span> — all in one place.  
          </p>

          <button className="lp-get-started" onClick={() => navigate("/explore")}>
            Explore Now
          </button>
        </div>
        
        <div className="lp-image-content">
          <img src="\public\interview2.jpg" alt="Job Interview Illustration" />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;