import express from 'express';

import banksoalcontroller from '../controller/bank-soal.js';

import verifyToken from '../middleware/verifytoken.js';

const router = express.Router();

router.get('/banksoal', banksoalcontroller.getBanksoal);

router.post('/add-banksoal', banksoalcontroller.createBanksoal);

router.patch('/edit-banksoal/:id_bank_soal', verifyToken, banksoalcontroller.updateBanksoal);

router.delete('/delete-banksoal/:id_bank_soal', verifyToken, banksoalcontroller.deleteBanksoal);

export default router;