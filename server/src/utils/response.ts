import type { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendCreated = (
  res: Response,
  data: any,
  message: string = 'Created successfully'
) => {
  sendSuccess(res, data, message, 201);
};

export const sendError = (
  res: Response,
  message: string = 'Error',
  statusCode: number = 400,
  errors?: any
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
