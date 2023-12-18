import historiModel from "../models/history-ujian.js";

const getHistoryByIdUser = async (req, res) => {
    const { params } = req;
    const { id_user } = params

    try {
        const history = await historiModel.getHistoryByIdUser(id_user);
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data history', error: error.message });
    }
};

export default {
    getHistoryByIdUser,
}
