import { RowDataPacket, OkPacket } from 'mysql2/promise'
import pool from '../config/db'

/**
 * @swagger
 * components:
 *   schemas:
 *     Zone:
 *       type: object
 *       properties:
 *         id: { type: integer, readOnly: true }
 *         title: { type: string }
 *         from_area: { type: string, nullable: true }
 *         to_area: { type: string, nullable: true }
 *         is_active: { type: integer, description: "1=active, 0=inactive" }
 *         is_deleted: { type: integer, readOnly: true }
 *         created_at: { type: string, format: date-time, readOnly: true }
 *         updated_at: { type: string, format: date-time, readOnly: true }
 *     ZoneInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title: { type: string }
 *         from_area: { type: string }
 *         to_area: { type: string }
 *         is_active: { type: integer, description: "1=active, 0=inactive", default: 1 }
 */
export interface IZone {
  id?: number
  title: string
  from_area?: string | null
  to_area?: string | null
  is_active?: number // boolean might be better
  is_deleted?: number
  created_at?: Date
  updated_at?: Date
}

// Type for query results
type ZoneQueryResult = IZone & RowDataPacket

export const Zone = {
  async findById (id: number): Promise<IZone | null> {
    try {
      const [rows] = await pool.query<ZoneQueryResult[]>(
        'SELECT * FROM tbl_zone WHERE id = ? AND is_deleted = 0 AND is_active = 1', // Only active, non-deleted
        [id]
      )
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error('[models/Zone.findById]', error)
      throw new Error('Error fetching zone by ID')
    }
  },

  async findAll (): Promise<IZone[]> {
    try {
      const [rows] = await pool.query<ZoneQueryResult[]>(
        'SELECT * FROM tbl_zone WHERE is_deleted = 0 AND is_active = 1 ORDER BY title ASC' // Only active, non-deleted
      )
      return rows
    } catch (error) {
      console.error('[models/Zone.findAll]', error)
      throw new Error('Error fetching all zones')
    }
  },

  // Add other CRUD functions here later (e.g., create, update, delete)
  async create(zoneData: Omit<IZone, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'is_active'>): Promise<number> {
    const { title, from_area, to_area } = zoneData
    try {
      // Assume new zones are active and not deleted by default
      const [result] = await pool.query<OkPacket>(
        'INSERT INTO tbl_zone (title, from_area, to_area, is_active, is_deleted, created_at, updated_at) VALUES (?, ?, ?, 1, 0, NOW(), NOW())',
        [title, from_area, to_area]
      )
      return result.insertId
    } catch (error) {
      console.error('[models/Zone.create]', error)
      throw new Error('Error creating zone record')
    }
  },

  async update(id: number, zoneData: Partial<Omit<IZone, 'id' | 'created_at' | 'updated_at' | 'is_deleted'> >): Promise<boolean> {
    const fields = Object.keys(zoneData) as Array<keyof typeof zoneData>;
    if (fields.length === 0) {
      return false; // Nothing to update
    }

    // Ensure is_active is handled correctly if present
    const updateFields = { ...zoneData };
    if ('is_active' in updateFields && updateFields.is_active !== undefined) {
      // Keep is_active if explicitly provided, otherwise don't include it in the update
      // Or remove it if it should never be updated here: delete updateFields.is_active;
    } else {
      // Remove is_active if not explicitly provided, to avoid accidentally setting it to null/undefined
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
        `UPDATE tbl_zone SET ${setClauses}, updated_at = NOW() WHERE id = ? AND is_deleted = 0`,
        values
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[models/Zone.update]', error);
      throw new Error('Error updating zone record');
    }
  },

  async softDelete(id: number): Promise<boolean> {
    try {
      // Set is_deleted = 1 and is_active = 0 for soft delete
      const [result] = await pool.query<OkPacket>(
        'UPDATE tbl_zone SET is_deleted = 1, is_active = 0, updated_at = NOW() WHERE id = ? AND is_deleted = 0',
        [id]
      );
      // Check if any row was actually affected
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[models/Zone.softDelete]', error);
      // Note: Consider implications if societies are linked to this zone.
      // Depending on requirements, you might want to prevent deletion if linked societies exist,
      // or handle cascading deletes/updates (though soft delete makes this less critical).
      throw new Error('Error soft deleting zone record');
    }
  }
} 