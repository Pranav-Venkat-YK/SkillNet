const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1", // or "localhost"
    user: "your_username_here",
    password: "your_password_here", // Update with your actual password
    database: "your_database_here",
  },
});

module.exports = db;
