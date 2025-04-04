import { useState, useEffect } from "react";
import axios from "axios";
import {toast} from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./OrgProfile.css";

const OrgProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    foundeddate: "",
    headquarters_address: "",
    city: "",
    state: "",
    country: "",
    website_url: "",
    industry: "",
  });
  const [editMode, setEditMode] = useState(false);

  const token = localStorage.getItem("token");

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
        console.log(res);
        if (res.data.details) {
          const details = res.data.details;
          

          setFormData(details);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    fetchStudentDetails();
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/api/organisations", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Details updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating details:", error);
      toast.error("Failed to update details. Try again.");
    }
  };

  return (
    <div className="org-details-container">
      <header className="org-dashboard-header">
        <div className="org-dashboard-logo">SkillNet</div>
        <button className="org-dashboard-logout-btn" onClick={() => { localStorage.clear(); navigate("/"); }}>
          Logout
        </button>
      </header>
      
      <h2>Your Details</h2>

      {!editMode ? (
        <div className="org-details-view">
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Industry:</strong> {formData.industry}</p>
          <p><strong>Bio:</strong> {formData.Description}</p>
          <p><strong>Founded Date:</strong> {formData.founded_date}</p>
          <p><strong>Headquarters Address:</strong> {formData.headquarters_address}</p>
          <p><strong>City:</strong> {formData.city}</p>
          <p><strong>State:</strong> {formData.state}</p>
          <p><strong>Country:</strong> {formData.country}</p>
          <p><strong>Website URL:</strong> <a href={formData.website_url}>{formData.website_url}</a></p>
          <button className="org-edit-btn" onClick={() => setEditMode(true)}>Edit</button>
          <button className="org-goback-btn" onClick={() => navigate("/org")}>Go Back</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="org-details-form">
          <label htmlFor="name">Name:</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} />

          <label htmlFor="industry">Industry:</label>
          <input type="text" name="industry" id="industry" value={formData.industry} onChange={handleChange} />

          <label htmlFor="bio">Bio:</label>
          <textarea name="bio" id="bio" value={formData.Description} onChange={handleChange} />
          
          <label htmlFor="foundeddate">Founded Date:</label>
          <input type="date" name="foundeddate" id="foundeddate" value={formData.founded_date} onChange={handleChange} />

          <label htmlFor="headquarters_address">Headquarters Address:</label>
          <textarea name="headquarters_address" id="headquarters_address" value={formData.headquarters_address} onChange={handleChange} />

          <label htmlFor="city">City:</label>
          <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} />

          <label htmlFor="state">State:</label>
          <input type="text" name="state" id="state" value={formData.state} onChange={handleChange} />

          <label htmlFor="country">Country:</label>
          <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} />

          <label htmlFor="website_url">Website URL:</label>
          <input type="text" name="website_url" id="website_url" value={formData.website_url} onChange={handleChange} />

          <button className="save-btn" type="submit">Save</button>
          <button className="cancel-btn" type="button" onClick={() => setEditMode(false)}>Cancel</button>
        </form>
      )}

      <footer className="org-dashboard-footer">
        <p>&copy; 2025 SkillNet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OrgProfile;
