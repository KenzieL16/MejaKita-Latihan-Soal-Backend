import historiModel from "../models/history-ujian.js";

const getHistoryByIdUser = async (req, res) => {
    const { id } = req.user;

    try {
        if (id === undefined) {
            throw new Error('You must login');
        }
        const history = await historiModel.getHistoryByIdUser(id);
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data history', error: error.message });
    }
};

export default {
    getHistoryByIdUser,
}
