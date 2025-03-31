import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-hot-toast";
import axios from "axios";
import "./StdAccount.css"; // Import updated CSS file

const StdAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    availability_status: "not_looking",
    resume_url: "",
    linkedin_url: "",
    github_url: "",
  });

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
          setFormData({
            availability_status: res.data.details.availability_status || "not_looking",
            resume_url: res.data.details.resume_url || "",
            linkedin_url: res.data.details.linkedin_url || "",
            github_url: res.data.details.github_url || "",
          });

          if (res.data.details.resume_url) {
            navigate("/user/main");
          }
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
      await axios.post("http://localhost:5000/api/student/details", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Details added successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding details:", error);
      toast.error("Failed to add details. Try again.");
    }
  };

  return (
    <div className="std-account-container">
      <header className="std-account-header">
        <div className="std-account-logo">SkillNet</div>
        <button className="std-account-logout-btn" onClick={() => { localStorage.clear(); navigate("/"); }}>
          Logout
        </button>
      </header>

      <div className="std-account-content">
        <form onSubmit={handleSubmit} className="std-account-form">
          <h2>Student Account Details</h2>

          <label htmlFor="availability_status">Availability Status:</label>
          <select
            name="availability_status"
            id="availability_status"
            value={formData.availability_status}
            onChange={handleChange}
          >
            <option value="not_looking">Not Looking</option>
            <option value="actively_looking">Actively Looking</option>
          </select>

          <label htmlFor="resume_url">Resume URL:</label>
          <input
            type="url"
            id="resume_url"
            name="resume_url"
            value={formData.resume_url}
            onChange={handleChange}
          />

          <label htmlFor="linkedin_url">LinkedIn URL:</label>
          <input
            type="url"
            name="linkedin_url"
            id="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
          />

          <label htmlFor="github_url">GitHub URL:</label>
          <input
            type="url"
            name="github_url"
            id="github_url"
            value={formData.github_url}
            onChange={handleChange}
          />

          <button type="submit" className="std-account-submit">Submit</button>
        </form>
      </div>

      <footer className="std-account-footer">
        <p>&copy; 2025 SkillNet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StdAccount;
