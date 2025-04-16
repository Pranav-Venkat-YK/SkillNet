require("dotenv").config();
const express = require("express");
const cors = require("cors");
const knex = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-key";

// 🔹 Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
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

// const authenticate = (req, res, next) => {
//   const token = req.header("Authorization")?.split(" ")[1]; // Expect "Bearer <token>"
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized, token missing" });
//   }

//   try {
//     const decoded = jwt.verify(token, SECRET_KEY);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

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

  const { name, bio, foundeddate, headquarters_address, city, state, country, website_url, industry} = req.body;

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
      website_url,
      industry,
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

app.post("/api/workingprofessional/details", authenticate, async (req, res) => {
  try {
    const workingprofessionalData = { user_id: req.user.userId, ...req.body };
    await knex("workingprofessional").insert(workingprofessionalData).onConflict("user_id").merge();
    res.status(200).json({ message: "Working Professional details added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding Working Professional details" });
  }
});

app.post("/api/student/education", authenticate, async (req, res) => {
  try {
    const studentData = { user_id: req.user.userId, ...req.body };
    await knex("education").insert(studentData).onConflict("user_id").merge();
    res.status(200).json({ message: "Education details added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding education details" });
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

app.get("/api/workingprofessional/details", authenticate, async (req, res) => {
  try {
    const workingprofessionalDetails = await knex("workingprofessional")
      .where({ user_id: req.user.userId })
      .first();
    if (workingprofessionalDetails) {
      res.json({ details: workingprofessionalDetails });
    } else {
      res.status(404).json({ message: "Working Professional details not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching Working Professional details" });
  }
});


app.get("/api/student/education", authenticate, async (req, res) => {
  try {
    // Fetch education details using knex, assuming education table has a column `user_id`
    const educationDetails = await knex("education")
      .where({ user_id: req.user.userId }) // Match user_id from authenticated user
      .first(); // Get the first result (as each user has one record)

    if (educationDetails) {
      res.json({ educationDetails });
    } else {
      res.status(404).json({ message: "Education details not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching education details" });
  }
});


app.put("/api/student/details", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract user ID from the token
    const updatedData = req.body; // Get updated fields from request body

    const student = await knex("student").where({ user_id: userId }).first();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await knex("student").where({ user_id: userId }).update(updatedData);

    const updatedStudent = await knex("student").where({ user_id: userId }).first(); // Fetch updated record

    res.status(200).json({ message: "Details updated successfully", details: updatedStudent });
  } catch (error) {
    console.error("Error updating student details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/api/workingprofessional/details", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract user ID from the token
    const updatedData = req.body; // Get updated fields from request body

    const workingprofessional = await knex("workingprofessional").where({ user_id: userId }).first();
    if (!workingprofessional) {
      return res.status(404).json({ message: "Student not found" });
    }

    await knex("workingprofessional").where({ user_id: userId }).update(updatedData);

    const updatedStudent = await knex("workingprofessional").where({ user_id: userId }).first(); // Fetch updated record

    res.status(200).json({ message: "Details updated successfully", details: updatedStudent });
  } catch (error) {
    console.error("Error updating workingprofessional details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.put("/api/student/education", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract user ID from the token
    const updatedData = req.body; // Get updated fields from request body

    const student = await knex("education").where({ user_id: userId }).first();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await knex("education").where({ user_id: userId }).update(updatedData);

    const updatedStudent = await knex("education").where({ user_id: userId }).first(); // Fetch updated record

    res.status(200).json({ message: "Details updated successfully", details: updatedStudent });
  } catch (error) {
    console.error("Error updating student details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Get Organization Details (Protected)
app.get("/api/org/details", authenticate, async (req, res) => {
  try {
    if (req.user.userType !== "org") {
      return res.status(403).json({ message: "Access denied" });
    }

    const details = await knex("organisations")
      .where({ id: req.user.orgId })
      .select("*")
      .first();
      
    if (!details) {
      return res.status(404).json({ message: "Organization details not found" });
    }

    res.json({ details });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching organization details" });
  }
});
// Place this code in your server file (e.g., index.js or a dedicated routes file)

app.post("/api/org/jobs", authenticate, async (req, res) => {
  // Ensure that only organisation users can post jobs
  if (req.user.userType !== "org") {
    return res.status(403).json({ message: "Access denied" });
  }

  // Destructure job details from the request body
  const {
    title,
    description,
    requirements,
    responsibilities,
    location,
    is_remote,
    salary_min,
    salary_max,
    salary_currency,
    employment_type,
    experience_level,
    education_level,
    domain_of_study,
    application_deadline,
    status,
    orgId, // optional if you want to pass it explicitly; you can also use req.user.orgId
  } = req.body;

  try {
    // Use the organisation ID from the token to ensure data integrity
    const organisationId = req.user.orgId;

    // Insert the new job into the jobs table using Knex
    const newJob = await knex("jobs")
  .insert({
    id: req.user.orgId, // using "id" as defined in your migration
    title,
    description,
    requirements,
    responsibilities,
    location,
    is_remote,
    salary_min,
    salary_max,
    salary_currency,
    employment_type,
    experience_level,
    education_level,
    domain_of_study,
    application_deadline,
    status,
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  })
  .returning("*");

    res.status(201).json({ message: "Job posted successfully!", job: newJob[0] });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Failed to post job." });
  }
});

// In your Express server file (e.g., index.js or routes file)

// GET jobs for the logged-in organization
app.get("/api/org/jobs", authenticate, async (req, res) => {
  // Ensure that only organization users can fetch jobs
  if (req.user.userType !== "org") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    // "id" column in jobs table references the organisation's id
    const jobs = await knex("jobs").where({ id: req.user.orgId });
    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Error fetching jobs." });
  }
});
app.get("/api/student/jobs", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId; // Get current user ID

    const jobs = await knex('jobs')
      .join('organisations', 'jobs.id', 'organisations.id')
      .leftJoin('bookmarks', function() {
        this.on('bookmarks.job_id', '=', 'jobs.job_id') // Correct job ID reference
           .andOn('bookmarks.user_id', '=', userId) // Current user check
      })
      .select(
        'jobs.*',
        'organisations.name as company_name',
        'organisations.Description as company_description',
        'organisations.website_url as company_website',
        'organisations.industry as company_industry',
        knex.raw('bookmarks.job_id IS NOT NULL as is_bookmarked') // Boolean bookmark status
      );

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ 
      message: "Error fetching jobs.",
      error: error.message
    });
  }
});



// Similarly update /api/wp/jobs endpoint
app.get("/api/wp/jobs", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const jobs = await knex('jobs')
      .join('organisations', 'jobs.id', 'organisations.id')
      .leftJoin('bookmarks', function() {
        this.on('bookmarks.job_id', '=', 'jobs.job_id')
           .andOn('bookmarks.user_id', '=', userId)
      })
      .select(
        'jobs.*',
        'organisations.name as company_name',
        'organisations.Description as company_description',
        'organisations.website_url as company_website',
        'organisations.industry as company_industry',
        knex.raw('bookmarks.job_id IS NOT NULL as is_bookmarked')
      );

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ 
      message: "Error fetching jobs.",
      error: error.message
    });
  }
});
// 🔹 Get Job Details
app.get("/api/jobs/:jobId", async (req, res) => {
  try {
    const job = await knex('jobs')
      .where('jobs.job_id', req.params.jobId)
      .join('organisations', 'jobs.id', 'organisations.id')
      .select(
        'jobs.*',
        'organisations.name as company_name',
        'organisations.Description as company_description',
        'organisations.website_url as company_website',
        'organisations.industry as company_industry'
      )
      .first();
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

// 🔹 Check Bookmark Status
app.get("/api/jobs/:jobId/bookmark-status", authenticate, async (req, res) => {
  try {
    const bookmark = await knex('bookmarks')
      .where({
        job_id: req.params.jobId,
        user_id: req.user.userId
      })
      .first();
    
    res.json({ isBookmarked: !!bookmark });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check bookmark status' });
  }
});

// 🔹 Toggle Bookmark
app.post("/api/jobs/:jobId/bookmark", authenticate, async (req, res) => {
  try {
    const existing = await knex('bookmarks')
      .where({
        job_id: req.params.jobId,
        user_id: req.user.userId
      })
      .first();

    if (existing) {
      await knex('bookmarks').where('bookmark_id', existing.bookmark_id).del();
      return res.json({ bookmarked: false });
    } else {
      const [bookmark] = await knex('bookmarks').insert({
        job_id: req.params.jobId,
        user_id: req.user.userId
      }).returning('*');
      return res.json({ bookmarked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// 🔹 Check Application Status
app.get("/api/jobs/:jobId/application-status", authenticate, async (req, res) => {
  try {
    const application = await knex('applications')
      .where({
        job_id: req.params.jobId,
        user_id: req.user.userId
      })
      .first();
    
    res.json({ hasApplied: !!application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check application status' });
  }
});
// Get all saved jobs for a student
app.get("/api/student/saved-jobs", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const savedJobs = await knex('bookmarks')
      .where('bookmarks.user_id', userId)
      .join('jobs', 'bookmarks.job_id', 'jobs.job_id')
      .join('organisations', 'jobs.id', 'organisations.id')
      .select(
        'jobs.*',
        'organisations.name as company_name',
        'bookmarks.created_at as bookmarked_at'
      )
      .orderBy('bookmarks.created_at', 'desc');

    // Check if user has applied to these jobs
    const applications = await knex('applications')
      .where('user_id', userId)
      .select('job_id', 'status');

    const jobsWithApplicationStatus = savedJobs.map(job => {
      const application = applications.find(app => app.job_id === job.job_id);
      return {
        ...job,
        has_applied: !!application,
        application_status: application?.status || null
      };
    });

    res.json({ 
      success: true,
      jobs: jobsWithApplicationStatus 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: 'Failed to fetch saved jobs',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.post("/api/student/jobs/:jobId/bookmark", authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId;

    // Validate jobId is a number
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    // Check if the job exists
    const jobExists = await knex('jobs').where('job_id', jobId).first();
    if (!jobExists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if bookmark already exists
    const existingBookmark = await knex('bookmarks')
      .where({
        job_id: jobId,
        user_id: userId
      })
      .first();

    if (existingBookmark) {
      // Remove bookmark if it exists
      await knex('bookmarks').where('bookmark_id', existingBookmark.bookmark_id).del();
      return res.json({ 
        success: true,
        bookmarked: false,
        message: 'Bookmark removed successfully'
      });
    } else {
      // Add new bookmark
      await knex('bookmarks').insert({
        job_id: jobId,
        user_id: userId
      });
      return res.json({ 
        success: true,
        bookmarked: true,
        message: 'Bookmark added successfully'
      });
    }
  } catch (err) {
    console.error('Bookmark error:', err);
    
    if (err.code === '23503') { // Foreign key violation
      return res.status(404).json({ error: 'Job or user not found' });
    }
    
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Bookmark already exists' });
    }
    
    res.status(500).json({ 
      error: 'Failed to toggle bookmark',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// app.get("/api/student/interviews", authenticate, async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     console.log(userId);

//     const interviews = await knex('interviews')
//       .join('applications', 'interviews.application_id', 'applications.application_id')
//       .join('jobs', 'applications.job_id', 'jobs.job_id')
//       .join('organisations', 'jobs.job_id', 'organisations.id')
//       .where('applications.user_id', userId)
//       .select(
//         'interviews.interview_id',
//         'interviews.scheduled_time',
//         'jobs.job_id',
//         'interviews.duration_minutes',
//         'interviews.interview_type',
//         'interviews.location_or_link',
//         'interviews.interviewer_name',
//         'interviews.interviewer_position',
//         'interviews.status',
//         'interviews.feedback',
//         'jobs.title as job_title',
//         'organisations.name as organisation_name'
//       )
//       .orderBy('interviews.scheduled_time', 'asc');

//     res.json({ interviews });
//   } catch (error) {
//     console.error('Error fetching interviews:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.get("/api/student/interviews", authenticate, async (req, res) => {
  try {
    console.log(req.user);
    const studentId = req.user.userId;

    const interviews = await knex('interviews')
      .join('applications','interviews.application_id','applications.application_id')
      .join('jobs', 'applications.job_id', 'jobs.job_id')
      .join('organisations', 'jobs.id', 'organisations.id')
      .where('applications.user_id', studentId)
      .select(
        'interviews.*',
        'applications.application_id',
        'applications.job_id',
        'applications.resume_url',
        'applications.status',
        'applications.applied_at',
        'applications.updated_at',
        'jobs.title as job_title',
        'jobs.location',
        'jobs.is_remote',
        'jobs.employment_type',
        'jobs.salary_min',
        'jobs.salary_max',
        'jobs.salary_currency',
        'organisations.name'
        // knex.raw('COALESCE(companies.name, organisations.name) as company_name')
      )
      .orderBy('applications.updated_at', 'desc');

    res.json({ 
      success: true, 
      interviews 
    });

  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications"
    });
  }
});
// 🔹 Submit Application
app.post("/api/jobs/:jobId/apply", authenticate, upload.single('resume'), async (req, res) => {
  try {
    // Check if already applied
    const existing = await knex('applications')
      .where({
        job_id: req.params.jobId,
        user_id: req.user.userId
      })
      .first();

    if (existing) {
      return res.status(400).json({ error: 'Already applied to this job' });
    }

    // Save resume file and get URL
    const resumeUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Create application
    const [application] = await knex('applications').insert({
      job_id: req.params.jobId,
      user_id: req.user.userId,
      resume_url: resumeUrl,
      status: 'applied'
    }).returning('*');

    // Increment applications count
    await knex('jobs')
      .where('job_id', req.params.jobId)
      .increment('applications_count', 1);

    res.json({ success: true, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// 🔹 Get Jobs with Application Status (for student dashboard)
app.get("/api/student/jobs", authenticate, async (req, res) => {
  try {
    const jobs = await knex('jobs')
      .leftJoin('applications', function() {
        this.on('jobs.job_id', '=', 'applications.job_id')
           .andOn('applications.user_id', '=', knex.raw('?', [req.user.userId]));
      })
      .leftJoin('bookmarks', function() {
        this.on('jobs.job_id', '=', 'bookmarks.job_id')
           .andOn('bookmarks.user_id', '=', knex.raw('?', [req.user.userId]));
      })
      .leftJoin('organisations', 'jobs.id', 'organisations.id')
      .select(
        'jobs.*',
        'organisations.name as company_name',
        'applications.application_id',
        'applications.status as application_status',
        knex.raw('CASE WHEN applications.job_id IS NOT NULL THEN true ELSE false END as has_applied'),
        knex.raw('CASE WHEN bookmarks.job_id IS NOT NULL THEN true ELSE false END as is_bookmarked')
      );

    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// 🔹 Get Organization's Jobs
app.get("/api/org/jobs", authenticate, async (req, res) => {
  if (req.user.userType !== "org") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const jobs = await knex('jobs')
      .where('id', req.user.orgId)
      .leftJoin('applications', 'jobs.job_id', 'applications.job_id')
      .select(
        'jobs.*',
        knex.raw('COUNT(applications.application_id) as applications_count')
      )
      .groupBy('jobs.job_id');

    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch organization jobs' });
  }
});
app.get("/api/org/interviews", authenticate, async (req, res) => {
  if (req.user.userType !== "org") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const interviews = await knex('interviews')
      .join('applications', 'applications.application_id', 'interviews.application_id')
      .join('jobs', 'applications.job_id', 'jobs.job_id')
      .join('users', 'applications.user_id', 'users.id')
      .leftJoin('student', 'users.id', 'student.user_id')
      .leftJoin('workingprofessional', 'users.id', 'workingprofessional.user_id')
      .where('jobs.id', req.user.orgId) 
      .select(
        'interviews.*',
        'applications.*',
        'jobs.title as job_title',
        'users.name as student_name',
        'users.email',
        'student.phone_number',
        'student.resume_url as student_resume',
        'workingprofessional.resume_url as professional_resume',
        'workingprofessional.current_position',
        'workingprofessional.company_name as current_company',
        'workingprofessional.years_of_experience'
      )
      .orderBy('applications.applied_at', 'desc');

      if (!interviews) {
        return res.status(404).json({ error: 'Interviews not found or unauthorized' });
      }
      res.json({ interviews });

  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Get Applications for a company
app.get("/api/org/applications", authenticate, async (req, res) => {
  if (req.user.userType !== "org") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    // Get all applications for jobs posted by this organization
    const applications = await knex('applications')
      .join('jobs', 'applications.job_id', 'jobs.job_id')
      .join('users', 'applications.user_id', 'users.id')
      .leftJoin('student', 'users.id', 'student.user_id')
      .leftJoin('workingprofessional', 'users.id', 'workingprofessional.user_id')
      .where('jobs.id', req.user.orgId) // Filter by organization ID
      .select(
        'applications.*',
        'jobs.title as job_title',
        'users.name as student_name',
        'users.email',
        'student.phone_number',
        'applications.resume_url as student_resume',
        'workingprofessional.resume_url as professional_resume',
        'workingprofessional.current_position',
        'workingprofessional.company_name as current_company',
        'workingprofessional.years_of_experience'
      )
      .orderBy('applications.applied_at', 'desc');

    // Format the response data
    const formattedApplications = applications.map(app => ({
      application_id: app.application_id,
      job_id: app.job_id,
      job_title: app.job_title,
      student_name: app.student_name,
      email: app.email,
      phone: app.phone_number || 'Not provided',
      resume_url: app.student_resume || app.professional_resume,
      current_position: app.current_position || 'Student',
      current_company: app.current_company || 'N/A',
      experience: app.years_of_experience ? `${app.years_of_experience} years` : 'Student',
      status: app.status,
      applied_at: new Date(app.applied_at).toLocaleDateString(),
    }));
    if (!applications) {
      return res.status(404).json({ error: 'Applications not found or unauthorized' });
    }

    res.json({ 
      applications: formattedApplications,
      total: formattedApplications.length
    });
  } catch (err) {
    console.error("Error fetching organization applications:", err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// // In your interviews route file (e.g., routes/interviews.js)
// app.put('/api/org/interviews/:interviewId/cancel', authenticate, async (req, res) => {
//   try {
//     await knex.transaction(async (trx) => {
//       // 1. First get the application_id before deleting
//       const interview = await trx('interviews')
//         .where('interview_id', interviewId)
//         .first();

//       if (!interview) {
//         throw new Error('Interview not found');
//       }

//       // 2. Delete the interview
//       await trx('interviews')
//         .where('interview_id', interviewId)
//         .del();

//       // 3. Update the application status back to 'applied'
//       await trx('applications')
//         .where('application_id', interview.application_id)
//         .update({
//           status: 'applied',
//           updated_at: knex.fn.now()
//         });
//     });

//     res.status(200).json({ message: 'Interview deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting interview:', error);
//     res.status(500).json({ error: 'Failed to delete interview' });
//   }
// });

// 🔹 Get Applications for a Job
app.get("/api/jobs/:jobId/applications", authenticate, async (req, res) => {
  if (req.user.userType !== "org") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    // Verify the job belongs to the organization
    const job = await knex('jobs')
      .where({
        job_id: req.params.jobId,
        id: req.user.orgId
      })
      .first();

    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    const applications = await knex('applications')
      .where('job_id', req.params.jobId)
      .join('users', 'applications.user_id', 'users.id')
      .leftJoin('student', 'users.id', 'student.user_id')
      .leftJoin('workingprofessional', 'users.id', 'workingprofessional.user_id')
      .select(
        'applications.*',
        'users.name as applicant_name',
        'users.email as applicant_email',
        'student.resume_url as student_resume',
        'workingprofessional.resume_url as professional_resume'
      );

    res.json({ applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get specific job details (for students)
app.get("/api/student/jobs/:jobId", authenticate, async (req, res) => {
  try {
    const job = await knex('jobs')
      .where('jobs.job_id', req.params.jobId)
      .join('organisations', 'jobs.id', 'organisations.id')
      .select(
        'jobs.*',
        'organisations.name as company_name',
        'organisations.Description as company_description',
        'organisations.website_url as company_website',
        'organisations.industry as company_industry'
      )
      .first();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user has applied
    const application = await knex('applications')
      .where({
        job_id: req.params.jobId,
        user_id: req.user.userId
      })
      .first();

    // Check if bookmarked
    const bookmark = await knex('bookmarks')
      .where({
        job_id: req.params.jobId,
        user_id: req.user.userId
      })
      .first();

    res.json({ 
      job: {
        ...job,
        has_applied: !!application,
        is_bookmarked: !!bookmark
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

// 🔹 Get Applicants for a Job
app.get("/api/jobs/:jobId/applicants", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the organization owns this job
    const job = await knex('jobs')
      .where('job_id', req.params.jobId)
      .first();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get all applications for this job with user details
    const applications = await knex('applications')
      .where('job_id', req.params.jobId)
      .join('users', 'applications.user_id', 'users.id')
      .leftJoin('student', 'users.id', 'student.user_id')
      .leftJoin('workingprofessional', 'users.id', 'workingprofessional.user_id')
      .select(
        'applications.*',
        'users.name',
        'users.email',
        'student.resume_url as student_resume',
        'workingprofessional.resume_url as professional_resume',
        'workingprofessional.current_position',
        'workingprofessional.company_name',
        'workingprofessional.years_of_experience'
      );

    // Format the applicants data
    const applicants = applications.map(app => ({
      id: app.application_id,
      name: app.name,
      position: app.current_position || 'Student',
      company: app.company_name || 'N/A',
      experience: app.years_of_experience ? `${app.years_of_experience} years` : 'Student',
      resume_url: app.student_resume || app.professional_resume,
      appliedDate: new Date(app.applied_at).toLocaleDateString(),
      status: app.status
    }));

    res.json({ applicants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});


// Get application details
app.get('/api/applications/:applicationId', async (req, res) => {
  try {
    const application = await knex('applications')
      .where('application_id', req.params.applicationId)
      .join('users', 'applications.user_id', 'users.id')
      .leftJoin('student', 'users.id', 'student.user_id')
      .leftJoin('workingprofessional', 'users.id', 'workingprofessional.user_id')
      .select(
        'applications.*',
        'users.name',
        'users.email',
        'student.phone_number',
        'student.linkedin_url',
        'student.github_url',
        'student.resume_url',
        'student.bio',
        'workingprofessional.current_position as position',
        'workingprofessional.company_name',
        'workingprofessional.years_of_experience'
      )
      .first();

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Get status history
    const statusHistory = await knex('applications')
      .where('application_id', req.params.applicationId);

    res.json({
      application: {
        ...application,
        status_history: statusHistory
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch application details' });
  }
});

// // Get application notes
// app.get('/api/applications/:applicationId/notes', async (req, res) => {
//   try {
//     const notes = await knex('application_notes')
//       .where('application_id', req.params.applicationId)
//       .join('users', 'application_notes.author_id', 'users.id')
//       .select(
//         'application_notes.*',
//         'users.name as author_name'
//       )
//       .orderBy('created_at', 'desc');

//     res.json({ notes });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch notes' });
//   }
// });

// // Add application note
// app.post('/api/applications/:applicationId/notes', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const { content } = req.body;

//     const [note] = await knex('application_notes')
//       .insert({
//         application_id: req.params.applicationId,
//         author_id: decoded.id,
//         content: content,
//         created_at: new Date()
//       })
//       .returning('*');

//     res.json({ note });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to add note' });
//   }
// });

// Get application interviews
// 🔹 Schedule an Interview
app.post("/api/applications/:applicationId/interviews", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      scheduled_time, 
      duration_minutes, 
      interview_type, 
      location_or_link,
      interviewer_name,
      interviewer_position,
      notes
    } = req.body;

    // Validate required fields
    if (!scheduled_time || !duration_minutes || !interview_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if application exists
    const application = await knex('applications')
      .where('application_id', req.params.applicationId)
      .first();

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Insert the new interview
    const [interviewId] = await knex('interviews').insert({
      application_id: req.params.applicationId,
      scheduled_time: new Date(scheduled_time),
      duration_minutes,
      interview_type,
      location_or_link,
      interviewer_name,
      interviewer_position,
      status: 'scheduled',
      feedback: notes || ''
    }).returning('interview_id');

    // Optionally update application status to "interviewing"
    if (req.body.update_status) {
      await knex('applications')
        .where('application_id', req.params.applicationId)
        .update({ status: 'interviewing', updated_at: knex.fn.now() });
    }

    // TODO: Send email notification if requested

    res.status(201).json({ 
      message: 'Interview scheduled successfully',
      interview_id: interviewId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
});
// 🔹 Get Interviews for an Application
app.get("/api/applications/:applicationId/interviews", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const interviews = await knex('interviews')
      .where('application_id', req.params.applicationId)
      .orderBy('scheduled_time', 'asc');

    res.json({ interviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

// 🔹 Update an Interview
app.put("/api/interviews/:interviewId", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      scheduled_time, 
      duration_minutes, 
      interview_type, 
      location_or_link,
      interviewer_name,
      interviewer_position,
      feedback
    } = req.body;

    // Validate required fields
    if (!scheduled_time || !duration_minutes || !interview_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update the interview
    await knex('interviews')
      .where('interview_id', req.params.interviewId)
      .update({
        scheduled_time: new Date(scheduled_time),
        duration_minutes: duration_minutes,
        interview_type,
        location_or_link,
        interviewer_name,
        interviewer_position,
        feedback,
        updated_at: knex.fn.now()
      });

    res.json({ message: 'Interview updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update interview' });
  }
});

// Update application status
// 🔹 Update Application Status
app.put("/api/applications/:applicationId", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['applied', 'viewed', 'shortlisted', 'interviewing', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await knex('applications')
      .where('application_id', req.params.applicationId)
      .update({ 
        status,
        updated_at: knex.fn.now() 
      });

    if (!updated) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// 🔹 Get Jobs for Working Professionals (with company names)
app.get("/api/wp/jobs", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get jobs with company names by joining with organisations table
    const jobs = await knex('jobs')
      .join('organisations', 'jobs.id', 'organisations.id')
      .select(
        'jobs.*',
        'organisations.name as company_name'
      )
      .orderBy('jobs.created_at', 'desc');

    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get("/api/student/applications", authenticate, async (req, res) => {
  try {
    console.log(req.user);
    const studentId = req.user.userId;

    const applications = await knex('applications')
      .join('jobs', 'applications.job_id', 'jobs.job_id')
      .join('organisations', 'jobs.id', 'organisations.id')
      .where('applications.user_id', studentId)
      .select(
        'applications.application_id',
        'applications.job_id',
        'applications.resume_url',
        'applications.status',
        'applications.applied_at',
        'applications.updated_at',
        'jobs.title as job_title',
        'jobs.location',
        'jobs.is_remote',
        'jobs.employment_type',
        'jobs.salary_min',
        'jobs.salary_max',
        'jobs.salary_currency',
        'organisations.name'
        // knex.raw('COALESCE(companies.name, organisations.name) as company_name')
      )
      .orderBy('applications.updated_at', 'desc');

    res.json({ 
      success: true, 
      applications 
    });

  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications"
    });
  }
});

app.delete("/api/student/applications/:applicationId", authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const applicationId = req.params.applicationId;

    // Verify the application belongs to the student
    const application = await knex('applications')
      .where({ 
        application_id: applicationId,
        user_id: studentId
      })
      .first();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or not authorized'
      });
    }

    await knex('applications')
      .where({ application_id: applicationId })
      .del();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application'
    });
  }
});

// app.get('/api/student/interviews', authenticate, async (req, res) => {
//   try {
//     const interviews = await knex('interviews')
//       .where('application_id', req.user.id) // Assuming student ID is in token
//       .join('jobs', 'interviews.job_id', 'jobs.job_id')
//       .join('organisations', 'jobs.org_id', 'organisations.id')
//       .select(
//         'interviews.*',
//         'jobs.title as job_title',
//         'organisations.name as company_name'
//       );
      
//     res.json({ interviews });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch interviews' });
//   }
// });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});