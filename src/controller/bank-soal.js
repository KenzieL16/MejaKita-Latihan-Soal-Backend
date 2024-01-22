import banksoalModel from "../models/bank-soal.js"
import ErrorHandler from '../util/error.js';
const { BadRequestError, InternalServerError, UnauthorizedError } = ErrorHandler;
const createBanksoal = async (req, res) => {
    const { body } = req;
    const { params } = req;
    const { id_bank_soal } = params;

    try {
        const result = await banksoalModel.createBanksoal(body, id_bank_soal);
        res.status(201).json({ success: true, message: 'Bank soal baru telah ditambahkan', result });
    } catch (error) {
        console.error(error);

        if (error instanceof InternalServerError) {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menambahkan bank soal', error: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Gagal menambahkan bank soal', error: error.message });
        }
    }
};

const getBanksoal = async (req, res) => {
    try {
        const banksoalData = await banksoalModel.getBanksoal();
        res.status(200).json(banksoalData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data bank soal', error: error.message });
    }
};

const updateBanksoal = async (req, res) => {
    try {
        console.log(req.params);
        const { id_bank_soal } = req.params;
        const { nama_banksoal } = req.body;
        //const { user } = req;

        //if (user && user.role === 'Kontributor') {
            // Panggil fungsi updateBanksoal dari model
            const result = await banksoalModel.updateBanksoal({ id_bank_soal, nama_banksoal });

            return res.status(200).json({
                success: true,
                message: 'Bank soal berhasil diperbarui',
                data: result,
            });
        //} else {
         //   res.status(403).json({ success: false, message: 'Unauthorized' });
        //}
    } catch (error) {
        console.error(error);

        if (error instanceof UnauthorizedError) {
            return res.status(403).json({ success: false, message: error.message });
        } else if (error instanceof InternalServerError) {
            return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memperbarui bank soal', error: error.message });
        } else {
            return res.status(500).json({ success: false, message: 'Gagal memperbarui bank soal', error: error.message });
        }
    }
};

const deleteBanksoal = async (req, res) => {
    const { id_bank_soal } = req.params;
    //const { user } = req;

    try {
        //if (user && user.role === 'Kontributor') {
            // Panggil fungsi deleteBankSoal dari model
            await banksoalModel.deleteBankSoal(id_bank_soal);

            res.json({
                success: true,
                message: 'Berhasil Menghapus Bank Soal',
                data: { id_bank_soal }
            });
        // } else {
        //     throw new UnauthorizedError('Unauthorized');
        // }
    } catch (error) {
        console.error(error);

        if (error instanceof UnauthorizedError) {
            return res.status(403).json({ success: false, message: error.message });
        } else if (error instanceof InternalServerError) {
            return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus bank soal', error: error.message });
        } else {
            return res.status(500).json({ success: false, message: 'Gagal menghapus bank soal', error: error.message });
        }
    }
};

export default {
    createBanksoal,
    getBanksoal,
    updateBanksoal,
    deleteBanksoal,
};