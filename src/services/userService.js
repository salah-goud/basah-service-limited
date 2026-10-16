/**
 * User Management Service (Frontend Mock Layer)
 */
import { INITIAL_USERS } from '../data/mockData';

const STORAGE_KEY = 'basah_users_data';
const PASSWORD_ITERATIONS = 120000;

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

async function derivePasswordHash(password, salt) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PASSWORD_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return toBase64(new Uint8Array(hash));
}

async function createPasswordCredentials(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    passwordSalt: toBase64(salt),
    passwordHash: await derivePasswordHash(password, salt)
  };
}

async function verifyPassword(password, user) {
  if (!user.passwordSalt || !user.passwordHash) return false;
  const salt = Uint8Array.from(atob(user.passwordSalt), (character) => character.charCodeAt(0));
  return (await derivePasswordHash(password, salt)) === user.passwordHash;
}

function toPublicUser(user) {
  const { password, passwordHash, passwordSalt, ...publicUser } = user;
  return {
    ...publicUser,
    hasPassword: Boolean(passwordHash || user.username.toLowerCase() === 'admin')
  };
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export const userService = {
  async getAll() {
    return Promise.resolve(getStoredUsers().map(toPublicUser));
  },

  async create(userData) {
    const users = getStoredUsers();
    const username = userData.username.trim().toLowerCase();
    if (users.some((user) => user.username.toLowerCase() === username)) {
      throw new Error('This username is already in use.');
    }
    const credentials = await createPasswordCredentials(userData.password);
    const newUser = {
      id: 'usr-' + Date.now(),
      name: userData.name.trim(),
      username,
      email: userData.email?.trim() || '',
      role: userData.role || 'Data Entry Clerk',
      status: userData.status || 'Active',
      createdDate: new Date().toISOString().slice(0, 10),
      ...credentials
    };
    users.push(newUser);
    saveUsers(users);
    return toPublicUser(newUser);
  },

  async update(id, userData) {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    const username = (userData.username || users[index].username).trim().toLowerCase();
    if (users.some((user) => user.id !== id && user.username.toLowerCase() === username)) {
      throw new Error('This username is already in use.');
    }
    const credentials = userData.password
      ? await createPasswordCredentials(userData.password)
      : {};
    const updated = {
      ...users[index],
      ...userData,
      name: (userData.name || users[index].name).trim(),
      username,
      ...credentials
    };
    delete updated.password;
    users[index] = updated;
    saveUsers(users);
    return toPublicUser(updated);
  },

  async authenticate(username, password) {
    const normalizedUsername = username.trim().toLowerCase();
    const user = getStoredUsers().find(
      (entry) => entry.username.toLowerCase() === normalizedUsername && entry.status === 'Active'
    );
    if (!user || !(await verifyPassword(password, user))) return null;
    return toPublicUser(user);
  },

  async hasCustomPassword(username) {
    const normalizedUsername = username.trim().toLowerCase();
    const user = getStoredUsers().find((entry) => entry.username.toLowerCase() === normalizedUsername);
    return Boolean(user?.passwordHash && user?.passwordSalt);
  },

  async toggleStatus(id) {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index].status = users[index].status === 'Active' ? 'Inactive' : 'Active';
    saveUsers(users);
    return toPublicUser(users[index]);
  },

  async delete(id) {
    let users = getStoredUsers();
    users = users.filter((u) => u.id !== id);
    saveUsers(users);
    return Promise.resolve(true);
  }
};
