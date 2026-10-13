import crypto           from 'crypto';
import { transporter }  from '../config/mailer.js';
import { renderTemplate } from '../utils/template.js';
import { env }          from '../config/env.js';
import * as EmailRepo   from '../repositories/email.repository.js';
import { NotificationChannel, NotificationType } from '../generated/prisma/enums.js';

interface SendMailOptions {
  to:      string;
  subject: string;
  html:    string;
}

// ── Core Send ────────────────────────────────────
const sendMail = async (options: SendMailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from:    env.SMTP_FROM,
      to:      options.to,
      subject: options.subject,
      html:    options.html,
    });
    return true;
  } catch (err) {
    console.error('❌ Email send failed:', err);
    return false;
  }
};

// ── Verification Email ───────────────────────────
export const sendVerificationEmail = async (user: {
  id:        string;
  email:     string;
  firstName: string;
}) => {
  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await EmailRepo.createEmailVerification({ token, userId: user.id, expiresAt });

  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  const html = renderTemplate('verify-email.html', {
    firstName: user.firstName,
    verifyUrl,
  });

  const emailSent = await sendMail({
    to:      user.email,
    subject: `Verify your email — ${env.APP_NAME}`,
    html,
  });

  // Save in-app notification
  await EmailRepo.createNotification({
    userId:  user.id,
    title:   'Verify Your Email',
    message: emailSent
      ? 'A verification email has been sent to your inbox.'
      : 'We could not send your verification email. Please request another one.',
    type:    NotificationType.EMAIL_VERIFICATION,
    channel: NotificationChannel.BOTH,
    ...(emailSent && { sentAt: new Date() }),
  });

  return { emailSent };
};

// ── Verify Token ─────────────────────────────────
export const verifyEmailToken = async (token: string) => {
  const record = await EmailRepo.findEmailVerification(token);

  if (!record)
    throw new Error('Invalid or already used verification token');

  if (record.expiresAt < new Date())
    throw new Error('Verification token has expired');

  // Mark token used + activate user
  const marked = await EmailRepo.markEmailVerificationUsed(record.id);
  if (!marked) throw new Error('Invalid or already used verification token');

  await EmailRepo.createNotification({
    userId:  record.userId,
    title:   'Email Verified',
    message: 'Your email has been verified. Welcome aboard!',
    type:    NotificationType.ACCOUNT_ACTIVATED,
    channel: NotificationChannel.IN_APP,
  });

  return record.user;
};

// ── Resend Verification ──────────────────────────
export const resendVerificationEmail = async (user: {
  id:        string;
  email:     string;
  firstName: string;
  isVerified: boolean;
}) => {
  if (user.isVerified)
    throw new Error('Email is already verified');

  const pending = await EmailRepo.findPendingVerification(user.id);
  if (pending)
    throw new Error('A verification email was recently sent. Please check your inbox.');

  return sendVerificationEmail(user);
};

// ── Password Reset Email ─────────────────────────
export const sendPasswordResetEmail = async (user: {
  id:        string;
  email:     string;
  firstName: string;
}, token: string) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  const html = renderTemplate('password-reset.html', {
    firstName: user.firstName,
    resetUrl,
  });

  await sendMail({
    to:      user.email,
    subject: `Reset your password — ${env.APP_NAME}`,
    html,
  });

  await EmailRepo.createNotification({
    userId:  user.id,
    title:   'Password Reset Requested',
    message: 'A password reset link has been sent to your email.',
    type:    NotificationType.PASSWORD_RESET,
    channel: NotificationChannel.BOTH,
    sentAt:  new Date(),
  });
};

// ── Welcome Email ────────────────────────────────
export const sendWelcomeEmail = async (user: {
  id:        string;
  email:     string;
  firstName: string;
}) => {
  const html = renderTemplate('welcome.html', {
    firstName: user.firstName,
    loginUrl:  `${env.CLIENT_URL}/login`,
  });

  await sendMail({
    to:      user.email,
    subject: `Welcome to ${env.APP_NAME}! 🎉`,
    html,
  });

  await EmailRepo.createNotification({
    userId:  user.id,
    title:   `Welcome to ${env.APP_NAME}!`,
    message: 'Your account is now active. Welcome aboard!',
    type:    NotificationType.GENERAL,
    channel: NotificationChannel.BOTH,
    sentAt:  new Date(),
  });
};