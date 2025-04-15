import { RowDataPacket, OkPacket } from 'mysql2/promise'
import pool from '../config/db'
import bcrypt from 'bcrypt'; // Import bcrypt

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: integer, readOnly: true }
 *         firstname: { type: string }
 *         lastname: { type: string }
 *         phone: { type: string }
 *         email: { type: string, format: email, nullable: true }
 *         role_id: { type: integer }
 *         address_1: { type: string, nullable: true }
 *         address_2: { type: string, nullable: true }
 *         city: { type: string }
 *         state: { type: string }
 *         lattitude: { type: number, format: float, nullable: true } 
 *         longitude: { type: number, format: float, nullable: true }
 *         zone_id: { type: integer, nullable: true }
 *         society_id: { type: integer, nullable: true }
 *         is_active: { type: integer, description: "0=inactive, 1=active" }
 *         is_deleted: { type: integer, readOnly: true }
 *         created_at: { type: string, format: date-time, readOnly: true }
 *         updated_at: { type: string, format: date-time, readOnly: true }
 *         referral_code: { type: string, readOnly: true }
 *         referral_points: { type: integer }
 *         total_quantity_remain: { type: integer }
 *         deposit: { type: number, format: double }
 *         total_amount: { type: number, format: double }
 *         due_amount: { type: number, format: double }
 *     UserInputRequired:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - phone
 *         - password
 *         - role_id
 *         - city
 *         - state
 *       properties:
 *         firstname: { type: string }
 *         lastname: { type: string }
 *         phone: { type: string }
 *         password: { type: string, format: password, minLength: 6 }
 *         email: { type: string, format: email }
 *         role_id: { type: integer }
 *         address_1: { type: string }
 *         address_2: { type: string }
 *         city: { type: string }
 *         state: { type: string }
 *         zone_id: { type: integer }
 *         society_id: { type: integer }
 *         is_active: { type: integer, description: "0=inactive, 1=active", default: 1 }
 *         deposit: { type: number, format: double, default: 0 }
 *         due_amount: { type: number, format: double, default: 0 }
 *         # Other fields usually calculated/set by server:
 *         # referral_code, referral_points, total_quantity_remain, total_amount
 *     UserInputOptional: # For PATCH updates
 *       type: object
 *       properties:
 *         firstname: { type: string }
 *         lastname: { type: string }
 *         phone: { type: string }
 *         email: { type: string, format: email }
 *         address_1: { type: string }
 *         address_2: { type: string }
 *         city: { type: string }
 *         state: { type: string }
 *         zone_id: { type: integer }
 *         society_id: { type: integer }
 *         is_active: { type: integer, description: "0=inactive, 1=active" }
 *         deposit: { type: number, format: double }
 *         due_amount: { type: number, format: double }
 *         # Excluded: password, role_id (handled separately)
 */
export interface IUser {
  id?: number
  firstname: string
  lastname: string
  phone: string
  password?: string // Password will be handled separately (hashing)
  email?: string | null
  role_id: number
  address_1?: string | null
  address_2?: string | null
  city: string
  state: string
  lattitude?: number | null // Consider decimal type if precision needed
  longitude?: number | null // Consider decimal type if precision needed
  zone_id?: number | null
  society_id?: number | null
  is_active?: number // boolean might be better, but TINYINT(1) often maps to number
  is_deleted?: number
  created_at?: Date
  updated_at?: Date
  referral_code?: string
  referral_points?: number
  token?: string | null
  total_quantity_remain?: number
  deposit?: number
  total_amount?: number
  due_amount?: number
}

// Type for the result of findById
type UserQueryResult = IUser & RowDataPacket

