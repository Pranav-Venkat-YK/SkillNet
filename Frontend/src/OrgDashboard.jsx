import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OrgDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const orgName = localStorage.getItem("orgName");

  const [formData, setFormData] = useState({
    bio: "",
    foundeddate: "",
    headquarters_address: "",
    city: "",
    state: "",
    country: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/student/details", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Details added successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding details:", error);
      alert("Failed to add details. Try again.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="org-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">SkillNet</div>
        <button className="dashboard-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <form onSubmit={handleSubmit} className="org-details-form">
          <h2>Organization Details</h2>

          <label htmlFor="bio">Bio:</label>
          <textarea
            name="bio"
            id="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about your organization..."
          ></textarea>

          <label htmlFor="foundeddate">Founded Date:</label>
          <input
            type="date"
            name="foundeddate"
            id="foundeddate"
            value={formData.foundeddate}
            onChange={handleChange}
          />

          <label htmlFor="headquarters_address">Headquarters Address:</label>
          <textarea
            name="headquarters_address"
            id="headquarters_address"
            value={formData.headquarters_address}
            onChange={handleChange}
            placeholder="Enter your main office address..."
          ></textarea>

          <div className="form-grid">
            <div>
              <label htmlFor="city">City:</label>
              <input
                type="text"
                name="city"
                id="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>
            <div>
              <label htmlFor="state">State:</label>
              <input
                type="text"
                name="state"
                id="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
              />
            </div>
            <div>
              <label htmlFor="country">Country:</label>
              <input
                type="text"
                name="country"
                id="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>
          </div>

          <button type="submit">Submit Details</button>
        </form>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; 2025 SkillNet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OrgDashboard;
