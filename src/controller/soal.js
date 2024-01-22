import soalModel from "../models/soal.js";
import ErrorHandler from '../util/error.js';

const { BadRequestError, InternalServerError } = ErrorHandler;

const addSoal = async (req, res) => {
    const { body } = req;
    const { params } = req;
    const { user } = req;
    const { id_bank_soal } = params;

    try {
        const result = await soalModel.addSoal(id_bank_soal, body);

        if (result.success) {
            res.status(201).json({ success: true, message: 'Soal baru telah ditambahkan', result, body });
            console.log(result);
        } else {
            res.status(result.statusCode).json({ success: false, message: result.message, error: result.error });
            console.log(result.message);
        }
    } catch (error) {
        console.error(error);

        if (error instanceof BadRequestError) {
            res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
        } else if (error instanceof InternalServerError) {
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Gagal menambahkan soal', error: error.message });
        }
    }
};

const updateSoal = async (req, res) => {
    const { body, params, user } = req;
    const { id_soal } = params;

    try {
        if (user && user.role === 'Kontributor') {
            // Pastikan model Anda dapat menangani data dari req.body tanpa perlu mengonversi JSON
            const result = await soalModel.updateSoal(id_soal, body);
            if (result.success) {
                res.status(201).json({ success: true, message: 'Soal telah diperbarui', result });
            } else {
                res.status(400).json({ success: false, message: 'Gagal memperbarui soal', error: result.message });
                console.log(result.message);
            }
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);

        if (error instanceof TypeError && error.message.includes("Cannot read properties of undefined")) {
            res.status(400).json({ success: false, message: "Terjadi kesalahan pada data yang diberikan." });
        } else if (error instanceof BadRequestError) {
            res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
        } else if (error instanceof InternalServerError) {
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Gagal memperbarui soal', error: error.message });
        }
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
        if (error instanceof InternalServerError) {
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Gagal mendapatkan soal', error: error.message });
        }
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
            res.status(200).json({ success: true, message: 'Soal berhasil dihapus.' });
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        // Tangani kesalahan dan kirim respons dengan status error
        console.error(error);

        if (error instanceof InternalServerError) {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus soal.', error: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Gagal menghapus soal.', error: error.message });
        }
    }
};


export default {
    addSoal,
    updateSoal,
    getAllSoal,
    deleteSoal,
};