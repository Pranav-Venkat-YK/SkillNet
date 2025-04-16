import React from 'react';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import './AboutUs.css';

const AboutUs = () => {
  const teamMembers = [
    {
      id: 1,
      name: "A R Sharan Kumar",
      rollNo: "231CS101",
      github: "https://github.com/arsharankumar",
      linkedin: "https://www.linkedin.com/in/a-r-sharan-kumar-53584b293/"
    },
    {
      id: 2,
      name: "Mithun Patil V N",
      rollNo: "231CS234",
      github: "https://github.com/Mithun-144",
      linkedin: "https://linkedin.com/in/mithunpatil"
    },
    {
      id: 3,
      name: "Pranav Venkat YK",
      rollNo: "231CS242",
      github: "https://github.com/Pranav-Venkat-YK",
      linkedin: "https://www.linkedin.com/in/pranav-venkat-yk-7a486a28b/"
    },
    {
      id: 4,
      name: "Yashwanth R",
      rollNo: "231CS265",
      github: "https://github.com/ryashwanth990",
      linkedin: "https://www.linkedin.com/in/yashwanth-r-bb437128a/"
    }
  ];

  return (
    <div className="aboutBody">
      <div className="about-container">
        <header className="about-header">
          <div className="about-logo">SkillNet</div>
          <nav className="about-nav">
            <a href="/">Home</a>
            <a href="/about" className="active">About Us</a>
            <a href="/work">Work</a>
            <a href="/info">Info</a>
          </nav>
        </header>

        <section className="about-hero">
          <h1>About <span className="purple-text">SkillNet</span></h1>
          <div className="about-divider"></div>
        </section>

        <section className="about-mission">
          <h2>Our Mission</h2>
          <p>
            SkillNet is a comprehensive platform designed to bridge the gap between talented professionals and recruiters.
            We streamline the hiring process by providing powerful tools to schedule interviews, track candidates,
            and unlock career opportunities - all in one centralized location.
          </p>
          <p>
            Our platform helps job seekers showcase their skills and connect with employers who value their talents,
            while providing recruiters with efficient tools to find, evaluate, and hire the best candidates for their teams.
          </p>
        </section>

        <section className="about-team">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div className="team-member" key={member.id}>
                <div className="member-avatar">
                  {member.name.charAt(0)}
                </div>
                <h3>{member.name}</h3>
                <p className="roll-no">{member.rollNo}</p>
                <div className="social-links">
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="social-icon">
                    <FaGithub />
                  </a>
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon">
                    <FaLinkedin />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="about-footer">
          <p>&copy; {new Date().getFullYear()} SkillNet. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AboutUs;