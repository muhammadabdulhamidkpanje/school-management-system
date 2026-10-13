import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { loginRateLimit, passwordResetRateLimit } from '../middlewares/rateLimit.js';
import { validate } from '../validators/middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Public
router.post('/register',       validate(registerSchema),       AuthController.register);
router.post('/login',          loginRateLimit, validate(loginSchema), AuthController.login);
router.post('/refresh',                                         AuthController.refresh);
router.post('/forgot-password', passwordResetRateLimit, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password',  passwordResetRateLimit, validate(resetPasswordSchema), AuthController.resetPassword);

// Protected
router.get( '/me',             authenticate,                   AuthController.me);
router.patch('/me',             authenticate, validate(updateProfileSchema), AuthController.updateProfile);
router.post('/logout',         authenticate,                   AuthController.logout);
router.post('/logout-all',     authenticate,                   AuthController.logoutAll);
router.post('/change-password',authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;