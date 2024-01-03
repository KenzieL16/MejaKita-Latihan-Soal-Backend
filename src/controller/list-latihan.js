import dashboardModel from "../models/list-latihan.js";


const createNewLatsol = async (req, res) => {
    const { body, user } = req;

    try {
        if (user && user.role === 'Kontributor') {
            const result = await dashboardModel.createNewLatsol(body);
            res.status(201).json({ success: true, message: 'Latihan soal baru telah ditambahkan', result });
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan latihan soal', error: error.message });
    }
};
const updateLatsol = async (req, res) => {
    try {
        console.log(req.params)
        const { id_latihan_soal } = req.params;
        const { id_bank_soal, status, nama_latihansoal, durasi } = req.body;

        // Panggil fungsi updateLatsol dari service
        const result = await dashboardModel.updateLatsol({ id_latihan_soal, id_bank_soal, status, nama_latihansoal, durasi });

        return res.status(200).json({
            success: true,
            message: 'Latihan soal berhasil diperbarui',
            data: result,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui latihan soal',
            error: error.message,
        });
    }
};

const createBanksoal = async (req, res) => {
    const { body } = req;

    try {
        const result = await dashboardModel.createBanksoal(body);
        res.status(201).json({ success: true, message: 'Bank soal baru telah ditambahkan', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan bank soal', error: error.message });
    }
};
const getDashboard = async (req, res) => {
    try {
        const dashboardData = await dashboardModel.getDashboard();
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard', error: error.message });
    }
};
const getBanksoal = async (req, res) => {
    try {
        const banksoalData = await dashboardModel.getBanksoal();
        res.status(200).json(banksoalData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data bank soal', error: error.message });
    }
};

const deleteLatsol = async (req, res) => {
    const { id_latihan_soal } = req.params;
    const { body } = req;
    try {
        await dashboardModel.deleteLatsol(id_latihan_soal);
        res.json({
            message: 'Berhasil Menghapus Latihan Soal',
            data: body
        })
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            serverMessage: error
        })
    }
}


export default {
    createNewLatsol,
    getDashboard,
    createBanksoal,
    updateLatsol,
    getBanksoal,
    deleteLatsol,
};