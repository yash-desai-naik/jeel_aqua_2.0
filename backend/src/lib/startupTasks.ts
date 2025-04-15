import bcrypt from 'bcrypt';
import pool from '../config/db'; // Import pool for direct query
import { IUser } from '../models/User'; // Import IUser type
import { RowDataPacket, OkPacket } from 'mysql2/promise';

export async function ensureAdminUserExists() {
    const ADMIN_PHONE = process.env.DEFAULT_ADMIN_PHONE || '0000000000';
    const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const ADMIN_ROLE_NAME = 'Admin'; // Or 'Owner' - adjust as needed

    console.log('Checking for default admin user...');

    try {
        // 1. Check if user exists
        const [userRows] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM tbl_users WHERE phone = ?',
            [ADMIN_PHONE]
        );

        if (userRows.length > 0) {
            console.log('Default admin user already exists.');
            return;
        }

        console.log('Default admin user not found, creating...');

        // 2. Find Admin Role ID
        const [roleRows] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM tbl_role WHERE rolename = ? AND is_active = 1 AND is_deleted = 0',
            [ADMIN_ROLE_NAME]
        );

        let adminRoleId: number;
        if (roleRows.length === 0) {
            console.warn(`Role '${ADMIN_ROLE_NAME}' not found or inactive. Inserting...`);
            const [insertRoleResult] = await pool.query<OkPacket>(
                'INSERT INTO tbl_role (rolename, is_active, is_deleted, created_at, updated_at) VALUES (?, 1, 0, NOW(), NOW())',
                [ADMIN_ROLE_NAME]
            );
            adminRoleId = insertRoleResult.insertId;
             if (!adminRoleId) {
                throw new Error ('Failed to create Admin role.');
            }
             console.log(`Role '${ADMIN_ROLE_NAME}' created with ID: ${adminRoleId}`);
        } else {
            adminRoleId = roleRows[0].id;
        }

        // 3. Hash Password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

        // 4. Insert Admin User
        const newUser = {
            firstname: 'Admin',
            lastname: 'User',
            phone: ADMIN_PHONE,
            password: hashedPassword,
            email: 'admin@example.com',
            role_id: adminRoleId,
            address_1: 'NA',
            address_2: null,
            city: 'Bharuch',
            state: 'Gujarat',
            lattitude: null,
            longitude: null,
            zone_id: null,
            society_id: null,
            is_active: 1,
            is_deleted: 0,
            created_at: new Date(),
            updated_at: new Date(),
            referral_code: 'ADMINREF',
            referral_points: 0,
            token: null,
            total_quantity_remain: 0,
            deposit: 0,
            total_amount: 0,
            due_amount: 0,
        };

        const [insertUserResult] = await pool.query<OkPacket>(
            'INSERT INTO tbl_users SET ?',
            [newUser]
        );

        if (insertUserResult.affectedRows === 1) {
            console.log(`Default admin user created successfully! Phone: ${ADMIN_PHONE}`);
        } else {
            throw new Error('Failed to insert default admin user.');
        }

    } catch (error) {
        console.error("Error ensuring admin user exists:", error);
        // Consider if the server should fail to start if seeding fails critically
        // For now, allowing it to continue but logging the error.
    }
}
