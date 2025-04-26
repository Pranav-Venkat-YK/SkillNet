require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'your_username_here',          // Replace with your PostgreSQL username
      password: 'your_password_here', // Replace with your PostgreSQL password
      database: 'your_database_here'    // Replace with your database name
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
