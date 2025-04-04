import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import "./StdAccount.css";

const WpAccount = () => {
  const navigate = useNavigate();
  
  // Form state for working professional account details
  const [formData, setFormData] = useState({
    current_position: "",
    company_name: "",
    industry: "",
    years_of_experience: "",
    availability_status: "not_looking",
    resume_url: "",
    linkedin_url: "",
    github_url: "",
  });

  // Form state for education details
  const [formData1, setFormData1] = useState({
    tenth_grade: null,
    tenth_board: "",
    tenth_school: "",
    twelveth_grade: null,
    twelveth_course_combination: "",
    twelveth_college: "",
    degree_grade: null,
    degree_course: "",
    degree_university: "",
    postdegree_grade: null,
    postdegree_course: "",
    postdegree_university: "",
  });

  const token = localStorage.getItem("token");

  // Fetch working professional details on component mount
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
  
    const fetchWorkingProfessionalDetails = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/workingprofessional/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (res.data.details) {
          setFormData({
            current_position: res.data.details.current_position || "",
            company_name: res.data.details.company_name || "",
            industry: res.data.details.industry || "",
            years_of_experience: res.data.details.years_of_experience || "",
            availability_status: res.data.details.availability_status || "not_looking",
            resume_url: res.data.details.resume_url || "",
            linkedin_url: res.data.details.linkedin_url || "",
            github_url: res.data.details.github_url || "",
          });
  
          // Only navigate to /wp/main if the resume_url is not empty
          if (res.data.details.resume_url && res.data.details.resume_url.trim() !== "") {
            navigate("/wp/profile");
          }
        }
  
        // Fetch Education Details
        const educationRes = await axios.get("http://localhost:5000/api/student/education", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (educationRes.data.educationDetails) {
          setFormData1({
            tenth_grade: educationRes.data.educationDetails.tenth_grade || null,
            tenth_board: educationRes.data.educationDetails.tenth_board || "",
            tenth_school: educationRes.data.educationDetails.tenth_school || "",
            twelveth_grade: educationRes.data.educationDetails.twelveth_grade || null,
            twelveth_course_combination: educationRes.data.educationDetails.twelveth_course_combination || "",
            twelveth_college: educationRes.data.educationDetails.twelveth_college || "",
            degree_grade: educationRes.data.educationDetails.degree_grade || null,
            degree_course: educationRes.data.educationDetails.degree_course || "",
            degree_university: educationRes.data.educationDetails.degree_university || "",
            postdegree_grade: educationRes.data.educationDetails.postdegree_grade || null,
            postdegree_course: educationRes.data.educationDetails.postdegree_course || "",
            postdegree_university: educationRes.data.educationDetails.postdegree_university || "",
          });
        }
      } catch (error) {
        console.error("Error fetching working professional details:", error);
      }
    };
  
    fetchWorkingProfessionalDetails();
  }, [token, navigate]);
  
  // Handle change in working professional form data
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle change in education form data
  const handleChange1 = (e) => {
    const { name, value } = e.target;
    
    if (["tenth_grade", "twelveth_grade", "degree_grade", "postdegree_grade"].includes(name)) {
      setFormData1((prev) => ({
        ...prev,
        [name]: value === "" ? null : parseFloat(value),
      }));
    } else {
      setFormData1((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send Working Professional Details data
      await axios.post("http://localhost:5000/api/workingprofessional/details", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Send EducationDetails data
      await axios.post("http://localhost:5000/api/student/education", formData1, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Details added successfully!");
      navigate("/wp/profile");
    } catch (error) {
      console.error("Error adding details:", error);
      toast.error("Failed to add details. Try again.");
    }
  };

  return (
    <div className="std-account-container">
      <header className="std-account-header">
        <div className="std-account-logo">SkillNet</div>
        <button
          className="std-account-logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </button>
      </header>

      <div className="std-account-content">
        <form onSubmit={handleSubmit} className="std-account-form">
          <h2>Professional Details</h2>

          <label htmlFor="current_position">Current Position:</label>
          <input
            type="text"
            id="current_position"
            name="current_position"
            value={formData.current_position}
            onChange={handleChange}
          />

          <label htmlFor="company_name">Company Name:</label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
          />

          <label htmlFor="industry">Industry:</label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
          />

          <label htmlFor="years_of_experience">Years of Experience:</label>
          <input
            type="number"
            id="years_of_experience"
            name="years_of_experience"
            value={formData.years_of_experience}
            onChange={handleChange}
          />

          {/* Education Details Form */}
          <h2>Education Details</h2>

          <label htmlFor="tenth_grade">Tenth Percentage:</label>
          <input
            type="number"
            id="tenth_grade"
            name="tenth_grade"
            value={formData1.tenth_grade || ""}
            onChange={handleChange1}
            step="0.01"
          />

          <label htmlFor="tenth_board">Tenth Board:</label>
          <input
            type="text"
            id="tenth_board"
            name="tenth_board"
            value={formData1.tenth_board}
            onChange={handleChange1}
          />

          <label htmlFor="tenth_school">Tenth School:</label>
          <input
            type="text"
            id="tenth_school"
            name="tenth_school"
            value={formData1.tenth_school}
            onChange={handleChange1}
          />

          <label htmlFor="twelveth_grade">Twelveth Percentage:</label>
          <input
            type="number"
            id="twelveth_grade"
            name="twelveth_grade"
            value={formData1.twelveth_grade || ""}
            onChange={handleChange1}
            step="0.01"
          />

          <label htmlFor="twelveth_course_combination">Twelveth Course Combination:</label>
          <input
            type="text"
            id="twelveth_course_combination"
            name="twelveth_course_combination"
            value={formData1.twelveth_course_combination}
            onChange={handleChange1}
          />

          <label htmlFor="twelveth_college">Twelveth College:</label>
          <input
            type="text"
            id="twelveth_college"
            name="twelveth_college"
            value={formData1.twelveth_college}
            onChange={handleChange1}
          />

          <label htmlFor="degree_grade">Degree Grade:</label>
          <input
            type="number"
            id="degree_grade"
            name="degree_grade"
            value={formData1.degree_grade || ""}
            onChange={handleChange1}
            step="0.01"
          />

          <label htmlFor="degree_course">Degree Course:</label>
          <input
            type="text"
            id="degree_course"
            name="degree_course"
            value={formData1.degree_course}
            onChange={handleChange1}
          />

          <label htmlFor="degree_university">Degree University:</label>
          <input
            type="text"
            id="degree_university"
            name="degree_university"
            value={formData1.degree_university}
            onChange={handleChange1}
          />

          <label htmlFor="postdegree_grade">Post Graduation Grade:</label>
          <input
            type="number"
            id="postdegree_grade"
            name="postdegree_grade"
            value={formData1.postdegree_grade || ""}
            onChange={handleChange1}
            step="0.01"
          />

          <label htmlFor="postdegree_course">Post Graduation Course:</label>
          <input
            type="text"
            id="postdegree_course"
            name="postdegree_course"
            value={formData1.postdegree_course}
            onChange={handleChange1}
          />

          <label htmlFor="postdegree_university">Post Graduation University:</label>
          <input
            type="text"
            id="postdegree_university"
            name="postdegree_university"
            value={formData1.postdegree_university}
            onChange={handleChange1}
          />

          {/* Account Availability and URLs */}
          <h2>Profile Details</h2>

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

          <button type="submit" className="std-account-submit">
            Submit
          </button>
        </form>
      </div>

      <footer className="std-account-footer">
        <p>&copy; 2025 SkillNet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WpAccount;