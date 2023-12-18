import dbpool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const createNewLatsol = async ({ nama_latihansoal, durasi, nama_tag, nama_banksoal }) => {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');

        // Check if nama_latihansoal already exists
        const checkExistenceQuery = 'SELECT id_latihan_soal FROM latihan_soal WHERE nama_latihansoal = ?';
        const [existingResult] = await connection.execute(checkExistenceQuery, [nama_latihansoal]);

        if (existingResult && existingResult.length > 0) {
            throw new Error('Nama_latihansoal already exists in the database. Please choose a different name.');
        }

        // If nama_latihansoal doesn't exist, proceed with the insertion
        const createLatsolQuery = 'INSERT INTO latihan_soal (nama_latihansoal, durasi, status) VALUES (?, ?, "Arsip")';
        await connection.execute(createLatsolQuery, [nama_latihansoal, durasi]);

        // Dapatkan ID menggunakan SELECT query
        const selectLatsolQuery = 'SELECT id_latihan_soal FROM latihan_soal WHERE nama_latihansoal = ?';
        const [result] = await connection.execute(selectLatsolQuery, [nama_latihansoal]);

        if (!result || !result[0] || !result[0].id_latihan_soal) {
            throw new Error('Failed to retrieve the ID of the inserted row.');
        }

        const id_latihan_soal = result[0].id_latihan_soal;

        // Handle nama_banksoal logic
        let id_bank_soal;

        if (nama_banksoal) {
            // Check if the banksoal already exists in the bank_soal table
            const checkBankSoalQuery = 'SELECT id_bank_soal FROM bank_soal WHERE nama_banksoal = ?';
            const [bankSoalResult] = await connection.execute(checkBankSoalQuery, [nama_banksoal]);

            if (bankSoalResult && bankSoalResult.length > 0) {
                // Banksoal already exists, use the existing id_bank_soal
                id_bank_soal = bankSoalResult[0].id_bank_soal;
            } else {
                // Banksoal doesn't exist, create a new banksoal and get the id_bank_soal
                const createBankSoalQuery = 'INSERT INTO bank_soal (nama_banksoal) VALUES (?)';
                const [createdBankSoal] = await connection.execute(createBankSoalQuery, [nama_banksoal]);

                if (!createdBankSoal || !createdBankSoal.insertId) {
                    throw new Error('Failed to create a new banksoal.');
                }

                id_bank_soal = createdBankSoal.insertId;
            }

            // Update the latihan_soal row with the id_bank_soal
            const updateLatsolQuery = 'UPDATE latihan_soal SET id_bank_soal = ? WHERE id_latihan_soal = ?';
            await connection.execute(updateLatsolQuery, [id_bank_soal, id_latihan_soal]);
        }

        // Check if nama_tag is an array before using map
        if (Array.isArray(nama_tag)) {
            // Tambahkan semua tag menggunakan satu transaksi
            const addTagsquery = 'INSERT INTO latihansoal_tag (id_latihan_soal, id_tag) VALUES (?, ?)';

            for (const tag of nama_tag) {
                // Check if the tag already exists in the tag table
                const checkTagQuery = 'SELECT id_tag FROM tag WHERE nama_tag = ?';
                const [tagResult] = await connection.execute(checkTagQuery, [tag]);

                let id_tag;

                if (tagResult && tagResult.length > 0) {
                    // Tag already exists, use the existing id_tag
                    id_tag = tagResult[0].id_tag;
                } else {
                    // Tag doesn't exist, create a new tag and get the id_tag
                    const createTagQuery = 'INSERT INTO tag (nama_tag) VALUES (?)';
                    const [createdTag] = await connection.execute(createTagQuery, [tag]);

                    if (!createdTag || !createdTag.insertId) {
                        throw new Error('Failed to create a new tag.');
                    }

                    id_tag = createdTag.insertId;
                }

                // Insert into latihansoal_tag
                await connection.execute(addTagsquery, [id_latihan_soal, id_tag]);
            }
        }

        await connection.query('COMMIT');

        return { id_latihan_soal, nama_latihansoal, durasi, status: "Arsip", id_bank_soal };
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
};
async function updateLatsol({ id_latihan_soal, id_bank_soal, status, nama_latihansoal, durasi }) {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');
        // Perbarui data di tabel latihan_soal
        const updateLatsolQuery = 'UPDATE latihan_soal SET id_bank_soal = ?, status = ?, nama_latihansoal = ?, durasi = ? WHERE id_latihan_soal = ?';
        await connection.execute(updateLatsolQuery, [id_bank_soal, status, nama_latihansoal, durasi, id_latihan_soal]);

        await connection.query('COMMIT');

        return { id_latihan_soal, id_bank_soal, status, nama_latihansoal, durasi };
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
}

const getDashboard = async () => {
    try {
        const query = `
            SELECT
                ls.id_latihan_soal,
                ls.nama_latihansoal,
                ls.durasi,
                GROUP_CONCAT(lt.id_tag) AS id_tags,
                GROUP_CONCAT(t.nama_tag) AS nama_tags
            FROM
                latihan_soal ls
                LEFT JOIN latihansoal_tag lt ON ls.id_latihan_soal = lt.id_latihan_soal
                LEFT JOIN tag t ON lt.id_tag = t.id_tag
            WHERE
                ls.deleted IS NULL
            GROUP BY
                ls.id_latihan_soal, ls.nama_latihansoal, ls.durasi
        `;

        const [rows, fields] = await dbpool.execute(query);

        // Split id_tags and nama_tags into arrays
        rows.forEach(row => {
            if (row.id_tags) {
                row.id_tags = row.id_tags.split(',').map(Number);
            } else {
                row.id_tags = [];
            }

            if (row.nama_tags) {
                row.nama_tags = row.nama_tags.split(',');
            } else {
                row.nama_tags = [];
            }
        });

        return rows;
    } catch (error) {
        throw error;
    }
};
const deleteLatsol = (id_latihan_soal) => {
    const query = `UPDATE latihan_soal set deleted = NOW() WHERE id_latihan_soal = ${id_latihan_soal}`;

    return dbpool.execute(query, [id_latihan_soal]);
};

export default {
    createNewLatsol,
    getDashboard,
    updateLatsol,
    deleteLatsol

};