export const User = {
  async findById (id: number): Promise<IUser | null> {
    try {
      const [rows] = await pool.query<UserQueryResult[]>(
        'SELECT * FROM tbl_users WHERE id = ? AND is_deleted = 0', 
        [id]
      )
      if (rows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = rows[0]
        return userWithoutPassword as IUser
      }
      return null
    } catch (error) {
      console.error('[models/User.findById]', error)
      throw new Error('Error fetching user by ID')
    }
  },

  async findByPhone (phone: string): Promise<IUser | null> {
    try {
      const [rows] = await pool.query<UserQueryResult[]>(
        'SELECT * FROM tbl_users WHERE phone = ? AND is_deleted = 0 AND is_active = 1',
        [phone]
      )
      // Return the full user object including password for comparison in the controller
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error('[models/User.findByPhone]', error)
      throw new Error('Error fetching user by phone number')
    }
  },

  async create(userData: Omit<IUser, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'token'>): Promise<number> {
      // Extract password to hash it
      const { password, ...otherUserData } = userData;
      if (!password) {
          throw new Error('Password is required to create a user.');
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Prepare data for insertion
      const newUser = {
          ...otherUserData,
          password: hashedPassword,
          is_active: userData.is_active ?? 1, // Default to active if not specified
          is_deleted: 0,
          created_at: new Date(),
          updated_at: new Date(),
          referral_code: userData.referral_code || Math.random().toString(36).substring(2, 8).toUpperCase() // Generate random code if not provided
      };

      try {
          // Check if phone number already exists
          const [existing] = await pool.query<UserQueryResult[]>(
              'SELECT id FROM tbl_users WHERE phone = ? AND is_deleted = 0',
              [newUser.phone]
          );
          if (existing.length > 0) {
              throw new Error('Phone number is already registered.');
          }

          const [result] = await pool.query<OkPacket>('INSERT INTO tbl_users SET ?', [newUser]);
          return result.insertId;
      } catch (error) {
          console.error('[models/User.create]', error);
          if (error instanceof Error && error.message.includes('already registered')) {
            throw error; // Re-throw specific error
          }
           // Handle potential foreign key constraint errors (zone_id, society_id, role_id)
          if (error instanceof Error && 'code' in error && error.code === 'ER_NO_REFERENCED_ROW_2') {
               throw new Error('Invalid role_id, zone_id, or society_id.');
           }
          throw new Error('Error creating user record');
      }
  },

  async update(id: number, userData: Partial<Omit<IUser, 'id' | 'password' | 'created_at' | 'updated_at' | 'is_deleted' | 'token' >>): Promise<boolean> {
    // Define allowed fields for update (similar to before, but explicitly listing)
    // Removed role_id, referral_code, referral_points as they likely need separate logic/permissions
     const allowedFields: Array<keyof typeof userData> = [
       'firstname', 'lastname', 'phone', 'email', 'address_1', 'address_2',
       'city', 'state', 'lattitude', 'longitude', 'zone_id', 'society_id',
       'is_active', 'total_quantity_remain', 'deposit', 'total_amount', 'due_amount'
     ];
 
     const fieldsToUpdate = Object.keys(userData).filter(
         (key) => allowedFields.includes(key as keyof typeof userData) && userData[key as keyof typeof userData] !== undefined
     ) as Array<keyof typeof userData>;
 
     if (fieldsToUpdate.length === 0) {
       return false; // Nothing to update
     }
 
    // Specific validation (add more as needed)
    if ('is_active' in userData && ![0, 1].includes(Number(userData.is_active))) {
         throw new Error('Invalid value for is_active. Must be 0 or 1.');
    }
     if ('phone' in userData && userData.phone) {
         // Check if the new phone number is already taken by another user
         const [existing] = await pool.query<UserQueryResult[]>(
             'SELECT id FROM tbl_users WHERE phone = ? AND id != ? AND is_deleted = 0',
             [userData.phone, id]
         );
         if (existing.length > 0) {
             throw new Error('Phone number is already registered by another user.');
         }
     }

     const setClauses = fieldsToUpdate.map(field => `${field} = ?`).join(', ');
     const values = fieldsToUpdate.map(field => userData[field as keyof typeof userData]);
     values.push(id); // Add the id for the WHERE clause
 
     try {
       const [result] = await pool.query<OkPacket>(
         `UPDATE tbl_users SET ${setClauses}, updated_at = NOW() WHERE id = ? AND is_deleted = 0`,
         values
       );
       return result.affectedRows > 0;
     } catch (error) {
       console.error('[models/User.update]', error);
       if (error instanceof Error && (error.message.includes('already registered') || error.message.includes('Invalid value'))) {
           throw error; // Re-throw validation errors
       }
       // Handle potential foreign key constraint errors (zone_id, society_id)
       if (error instanceof Error && 'code' in error && error.code === 'ER_NO_REFERENCED_ROW_2') {
           throw new Error('Invalid zone_id or society_id.');
       }
       throw new Error('Error updating user record');
     }
   },

  async changePassword(id: number, newPasswordHash: string): Promise<boolean> {
      try {
          const [result] = await pool.query<OkPacket>(
              'UPDATE tbl_users SET password = ?, updated_at = NOW() WHERE id = ? AND is_deleted = 0',
              [newPasswordHash, id]
          );
          return result.affectedRows > 0;
      } catch (error) {
          console.error('[models/User.changePassword]', error);
          throw new Error('Error updating user password');
      }
  },

  async softDelete(id: number): Promise<boolean> {
    try {
      // Set is_deleted = 1 and is_active = 0
      const [result] = await pool.query<OkPacket>(
        'UPDATE tbl_users SET is_deleted = 1, is_active = 0, updated_at = NOW() WHERE id = ? AND is_deleted = 0',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[models/User.softDelete]', error);
      throw new Error('Error soft deleting user record');
    }
  },

  async findAll(options: { roleId?: number } = {}): Promise<Omit<IUser, 'password'>[]> {
      const { roleId } = options;
      let query = 'SELECT id, firstname, lastname, phone, email, role_id, address_1, address_2, city, state, zone_id, society_id, is_active, created_at, updated_at, deposit, due_amount FROM tbl_users WHERE is_deleted = 0';
      const queryParams: (string | number)[] = [];

      if (roleId !== undefined) {
          query += ' AND role_id = ?';
          queryParams.push(roleId);
      }

      query += ' ORDER BY lastname ASC, firstname ASC';

      try {
          const [rows] = await pool.query<(Omit<IUser, 'password'> & RowDataPacket)[]>(query, queryParams);
          return rows as Omit<IUser, 'password'>[];
      } catch (error) {
          console.error('[models/User.findAll]', error);
          throw new Error('Error fetching all users');
      }
  },

  // Add other CRUD functions here later (e.g., create, update, delete)

  // Note: Password comparison logic might also live in a service layer
  // or directly in the controller for simpler cases.
  // Adding it here for demonstration.
  // async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  //   return await bcrypt.compare(plainPassword, hashedPassword)
  // }
} 