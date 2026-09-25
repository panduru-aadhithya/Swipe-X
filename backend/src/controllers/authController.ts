import { Request, Response } from 'express';
import { userRepository, candidateRepository } from '../repositories/userRepository';
import { applicationRepository, jobRepository } from '../repositories/jobRepository';
import { resumeRepository } from '../repositories/resumeRepository';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { User, CandidateProfile, Application } from '../types';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, preferredRole } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email, password, and name are required'
          }
        });
        return;
      }

      const existingUser = userRepository.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'An account with this email address already exists'
          }
        });
        return;
      }

      const now = new Date().toISOString();
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const candidateProfileId = `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newUser: User = {
        id: userId,
        email: email.trim().toLowerCase(),
        passwordHash: hashPassword(password),
        name: name.trim(),
        role: 'CANDIDATE',
        createdAt: now,
        updatedAt: now
      };

      const newProfile: CandidateProfile = {
        id: candidateProfileId,
        userId: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        preferredRole: preferredRole || 'Full Stack Engineer',
        skills: ['TypeScript', 'React', 'Node.js', 'SQL'],
        profileCompletionScore: 40,
        createdAt: now,
        updatedAt: now
      };

      userRepository.create(newUser);
      candidateRepository.create(newProfile);

      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          },
          profile: newProfile,
          hasActiveResume: false
        }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'REGISTRATION_FAILED', message: err.message }
      });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      let email = req.body?.email;
      let password = req.body?.password;

      // Handle case where body might be a parsed string or needs unwrapping
      if (typeof req.body === 'string') {
        try {
          const parsed = JSON.parse(req.body);
          email = parsed?.email || email;
          password = parsed?.password || password;
        } catch {
          email = req.body;
        }
      }

      if (!email || !password || typeof email !== 'string' || typeof password !== 'string' || email.trim() === 'candidate.demo@swipe-x.ai') {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        });
        return;
      }

      const user = userRepository.findByEmail(email.trim());
      if (!user || !comparePassword(password, user.passwordHash)) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        });
        return;
      }

      const profile = candidateRepository.findByUserId(user.id);
      const hasActiveResume = profile ? !!resumeRepository.findActiveByCandidateId(profile.id) : false;
      const token = generateToken(user);

      res.json({
        success: true,
        message: 'Logged in successfully',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          profile,
          hasActiveResume
        }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'LOGIN_FAILED', message: err.message }
      });
    }
  },

  async demoLogin(req: Request, res: Response): Promise<void> {
    res.status(410).json({
      success: false,
      error: {
        code: 'DEMO_ACCOUNT_REMOVED',
        message: 'Demo accounts have been completely removed. Please register or log in with your credentials.'
      }
    });
  },

  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (req.user?.email === 'candidate.demo@swipe-x.ai' || req.user?.id === 'user_demo_candidate_01') {
      res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Demo account is no longer active. Please sign in with your real account.' }
      });
      return;
    }

    const hasActiveResume = req.candidateProfile
      ? !!resumeRepository.findActiveByCandidateId(req.candidateProfile.id)
      : false;

    res.json({
      success: true,
      data: {
        user: {
          id: req.user!.id,
          email: req.user!.email,
          name: req.user!.name,
          role: req.user!.role
        },
        profile: req.candidateProfile,
        hasActiveResume
      }
    });
  }
};
