import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: 'unauthorized access' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ 
      message: 'invalid token ' + (error instanceof Error ? error.message : '') 
    });
  }
};
