import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { AUTH_SECRET } from './config.js';
import { findUser, verifyPassword } from './users.js';
import type { Role } from './users.js';

// ── Type augmentations ────────────────────────────────────────────────────────

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; role: Role };
    user: { sub: string; role: Role };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    /** Verify Bearer JWT; sends 401 on failure. */
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    /** Returns an array of preHandlers: authenticate then role check (403 if denied). */
    requireRole(...roles: Role[]): Array<(request: FastifyRequest, reply: FastifyReply) => Promise<void>>;
  }
}

// ── Plugin registration ───────────────────────────────────────────────────────

export async function registerAuth(app: FastifyInstance): Promise<void> {
  // @fastify/jwt wraps itself with fastify-plugin so decorators land on root scope.
  await app.register(fastifyJwt, { secret: AUTH_SECRET });

  async function authenticate(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      await req.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  }

  app.decorate('authenticate', authenticate);

  app.decorate('requireRole', function requireRole(...roles: Role[]) {
    return [
      authenticate,
      async function checkRole(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        if (!roles.includes(req.user.role)) {
          reply.status(403).send({ error: 'Forbidden' });
        }
      },
    ];
  });

  // ── Auth routes ─────────────────────────────────────────────────────────────

  /** POST /auth/login — verify credentials, return signed JWT + user info. */
  app.post<{ Body: { username: string; password: string } }>(
    '/auth/login',
    async (req, reply) => {
      const { username, password } = req.body;
      if (!username || !password) {
        return reply.status(400).send({ error: 'username and password are required' });
      }
      const user = findUser(username);
      if (!user || !verifyPassword(user, password)) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      const token = app.jwt.sign(
        { sub: user.username, role: user.role },
        { expiresIn: '12h' },
      );
      return reply.send({ token, user: { username: user.username, role: user.role } });
    },
  );

  /** POST /auth/logout — stateless; client should discard the token. */
  app.post('/auth/logout', async (_req, reply) => {
    return reply.send({ ok: true });
  });

  /** GET /auth/me — returns the authenticated user's info. */
  app.get(
    '/auth/me',
    { preHandler: authenticate },
    async (req, reply) => {
      return reply.send({ user: { username: req.user.sub, role: req.user.role } });
    },
  );
}
