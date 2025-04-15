import { RowDataPacket, OkPacket } from 'mysql2/promise'
import pool from '../config/db'

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - rolename
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the role.
 *         rolename:
 *           type: string
 *           description: The name of the role.
 *           example: Admin
 *         is_active:
 *           type: integer
 *           description: Whether the role is active (1) or inactive (0).
 *           example: 1
 *         is_deleted:
 *           type: integer
 *           description: Whether the role is marked as deleted (1) or not (0).
 *           readOnly: true # Typically not set directly by client
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the role was created.
 *           readOnly: true
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the role was last updated.
 *           readOnly: true
 *       example:
 *         id: 1
 *         rolename: Admin
 *         is_active: 1
 *         created_at: "2024-01-01T12:00:00.000Z"
 *         updated_at: "2024-01-01T12:00:00.000Z"
 *     RoleInput:
 *        type: object
 *        required:
 *          - rolename
 *        properties:
 *          rolename:
 *            type: string
 *            description: The name of the role.
 *            example: Employee
 *          is_active:
 *            type: integer
 *            description: Set role status (1 for active, 0 for inactive).
 *            example: 1
 */
export interface IRole {
  id?: number
  rolename: string
  is_active?: number // 1 = active, 0 = inactive
  is_deleted?: number // 1 = deleted, 0 = not deleted
  created_at?: Date
  updated_at?: Date
}

// Type for query results
type RoleQueryResult = IRole & RowDataPacket

export const Role = {
  async findAll (): Promise<IRole[]> {
    try {
      const [rows] = await pool.query<RoleQueryResult[]>(
        'SELECT * FROM tbl_role WHERE is_deleted = 0 ORDER BY rolename ASC'
      )
      return rows
    } catch (error) {
      console.error('[models/Role.findAll]', error)
      throw new Error('Error fetching all roles')
    }
  },

  async findById (id: number): Promise<IRole | null> {
    try {
      const [rows] = await pool.query<RoleQueryResult[]>(
        'SELECT * FROM tbl_role WHERE id = ? AND is_deleted = 0',
        [id]
      )
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error('[models/Role.findById]', error)
      throw new Error('Error fetching role by ID')
    }
  },

  async create(roleData: Pick<IRole, 'rolename'>): Promise<number> {
    const { rolename } = roleData;
    try {
      const [result] = await pool.query<OkPacket>(
        'INSERT INTO tbl_role (rolename, is_active, is_deleted, created_at, updated_at) VALUES (?, 1, 0, NOW(), NOW())',
        [rolename]
      );
      return result.insertId;
    } catch (error) {
      console.error('[models/Role.create]', error);
      // Handle potential unique constraint error if rolename is unique
      if (error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
          throw new Error('Role name already exists.');
      }
      throw new Error('Error creating role');
    }
  },

  async update(id: number, roleData: Partial<Pick<IRole, 'rolename' | 'is_active'>>): Promise<boolean> {
    const fields = Object.keys(roleData) as Array<keyof typeof roleData>;
    if (fields.length === 0) return false;

    const updateFields: Partial<Pick<IRole, 'rolename' | 'is_active'>> = {};
    if ('rolename' in roleData && roleData.rolename) {
        updateFields.rolename = roleData.rolename;
    }
    if ('is_active' in roleData && roleData.is_active !== undefined && [0, 1].includes(Number(roleData.is_active))) {
        updateFields.is_active = Number(roleData.is_active);
    }

    const finalFields = Object.keys(updateFields) as Array<keyof typeof updateFields>;
    if (finalFields.length === 0) return false; // No valid fields to update

    const setClauses = finalFields.map(field => `${field} = ?`).join(', ');
    const values = finalFields.map(field => updateFields[field as keyof typeof updateFields]);
    values.push(id);

    try {
      const [result] = await pool.query<OkPacket>(
        `UPDATE tbl_role SET ${setClauses}, updated_at = NOW() WHERE id = ? AND is_deleted = 0`,
        values
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[models/Role.update]', error);
      if (error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
          throw new Error('Role name already exists.');
      }
      throw new Error('Error updating role');
    }
  },

  async softDelete(id: number): Promise<boolean> {
    // IMPORTANT: Check if role is assigned to any users before deleting!
    try {
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM tbl_users WHERE role_id = ? AND is_deleted = 0',
            [id]
        );
        if (users.length > 0) {
            throw new Error('Cannot delete role: Role is assigned to active users.');
        }

        const [result] = await pool.query<OkPacket>(
            'UPDATE tbl_role SET is_deleted = 1, is_active = 0, updated_at = NOW() WHERE id = ? AND is_deleted = 0',
            [id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('[models/Role.softDelete]', error);
        if (error instanceof Error && error.message.includes('Cannot delete role')) {
            throw error; // Re-throw the specific error
        }
        throw new Error('Error deleting role');
    }
  }
} 