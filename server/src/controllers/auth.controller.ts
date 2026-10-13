import type { Request, Response } from 'express';
import * as AuthService from '../services/auth.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await AuthService.register(req.body, req.ip);
  sendCreated(res, user, 'Registration successful');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body, req.ip);

  // HttpOnly cookie for refresh token
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, {
    accessToken: result.accessToken,
    user:        result.user,
  }, 'Login successful');
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  const tokens = await AuthService.refreshTokens(token);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, { accessToken: tokens.accessToken }, 'Token refreshed');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  await AuthService.logout(token, req.user!.sub, req.ip);
  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out successfully');
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.logoutAll(req.user!.sub);
  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out from all devices');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);
  sendSuccess(res, null, result.message);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body, req.ip);
  sendSuccess(res, null, result.message);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.changePassword(req.user!.sub, req.body, req.ip);
  sendSuccess(res, null, result.message);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await AuthService.getCurrentUser(req.user!.sub);
  sendSuccess(res, user, 'Profile fetched');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await AuthService.updateProfile(req.user!.sub, req.body, req.ip);
  sendSuccess(res, user, 'Profile updated');
});