import type { Request, Response }     from 'express';
import * as EmailService         from '../services/email.service.js';
import * as NotificationService  from '../services/notification.service.js';
import { handleAsync }          from '../utils/handleAsyn.js';
import { sendSuccess }           from '../utils/response.js';
import { BadRequestError }       from '../errors/errors.js';

// POST /api/email/verify
export const verifyEmail = handleAsync(async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) throw new BadRequestError('Token is required');

  const user = await EmailService.verifyEmailToken(token);
  sendSuccess(res, { email: user.email }, 'Email verified successfully');
});

// POST /api/email/resend
export const resendVerification = handleAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError('Email is required');

  // fetch user from DB via auth repo
  const { findUserByEmail } = await import('../repositories/auth.repositories.js');
  const user = await findUserByEmail(email);
  if (!user) return sendSuccess(res, null, 'If this email exists, a link has been sent');

  await EmailService.resendVerificationEmail({
    id:         user.id,
    email:      user.email,
    firstName:  user.profile?.firstName || '',
    isVerified: user.isVerified,
  });

  sendSuccess(res, null, 'Verification email resent');
});

// GET /api/notifications
export const getNotifications = handleAsync(async (req: Request, res: Response) => {
  const unreadOnly = req.query.unread === 'true';
  const data = await NotificationService.getMyNotifications(req.user!.sub, unreadOnly);
  sendSuccess(res, data);
});

// GET /api/notifications/unread-count
export const getUnreadCount = handleAsync(async (req: Request, res: Response) => {
  const count = await NotificationService.getUnreadCount(req.user!.sub);
  sendSuccess(res, { count });
});

// PATCH /api/notifications/:id/read
export const markAsRead = handleAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || Array.isArray(id)) throw new BadRequestError('Notification id is required');

  await NotificationService.markAsRead(id, req.user!.sub);
  sendSuccess(res, null, 'Notification marked as read');
});

// PATCH /api/notifications/read-all
export const markAllAsRead = handleAsync(async (req: Request, res: Response) => {
  await NotificationService.markAllAsRead(req.user!.sub);
  sendSuccess(res, null, 'All notifications marked as read');
});