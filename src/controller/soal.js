import soalModel from "../models/soal.js";

const addSoal = async (req, res) => {
    const { body, user } = req;
    const { params } = req;
    const { id_bank_soal } = params;

    try {
        if (user && user.role === 'Kontributor') {
            const result = await soalModel.addSoal(id_bank_soal, body);
            res.status(201).json({ success: true, message: 'Soal baru telah ditambahkan', result });
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan soal', error: error.message });
    }
};

const updateSoal = async (req, res) => {
    const { body, params, user } = req;
    const { id_soal } = params;

    try {
        if (user && user.role === 'Kontributor') {
            // Pastikan model Anda dapat menangani data dari req.body tanpa perlu mengonversi JSON
            const result = await soalModel.updateSoal(id_soal, body);
            res.status(201).json({ success: true, message: 'Soal telah diperbarui', result });
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui soal', error: error.message });
    }
};

const getAllSoal = async (req, res) => {
    const { params } = req;
    const { id_bank_soal } = params;

    try {
        const result = await soalModel.getAllSoal(id_bank_soal);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mendapatkan soal', error: error.message });
    }
};

const deleteSoal = async (req, res) => {
    const { id_soal } = req.params;
    const { user } = req;

    try {
        if (user && user.role === 'Kontributor') {
            // Panggil fungsi deleteSoal dengan id_soal yang diberikan
            await soalModel.deleteSoal(id_soal);
            // Berikan respons sukses jika tidak ada kesalahan
            res.status(200).json({ message: 'Soal berhasil dihapus.' });
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        // Tangani kesalahan dan kirim respons dengan status error
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus soal.' });
    }
};


export default {
    addSoal,
    updateSoal,
    getAllSoal,
    deleteSoal,
};