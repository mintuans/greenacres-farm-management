import pool from './config/database';

async function check() {
    try {
        const res = await pool.query('SELECT * FROM permissions');
        console.log('--- PERMISSIONS ---');
        console.table(res.rows);

        const roles = await pool.query('SELECT * FROM roles');
        console.log('--- ROLES ---');
        console.table(roles.rows);

        const role_perms = await pool.query('SELECT r.name as role, p.code as permission FROM role_permissions rp JOIN roles r ON rp.role_id = r.id JOIN permissions p ON rp.permission_id = p.id');
        console.log('--- ROLE PERMISSIONS ---');
        console.table(role_perms.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
