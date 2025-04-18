import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

// Define the shape of our JWT payload
export interface UserJWTPayload extends JwtPayload {
  userId: number;
  roleId: number;
  phone?: string;
  // Add other fields included in the token if any
}

// Extend Express Request interface to include 'user' property
export interface AuthenticatedRequest extends Request {
  user?: UserJWTPayload; // Use our custom payload type
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (token == null) {
    // No token provided
    res.status(401).json({ message: 'Authentication token required' })
    return
  }

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables')
    res.status(500).json({ message: 'Internal server configuration error' })
    return
  }

  jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
    if (err) {
      console.error('JWT verification failed:', err.message)
      // Token might be expired or invalid
      return res.status(403).json({ message: 'Invalid or expired token' })
    }

    // Type assertion to our custom payload type
    req.user = decodedPayload as UserJWTPayload

    next() // Proceed to the next middleware or route handler
  })
} 