import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { ADMIN_USER, ADMIN_PASSWORD } from './config.js';

export type Role = 'admin' | 'operator' | 'viewer';

export interface User {
  username: string;
  role: Role;
  passwordHash: string;
}

/** Safe to return to API consumers — no password hash. */
export interface PublicUser {
  username: string;
  role: Role;
}

const _dir = dirname(fileURLToPath(import.meta.url));
const USERS_FILE = join(_dir, '..', 'data', 'users.json');

let _users: User[] = [];

async function persist(): Promise<void> {
  await mkdir(dirname(USERS_FILE), { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(_users, null, 2), 'utf8');
}

function seedAdmin(): User {
  return {
    username: ADMIN_USER,
    role: 'admin',
    passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
  };
}

export async function loadUsers(): Promise<void> {
  try {
    const raw = await readFile(USERS_FILE, 'utf8');
    _users = JSON.parse(raw) as User[];
    // Always ensure the configured admin exists.
    if (!_users.find(u => u.username === ADMIN_USER)) {
      _users.push(seedAdmin());
      await persist();
    }
  } catch {
    // First boot: create store with seeded admin.
    _users = [seedAdmin()];
    await persist();
  }
}

export function findUser(username: string): User | undefined {
  return _users.find(u => u.username === username);
}

export function verifyPassword(user: User, password: string): boolean {
  return bcrypt.compareSync(password, user.passwordHash);
}

/** Returns users without password hashes — safe for API responses. */
export function listUsers(): PublicUser[] {
  return _users.map(({ username, role }) => ({ username, role }));
}
