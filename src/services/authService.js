/**
 * Authentication Service (Frontend-First Demonstration)
 */
import { userService } from './userService';

const DEMO_USER = {
  id: 'usr-1',
  name: 'Suldaan God',
  username: 'admin',
  email: 'suldaangod@gmail.com',
  role: 'Administrator',
  avatarUrl: null
};

export const authService = {
  /**
   * Logs in the user with demo credentials or delegates to backend API.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{user: Object, token: string}>}
   */
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Both username and password are required.');
    }

    await new Promise((resolve) => setTimeout(resolve, 250));

    const normalizedUsername = username.toLowerCase();
    const hasCustomPassword = await userService.hasCustomPassword(username);
    let user = await userService.authenticate(username, password);
    let isDemo = false;

    if (!user && !hasCustomPassword) {
      const isDemoAdmin =
        (normalizedUsername === 'admin' || normalizedUsername === 'suldaangod') && password === 'admin123';
      const isDemoManager = normalizedUsername === 'manager' && password === 'manager123';
      if (isDemoAdmin || isDemoManager) {
      user = {
        ...DEMO_USER,
        username,
        role: isDemoManager ? 'Fleet Operations Manager' : 'Administrator'
      };
        isDemo = true;
      }
    }

    if (!user) throw new Error('Invalid username or password.');

    const token = 'demo_jwt_token_' + Date.now();
    localStorage.setItem('basah_auth_token', token);
    localStorage.setItem('basah_auth_user', JSON.stringify(user));
    return { user, token, isDemo };
  },

  /**
   * Logs out the current session.
   */
  async logout() {
    localStorage.removeItem('basah_auth_token');
    localStorage.removeItem('basah_auth_user');
    return Promise.resolve();
  },

  /**
   * Returns current logged-in demo user or null.
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem('basah_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
};
