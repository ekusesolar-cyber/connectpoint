import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { EmailService } from '../services/EmailService';
import { env } from '../config/env';
import { registerSchema, loginSchema } from '@connectpoint/shared';
import { ZodError } from 'zod';

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await AuthService.register(data);

    await EmailService.sendWelcomeEmail(data.email, data.fullName).catch(() => {});

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: err.errors });
      return;
    }
    const message = (err as Error).message;
    if (message === 'EMAIL_EXISTS') {
      res.status(409).json({ success: false, error: 'An account with this email already exists' });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await AuthService.login(data);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: err.errors });
      return;
    }
    const message = (err as Error).message;
    if (message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }
    if (message === 'SUSPENDED') {
      res.status(403).json({ success: false, error: 'Your account has been suspended' });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'Refresh token is required' });
      return;
    }
    const result = await AuthService.refresh(refreshToken);
    res.json({ success: true, data: result });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await AuthService.getProfile(req.user!.userId);
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }
    const result = await AuthService.forgotPassword(email);
    if (result) {
      const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${result.token}&email=${result.email}`;
      await EmailService.sendPasswordResetEmail(result.email, resetUrl).catch(() => {});
    }
    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ success: false, error: 'Token and password are required' });
      return;
    }
    await AuthService.resetPassword(token, password);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch {
    res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
  }
};
