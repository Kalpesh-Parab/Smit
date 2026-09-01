import { Router } from 'express';
import {
  getTowingVans,
  getTowingVanById,
  createTowingVan,
  updateTowingVan,
  deleteTowingVan,
} from '../controllers/towingVan.controller.js';

const router = Router();

router.route('/').get(getTowingVans).post(createTowingVan);

router
  .route('/:id')
  .get(getTowingVanById)
  .put(updateTowingVan)
  .delete(deleteTowingVan);

export default router;
