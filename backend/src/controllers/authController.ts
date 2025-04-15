import { Request, Response } from 'express'
import { User, IUser } from '../models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken' // Import jsonwebtoken

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.')
  process.exit(1) // Exit if secret is not set
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { phone, password } = req.body

  if (!phone || !password) {
    res.status(400).json({ message: 'Phone number and password are required' })
    return
  }

  try {
    const user = await User.findByPhone(phone)

    if (!user || !user.password) {
      // User not found or has no password set (should not happen in normal flow)
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    // Compare the provided password with the hashed password from the database
    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      // Passwords match - Login successful

      // Create payload for JWT (include essential, non-sensitive info)
      const payload = {
        userId: user.id,
        phone: user.phone,
        roleId: user.role_id
        // Add other relevant fields if needed
      }

      // Sign the token
      const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour (adjust as needed)
      )

      // Exclude password from the returned user object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user

      res.status(200).json({
        message: 'Login successful',
        user: userWithoutPassword,
        token: token // Send token back to client
      })
    } else {
      // Passwords don't match
      res.status(401).json({ message: 'Invalid credentials' })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Add registration, logout, etc. functions here later 