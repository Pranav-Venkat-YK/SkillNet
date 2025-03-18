const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1", // or "localhost"
    user: "myuser",
    password: "password", // Update with your actual password
    database: "mydatabase",
  },
});

module.exports = db;
