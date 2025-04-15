import { RowDataPacket, OkPacket } from 'mysql2/promise'
import pool from '../config/db'

/**
 * @swagger
 * components:
 *   schemas:
 *     Society:
 *       type: object
 *       properties:
 *         id: { type: integer, readOnly: true }
 *         name: { type: string }
 *         zone_id: { type: integer }
 *         zone_title: { type: string, readOnly: true, description: "Title of the associated zone (added by query)"}
 *         is_active: { type: integer, description: "1=active, 0=inactive" }
 *         is_deleted: { type: integer, readOnly: true }
 *         created_at: { type: string, format: date-time, readOnly: true }
 *         updated_at: { type: string, format: date-time, readOnly: true }
 *     SocietyInput:
 *       type: object
 *       required:
 *         - name
 *         - zone_id
 *       properties:
 *         name: { type: string }
 *         zone_id: { type: integer }
 *         is_active: { type: integer, description: "1=active, 0=inactive", default: 1 }
 */
export interface ISociety {
  id?: number
  name: string
  zone_id: number // Foreign key to tbl_zone
  is_active?: number // boolean might be better
  is_deleted?: number
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null // Note: deleted_at field exists
  zone_title?: string; // Added for joining
}

// Type for query results
type SocietyQueryResult = ISociety & RowDataPacket

export const Society = {
  async findById (id: number): Promise<ISociety | null> {
    try {
      const [rows] = await pool.query<SocietyQueryResult[]>(
        'SELECT * FROM tbl_society WHERE id = ? AND is_deleted = 0 AND is_active = 1', // Only active, non-deleted
        [id]
      )
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error('[models/Society.findById]', error)
      throw new Error('Error fetching society by ID')
    }
  },

  async findAll (): Promise<ISociety[]> {
    try {
      const [rows] = await pool.query<SocietyQueryResult[]>(
        'SELECT * FROM tbl_society WHERE is_deleted = 0 AND is_active = 1 ORDER BY name ASC' // Only active, non-deleted
      )
      return rows
    } catch (error) {
      console.error('[models/Society.findAll]', error)
      throw new Error('Error fetching all societies')
    }
  },

  async findByZoneId (zoneId: number): Promise<ISociety[]> {
    try {
      const [rows] = await pool.query<SocietyQueryResult[]>(
        'SELECT * FROM tbl_society WHERE zone_id = ? AND is_deleted = 0 AND is_active = 1 ORDER BY name ASC', // Active, non-deleted for a specific zone
        [zoneId]
      )
      return rows
    } catch (error) {
      console.error('[models/Society.findByZoneId]', error)
      throw new Error('Error fetching societies by Zone ID')
    }
  },

  // Add other CRUD functions here later (e.g., create, update, delete)
  async create(societyData: Omit<ISociety, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'is_deleted' | 'is_active'>): Promise<number> {
    const { name, zone_id } = societyData
    try {
      // Assume new societies are active and not deleted by default
      // Note: deleted_at is not set on creation
      const [result] = await pool.query<OkPacket>(
        'INSERT INTO tbl_society (name, zone_id, is_active, is_deleted, created_at, updated_at) VALUES (?, ?, 1, 0, NOW(), NOW())',
        [name, zone_id]
      )
      return result.insertId
    } catch (error) {
      console.error('[models/Society.create]', error)
      // Handle potential foreign key constraint error if zone_id is invalid
      if (error instanceof Error && 'code' in error && error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error(`Error creating society: Zone with ID ${zone_id} does not exist.`)
      }
      throw new Error('Error creating society record')
    }
  },

  async update(id: number, societyData: Partial<Omit<ISociety, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'is_deleted'> >): Promise<boolean> {
    const fields = Object.keys(societyData) as Array<keyof typeof societyData>;
    if (fields.length === 0) {
      return false; // Nothing to update
    }

    // Ensure is_active is handled correctly if present
    const updateFields = { ...societyData };
    if ('is_active' in updateFields && updateFields.is_active !== undefined) {
        // Keep is_active
    } else {
        delete updateFields.is_active;
    }

    // Re-calculate fields and values after potential modifications
    const finalFields = Object.keys(updateFields) as Array<keyof typeof updateFields>;
    if (finalFields.length === 0) {
        return false; // Nothing left to update
    }
    const setClauses = finalFields.map(field => `${field} = ?`).join(', ');
    const values = finalFields.map(field => updateFields[field]);
    values.push(id); // Add the id for the WHERE clause

    try {
      const [result] = await pool.query<OkPacket>(
        `UPDATE tbl_society SET ${setClauses}, updated_at = NOW() WHERE id = ? AND is_deleted = 0`,
        values
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[models/Society.update]', error);
      // Handle potential foreign key constraint error if zone_id is updated to an invalid value
      if (error instanceof Error && 'code' in error && error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error(`Error updating society: Zone with ID ${societyData.zone_id} does not exist.`);
      }
      throw new Error('Error updating society record');
    }
  },

  async softDelete(id: number): Promise<boolean> {
    // Assumes `is_deleted` column now exists instead of `deleted_at`
    // Check if any active users are assigned to this society
    try {
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM tbl_users WHERE society_id = ? AND is_deleted = 0',
            [id]
        );
        if (users.length > 0) {
            throw new Error('Cannot delete society: It is assigned to active users.');
        }

        const [result] = await pool.query<OkPacket>(
            'UPDATE tbl_society SET is_deleted = 1, is_active = 0, updated_at = NOW() WHERE id = ? AND is_deleted = 0',
            [id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('[models/Society.softDelete]', error);
         if (error instanceof Error && error.message.includes('Cannot delete society')) {
           throw error; // Re-throw specific error
       }
        throw new Error('Error deleting society');
    }
  }
} 