import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserAuth.css"

const UserAuth = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/user/register", registerData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userType", "user");
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);

      alert("Registration successful!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/user/login", loginData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userType", "user");
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);

      alert("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="uaauth-page">
        <header>
        {/* <a href={() => navigate("/") }className="uaback-icon">←</a> */}
        <button className="uaback-icon" onClick={() => navigate("/explore")}>←</button>
        <div className="ualogo">SkillNet</div>
      </header>

      {isRegistering ? (
        <>
          <main>
            <div className="ualogin-container">
            <div className="ualogin-header">
            <h2>Create Account</h2>
            <p>Join SkillNet today</p>
          </div>
          <form id="loginForm" onSubmit={handleRegister}>
            <div className="uaform-group">
              <label htmlFor="name">Username</label>
              <input type="text" id="name" name="name" placeholder="Name" onChange={handleRegisterChange} required />
            </div>
            <div className="uaform-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" name="email" id="email" placeholder="Email" onChange={handleRegisterChange} required />
            </div>
            <div className="uaform-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" placeholder="Password" onChange={handleRegisterChange} required />
            </div>
            <button className="uabtn uabtn-primary" type="submit">Sign Up</button>
           
            <div className="para">
            <p className="ualogin-p"  >Already have an account?</p>
            <p className="ualogin-link" onClick={() => setIsRegistering(false)} style={{ cursor: "pointer" }}>
             Log In
          </p>
            </div>
            
          </form>
          
            </div>
          </main>
        </>
      ) : (
        <>
        <main>
          
        <div className="ualogin-container">
          <div className="ualogin-header">
            <h2>Welcome Back</h2>
            <p>Please sign in to continue</p>
          </div>
          <form id="loginForm" onSubmit={handleLogin}>
            <div className="uaform-group">
            <label htmlFor="email">Email Address</label>
            <input type="email"id="email" name="email" placeholder="Email" onChange={handleLoginChange} required />
            </div>
            <div className="uaform-group">
            <label htmlFor="password">Password</label>
            <input type="password"  id="password" name="password" placeholder="Password" onChange={handleLoginChange} required />
            </div>
            <button className="uabtn uabtn-primary" type="submit">Log In</button>
            <button className="uabtn uabtn-secondary" onClick={() => setIsRegistering(true)}>Create Account</button>
          </form>
          
          </div>
        </main>
        </>
      )}
      <footer>
        <p>&copy; 2025 SkillNet. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default UserAuth;
