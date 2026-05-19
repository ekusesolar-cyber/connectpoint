import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const auditLog = (action: string) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const originalJson = _res.json.bind(_res);
    const originalSend = _res.send.bind(_res);

    _res.json = function (body: unknown) {
      if (_res.statusCode < 400 && req.user && action) {
        prisma.auditLog.create({
          data: {
            userId: req.user.userId,
            action,
            entityType: (req.params as Record<string, string>).id ? req.baseUrl.split('/').pop() : undefined,
            entityId: (req.params as Record<string, string>).id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          },
        }).catch(() => {});
      }
      return originalJson(body);
    };

    _res.send = function (body: unknown) {
      if (_res.statusCode < 400 && req.user && action) {
        prisma.auditLog.create({
          data: {
            userId: req.user.userId,
            action,
            entityType: (req.params as Record<string, string>).id ? req.baseUrl.split('/').pop() : undefined,
            entityId: (req.params as Record<string, string>).id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          },
        }).catch(() => {});
      }
      return originalSend(body);
    };

    next();
  };
};
