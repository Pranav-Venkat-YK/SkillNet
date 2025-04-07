import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./StdProfile.css";

const WpProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
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
    current_position: "",
    company_name: "",
    industry: "",
    years_of_experience: "",
  });

  const [formData1, setFormData1] = useState({
    tenth_grade: "",
    tenth_board: "",
    tenth_school: "",
    twelveth_grade: "",
    twelveth_course_combination: "",
    twelveth_college: "",
    degree_grade: "",
    degree_course: "",
    degree_university: "",
    postdegree_grade: "",
    postdegree_course: "",
    postdegree_university: "",
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
        const res = await axios.get("http://localhost:5000/api/workingprofessional/details", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.details) {
          const { details } = res.data;
          console.log("Fetched details:", details);

          setFormData({
            name: details.name || "",
            bio: details.bio || "",
            date_of_birth: formatDateToLocal(details.date_of_birth),
            phone_number: details.phone_number || "",
            city: details.city || "",
            country: details.country || "",
            postal_code: details.postal_code || "",
            availability_status: details.availability_status || "not_looking",
            resume_url: details.resume_url || "",
            linkedin_url: details.linkedin_url || "",
            github_url: details.github_url || "",
            current_position: details.current_position || "",
            company_name: details.company_name || "",
            industry: details.industry || "",
            years_of_experience: details.years_of_experience || "",
          });

          if (details.resume_url && details.resume_url.trim() !== "") {
            navigate("/wp/profile");
          }
        } else {
          console.error("Working professional details are missing or invalid in the response.");
        }

        const educationRes = await axios.get("http://localhost:5000/api/student/education", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (educationRes.data && educationRes.data.educationDetails) {
          const { educationDetails } = educationRes.data;
          console.log("Fetched education details:", educationDetails);

          setFormData1({
            tenth_grade: educationDetails.tenth_grade || "",
            tenth_board: educationDetails.tenth_board || "",
            tenth_school: educationDetails.tenth_school || "",
            twelveth_grade: educationDetails.twelveth_grade || "",
            twelveth_course_combination: educationDetails.twelveth_course_combination || "",
            twelveth_college: educationDetails.twelveth_college || "",
            degree_grade: educationDetails.degree_grade || "",
            degree_course: educationDetails.degree_course || "",
            degree_university: educationDetails.degree_university || "",
            postdegree_grade: educationDetails.postdegree_grade || "",
            postdegree_course: educationDetails.postdegree_course || "",
            postdegree_university: educationDetails.postdegree_university || "",
          });
        } else {
          console.error("Education details are missing or invalid in the response.");
        }
      } catch (error) {
        console.error("Error fetching working professional details:", error.response || error.message);
      }
    };
    fetchStudentDetails();
  }, [token, navigate]);

  const formatDateToLocal = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toISOString().split("T")[0]; // ✅ Ensures correct date
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChange1 = (e) => {
    const { name, value } = e.target;

    if (["tenth_grade", "twelveth_grade", "degree_grade", "postdegree_grade"].includes(name)) {
      setFormData1((prev) => ({
        ...prev,
        [name]: value === "" ? "" : value, // Handle empty string for numeric fields
      }));
    } else {
      setFormData1((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Function to replace empty strings with null
    const replaceEmptyWithNull = (data) => {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          // Convert empty strings to null
          if (value === "") return [key, null];
  
          // Convert non-numeric empty values explicitly to null
          if (typeof value === "string" && value.trim() === "") return [key, null];
  
          return [key, value];
        })
      );
    };
  
    try {
      const sanitizedFormData = replaceEmptyWithNull(formData);
      const sanitizedFormData1 = replaceEmptyWithNull(formData1);
  
      // Log sanitized data before making the request
     
  
      await axios.put("http://localhost:5000/api/workingprofessional/details", sanitizedFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      await axios.put("http://localhost:5000/api/student/education", sanitizedFormData1, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Sanitized Form Data:", sanitizedFormData);
      console.log("Sanitized Form Data 1:", sanitizedFormData1);
      navigate("/wp/profile");
      setEditMode(false)
      toast.success("Details added successfully!");
      
    } catch (error) {
      console.error("Error adding details:", error);
      toast.error("Failed to add details. Try again.");
    }
  };
  

  return (
    <div className="std-details-containers">
      <header className="std-dashboard-header">
        <div className="std-dashboard-logo">SkillNet</div>
        <button
          className="std-dashboard-logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </button>
      </header>

      {!editMode ? (<>
        <h2>Personal Details</h2>
        <div className="std-details-view">
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Bio:</strong> {formData.bio}</p>
          <p><strong>Date of Birth:</strong> {formData.date_of_birth}</p>
          <p><strong>Phone Number:</strong> {formData.phone_number}</p>
          <p><strong>City:</strong> {formData.city}</p>
          <p><strong>Country:</strong> {formData.country}</p>
          <p><strong>Postal Code:</strong> {formData.postal_code}</p>
          <p><strong>Availability Status:</strong> {formData.availability_status.replace("_", " ")}</p>
          <p><strong>Current Position:</strong> {formData.current_position}</p>
          <p><strong>Company Name:</strong> {formData.company_name}</p>
          <p><strong>Industry:</strong> {formData.industry}</p>
          <p><strong>Years of Experience:</strong> {formData.years_of_experience}</p>
          <p><strong>Resume URL:</strong> <a href={formData.resume_url} target="_blank" rel="noopener noreferrer">{formData.resume_url}</a></p>
          <p><strong>LinkedIn URL:</strong> <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer">{formData.linkedin_url}</a></p>
          <p><strong>GitHub URL:</strong> <a href={formData.github_url} target="_blank" rel="noopener noreferrer">{formData.github_url}</a></p>
        </div>
        <h2>Education Details</h2>
        <div className="std-details-view">
          <p><strong>10th Grade:</strong> {formData1.tenth_grade}</p>
          <p><strong>10th Board:</strong> {formData1.tenth_board}</p>
          <p><strong>10th School:</strong> {formData1.tenth_school}</p>
          <p><strong>12th Grade:</strong> {formData1.twelveth_grade}</p>
          <p><strong>12th Course Combination:</strong> {formData1.twelveth_course_combination}</p>
          <p><strong>12th College:</strong> {formData1.twelveth_college}</p>
          <p><strong>Degree Grade:</strong> {formData1.degree_grade}</p>
          <p><strong>Degree Course:</strong> {formData1.degree_course}</p>
          <p><strong>Degree University:</strong> {formData1.degree_university}</p>
          <p><strong>Post Degree Grade:</strong> {formData1.postdegree_grade}</p>
          <p><strong>Post Degree Course:</strong> {formData1.postdegree_course}</p>
          <p><strong>Post Degree University:</strong> {formData1.postdegree_university}</p>

          <button className="std-edit-btn" onClick={() => setEditMode(true)}>Edit</button>
          <button className="std-goback-btn" onClick={() => navigate("/wp/")}>Go Back</button>

        </div></>
      ) : (
        <form onSubmit={handleSubmit} className="std-details-form">
          
          <h2>Personal Details</h2>
          <div className="">
            <label htmlFor="name">Name:</label>
            <input name="name" id="name" value={formData.name} onChange={handleChange} />

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

            <label htmlFor="current_position">Current Position:</label>
            <input name="current_position" id="current_position" value={formData.current_position} onChange={handleChange} />

            <label htmlFor="company_name">Company Name:</label>
            <input name="company_name" id="company_name" value={formData.company_name} onChange={handleChange} />

            <label htmlFor="industry">Industry:</label>
            <input name="industry" id="industry" value={formData.industry} onChange={handleChange} />

            <label htmlFor="years_of_experience">Years of Experience:</label>
            <input type="number" name="years_of_experience" id="years_of_experience" value={formData.years_of_experience} onChange={handleChange} />

            <label htmlFor="resume_url">Resume URL:</label>
            <input name="resume_url" id="resume_url" value={formData.resume_url} onChange={handleChange} />

            <label htmlFor="linkedin_url">LinkedIn URL:</label>
            <input name="linkedin_url" id="linkedin_url" value={formData.linkedin_url} onChange={handleChange} />

            <label htmlFor="github_url">GitHub URL:</label>
            <input name="github_url" id="github_url" value={formData.github_url} onChange={handleChange} />
          </div>

          <h2>Education Details</h2>
          <div className="std-edit">
            <label htmlFor="tenth_grade">10th Grade:</label>
            <input type="number" name="tenth_grade" value={formData1.tenth_grade} onChange={handleChange1} />

            <label htmlFor="tenth_board">10th Board:</label>
            <input name="tenth_board" value={formData1.tenth_board} onChange={handleChange1} />

            <label htmlFor="tenth_school">10th School:</label>
            <input name="tenth_school" value={formData1.tenth_school} onChange={handleChange1} />

            <label htmlFor="twelveth_grade">12th Grade:</label>
            <input type="number" name="twelveth_grade" value={formData1.twelveth_grade} onChange={handleChange1} />

            <label htmlFor="twelveth_course_combination">12th Course Combination:</label>
            <input name="twelveth_course_combination" value={formData1.twelveth_course_combination} onChange={handleChange1} />

            <label htmlFor="twelveth_college">12th College:</label>
            <input name="twelveth_college" value={formData1.twelveth_college} onChange={handleChange1} />

            <label htmlFor="degree_grade">Degree Grade:</label>
            <input type="number" name="degree_grade" value={formData1.degree_grade} onChange={handleChange1} />

            <label htmlFor="degree_course">Degree Course:</label>
            <input name="degree_course" value={formData1.degree_course} onChange={handleChange1} />

            <label htmlFor="degree_university">Degree University:</label>
            <input name="degree_university" value={formData1.degree_university} onChange={handleChange1} />

            <label htmlFor="postdegree_grade">Post Degree Grade:</label>
            <input type="number" name="postdegree_grade" value={formData1.postdegree_grade} onChange={handleChange1} />

            <label htmlFor="postdegree_course">Post Degree Course:</label>
            <input name="postdegree_course" value={formData1.postdegree_course} onChange={handleChange1} />

            <label htmlFor="postdegree_university">Post Degree University:</label>
            <input name="postdegree_university" value={formData1.postdegree_university} onChange={handleChange1} />

            <button className="user_save" type="submit">Save</button>
            <button className="user_cancel" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </form>
      )}
      <footer className="std-account-footer">
        <p>&copy; 2025 SkillNet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WpProfile;