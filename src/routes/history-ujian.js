import express from 'express';

import historycontroller from '../controller/histori-ujian.js';

const router = express.Router();

router.get('/:id_user', historycontroller.getHistoryByIdUser);

export default router;