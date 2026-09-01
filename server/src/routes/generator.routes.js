import { Router } from 'express';
import {
  getGenerators,
  getGeneratorById,
  createGenerator,
  updateGenerator,
  deleteGenerator,
} from '../controllers/generator.controller.js';

const router = Router();

router.route('/').get(getGenerators).post(createGenerator);

router
  .route('/:id')
  .get(getGeneratorById)
  .put(updateGenerator)
  .delete(deleteGenerator);

export default router;
