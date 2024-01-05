import ujianModel from "../models/ujian.js";

const getAllSoal = async (req, res) => {
    const { params } = req;
    const { id_latihan_soal } = params;

    try {
        const result = await ujianModel.getAllSoal(id_latihan_soal);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mendapatkan soal', error: error.message });
    }
};
const submitJawaban = async (req, res) => {
    const { params, body } = req;
    const { id_latihan_soal } = params;
    const { id_user, id_jawaban } = body;

    try {

        // Panggil fungsi submitJawaban dari model
        await ujianModel.submitJawaban(id_user, id_jawaban, id_latihan_soal);

        res.status(200).json({
            success: true,
            message: 'Jawaban berhasil disubmit',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: error.message,
        });
    }
};

const enrollment = async (req, res) => {
    const { params } = req;
    const { id_latihan_soal } = params;
    const { id } = req.user;

    try {
        console.log(id_latihan_soal);
        console.log(id);
        // Pastikan id_user dan id_latihan_soal terdefinisi
        if (id === undefined || id_latihan_soal === undefined) {
            throw new Error('Parameter id_user atau id_latihan_soal tidak valid');
        }

        const result = await ujianModel.enrollment(id, id_latihan_soal);
        res.status(200).json({ success: true, message: 'Data Disimpan', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
    }
};

const countNilai = async (req, res) => {
    const { params } = req;
    const { id_latihan_soal } = params;
    const { id } = req.user;
    try {
        if (id === undefined) {
            throw new Error('You must login');
        }

        // Hitung nilai dan simpan ke tabel nilai_akhir
        const result = await ujianModel.countNilai(id, id_latihan_soal);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
    }
};

export default {
    getAllSoal,
    submitJawaban,
    enrollment,
    countNilai
};