import express from 'express';

import banksoalcontroller from '../controller/bank-soal.js';

import verifyToken from '../middleware/verifytoken.js';

const router = express.Router();

router.get('/', banksoalcontroller.getBanksoal);

router.post('/add-banksoal', banksoalcontroller.createBanksoal);

router.patch('/edit-banksoal/:id_bank_soal', banksoalcontroller.updateBanksoal);

router.delete('/delete-banksoal/:id_bank_soal', banksoalcontroller.deleteBanksoal);

export default router;