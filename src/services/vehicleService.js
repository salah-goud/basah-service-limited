/**
 * Vehicle Service (Frontend Mock Layer with Future REST API contract)
 */
import apiClient from './apiClient';
import { INITIAL_VEHICLES } from '../data/mockData';

const STORAGE_KEY = 'basah_vehicles_data';

function getStoredVehicles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VEHICLES));
      return INITIAL_VEHICLES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_VEHICLES;
  }
}

function saveVehicles(vehicles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

export const vehicleService = {
  async getAll() {
    // In Phase 2: return apiClient.get('/vehicles').then(r => r.data);
    return Promise.resolve([...getStoredVehicles()]);
  },

  async getById(id) {
    const vehicles = getStoredVehicles();
    const found = vehicles.find((v) => v.id === id);
    if (!found) throw new Error(`Vehicle ${id} not found`);
    return Promise.resolve({ ...found });
  },

  async create(vehicleData) {
    const vehicles = getStoredVehicles();
    const newVehicle = {
      id: 'veh-' + Date.now(),
      registrationNumber: vehicleData.registrationNumber.trim().toUpperCase(),
      makeModel: vehicleData.makeModel?.trim() || '',
      type: vehicleData.type?.trim() || 'Heavy Haulage',
      capacity: vehicleData.capacity?.trim() || '30.0 MT',
      status: vehicleData.status || 'Active',
      assignedDriver: vehicleData.assignedDriver?.trim() || 'Unassigned',
      notes: vehicleData.notes?.trim() || ''
    };
    vehicles.unshift(newVehicle);
    saveVehicles(vehicles);
    return Promise.resolve(newVehicle);
  },

  async update(id, vehicleData) {
    const vehicles = getStoredVehicles();
    const index = vehicles.findIndex((v) => v.id === id);
    if (index === -1) throw new Error('Vehicle not found');
    const updated = {
      ...vehicles[index],
      ...vehicleData,
      registrationNumber: (vehicleData.registrationNumber || vehicles[index].registrationNumber).trim().toUpperCase()
    };
    vehicles[index] = updated;
    saveVehicles(vehicles);
    return Promise.resolve(updated);
  },

  async toggleStatus(id) {
    const vehicles = getStoredVehicles();
    const index = vehicles.findIndex((v) => v.id === id);
    if (index === -1) throw new Error('Vehicle not found');
    const currentStatus = vehicles[index].status;
    vehicles[index].status = currentStatus === 'Active' ? 'Inactive' : 'Active';
    saveVehicles(vehicles);
    return Promise.resolve(vehicles[index]);
  },

  async delete(id) {
    let vehicles = getStoredVehicles();
    vehicles = vehicles.filter((v) => v.id !== id);
    saveVehicles(vehicles);
    return Promise.resolve(true);
  }
};
