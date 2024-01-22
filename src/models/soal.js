import dbpool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

async function addSoal(id_bank_soal, body) {
    const { soal } = body;

    // Pemeriksaan keberadaan dan nilai properti 'soal'
    if (!soal || typeof soal !== 'object') {
        return { success: false, message: "Properti 'soal' harus berupa objek.", statusCode: 400 };
    }

    const connection = await dbpool;

    try {
        console.log('Transaksi dimulai');
        await connection.query('START TRANSACTION');

        // Tambahkan data ke tabel soal
        const createSoalQuery = 'INSERT INTO soal (konten_soal, id_bank_soal) VALUES (?, ?)';
        const [soalResult] = await connection.execute(createSoalQuery, [soal.konten_soal, id_bank_soal]);
        const id_soal = soalResult.insertId;

        // Loop untuk menambahkan jawaban
        for (let j = 0; j < soal.jawaban.length; j++) {
            const { konten_jawaban, jawaban_benar } = soal.jawaban[j];

            // Pemeriksaan keberadaan dan nilai properti 'konten_jawaban' dan 'jawaban_benar'
            if (typeof konten_jawaban !== 'string') {
                await connection.query('ROLLBACK');
                return { success: false, message: "Properti 'konten_jawaban' harus berupa string.", statusCode: 400 };
            }
            if (typeof jawaban_benar !== 'string' || (jawaban_benar !== '0' && jawaban_benar !== '1')) {
                await connection.query('ROLLBACK');
                return { success: false, message: "Properti 'jawaban_benar' harus berupa angka (0 atau 1) dalam bentuk string.", statusCode: 400 };
            }

            // Tambahkan data ke tabel jawaban
            const createJawabanQuery = 'INSERT INTO jawaban (id_soal, konten_jawaban, jawaban_benar) VALUES (?, ?, ?)';
            await connection.execute(createJawabanQuery, [id_soal, konten_jawaban, jawaban_benar]);
        }

        // Tambahkan data ke tabel pembahasan
        const createPembahasanQuery = 'INSERT INTO pembahasan (id_soal, konten_pembahasan) VALUES (?, ?)';
        await connection.execute(createPembahasanQuery, [id_soal, soal.pembahasan]);

        console.log('Transaksi selesai');
        await connection.query('COMMIT');

        return { success: true, id_soal };
    } catch (error) {
        console.error('Kesalahan:', error);

        console.log('Rollback transaksi');
        await connection.query('ROLLBACK');

        throw error;
    }
}

async function updateSoal(id_soal, body) {
    const { soal } = body;
    const { konten_soal, jawaban, pembahasan } = soal;

    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');

        // Perbarui data pada tabel soal
        const updateSoalQuery = 'UPDATE soal SET konten_soal = ? WHERE id_soal = ?';
        await connection.execute(updateSoalQuery, [konten_soal, id_soal]);

        const deleteJawabanQuery = 'UPDATE jawaban SET deleted = NOW() WHERE id_soal = ?';
        await connection.execute(deleteJawabanQuery, [id_soal]);

        for (let j = 0; j < jawaban.length; j++) {
            const { id_jawaban, konten_jawaban, jawaban_benar } = jawaban[j];
            console.log(id_jawaban, id_soal)

            const createJawabanQuery = 'INSERT INTO jawaban (id_soal, konten_jawaban, jawaban_benar) VALUES (?, ?, ?)';
            await connection.execute(createJawabanQuery, [id_soal, konten_jawaban, jawaban_benar]);

        }

        // Perbarui data pada tabel pembahasan
        const updatePembahasanQuery = 'UPDATE pembahasan SET konten_pembahasan = ? WHERE id_soal = ?';
        await connection.execute(updatePembahasanQuery, [pembahasan, id_soal]);

        await connection.query('COMMIT');

        return { id_soal };
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
};


async function getAllSoal(id_bank_soal) {
    const connection = await dbpool;

    try {
        // Query untuk mendapatkan semua soal berdasarkan id_bank_soal
        const getAllSoalQuery = `
            SELECT s.id_soal, s.konten_soal, p.konten_pembahasan, j.id_jawaban, j.konten_jawaban, j.jawaban_benar
            FROM soal s
            LEFT JOIN pembahasan p ON s.id_soal = p.id_soal
            LEFT JOIN jawaban j ON s.id_soal = j.id_soal
            WHERE s.id_bank_soal = ? AND s.deleted IS NULL AND j.deleted IS NULL
        `;
        const [results] = await connection.execute(getAllSoalQuery, [id_bank_soal]);

        // Proses hasil query untuk mengelompokkan data soal, jawaban, dan pembahasan
        const soalData = {};
        results.forEach((row) => {
            const { id_soal, konten_soal, konten_pembahasan, id_jawaban, konten_jawaban, jawaban_benar } = row;

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
        const hasilAkhir = Object.values(soalData);

        return hasilAkhir;
    } catch (error) {
        throw error;
    }
}

async function deleteSoal(id_soal) {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');

        // Update kolom deleted pada tabel soal
        const deleteSoalQuery = 'UPDATE soal SET deleted = NOW() WHERE id_soal = ?';
        await connection.execute(deleteSoalQuery, [id_soal]);

        // Commit transaksi
        await connection.query('COMMIT');
    } catch (error) {
        // Rollback transaksi jika terjadi kesalahan
        await connection.query('ROLLBACK');
        throw error;
    }
};

export default {
    addSoal,
    updateSoal,
    getAllSoal,
    deleteSoal,
}