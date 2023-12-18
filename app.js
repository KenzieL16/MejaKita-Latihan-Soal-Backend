import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;
import cors from 'cors';
import express from 'express';
const app = express();

import userRoutes from './src/routes/users.js';
import latihansoalRoutes from './src/routes/list-latihan.js';
import banksoalRoutes from './src/routes/bank-soal.js';
import soalRoutes from './src/routes/soal.js';
import middleware from './src/middleware/logs.js';
import ujianRoutes from './src/routes/ujian.js'
import tagsRoutes from './src/routes/tags.js'
import historyRoutes from './src/routes/history-ujian.js'

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middleware);

// Your routes and middleware will go here
app.use('/users', userRoutes);
app.use('/latihansoal', latihansoalRoutes);
app.use('/banksoal', banksoalRoutes);
app.use('/soal', soalRoutes);
app.use('/ujian', ujianRoutes);
app.use('/tags', tagsRoutes);
app.use('/history', historyRoutes);

app.listen(PORT, () => {
    console.log(`Berhasil Running Server ${PORT}!`);
});