import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database';
import { env } from '../config/env';
import type { JwtPayload } from '../middleware/auth';
import type { RegisterInput, LoginInput } from '../shared/validators';

export class AuthService {
  static async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone || null,
        role: 'hotspot_owner',
      },
    });

    await prisma.subscription.create({
      data: {
        ownerId: user.id,
        planName: 'free',
        maxHotspots: 1,
        commissionRate: env.PLATFORM_DEFAULT_COMMISSION,
      },
    });

    const tokens = this.generateTokens(user.id, user.role, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new Error('SUSPENDED');
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const tokens = this.generateTokens(user.id, user.role, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  static async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new Error('INVALID_TOKEN');
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const user = stored.user;
    if (!user.isActive) {
      throw new Error('SUSPENDED');
    }

    const tokens = this.generateTokens(user.id, user.role, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  static async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { kycProfile: true, subscriptions: true },
    });
    if (!user) throw new Error('NOT_FOUND');
    return this.sanitizeUser(user);
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: `pwd_reset_${token}`,
        expiresAt,
      },
    });

    return { email: user.email, token: `pwd_reset_${token}` };
  }

  static async resetPassword(token: string, newPassword: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new Error('INVALID_TOKEN');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: stored.userId },
      data: { passwordHash },
    });

    await prisma.refreshToken.delete({ where: { id: stored.id } });
    await prisma.refreshToken.deleteMany({ where: { userId: stored.userId } });
  }

  private static generateTokens(userId: string, role: string, email: string) {
    const payload: JwtPayload = { userId, role, email };
    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as string });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    return { accessToken, refreshToken };
  }

  private static async storeRefreshToken(userId: string, token: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  }

  static sanitizeUser(user: Record<string, unknown>) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
