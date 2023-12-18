import express from 'express';

import soalcontroller from '../controller/soal.js';

const router = express.Router();

router.post('/:id_bank_soal/add-soal', soalcontroller.addSoal)

router.patch('/edit-soal/:id_soal', soalcontroller.updateSoal)

router.get('/:id_bank_soal/get-all-soal', soalcontroller.getAllSoal)

router.delete('/delete-soal/:id_soal', soalcontroller.deleteSoal)

export default router;