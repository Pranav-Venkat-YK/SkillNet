import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StdAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    
    availability_status: "not_looking",
    resume_url: "",
    linkedin_url: "",
    github_url: "",
  });
  const [studentExists, setStudentExists] = useState(false);

  const token = localStorage.getItem("token");

  // Check if student details already exist when component mounts
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const checkStudentDetails = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/student/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.details.github_url) {
          console.log(res.data.details);
          setStudentExists(true);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Details not found, so the form should be displayed
          setStudentExists(false);
        } else {
          console.error("Error checking student details:", error);
        }
      }
    };
    checkStudentDetails();
  }, [token, navigate]);

  // Update form data when user changes input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form to add student details
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

  // If details already exist, show message and redirect button
  if (studentExists) {
    return (
      <div className="std-details-container">
        <h2>Your acad details already exist.</h2>
        {/* <button onClick={() => navigate("/")}>Go to your account</button> */}
      </div>
    );
  }

  // Render the form if details do not exist
  return (
    <div className="std-details-container">
      <h2>Student Details</h2>
      <form onSubmit={handleSubmit} className="std-details-form">
        

         <label for="availability_status">Availability Status:</label>
        <select name="availability_status" id="availability_status" value={formData.availability_status} onChange={handleChange}>
          <option value="not_looking">Not Looking</option>
          <option value="actively_looking">Actively Looking</option>
        </select>

        <label for="resume_url">Resume URL:</label>
        <input type="text" id="resume_url"name="resume_url" value={formData.resume_url} onChange={handleChange} />

        <label for="linkedin_url">LinkedIn URL:</label>
        <input type="text" name="linkedin_url" id="linkedin_url" value={formData.linkedin_url} onChange={handleChange} />

        <label for="github_url">GitHub URL:</label>
        <input type="text" name="github_url" id="github_url" value={formData.github_url} onChange={handleChange} />

        <button type="submit" className="std-details-submit">Submit</button>
      </form>
    </div>
  );
};

export default StdAccount;
