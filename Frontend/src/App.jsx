import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import LandingPage from "./LandingPage";
import ExplorePage from "./ExplorePage";
import UserAuth from "./UserAuth";
import OrgAuth from "./OrgAuth";
import UserDashboard from "./UserDashboard";
import OrgDashboard from "./OrgDashboard";
import StdPersonal from "./StdPersonal";
import StdAccount from "./StdAccount";
import WpPersonal from "./WpPersonal";
import WpAccount from "./WpAccount";
import StdProfile from "./StdProfile";
import WpProfile from "./WpProfile";
import OrgHome from "./OrgHome";
import OrgProfile from "./OrgProfile";
import OrgJob from "./OrgJob";
import JobDetails from "./JobDetails";
import StudentHome from "./StudentHome";
import WpHome from "./WpHome";
import JobApplicants from "./JobApplicants";
import CandProf from "./CandProf";
import InterSche from "./InterSche";
import SavedJobs from "./SavedJobs";
import SavedJobs_wp from "./SavedJobs_wp";
import StudentInterviews from "./StudentInterview";
import WPInterviews from "./WPInterview";
import StudentApplications from "./StudentApplications";
import WPApplications from "./WPApplications";
import JobPostings from "./JobPostings";
import OrgInterviews from "./OrgInterview";
import OrgApplications from "./OrgApplications";
import AboutUs from "./AboutUs"; 

const AuthRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" /> : element;
};

const ProtectedRoute = ({ element, role }) => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token) return <Navigate to="/" />;
  
  if (role && userType !== role) {
    return <Navigate to={`/${userType.toLowerCase()}-dashboard`} />;
  }

  return element;
};

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/aboutus" element ={<AboutUs/>}/>
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/user-auth" element={<AuthRoute element={<UserAuth />} />} />
        <Route path="/org-auth" element={<AuthRoute element={<OrgAuth />} />} />
        
        <Route path="/StdPersonal" element={<ProtectedRoute element={<StdPersonal />} />} />
        <Route path="/StdAccount" element={<ProtectedRoute element={<StdAccount />} />} />

        <Route path="/WpPersonal" element={<ProtectedRoute element={<WpPersonal />} />} />
        <Route path="/WpAccount" element={<ProtectedRoute element={<WpAccount />} />} />
        
        {/* Separate dashboards */}
        <Route path="/user-dashboard" element={<ProtectedRoute element={<UserDashboard />} role="user" />} />
        <Route path="/org-dashboard" element={<ProtectedRoute element={<OrgDashboard />} role="org" />} />
        <Route path="/std/profile" element={<ProtectedRoute element={<StdProfile />} />} />
        <Route path="/wp/profile" element={<ProtectedRoute element={<WpProfile />} />} />
        <Route path="/org/" element={<ProtectedRoute element={<OrgHome />} />} />
        <Route path="/org/profile" element={<ProtectedRoute element={<OrgProfile />} />} />
        <Route path="/org/job" element={<ProtectedRoute element={<OrgJob />} />} />
        <Route path="/org/applications" element={<ProtectedRoute element={<OrgApplications />} />} />
        
        {/* Student routes */}
        <Route path="/std/" element={<ProtectedRoute element={<StudentHome />} />} />
        <Route path="/wp/" element={<ProtectedRoute element={<WpHome />} />} />
        <Route path="/std/jobs/:jobId" element={<ProtectedRoute element={<JobDetails />} />} />
        <Route path="/org/jobs/:jobId/applicants" element={<JobApplicants />} />
        <Route path="/org/jobs/:jobId/applicants/:applicationId" element={<CandProf />} />
        <Route path="/org/jobs/:jobId/applicants/:applicationId/schedule-interview" element={<InterSche />} /> 
        <Route path="/std/saved-jobs" element={<ProtectedRoute element={<SavedJobs />} />} />
        <Route path="/wp/saved-jobs" element={<ProtectedRoute element={<SavedJobs_wp />} />} />
        <Route path="/std/interviews" element={<ProtectedRoute element={<StudentInterviews />} />} />
        <Route path="/wp/interviews" element={<ProtectedRoute element={<WPInterviews />} />} />
        <Route path="/std/applications" element={<ProtectedRoute element={<StudentApplications />} />} />
        <Route path="/wp/applications" element={<ProtectedRoute element={<WPApplications />} />} />
        <Route path="/org/interviews" element={<ProtectedRoute element={<OrgInterviews />} />} />
         {/* <Route path="/org/applications" element={<ProtectedRoute element={<JobApplicants />} />} />
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
          <Route path="/org/jobs" element = {<ProtectedRoute element={<JobPostings />} />}/>
      </Routes>
    </Router>
  );
}

export default App;




