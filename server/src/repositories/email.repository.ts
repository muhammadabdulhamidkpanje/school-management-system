import prisma                from '../config/prisma.js';
import { NotificationType, NotificationChannel } from '../generated/prisma/enums.js';

// ── Email Verification ───────────────────────────
export const createEmailVerification = (data: {
  token:     string;
  userId:    string;
  expiresAt: Date;
}) => prisma.emailVerification.create({ data });

export const findEmailVerification = (token: string) =>
  prisma.emailVerification.findFirst({
    where: { token, used: false },
    include: { user: { include: { profile: true } } },
  });

export const markEmailVerificationUsed = (id: string) =>
  prisma.$transaction(async transaction => {
    const verification = await transaction.emailVerification.updateMany({
      where: { id, used: false },
      data:  { used: true },
    });
    if (verification.count !== 1) return false;

    const record = await transaction.emailVerification.findUnique({ where: { id } });
    if (!record) return false;

    await transaction.user.update({
      where: { id: record.userId },
      data:  { isVerified: true },
    });
    return true;
  });

export const findPendingVerification = (userId: string) =>
  prisma.emailVerification.findFirst({
    where: {
      userId,
      used:      false,
      expiresAt: { gt: new Date() },
    },
  });

// ── Notifications ────────────────────────────────
export const createNotification = (data: {
  userId:  string;
  title:   string;
  message: string;
  type:    NotificationType;
  channel: NotificationChannel;
  sentAt?: Date;
}) => prisma.notification.create({ data });

export const getUserNotifications = (userId: string, unreadOnly = false) =>
  prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly && { isRead: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

export const markNotificationRead = (id: string, userId: string) =>
  prisma.notification.update({
    where: { id },
    data:  { isRead: true },
  });

export const markAllNotificationsRead = (userId: string) =>
  prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  });

export const getUnreadCount = (userId: string) =>
  prisma.notification.count({
    where: { userId, isRead: false },
  });