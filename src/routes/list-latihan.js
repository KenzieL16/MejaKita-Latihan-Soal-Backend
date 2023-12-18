import express from 'express';

import dashboardcontroller from '../controller/list-latihan.js';

const router = express.Router();

router.get('/', dashboardcontroller.getDashboard);

router.post('/add-latsol', dashboardcontroller.createNewLatsol);

router.patch('/update/:id_latihan_soal', dashboardcontroller.updateLatsol);

router.delete('/delete/:id_latihan_soal', dashboardcontroller.deleteLatsol);

export default router;
