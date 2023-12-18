import express from 'express';

import tagscontroller from '../controller/tags.js';

const router = express.Router();

router.get('/', tagscontroller.getTags);

router.post('/add-tags', tagscontroller.createNewTags);

router.delete('/delete/:id_tag', tagscontroller.deleteTags);

export default router;