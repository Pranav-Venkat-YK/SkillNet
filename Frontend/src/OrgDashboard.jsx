import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import "./OrgDashboard.css";

const OrgDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    foundeddate: "",
    headquarters_address: "",
    city: "",
    state: "",
    country: "",
  });
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add a separate effect just for the redirect
  useEffect(() => {
    // Check for existing details in localStorage first
    const existingDetailsChecked = localStorage.getItem("detailsChecked");
    
    // If we've already checked and redirected, don't do it again
    if (existingDetailsChecked === "true") {
      setLoading(false);
      return;
    }

    if (!token) {
      navigate("/");
      return;
    }
    
    const checkCompletedDetails = async () => {
      try {
        // First fetch basic org data
        const response = await axios.get("http://localhost:5000/api/org/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrgData(response.data.org);
        
        // Then fetch detailed org information - use the correct endpoint from your backend
        // Make sure this endpoint exists on your backend
        const detailsResponse = await axios.get("http://localhost:5000/api/org/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("Details response:", detailsResponse.data);
        
        if (detailsResponse.data.details) {
          const details = detailsResponse.data.details;
          
          // Check if all required fields are completed
          const hasDescription = details.Description && details.Description.trim() !== "";
          const hasFoundedDate = details.founded_date && details.founded_date.trim() !== "";
          const hasAddress = details.headquarters_address && details.headquarters_address.trim() !== "";
          const hasCity = details.city && details.city.trim() !== "";
          const hasCountry = details.country && details.country.trim() !== "";
          
          // Log the check results for debugging
          console.log("Fields check:", {
            hasDescription,
            hasFoundedDate,
            hasAddress,
            hasCity,
            hasCountry
          });
          
          const isComplete = hasDescription && hasFoundedDate && hasAddress && hasCity && hasCountry;
          
          console.log("Details complete:", isComplete);
          
          // Set form data regardless
          setFormData({
            name: details.name || response.data.org.name,
            bio: details.Description || "",
            foundeddate: details.founded_date || "",
            headquarters_address: details.headquarters_address || "",
            city: details.city || "",
            state: details.state || "",
            country: details.country || "",
          });
          
          // Mark that we've checked for details
          localStorage.setItem("detailsChecked", "true");
          
          // If details are complete, immediately navigate to main
          if (isComplete) {
            console.log("Redirecting to main page...");
            navigate("/org/main");
            return; // Exit early
          }
        }
      } catch (error) {
        console.error("Error checking completed details:", error);
        // If API doesn't exist yet, continue to show the form
      } finally {
        setLoading(false);
      }
    };
    
    checkCompletedDetails();
  }, [navigate, token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/api/organisations", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Details updated successfully!");
      // Clear the check flag so we recheck on next load
      localStorage.removeItem("detailsChecked");
      // Navigate to the main dashboard after successful submission
      navigate("/org/main");
    } catch (error) {
      console.error("Error updating details:", error);
      toast.error("Failed to update details. Try again.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  // Show the form to complete details
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
          <label>Organization Name:</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name || (orgData ? orgData.name : "")} 
            onChange={handleChange} 
            placeholder="Organization name" 
          />
          <label>Bio:</label>
          <textarea 
            name="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            placeholder="Tell us about your organization..." 
          />
          <label>Founded Date:</label>
          <input 
            type="date" 
            name="foundeddate" 
            value={formData.foundeddate} 
            onChange={handleChange} 
          />
          <label>Headquarters Address:</label>
          <textarea 
            name="headquarters_address" 
            value={formData.headquarters_address} 
            onChange={handleChange} 
            placeholder="Enter your main office address..." 
          />
          <div className="form-grid">
            <input 
              type="text" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              placeholder="City" 
            />
            <input 
              type="text" 
              name="state" 
              value={formData.state} 
              onChange={handleChange} 
              placeholder="State" 
            />
            <input 
              type="text" 
              name="country" 
              value={formData.country} 
              onChange={handleChange} 
              placeholder="Country" 
            />
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