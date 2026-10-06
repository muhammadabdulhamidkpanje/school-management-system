import express, { Router } from 'express';
import { register, login, getUserProfile } from '../controllers/authcontroller';
import { protect } from '../middlewares/authMiddleware';

const router: Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/getUserProfile', protect, getUserProfile);

export default router;
