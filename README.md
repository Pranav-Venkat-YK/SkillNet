# <strong>SkillNet</strong>  – An Interview Management System


## Team Details

<details>
  <summary>Meet The Team</summary>

- **A R Sharan Kumar** (231CS101) - [arsharankumar.231cs101@nitk.edu.in](mailto:arsharankumar.231cs101@nitk.edu.in)  
- **Mithun Patil V N** (231CS234) - [mithunpatilvn.231cs234@nitk.edu.in](mailto:mithunpatilvn.231cs234@nitk.edu.in)  
- **Pranav Venkat Y K** (231CS242) - [pranavvenkatyk.231cs242@nitk.edu.in](mailto:pranavvenkatyk.231cs242@nitk.edu.in)  
- **Yashwanth R** (231CS265) - [yashwanthr.231cs265@nitk.edu.in](mailto:yashwanthr.231cs265@nitk.edu.in)  

</details>  


## Introduction

Our project aims to develop a comprehensive job portal website using **React** for front-end and **NodeJS** back-end development, with **PostgreSQL** as the core database management system.  
The platform is designed to connect **students seeking job opportunities** with **companies looking for potential candidates**, while also facilitating **interview management**.


## Features

<details>
  <summary><strong>1. Student Registration & Profile Management</strong></summary>

- Students can create accounts and enter their personal, academic, and professional details.  
- Resume upload and skill-based profile enhancement.  
- Search and apply for relevant job openings.  
- SQL is used to efficiently store and manage student data, ensuring quick retrieval and secure access.

</details>  

<details>
  <summary><strong>2. Company Registration & Job Posting</strong></summary>

- Companies can create accounts and manage job postings.  
- Search for potential candidates based on qualifications and skills.  
- View student profiles and shortlist candidates.  
- SQL is utilized for managing company profiles, job listings, and candidate applications, ensuring data integrity and optimized query performance.

</details>  

<details>
  <summary><strong>3. Interview Management System</strong></summary>

- Companies can schedule interviews with shortlisted candidates.  
- Automated notifications and reminders for scheduled interviews.  
- Tracking interview status and final hiring decisions.  
- SQL enables structured interview scheduling, tracking interview history, and maintaining logs for better organization.

</details>  

<details>
  <summary><strong>4. User-Friendly Interface & Security</strong></summary>

- Responsive and intuitive design for seamless user experience.  
- Secure authentication and data protection measures.  
- Efficient database management to handle multiple user requests.

</details>  



## Tech Stack

<p>
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React.js" width="75" height="75"/>
  &nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/2560px-Node.js_logo.svg.png" alt="Node.js" width="100" height="75"/>
  <br><br>
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png" alt="Express.js" width="145" height="75"/>
  &nbsp;&nbsp;&nbsp;
  <img src="https://static-00.iconduck.com/assets.00/knex-js-icon-1024x1024-t5ikxjr5.png" alt="Knex.js" width="75" height="75"/>
  <br><br>
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Axios_logo_%282020%29.svg/2560px-Axios_logo_%282020%29.svg.png" alt="Axios" width="185" height="45"/>
  &nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" alt="PostgreSQL" width="75" height="55"/>
</p>



## References

<details>
  <summary><strong>Click To See</strong></summary>

- **PostgreSQL:** [W3Schools - PostgreSQL](https://www.w3schools.com/PostgreSQl/)  
- **React:** [React Tutorial - YouTube](https://youtu.be/-mJFZp84TIY?si=lDxgZtqj60gQRhIB)  
- **Axios:** [Axios Documentation](https://axios-http.com/docs/intro)
- **NodeJS:** [W3Schools - NodeJS](https://www.w3schools.com/nodejs/)
- **KnexJS:** [KnexJS Documentation](https://knexjs.org/guide/)
- **ExpressJS:** [ExpressJS Documentation](https://expressjs.com/en/guide/routing.html)

</details>  



## Getting Started

Follow the instructions below to set up and run the website on your local machine.

### Prerequisites

- Node.js and npm installed
- PostgreSQL installed and create a database
- nodemon installed globally (`npm install -g nodemon`)
  


Clone the repository to your local machine:

   ```bash
   git clone https://github.com/Pranav-Venkat-YK/SkillNet.git
```

Then go to SkillNet Directory:

```bash
  cd SkillNet
```

After this in the Backend folder, modify db.js and knexfile.js with your credentials of PostgreSQL credentials.

## Running the Project

### 1. Backend Setup

1. Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Start the backend server using nodemon:

    ```bash
    nodemon index.js
    ```

---

### 2. Frontend Setup

1. Navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Start the frontend development server:

    ```bash
    npm run dev
    ```


## Notes

- The backend server usually runs on [http://localhost:5000](http://localhost:5000) (or your configured port).
- The frontend development server usually runs on [http://localhost:5173](http://localhost:5173) (or Vite's default port).




