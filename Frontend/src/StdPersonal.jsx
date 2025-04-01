import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-hot-toast";
import axios from "axios";
import "./StdPersonal.css";

const StdPersonal = () => {
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

  const token = localStorage.getItem("token");

  // ✅ Ensure all fields are filled for redirection
  const checkAllFieldsFilled = (details) => {
    return Object.values(details).every((field) => field !== "" && field !== null);
  };

  // ✅ Convert API date to local date format
  const formatDateToLocal = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toISOString().split("T")[0]; // ✅ Ensures correct date
  };

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

        if (res.data.details) {
          console.log("Fetched Details:", res.data.details);

          const details = res.data.details;
          const updatedFormData = {
            name:details.name||"",
            bio: details.bio || "",
            date_of_birth: formatDateToLocal(details.date_of_birth), // ✅ Fixes date shift
            phone_number: details.phone_number || "",
            city: details.city || "",
            country: details.country || "",
            postal_code: details.postal_code || "",
          };

          setFormData(updatedFormData);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    checkStudentDetails();
  }, [token, navigate]);

  // ✅ Move redirection logic inside `useEffect` to run after `formData` updates
  useEffect(() => {
    if (checkAllFieldsFilled(formData)) {
      console.log("✅ All fields filled, redirecting...");
      navigate("/StdAccount");
    }
  }, [formData, navigate]);

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
    <div className="std-page">
      <header className="dashboard-header">
        <div className="dashboard-logo">SkillNet</div>
        <button className="dashboard-logout-btn" onClick={() => { localStorage.clear(); navigate("/"); }}>
          Logout
        </button>
      </header>

      <div className="std-details-container">
        <h2>Student Details</h2>
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

          <button type="submit" className="std-details-submit">Submit</button>
        </form>
      </div>

      <footer className="dashboard-footer">
        <p>&copy; 2025 SkillNet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StdPersonal;
