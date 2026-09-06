import { Request, Response } from 'express';
import { userRepository, candidateRepository } from '../repositories/userRepository';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { User, CandidateProfile } from '../types';

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
          profile: newProfile
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
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
        });
        return;
      }

      const user = userRepository.findByEmail(email);
      if (!user || !comparePassword(password, user.passwordHash)) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        });
        return;
      }

      const profile = candidateRepository.findByUserId(user.id);
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
          profile
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
    try {
      const demoEmail = 'candidate.demo@swipe-x.ai';
      let user = userRepository.findByEmail(demoEmail);

      if (!user) {
        const now = new Date().toISOString();
        const userId = 'user_demo_candidate_01';
        const candidateProfileId = 'cand_demo_candidate_01';

        user = {
          id: userId,
          email: demoEmail,
          passwordHash: hashPassword('DemoPassword123!'),
          name: 'Alex Morgan',
          role: 'CANDIDATE',
          createdAt: now,
          updatedAt: now
        };

        const profile: CandidateProfile = {
          id: candidateProfileId,
          userId: userId,
          name: 'Alex Morgan',
          email: demoEmail,
          phone: '(415) 890-1234',
          location: 'San Francisco, CA',
          summary: 'Senior Full Stack & AI Systems Engineer with 5+ years of production experience building high-scale distributed systems, React interfaces, and LLM-powered applications.',
          preferredRole: 'Senior Full Stack Engineer',
          preferredLocation: 'Remote',
          preferredWorkType: 'Remote',
          experienceLevel: 'Senior',
          targetSalary: 165000,
          skills: ['TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS', 'LLMs', 'Tailwind CSS', 'GraphQL'],
          experienceYears: 5,
          profileCompletionScore: 90,
          createdAt: now,
          updatedAt: now
        };

        userRepository.create(user);
        candidateRepository.create(profile);
      }

      const profile = candidateRepository.findByUserId(user.id);
      const token = generateToken(user);

      res.json({
        success: true,
        message: 'Logged in with Demo Candidate Account',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          profile
        }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'DEMO_LOGIN_FAILED', message: err.message }
      });
    }
  },

  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user!.id,
          email: req.user!.email,
          name: req.user!.name,
          role: req.user!.role
        },
        profile: req.candidateProfile
      }
    });
  }
};
