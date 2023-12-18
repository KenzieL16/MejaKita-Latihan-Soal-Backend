import dbpool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

async function getAllSoal(id_latihan_soal) {
    const connection = await dbpool;

    try {
        // Query untuk mendapatkan semua soal berdasarkan id_bank_soal
        const getAllSoalQuery = `
            SELECT ls.durasi, s.id_soal, s.konten_soal, j.id_jawaban, j.konten_jawaban, j.jawaban_benar
            FROM latihan_soal ls
            JOIN soal s ON ls.id_bank_soal = s.id_bank_soal
            LEFT JOIN jawaban j ON s.id_soal = j.id_soal
            WHERE ls.id_latihan_soal = ? AND s.deleted IS NULL 
        `;
        const [results] = await connection.execute(getAllSoalQuery, [id_latihan_soal]);

        // Proses hasil query untuk mengelompokkan data soal, jawaban, dan pembahasan
        const soalData = {};
        let durasi;

        results.forEach((row) => {
            const { id_soal, konten_soal, konten_pembahasan, id_jawaban, konten_jawaban, jawaban_benar } = row;

            // Get the duration value from the first row since it's the same for all rows
            if (durasi === undefined) {
                durasi = row.durasi;
            }

            if (!soalData[id_soal]) {
                soalData[id_soal] = {
                    id_soal,
                    konten_soal,
                    pembahasan: konten_pembahasan,
                    jawaban: [],
                };
            }

            if (id_jawaban) {
                soalData[id_soal].jawaban.push({
                    id_jawaban,
                    konten_jawaban,
                    jawaban_benar,
                });
            }
        });

        // Ubah objek menjadi array untuk hasil yang lebih mudah diolah
        const hasilAkhir = {
            durasi,
            soalData: Object.values(soalData),
        };

        return hasilAkhir;
    } catch (error) {
        throw error;
    }
}

async function submitJawaban(id_user, id_jawaban, id_latihan_soal) {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');

        // Cek apakah data sudah ada untuk kombinasi kunci tertentu
        const checkExistingQuery = `
            SELECT id_user, id_latihan_soal, id_soal
            FROM jawaban_user
            WHERE id_user = ? AND id_latihan_soal = ? AND id_soal = (SELECT id_soal FROM jawaban WHERE id_jawaban = ?)
        `;

        const [existingResult] = await connection.execute(checkExistingQuery, [id_user, id_latihan_soal, id_jawaban]);

        if (existingResult.length > 0) {
            // Jika data sudah ada, lakukan update
            const updateJawabanUserQuery = `
                UPDATE jawaban_user
                SET id_jawaban = ?
                WHERE id_user = ? AND id_latihan_soal = ? AND id_soal = (SELECT id_soal FROM jawaban WHERE id_jawaban = ?)
            `;

            await connection.execute(updateJawabanUserQuery, [id_jawaban, id_user, id_latihan_soal, id_jawaban]);
        } else {
            // Jika data belum ada, lakukan insert
            const insertJawabanUserQuery = `
                INSERT INTO jawaban_user (id_user, id_jawaban, id_latihan_soal, id_soal)
                VALUES (?, ?, ?, (SELECT id_soal FROM jawaban WHERE id_jawaban = ?))
            `;

            await connection.execute(insertJawabanUserQuery, [id_user, id_jawaban, id_latihan_soal, id_jawaban]);
        }

        await connection.query('COMMIT');
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
}

async function enrollment(id_user, id_latihan_soal) {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');

        // Contoh: Menyisipkan data ke tabel 'jawaban_user' dengan tambahan 'id_latihan_soal'
        const enrollmentquery = 'INSERT INTO enrollment (id_user, id_latihan_soal, enrollment_date) VALUES (?, ?, NOW())';

        await connection.execute(enrollmentquery, [id_user, id_latihan_soal]);


        await connection.query('COMMIT');
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
}

async function countNilai(id_user, id_latihan_soal) {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');

        // Hitung jumlah benar
        const hitungJumlahBenarQuery = `
            SELECT COUNT(ju.id_jawaban) AS jumlah_benar
            FROM jawaban_user ju
            INNER JOIN jawaban j ON ju.id_jawaban = j.id_jawaban
            WHERE ju.id_user = ? AND ju.id_latihan_soal = ? AND j.jawaban_benar = 1
        `;

        const [result] = await connection.execute(hitungJumlahBenarQuery, [id_user, id_latihan_soal]);
        const jumlahBenar = result[0].jumlah_benar;

        // Hitung jumlah soal
        const hitungJumlahSoalQuery = `
            SELECT COUNT(*) AS jumlah_soal
            FROM soal s
            INNER JOIN latihan_soal ls ON s.id_bank_soal = ls.id_bank_soal
            WHERE ls.id_latihan_soal = ?
        `;

        const [soalResult] = await connection.execute(hitungJumlahSoalQuery, [id_latihan_soal]);
        const jumlahSoal = soalResult[0].jumlah_soal;

        // Hitung nilai
        const nilai = (jumlahBenar / jumlahSoal) * 100;

        // Dapatkan id_enrollment dari tabel enrollment
        const getIdEnrollmentQuery = 'SELECT id_enrollment FROM enrollment WHERE id_user = ? AND id_latihan_soal = ?';
        const [enrollmentResult] = await connection.execute(getIdEnrollmentQuery, [id_user, id_latihan_soal]);

        // Periksa apakah hasil query tidak kosong dan memiliki id_enrollment
        const id_enrollment = enrollmentResult.length > 0 ? enrollmentResult[0].id_enrollment : null;

        if (id_enrollment === null) {
            console.error('ID Enrollment is NULL');
            // Handle atau log kesalahan jika diperlukan
        }

        // Insert atau update (replace) data di tabel nilai_akhir
        const insertNilaiAkhirQuery = `
            INSERT INTO nilai_akhir (id_user, id_latihan_soal, id_enrollment, jumlah_benar, konten_nilai)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE jumlah_benar = ?, konten_nilai = ?;
        `;

        await connection.execute(
            insertNilaiAkhirQuery,
            [id_user, id_latihan_soal, id_enrollment, jumlahBenar, nilai, jumlahBenar, nilai]
        );

        await connection.query('COMMIT');

        return {
            jumlahBenar,
            jumlahSoal,
            nilai,
        };
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
}

export default {
    getAllSoal,
    submitJawaban,
    enrollment,
    countNilai
}