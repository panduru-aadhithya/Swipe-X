import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth';
import { userRepository, candidateRepository } from '../repositories/userRepository';
import { User, CandidateProfile } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: User;
  tokenPayload?: TokenPayload;
  candidateProfile?: CandidateProfile;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is missing or invalid'
      }
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Session has expired or token is invalid. Please log in again.'
      }
    });
    return;
  }

  const user = userRepository.findById(payload.userId);
  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User account associated with this token was not found'
      }
    });
    return;
  }

  req.user = user;
  req.tokenPayload = payload;

  const candidateProfile = candidateRepository.findByUserId(user.id);
  if (candidateProfile) {
    req.candidateProfile = candidateProfile;
  }

  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      const user = userRepository.findById(payload.userId);
      if (user) {
        req.user = user;
        req.tokenPayload = payload;
        const profile = candidateRepository.findByUserId(user.id);
        if (profile) req.candidateProfile = profile;
      }
    }
  }
  next();
}
