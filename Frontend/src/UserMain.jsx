import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserMain.css";

const UserMain = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name:"",
    bio: "",
    date_of_birth: "",
    phone_number: "",
    city: "",
    country: "",
    postal_code: "",
    availability_status: "not_looking",
    resume_url: "",
    linkedin_url: "",
    github_url: "",
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
        const res = await axios.get("http://localhost:5000/api/student/details", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.details) {
          const details = res.data.details;
          if (details.date_of_birth) {
            details.date_of_birth = details.date_of_birth.split("T")[0];
          }

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
      await axios.put("http://localhost:5000/api/student/details", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Details updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating details:", error);
      alert("Failed to update details. Try again.");
    }
  };

  return (
    <div className="std-details-containers">
      <header className="std-dashboard-header">
        <div className="std-dashboard-logo">SkillNet</div>
        <button className="std-dashboard-logout-btn" onClick={() => { localStorage.clear(); navigate("/"); }}>
          Logout
        </button>
      </header>
      
      <h2>Your Details</h2>

      {!editMode ? (
        <div className="std-details-view">
          <p><strong>Name:</strong>{formData.name}</p>
          <p><strong>Bio:</strong> {formData.bio}</p>
          <p><strong>Date of Birth:</strong> {formData.date_of_birth}</p>
          <p><strong>Phone Number:</strong> {formData.phone_number}</p>
          <p><strong>City:</strong> {formData.city}</p>
          <p><strong>Country:</strong> {formData.country}</p>
          <p><strong>Postal Code:</strong> {formData.postal_code}</p>
          <p><strong>Availability Status:</strong> {formData.availability_status.replace("_", " ")}</p>
          <p><strong>Resume URL:</strong> <a href={formData.resume_url} target="_blank" rel="noopener noreferrer">{formData.resume_url}</a></p>
          <p><strong>LinkedIn URL:</strong> <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer">{formData.linkedin_url}</a></p>
          <p><strong>GitHub URL:</strong> <a href={formData.github_url} target="_blank" rel="noopener noreferrer">{formData.github_url}</a></p>
          <button className="std-edit-btn" onClick={() => setEditMode(true)}>Edit</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="std-details-form">
          <label htmlFor="name">Name:</label>
          <textarea name="name" id="name" value={formData.name} onChange={handleChange} />

          <label htmlFor="bio">Bio:</label>
          <textarea name="bio" id="bio" value={formData.bio} onChange={handleChange} />

          <label htmlFor="date_of_birth">Date Of Birth:</label>
          <input type="date" name="date_of_birth" id="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />

          <label htmlFor="phone_number">Phone Number:</label>
          <input type="text" name="phone_number" id="phone_number" value={formData.phone_number} onChange={handleChange} />

          <label htmlFor="city">City:</label>
          <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} />

          <label htmlFor="country">Country:</label>
          <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} />

          <label htmlFor="postal_code">Postal Code:</label>
          <input type="text" name="postal_code" id="postal_code" value={formData.postal_code} onChange={handleChange} />

          <label htmlFor="availability_status">Availability Status:</label>
          <select name="availability_status" id="availability_status" value={formData.availability_status} onChange={handleChange}>
            <option value="not_looking">Not Looking</option>
            <option value="actively_looking">Actively Looking</option>
          </select>

          <label htmlFor="resume_url">Resume URL:</label>
          <input type="text" name="resume_url" id="resume_url" value={formData.resume_url} onChange={handleChange} />

          <label htmlFor="linkedin_url">LinkedIn URL:</label>
          <input type="text" name="linkedin_url" id="linkedin_url" value={formData.linkedin_url} onChange={handleChange} />

          <label htmlFor="github_url">GitHub URL:</label>
          <input type="text" name="github_url" id="github_url" value={formData.github_url} onChange={handleChange} />

          <button className="std-save-btn" type="submit">Save</button>
          <button className="std-cancel-btn" type="button" onClick={() => setEditMode(false)}>Cancel</button>
        </form>
      )}

      <footer className="std-dashboard-footer">
        <p>&copy; 2025 SkillNet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default UserMain;
