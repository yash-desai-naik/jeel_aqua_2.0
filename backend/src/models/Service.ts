import { RowDataPacket, OkPacket } from 'mysql2/promise'
import pool from '../config/db'

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id: { type: integer, readOnly: true }
 *         title: { type: string }
 *         qty: { type: number, format: float, description: "Quantity value" }
 *         measure_id: { type: integer, description: "FK to tbl_measures" }
 *         price: { type: number, format: float }
 *         notes: { type: string, nullable: true }
 *         is_active: { type: integer, description: "1=active, 0=inactive" }
 *         is_deleted: { type: integer, readOnly: true }
 *         service_img: { type: string, nullable: true, description: "URL or path to service image" }
 *         created_at: { type: string, format: date-time, readOnly: true }
 *         updated_at: { type: string, format: date-time, readOnly: true }
 *     ServiceInput:
 *       type: object
 *       required:
 *         - title
 *         - qty
 *         - measure_id
 *         - price
 *       properties:
 *         title: { type: string }
 *         qty: { type: number, format: float, description: "Quantity value" }
 *         measure_id: { type: integer, description: "ID from tbl_measures" }
 *         price: { type: number, format: float }
 *         notes: { type: string }
 *         is_active: { type: integer, description: "1=active, 0=inactive", default: 1 }
 *         service_img: { type: string, description: "URL or path to service image" }
 */

// Interface matching the tbl_services structure
export interface IService {
  id?: number
  title: string
  qty: number
  measure_id: number // Foreign key to tbl_measures (Need a Measure model later)
  price: number
  notes?: string | null
  is_active?: number // boolean might be better
  is_deleted?: number
  service_img?: string | null
  created_at?: Date
  updated_at?: Date
}

// Type for query results
type ServiceQueryResult = IService & RowDataPacket

export const Service = {
  async findById (id: number): Promise<IService | null> {
    try {
      const [rows] = await pool.query<ServiceQueryResult[]>(
        'SELECT * FROM tbl_services WHERE id = ? AND is_deleted = 0 AND is_active = 1', // Only active, non-deleted
        [id]
      )
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error('[models/Service.findById]', error)
      throw new Error('Error fetching service by ID')
    }
  },

  async findAll (): Promise<IService[]> {
    try {
      const [rows] = await pool.query<ServiceQueryResult[]>(
        'SELECT * FROM tbl_services WHERE is_deleted = 0 AND is_active = 1 ORDER BY title ASC' // Only active, non-deleted
      )
      return rows
    } catch (error) {
      console.error('[models/Service.findAll]', error)
      throw new Error('Error fetching all services')
    }
  },

  // Add other CRUD functions here later (e.g., create, update, delete)
  async create(serviceData: Omit<IService, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'is_active'>): Promise<number> {
    const { title, qty, measure_id, price, notes, service_img } = serviceData
    try {
      // Assume new services are active and not deleted by default
      const [result] = await pool.query<OkPacket>(
        'INSERT INTO tbl_services (title, qty, measure_id, price, notes, service_img, is_active, is_deleted, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())',
        [title, qty, measure_id, price, notes, service_img]
      )
      return result.insertId
    } catch (error) {
      console.error('[models/Service.create]', error)
      // Handle potential foreign key constraint error if measure_id is invalid
      if (error instanceof Error && 'code' in error && error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error(`Error creating service: Measure with ID ${measure_id} does not exist.`)
      }
      throw new Error('Error creating service record')
    }
  },

  async update(id: number, serviceData: Partial<Omit<IService, 'id' | 'created_at' | 'updated_at' | 'is_deleted'> >): Promise<boolean> {
    // Build the SET part of the SQL query dynamically based on provided fields
    const fields = Object.keys(serviceData) as Array<keyof typeof serviceData>;
    if (fields.length === 0) {
      return false; // Nothing to update
    }

    const setClauses = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => serviceData[field]);
    values.push(id); // Add the id for the WHERE clause

    try {
      const [result] = await pool.query<OkPacket>(
        `UPDATE tbl_services SET ${setClauses}, updated_at = NOW() WHERE id = ? AND is_deleted = 0`,
        values
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[models/Service.update]', error);
      // Handle potential foreign key constraint error if measure_id is updated to an invalid value
      if (error instanceof Error && 'code' in error && error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error(`Error updating service: Measure with ID ${serviceData.measure_id} does not exist.`);
      }
      throw new Error('Error updating service record');
    }
  },

  async softDelete(id: number): Promise<boolean> {
    try {
      // Set is_deleted = 1 and is_active = 0 for soft delete
      const [result] = await pool.query<OkPacket>(
        'UPDATE tbl_services SET is_deleted = 1, is_active = 0, updated_at = NOW() WHERE id = ? AND is_deleted = 0',
        [id]
      );
      // Check if any row was actually affected (i.e., the service existed and wasn't already deleted)
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[models/Service.softDelete]', error);
      throw new Error('Error soft deleting service record');
    }
  }
} 