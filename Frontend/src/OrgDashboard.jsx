import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-hot-toast";
import axios from "axios";
import "./OrgDashboard.css";

const OrgDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    bio: "",
    foundeddate: "",
    headquarters_address: "",
    city: "",
    state: "",
    country: "",
  });

  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchOrgData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/org/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrgData(response.data.org);
      } catch (error) {
        toast.error("Session expired, please log in again.");
        localStorage.clear();
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
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
      navigate("/dashboard");
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

          <label>Bio:</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about your organization..." />

          <label>Founded Date:</label>
          <input type="date" name="foundeddate" value={formData.foundeddate} onChange={handleChange} />

          <label>Headquarters Address:</label>
          <textarea name="headquarters_address" value={formData.headquarters_address} onChange={handleChange} placeholder="Enter your main office address..." />

          <div className="form-grid">
            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
            <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
            <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
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
