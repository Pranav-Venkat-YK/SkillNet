import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import ExplorePage from "./ExplorePage";
import UserAuth from "./UserAuth";
import OrgAuth from "./OrgAuth";
import Dashboard from "./Dashboard";

const AuthRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" /> : element;
};

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/user-auth" element={<AuthRoute element={<UserAuth />} />} />
        <Route path="/org-auth" element={<AuthRoute element={<OrgAuth />} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      </Routes>
    </Router>
  );
}

export default App;
