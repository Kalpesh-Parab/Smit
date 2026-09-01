import { Router } from 'express';
import {
  getAmbulances,
  getAmbulanceById,
  createAmbulance,
  updateAmbulance,
  deleteAmbulance,
} from '../controllers/ambulance.controller.js';

const router = Router();

router.route('/').get(getAmbulances).post(createAmbulance);

router
  .route('/:id')
  .get(getAmbulanceById)
  .put(updateAmbulance)
  .delete(deleteAmbulance);

export default router;
