import dbpool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

async function getAllSoal(id_latihan_soal) {
    const connection = await dbpool;

    try {
        // Query untuk mendapatkan semua soal berdasarkan id_bank_soal
        const getAllSoalQuery = `
            SELECT ls.nama_latihansoal, ls.durasi, s.id_soal, s.konten_soal, j.id_jawaban, j.konten_jawaban 
            FROM latihan_soal ls
            JOIN soal s ON ls.id_bank_soal = s.id_bank_soal
            LEFT JOIN jawaban j ON s.id_soal = j.id_soal
            WHERE ls.id_latihan_soal = ? AND s.deleted IS NULL AND j.deleted IS NULL
        `;
        const [results] = await connection.execute(getAllSoalQuery, [id_latihan_soal]);

        // Proses hasil query untuk mengelompokkan data soal, jawaban, dan pembahasan
        const soalData = {};
        let nama_latihansoal;
        let durasi;

        results.forEach((row) => {
            const { id_soal, konten_soal, konten_pembahasan, id_jawaban, konten_jawaban, jawaban_benar } = row;

            if (nama_latihansoal === undefined) {
                nama_latihansoal = row.nama_latihansoal;
            }
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
            nama_latihansoal,
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
        console.log('Transaksi dimulai');
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

        console.log('Transaksi selesai');
        await connection.query('COMMIT');
    } catch (error) {
        console.error('Kesalahan:', error);

        console.log('Rollback transaksi');
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
            WHERE ls.id_latihan_soal = ? AND s.deleted IS NULL
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

async function doneUjian(id_user, id_latihan_soal) {
    const connection = await dbpool;
    console.log("Parameters:", [id_latihan_soal, id_user]);

    try {
        // Query untuk mendapatkan semua jawaban user beserta konten_jawaban berdasarkan id_latihan_soal dan id_user
        const getJawabanUserQuery = `
            SELECT ju.id_user, ju.id_jawaban_user, ju.id_jawaban, ju.id_latihan_soal, ju.id_soal, j.konten_jawaban, j.jawaban_benar
            FROM jawaban_user ju
            LEFT JOIN jawaban j ON ju.id_jawaban = j.id_jawaban
            WHERE ju.id_latihan_soal = ? AND ju.id_user = ?
        `;
        const [jawabanUserResults] = await connection.execute(getJawabanUserQuery, [id_latihan_soal, id_user]);

        // Query untuk mendapatkan semua soal berdasarkan id_latihan_soal
        const getAllSoalQuery = `
            SELECT ls.nama_latihansoal, ls.durasi, s.id_soal, s.konten_soal, p.konten_pembahasan, j.id_jawaban, j.konten_jawaban, j.jawaban_benar
            FROM latihan_soal ls
            JOIN soal s ON ls.id_bank_soal = s.id_bank_soal
            LEFT JOIN pembahasan p ON s.id_soal = p.id_soal
            LEFT JOIN jawaban j ON s.id_soal = j.id_soal
            WHERE ls.id_latihan_soal = ? AND s.deleted IS NULL AND j.deleted IS NULL
        `;
        const [results] = await connection.execute(getAllSoalQuery, [id_latihan_soal]);

        // Query untuk mendapatkan nilai akhir
        const getNilaiAkhirQuery = `
            SELECT konten_nilai
            FROM nilai_akhir
            WHERE id_latihan_soal = ? AND id_user = ?
        `;
        const [nilaiAkhirResults] = await connection.execute(getNilaiAkhirQuery, [id_latihan_soal, id_user]);

        // Proses hasil query untuk mengelompokkan data soal, jawaban, dan pembahasan
        const soalData = {};
        let nama_latihansoal;
        let durasi;

        // Gabungkan hasil jawaban user ke dalam objek soalData
        results.forEach((row) => {
            const { id_soal, konten_soal, konten_pembahasan, id_jawaban, konten_jawaban, jawaban_benar } = row;

            if (nama_latihansoal === undefined) {
                nama_latihansoal = row.nama_latihansoal;
            }

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
                const jawabanUser = jawabanUserResults.find((jawaban) => jawaban.id_soal === id_soal);
                soalData[id_soal].jawaban.push({
                    id_jawaban,
                    konten_jawaban,
                    jawaban_benar,
                });

                // Tambahkan informasi jawaban user sebagai objek terpisah
                soalData[id_soal].jawaban_user = {
                    id_jawaban_user: jawabanUser ? jawabanUser.id_jawaban_user : null,
                    id_jawaban: jawabanUser ? jawabanUser.id_jawaban : null,
                    konten_jawaban: jawabanUser ? jawabanUser.konten_jawaban : null,
                    jawaban_benar: jawabanUser ? jawabanUser.jawaban_benar : null,
                };
            }
        });

        // Ubah objek menjadi array untuk hasil yang lebih mudah diolah
        const hasilAkhir = {
            nama_latihansoal,
            durasi,
            soalData: Object.values(soalData),
            nilai_akhir: nilaiAkhirResults.length > 0 ? nilaiAkhirResults[0].konten_nilai : null,
        };
        return hasilAkhir;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export default {
    getAllSoal,
    submitJawaban,
    enrollment,
    countNilai,
    doneUjian
}