import { Router }          from 'express';
import * as EmailController from '../controllers/email.controller.js';
import { authenticate }    from '../middlewares/authenticate.js';

const router = Router();

// Email verification (public)
router.post('/verify',  EmailController.verifyEmail);
router.post('/resend',  EmailController.resendVerification);

// Notifications (protected)
router.get( '/notifications',           authenticate, EmailController.getNotifications);
router.get( '/notifications/unread-count', authenticate, EmailController.getUnreadCount);
router.patch('/notifications/:id/read', authenticate, EmailController.markAsRead);
router.patch('/notifications/read-all', authenticate, EmailController.markAllAsRead);

export default router;