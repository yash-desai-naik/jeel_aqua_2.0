import express, { Request, Response, NextFunction, Express } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import zoneRoutes from './routes/zoneRoutes' // Import zone routes
import societyRoutes from './routes/societyRoutes' // Import society routes
import serviceRoutes from './routes/serviceRoutes' // Import service routes
import authRoutes from './routes/authRoutes' // Import auth routes
import orderRoutes from './routes/orderRoutes' // Import order routes
import orderDeliveryRoutes from './routes/orderDeliveryRoutes' // Import delivery routes
import paymentHistoryRoutes from './routes/paymentHistoryRoutes' // Import payment routes
import userRoutes from './routes/userRoutes' // Import user routes
import measureRoutes from './routes/measureRoutes' // Import measure routes
import roleRoutes from './routes/roleRoutes' // Import role routes
import expenseRoutes from './routes/expenseRoutes' // Import expense routes
import orderStatusRoutes from './routes/orderStatusRoutes' // Import order status routes
import reportRoutes from './routes/reportRoutes' // Import report routes
import mockRoutes from './routes/mockRoutes' // Import mock routes
import { ensureAdminUserExists } from './lib/startupTasks' // Import from lib
import swaggerUi from 'swagger-ui-express'
// import swaggerDocument from '../swagger-output.json' // Removed - Using swagger-jsdoc
import swaggerSpec from './config/swaggerConfig' // Added - Import swagger-jsdoc config

// Load environment variables
dotenv.config()

const app: Express = express()
const port: number = parseInt(process.env.PORT || '3001', 10)

// Middleware
app.use(cors()) // Enable CORS for all origins (adjust in production)
app.use(express.json()) // Parse JSON request bodies

// Basic health check route
// #swagger.tags = ['Health Check']
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' })
})

// Placeholder for future routes
// import userRoutes from './routes/users' // Example
app.use('/api/auth', authRoutes) // Mount auth routes
app.use('/api/users', userRoutes) // Mount user routes
app.use('/api/zones', zoneRoutes) // Mount zone routes
app.use('/api/societies', societyRoutes) // Mount society routes
app.use('/api/services', serviceRoutes) // Mount service routes
app.use('/api/orders', orderRoutes) // Mount order routes
app.use('/api/deliveries', orderDeliveryRoutes) // Mount delivery routes
app.use('/api/payments', paymentHistoryRoutes) // Mount payment routes
app.use('/api/measures', measureRoutes) // Mount measure routes
app.use('/api/roles', roleRoutes) // Mount role routes
app.use('/api/expenses', expenseRoutes) // Mount expense routes
app.use('/api/order-statuses', orderStatusRoutes) // Mount order status routes
app.use('/api/reports', reportRoutes) // Mount report routes
app.use('/api/mocks', mockRoutes) // Mount mock routes
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)) // Old setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)) // Use swagger-jsdoc spec

// Basic error handler (Restored inline version)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  // Send a generic error message
  // Avoid sending stack trace in production
  res.status(500).json({ message: 'Internal Server Error' });
});

// --- Start Server --- 
// Ensure admin user exists before starting the server
ensureAdminUserExists().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}).catch(error => {
  console.error("Critical error during startup tasks:", error)
  process.exit(1) // Optional: Exit if startup task fails critically
})
