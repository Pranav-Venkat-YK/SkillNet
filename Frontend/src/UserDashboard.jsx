import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data.user);
      } catch (error) {
        alert("Session expired, please log in again.");
        localStorage.clear();
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const redirectToDetails = (type) => {
    if (type === "student") {
      navigate("/StdPersonal");
    } else {
      navigate("/WpPersonal");
    }
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
          <h2 className="dashboard-welcome">Welcome, {userData?.name || "User"}!</h2>
          <p className="dashboard-info">Email: {userData?.email || "N/A"}</p>
          <div className="dashboard-actions">
            <button className="dashboard-btn primary" onClick={() => redirectToDetails("student")}>
              I'm a Student
            </button>
            <button className="dashboard-btn secondary" onClick={() => redirectToDetails("working")}>
              I'm a Working Professional
            </button>
          </div>
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>© 2025 SkillNet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default UserDashboard;
