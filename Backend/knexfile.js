require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'admin',          // Replace with your PostgreSQL username
      password: '@Nit000001', // Replace with your PostgreSQL password
      database: 'skillnet'    // Replace with your database name
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
