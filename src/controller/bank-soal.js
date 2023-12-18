import banksoalModel from "../models/bank-soal.js"

const createBanksoal = async (req, res) => {
    const { body } = req;
    const { params } = req;
    const { id_bank_soal } = params;

    try {
        const result = await banksoalModel.createBanksoal(body, id_bank_soal);
        res.status(201).json({ success: true, message: 'Bank soal baru telah ditambahkan', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan bank soal', error: error.message });
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
        console.log(req.params)
        const { id_bank_soal } = req.params;
        const { nama_banksoal } = req.body;

        // Panggil fungsi banksoal dari service
        const result = await banksoalModel.updateBanksoal({ id_bank_soal, nama_banksoal });

        return res.status(200).json({
            success: true,
            message: 'Bank soal berhasil diperbarui',
            data: result,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui bank soal',
            error: error.message,
        });
    }
};

const deleteBanksoal = async (req, res) => {
    const { id_bank_soal } = req.params;
    const { body } = req;

    try {
        await banksoalModel.deleteBankSoal(id_bank_soal);
        res.json({
            message: 'Berhasil Menghapus Bank Soal',
            data: body
        })
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            serverMessage: error
        })
    }
};

export default {
    createBanksoal,
    getBanksoal,
    updateBanksoal,
    deleteBanksoal,
};