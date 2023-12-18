import dbpool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

async function createNewTags({ nama_tag }) {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');

        // Tambahkan data ke tabel latihan_soal
        const createTagsQuery = 'INSERT INTO tag ( nama_tag ) VALUES (?)';
        await connection.execute(createTagsQuery, [nama_tag]);

        await connection.query('COMMIT');

        return { nama_tag };
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
};

const getTags = async () => {
    try {
        const [rows, fields] = await dbpool.execute('SELECT id_tag, nama_tag FROM tag WHERE deleted IS NULL');
        return rows;
    } catch (error) {
        throw error;
    }
};

const deleteTags = (id_tag) => {
    const query = `UPDATE tag set deleted = NOW() WHERE id_tag = ${id_tag}`;

    return dbpool.execute(query, [id_tag]);
};

export default {
    getTags,
    createNewTags,
    deleteTags,
};
