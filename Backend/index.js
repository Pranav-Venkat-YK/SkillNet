require("dotenv").config();
const express = require("express");
const cors = require("cors");
const knex = require("./db"); // Ensure you have a `db.js` file for Knex setup
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-key"; // Use .env file

// 🔹 Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Expect "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 🔹 Register User
app.post("/api/user/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await knex("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await knex("users")
      .insert({ name, email, password: hashedPassword })
      .returning(["id", "name", "email"]);

    const token = jwt.sign({ userId: newUser[0].id, userType: "user" }, SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", user: newUser[0], token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
});

// 🔹 Login User
app.post("/api/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await knex("users").where({ email }).first();
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id, userType: "user" }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// 🔹 Get User Profile
app.get("/api/user/me", authenticate, async (req, res) => {
  try {
    if (req.user.userType !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await knex("users").where({ id: req.user.userId }).select("id", "name", "email").first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// 🔹 Register Organization
app.post("/api/org/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingOrg = await knex("organisations").where({ email }).first();
    if (existingOrg) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newOrg = await knex("organisations")
      .insert({ name, email, password: hashedPassword })
      .returning(["id", "name", "email"]);

    const token = jwt.sign({ orgId: newOrg[0].id, userType: "org" }, SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ message: "Organization registered successfully", org: newOrg[0], token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering organization" });
  }
});

// 🔹 Update Organization Details (Protected)
app.put("/api/organisations", authenticate, async (req, res) => {
  const id = req.user.orgId; // Extracted from authentication middleware
  if (!id) {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  const { name, bio, foundeddate, headquarters_address, city, state, country } = req.body;

  try {
    const existingOrg = await knex("organisations").where({ id }).first();
    if (!existingOrg) {
      return res.status(404).json({ error: "Organization not found" });
    }

    await knex("organisations").where({ id }).update({
      name,
      Description: bio,
      founded_date: foundeddate,
      headquarters_address,
      city,
      state,
      country,
      updated_at: knex.fn.now(),
    });

    res.status(200).json({ message: "Organization details updated successfully!" });
  } catch (error) {
    console.error("Database update error:", error);
    res.status(500).json({ error: "Failed to update organization details." });
  }
});

// 🔹 Login Organization
app.post("/api/org/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const org = await knex("organisations").where({ email }).first();
    if (!org) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, org.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ orgId: org.id, userType: "org" }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ message: "Login successful", org: { id: org.id, name: org.name, email: org.email }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// 🔹 Get Organization Profile (Protected)
app.get("/api/org/me", authenticate, async (req, res) => {
  try {
    if (req.user.userType !== "org") {
      return res.status(403).json({ message: "Access denied" });
    }

    const org = await knex("organisations").where({ id: req.user.orgId }).select("id", "name", "email").first();
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({ org });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching organization data" });
  }
});

app.post("/api/student/details", authenticate, async (req, res) => {
  try {
    const studentData = { user_id: req.user.userId, ...req.body };
    await knex("student").insert(studentData).onConflict("user_id").merge();
    res.status(200).json({ message: "Student details added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding student details" });
  }
});

// GET Student Details (Server Side)
app.get("/api/student/details", authenticate, async (req, res) => {
  try {
    const studentDetails = await knex("student")
      .where({ user_id: req.user.userId })
      .first();
    if (studentDetails) {
      res.json({ details: studentDetails });
    } else {
      res.status(404).json({ message: "Student details not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching student details" });
  }
});

// 🔹 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
