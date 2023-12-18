import dbpool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

async function getHistoryByIdUser(id_user) {
    const connection = await dbpool;

    try {
        // Dapatkan histori ujian dari tabel enrollment
        const getHistoryQuery = `
            SELECT
                e.id_latihan_soal,
                e.enrollment_date,
                ls.nama_latihansoal,
                na.konten_nilai
            FROM enrollment e
            INNER JOIN latihan_soal ls ON e.id_latihan_soal = ls.id_latihan_soal
            LEFT JOIN nilai_akhir na ON e.id_user = na.id_user AND e.id_latihan_soal = na.id_latihan_soal
            WHERE e.id_user = ?
        `;

        const [historyResult] = await connection.execute(getHistoryQuery, [id_user]);

        return historyResult;
    } catch (error) {
        throw error;
    }
}

export default {
    getHistoryByIdUser
}
