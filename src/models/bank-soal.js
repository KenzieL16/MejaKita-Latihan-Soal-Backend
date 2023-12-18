import dbpool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

async function createBanksoal({ nama_banksoal }) {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');

        // Tambahkan data ke tabel latihan_soal
        const createbanksoalQuery = 'INSERT INTO bank_soal (nama_banksoal) VALUES (?)';
        const [result] = await connection.execute(createbanksoalQuery, [nama_banksoal]);

        const id_bank_soal = result.insertId;

        await connection.query('COMMIT');

        return { id_bank_soal, nama_banksoal };
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
}

const getBanksoal = async () => {
    try {
        const [rows, fields] = await dbpool.execute('SELECT id_bank_soal, nama_banksoal FROM bank_soal');
        return rows;
    } catch (error) {
        throw error;
    }
};

async function updateBanksoal({ id_bank_soal, nama_banksoal }) {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');
        // Perbarui data di tabel bank_soal
        const updateBanksoalQuery = 'UPDATE bank_soal SET nama_banksoal = ? WHERE id_bank_soal = ?';
        await connection.execute(updateBanksoalQuery, [nama_banksoal, id_bank_soal]);

        await connection.query('COMMIT');

        return { id_bank_soal, nama_banksoal };
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
}
async function deleteBankSoal(id_bank_soal) {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');

        // Update kolom deleted pada tabel bank_soal
        const updateBankSoalQuery = 'UPDATE bank_soal SET deleted = NOW() WHERE id_bank_soal = ?';
        await connection.execute(updateBankSoalQuery, [id_bank_soal]);

        await connection.query('COMMIT');
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
}

export default {
    createBanksoal,
    getBanksoal,
    updateBanksoal,
    deleteBankSoal
};