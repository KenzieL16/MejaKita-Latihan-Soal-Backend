import express from 'express';

import ujiancontroller from '../controller/ujian.js';

const router = express.Router();

router.get('/:id_latihan_soal/get-all-soal', ujiancontroller.getAllSoal)

router.post('/:id_latihan_soal/submit-jawaban', ujiancontroller.submitJawaban)

router.post('/:id_latihan_soal/enrollment', ujiancontroller.enrollment)

router.post('/:id_latihan_soal/nilai', ujiancontroller.countNilai)

export default router;