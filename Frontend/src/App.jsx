import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import LandingPage from "./LandingPage";
import ExplorePage from "./ExplorePage";
import UserAuth from "./UserAuth";
import OrgAuth from "./OrgAuth";
import UserDashboard from "./UserDashboard";
import OrgDashboard from "./OrgDashboard";

const AuthRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" /> : element;
};

const ProtectedRoute = ({ element, role }) => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token) return <Navigate to="/" />;
  
  if (role && userType !== role) {
    return <Navigate to={`/${userType}-dashboard`} />;
  }

  return element;
};

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/user-auth" element={<AuthRoute element={<UserAuth />} />} />
        <Route path="/org-auth" element={<AuthRoute element={<OrgAuth />} />} />
        
        {/* Separate dashboards */}
        <Route path="/user-dashboard" element={<ProtectedRoute element={<UserDashboard />} role="user" />} />
        <Route path="/org-dashboard" element={<ProtectedRoute element={<OrgDashboard />} role="org" />} />
        
        {/* General dashboard route redirects based on user type */}
        <Route
          path="/dashboard"
          element={
            localStorage.getItem("userType") === "user" ? (
              <Navigate to="/user-dashboard" />
            ) : (
              <Navigate to="/org-dashboard" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
