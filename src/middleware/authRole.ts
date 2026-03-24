import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/** Clé partagée avec la génération des JWT. En production : définir `JWT_SECRET`. */
export const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';
if (!process.env.JWT_SECRET) {
  console.warn('ATTENTION : Utilisation d\'une clé secrète par défaut. Veuillez définir JWT_SECRET dans les variables d\'environnement pour la production.');
}

export const ROLES = {
  guest: 'guest',
  user: 'user',
  developer: 'developer',
  admin: 'admin',
  superadmin: 'superadmin'
} as const;

// Extension de `Request` : propriété `user` renseignée après validation du JWT.
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: keyof typeof ROLES;
    };
  }
}

/**
 * Middleware d’autorisation par rôle : en-tête `Authorization: Bearer`, vérification JWT, contrôle de `decoded.role`.
 * Le rôle `superadmin` contourne la liste des rôles autorisés ; les autres doivent figurer dans `allowedRoles`.
 */
export const authorizeRole = (allowedRoles: Array<keyof typeof ROLES>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Token d\'authentification manquant' 
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: 'Format de token invalide' 
      });
    }

    try {
      const decoded = jwt.verify(token, secretKey) as any;

      // Compatibilité : le payload peut exposer l’identifiant sous `userId` ou `id`.
      const userId = decoded.userId || decoded.id || '';
      const userRole = decoded.role as keyof typeof ROLES;

      req.user = {
        id: userId.toString(),
        role: userRole
      };

      if (userRole === 'superadmin') {
        return next();
      }

      if (userRole && !allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: `Accès interdit, rôle '${userRole}' insuffisant. Rôle requis: ${allowedRoles.join(', ')}` 
        });
      }

      next();
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return res.status(401).json({ 
        message: 'Token invalide ou expiré' 
      });
    }
  };
};

/** Vérifie uniquement la validité du JWT et renseigne `req.user` (sans contrôle de rôle). */
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token d\'authentification manquant' });
  }

  const tokenValue = authHeader.split(' ')[1];
  if (!tokenValue) {
    return res.status(401).json({ message: 'Format de token invalide' });
  }

  try {
    const decoded = jwt.verify(tokenValue, secretKey) as any;
    req.user = {
      id: decoded.userId || decoded.id,
      role: decoded.role
    };
    next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};
