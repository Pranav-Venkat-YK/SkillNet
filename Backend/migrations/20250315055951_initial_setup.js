import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OrgDashboard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    description: "",
    industry: "",
    founded_date: "",
    headquarters_address: "",
    pincode: "",
    city: "",
    state: "",
    country: "",
    website_url: "",
  });

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form data to backend
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/organisations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Organisation added successfully!");
        setFormData({
          name: "",
          email: "",
          password: "",
          description: "",
          industry: "",
          founded_date: "",
          headquarters_address: "",
          pincode: "",
          city: "",
          state: "",
          country: "",
          website_url: "",
        });
      } else {
        alert("Failed to add organisation");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting form");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="org-details-form">
        <label htmlFor="name">Name:</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required />

        <label htmlFor="email">Email:</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />

        <label htmlFor="password">Password:</label>
        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required />

        <label htmlFor="description">Description:</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange}></textarea>

        <label htmlFor="industry">Industry:</label>
        <input type="text" name="industry" id="industry" value={formData.industry} onChange={handleChange} />

        <label htmlFor="founded_date">Founded Date:</label>
        <input type="date" name="founded_date" id="founded_date" value={formData.founded_date} onChange={handleChange} />

        <label htmlFor="headquarters_address">Headquarters Address:</label>
        <textarea name="headquarters_address" id="headquarters_address" value={formData.headquarters_address} onChange={handleChange}></textarea>

        <label htmlFor="pincode">Pincode:</label>
        <input type="text" name="pincode" id="pincode" value={formData.pincode} onChange={handleChange} />

        <label htmlFor="city">City:</label>
        <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} />

        <label htmlFor="state">State:</label>
        <input type="text" name="state" id="state" value={formData.state} onChange={handleChange} />

        <label htmlFor="country">Country:</label>
        <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} />

        <label htmlFor="website_url">Website URL:</label>
        <input type="text" name="website_url" id="website_url" value={formData.website_url} onChange={handleChange} />

        <button type="submit">Submit</button>
      </form>

      <button className="dashboard-logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default OrgDashboard;
