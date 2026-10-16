/**
 * Application Settings Service
 */
import { INITIAL_SETTINGS } from '../data/mockData';

const STORAGE_KEY = 'basah_settings_data';

export const settingsService = {
  async getSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
        return { ...INITIAL_SETTINGS };
      }
      return JSON.parse(raw);
    } catch {
      return { ...INITIAL_SETTINGS };
    }
  },

  async updateSettings(newSettings) {
    const current = await this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return Promise.resolve(updated);
  }
};
