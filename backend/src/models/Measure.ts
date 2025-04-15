import { RowDataPacket, OkPacket } from 'mysql2/promise'
import pool from '../config/db'

/**
 * @swagger
 * components:
 *   schemas:
 *     Measure:
 *       type: object
 *       properties:
 *         id: { type: integer, readOnly: true }
 *         title: { type: string }
 *         notes: { type: string, nullable: true }
 *         is_active: { type: integer, description: "1=active, 0=inactive" }
 *         is_deleted: { type: integer, readOnly: true }
 *         created_at: { type: string, format: date-time, readOnly: true }
 *         updated_at: { type: string, format: date-time, readOnly: true }
 *     MeasureInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title: { type: string }
 *         notes: { type: string }
 *         is_active: { type: integer, description: "1=active, 0=inactive", default: 1 }
 */
export interface IMeasure {
  id?: number
  title: string // e.g., "Liter", "Bottle", "JAR"
  notes?: string | null
  is_active?: number // boolean might be better
  is_deleted?: number
  created_at?: Date
  updated_at?: Date
}

// Type for query results
type MeasureQueryResult = IMeasure & RowDataPacket

export const Measure = {
  async findById (id: number): Promise<IMeasure | null> {
    try {
      const [rows] = await pool.query<MeasureQueryResult[]>(
        'SELECT * FROM tbl_measures WHERE id = ? AND is_deleted = 0 AND is_active = 1',
        [id]
      )
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error('[models/Measure.findById]', error)
      throw new Error('Error fetching measure by ID')
    }
  },

  async findAll (): Promise<IMeasure[]> {
    try {
      const [rows] = await pool.query<MeasureQueryResult[]>(
        'SELECT * FROM tbl_measures WHERE is_deleted = 0 AND is_active = 1 ORDER BY title ASC'
      )
      return rows
    } catch (error) {
      console.error('[models/Measure.findAll]', error)
      throw new Error('Error fetching all measures')
    }
  },

  async create(measureData: Pick<IMeasure, 'title' | 'notes'>): Promise<number> {
    const { title, notes } = measureData;
    try {
      // Assume new measures are active and not deleted
      const [result] = await pool.query<OkPacket>(
        'INSERT INTO tbl_measures (title, notes, is_active, is_deleted, created_at, updated_at) VALUES (?, ?, 1, 0, NOW(), NOW())',
        [title, notes]
      );
      return result.insertId;
    } catch (error) {
      console.error('[models/Measure.create]', error);
      // Handle potential unique constraint errors if title should be unique
      throw new Error('Error creating measure record');
    }
  },

  async update(id: number, measureData: Partial<Pick<IMeasure, 'title' | 'notes' | 'is_active'> >): Promise<boolean> {
    const fields = Object.keys(measureData) as Array<keyof typeof measureData>;
    if (fields.length === 0) return false;

    const updateFields = { ...measureData };
    // Ensure is_active is 0 or 1 if provided
    if ('is_active' in updateFields && ![0, 1].includes(Number(updateFields.is_active))) {
        delete updateFields.is_active; // Or throw error if invalid value provided
    }

    const finalFields = Object.keys(updateFields) as Array<keyof typeof updateFields>;
    if (finalFields.length === 0) return false;

    const setClauses = finalFields.map(field => `${field} = ?`).join(', ');
    const values = finalFields.map(field => updateFields[field]);
    values.push(id);

    try {
      const [result] = await pool.query<OkPacket>(
        `UPDATE tbl_measures SET ${setClauses}, updated_at = NOW() WHERE id = ? AND is_deleted = 0`,
        values
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[models/Measure.update]', error);
      throw new Error('Error updating measure record');
    }
  },

  async softDelete(id: number): Promise<boolean> {
    try {
      // Set is_deleted = 1 and is_active = 0
      const [result] = await pool.query<OkPacket>(
        'UPDATE tbl_measures SET is_deleted = 1, is_active = 0, updated_at = NOW() WHERE id = ? AND is_deleted = 0',
        [id]
      );
      // TODO: Check if this measure is used by any active services before deleting?
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[models/Measure.softDelete]', error);
      throw new Error('Error soft deleting measure record');
    }
  }
} 