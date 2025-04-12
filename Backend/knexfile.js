require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'myuser',          // Replace with your PostgreSQL username
      password: 'password', // Replace with your PostgreSQL password
      database: 'mydatabase'    // Replace with your database name
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
