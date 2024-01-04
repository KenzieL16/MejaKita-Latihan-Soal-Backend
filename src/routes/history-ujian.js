import express from 'express';

import historycontroller from '../controller/histori-ujian.js';

import verifyToken from '../middleware/verifytoken.js';

const router = express.Router();

router.get('/', verifyToken, historycontroller.getHistoryByIdUser);

export default router;