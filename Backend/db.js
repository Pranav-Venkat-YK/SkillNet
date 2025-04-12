const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1", // or "localhost"
    user: "admin",
    password: "@Nit000001", // Update with your actual password
    database: "skillnet",
  },
});

module.exports = db;
