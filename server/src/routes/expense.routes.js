import { Router } from 'express';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller.js';

const router = Router();

router.route('/').get(getExpenses).post(createExpense);

router.route('/:id').put(updateExpense).delete(deleteExpense);

export default router;
