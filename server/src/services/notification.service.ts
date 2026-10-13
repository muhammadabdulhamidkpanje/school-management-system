import * as EmailRepo from '../repositories/email.repository.js';

export const getMyNotifications = (userId: string, unreadOnly = false) =>
  EmailRepo.getUserNotifications(userId, unreadOnly);

export const getUnreadCount = (userId: string) =>
  EmailRepo.getUnreadCount(userId);

export const markAsRead = (id: string, userId: string) =>
  EmailRepo.markNotificationRead(id, userId);

export const markAllAsRead = (userId: string) =>
  EmailRepo.markAllNotificationsRead(userId);