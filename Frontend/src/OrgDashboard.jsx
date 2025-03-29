import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const OrgDashboard = () => {
  const navigate = useNavigate();
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

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
        alert("Session expired, please log in again.");
        localStorage.clear();
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">SkillNet</h1>
        <button className="dashboard-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2 className="dashboard-welcome">Welcome, {orgData?.name || "Organization"}!</h2>
          <p className="dashboard-info">Email: {orgData?.email || "N/A"}</p>
          <div className="dashboard-actions">
            <button className="dashboard-btn secondary">Manage Listings</button>
            <button className="dashboard-btn secondary">View Settings</button>
          </div>
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>© 2025 SkillNet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OrgDashboard;