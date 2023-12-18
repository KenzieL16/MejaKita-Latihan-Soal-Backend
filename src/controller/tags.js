import tagsModel from "../models/tags.js";

const createNewTags = async (req, res) => {
    const { body } = req;

    try {
        const result = await tagsModel.createNewTags(body);
        res.status(201).json({ success: true, message: 'Tags baru telah ditambahkan', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan Tags', error: error.message });
    }
};

const getTags = async (req, res) => {
    try {
        const tagsData = await tagsModel.getTags();
        res.status(200).json(tagsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data Tags', error: error.message });
    }
};

const deleteTags = async (req, res) => {
    const { id_tag } = req.params;
    const { body } = req;
    try {
        await tagsModel.deleteTags(id_tag);
        res.json({
            message: 'Berhasil Menghapus Tags',
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
    createNewTags,
    getTags,
    deleteTags
};