import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      adminUser?: string;
      candidatoToken?: string;
    }
  }
}

export function authAdminBasic(req: Request, res: Response, next: NextFunction) {
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid auth header' });
  }

  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  if (username === adminUser && password === adminPassword) {
    req.adminUser = username;
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
}

export function validateCandidatoToken(req: Request, res: Response, next: NextFunction) {
  const token = req.params.token || req.query.token as string;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token requerido' });
  }

  req.candidatoToken = token;
  next();
}
