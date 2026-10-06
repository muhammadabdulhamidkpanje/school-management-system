import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const generateToken = (user: any): string => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ status: 'fail', message: 'User already exists' });
      return;
    }

    const user = new User({ name, email, password, role });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({ status: 'success', data: { user, token } });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Something went wrong: ' + (error instanceof Error ? error.message : ''),
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
      return;
    }
    const token = generateToken(user);
    res.status(200).json({ status: 'success', data: { user, token } });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Something went wrong: ' + (error instanceof Error ? error.message : ''),
    });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Something went wrong: ' + (error instanceof Error ? error.message : ''),
    });
  }
};
