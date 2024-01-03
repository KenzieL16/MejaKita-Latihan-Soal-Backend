import dbpool from '../config/database.js';
import crypto from 'crypto';
const { scrypt } = crypto;
import dotenv from 'dotenv';
dotenv.config();


const createNewUsers = async (body) => {
    const { username, email, password, role } = body;

    // Check if the email already exists in the database
    const emailExists = await isEmailExists(email);
    if (emailExists) {
        throw new Error('Email already exists');
    }

    const { hashedPassword, salt } = await hashPassword(password);

    // Concatenate salt and hashed password with a delimiter
    const combinedPassword = `${hashedPassword}:${salt}`;

    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    const values = [username, email, combinedPassword, role];

    return dbpool.execute(query, values);
};
const isEmailExists = async (email) => {
    const query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    const [rows] = await dbpool.execute(query, [email]);
    const count = rows[0].count;
    return count > 0;
};
const hashPassword = async (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await new Promise((resolve, reject) => {
        scrypt(password, salt, 64, (err, key) => {
            if (err) reject(err);
            else resolve(key.toString('hex'));
        });
    });
    return { hashedPassword, salt };
};


const getUserByEmailAndPassword = (email) => {
    const query = `SELECT * FROM users WHERE email = ? AND delete_date IS NULL`;
    return dbpool.execute(query, [email])
        .then(([rows]) => {
            if (rows.length > 0) {
                const user = rows[0];

                if (user.password) {
                    return { id: user.id_user, username: user.username, email: user.email, role: user.role, combinedPassword: user.password };
                } else {
                    // Handle the case where password is undefined
                    console.error('Password is undefined for user:', user);
                    return null;
                }
            }
            return null;
        })
        .catch(error => {
            console.error('Error executing query:', error);
            throw error;
        });
};
const deleteUsers = (idUser) => {
    const query = `UPDATE users set delete_date = NOW() WHERE id_user = ${idUser}`;

    return dbpool.execute(query, [idUser]);
};

export default {
    createNewUsers,
    deleteUsers,
    getUserByEmailAndPassword,
    hashPassword,
    isEmailExists
};
