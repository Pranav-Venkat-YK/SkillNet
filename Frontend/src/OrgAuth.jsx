import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import axios from "axios";
// import "./OrgAuth.css";

const OrgAuth = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/org/register", registerData);
      const { token, org } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userType", "org");
      localStorage.setItem("orgName", org.name);
      localStorage.setItem("orgEmail", org.email);

      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/org/login", loginData);
      const { token, org } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userType", "org");
      localStorage.setItem("orgName", org.name);
      localStorage.setItem("orgEmail", org.email);

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className = "uaauth-page">
      <header >
        <button className = "uaback-icon" onClick={() => navigate("/explore")}>←</button>
        <div className = "ualogo">SkillNet</div>
      </header>

      {isRegistering ? (
        <div className="uamain">
          <div className = "ualogin-container">
            <div className = "ualogin-header">
              <h2>Create Account</h2>
              <p>Join SkillNet today</p>
            </div>
            <form id="registerForm" onSubmit={handleRegister}>
              <div className = "uaform-group">
                <label htmlFor="name">Organization Name</label>
                <input type="text" id="name" name="name" placeholder="Organization Name" onChange={handleRegisterChange} required />
              </div>
              <div className = "uaform-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" placeholder="Email" onChange={handleRegisterChange} required />
              </div>
              <div className = "uaform-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Password" onChange={handleRegisterChange} required />
              </div>
              <button className = "uabtn uabtn-primary" type="submit">Sign Up</button>
              <div className="para">
            <p className="ualogin-p"  >Already have an account?</p>
            <p className="ualogin-link" onClick={() => setIsRegistering(false)} style={{ cursor: "pointer" }}>
             Log In
          </p>
            </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="uamain">
          <div className = "ualogin-container">
            <div className = "ualogin-header">
              <h2>Welcome Back</h2>
              <p>Please sign in to continue</p>
            </div>
            <form id="loginForm" onSubmit={handleLogin}>
              <div className = "uaform-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" placeholder="Email" onChange={handleLoginChange} required />
              </div>
              <div className = "uaform-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Password" onChange={handleLoginChange} required />
              </div>
              <button className = "uabtn uabtn-primary" type="submit">Log In</button>
              <button className = "uabtn uabtn-secondary" onClick={() => setIsRegistering(true)}>Create Organization</button>
            </form>
          </div>
        </div>
      )}
      <footer>
        <p>&copy; 2025 SkillNet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OrgAuth;
