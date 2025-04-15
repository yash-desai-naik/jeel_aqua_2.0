import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config() // Load environment variables from .env file

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jeelaqua_water_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Test the connection (optional, but good practice)
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully!')
    connection.release() // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Database connection failed:', err.message)
    // Exit the process if the database connection fails on startup
    // process.exit(1)
  })

export default pool 