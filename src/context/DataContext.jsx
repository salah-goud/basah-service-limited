import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { vehicleService } from '../services/vehicleService';
import { dailyReportService } from '../services/dailyReportService';
import { userService } from '../services/userService';
import { settingsService } from '../services/settingsService';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [vList, rList, uList, sData] = await Promise.all([
        vehicleService.getAll(),
        dailyReportService.getAll(),
        userService.getAll(),
        settingsService.getSettings()
      ]);
      setVehicles(vList);
      setReports(rList);
      setUsers(uList);
      setSettings(sData);
    } catch (err) {
      console.error('Failed to load local data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Report actions
  const addReport = async (reportData) => {
    const created = await dailyReportService.create(reportData);
    setReports((prev) => [created, ...prev]);
    return created;
  };

  const updateReport = async (id, reportData) => {
    const updated = await dailyReportService.update(id, reportData);
    setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const deleteReport = async (id) => {
    await dailyReportService.delete(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const bulkAddReports = async (newRows) => {
    await dailyReportService.bulkAdd(newRows);
    const refreshed = await dailyReportService.getAll();
    setReports(refreshed);
    return newRows.length;
  };

  // Vehicle actions
  const addVehicle = async (vehicleData) => {
    const created = await vehicleService.create(vehicleData);
    setVehicles((prev) => [created, ...prev]);
    return created;
  };

  const updateVehicle = async (id, vehicleData) => {
    const updated = await vehicleService.update(id, vehicleData);
    setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    return updated;
  };

  const toggleVehicleStatus = async (id) => {
    const updated = await vehicleService.toggleStatus(id);
    setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    return updated;
  };

  const deleteVehicle = async (id) => {
    await vehicleService.delete(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  // User actions
  const addUser = async (userData) => {
    const created = await userService.create(userData);
    setUsers((prev) => [...prev, created]);
    return created;
  };

  const updateUser = async (id, userData) => {
    const updated = await userService.update(id, userData);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  };

  const toggleUserStatus = async (id) => {
    const updated = await userService.toggleStatus(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  };

  // Settings actions
  const updateSettings = async (newSettings) => {
    const updated = await settingsService.updateSettings(newSettings);
    setSettings(updated);
    return updated;
  };

  // Reset to initial demo state
  const resetAllDemoData = async () => {
    localStorage.removeItem('basah_vehicles_data');
    localStorage.removeItem('basah_daily_reports_data');
    localStorage.removeItem('basah_users_data');
    localStorage.removeItem('basah_settings_data');
    await loadData();
  };

  return (
    <DataContext.Provider
      value={{
        vehicles,
        reports,
        users,
        settings,
        loading,
        refreshData: loadData,
        addReport,
        updateReport,
        deleteReport,
        bulkAddReports,
        addVehicle,
        updateVehicle,
        toggleVehicleStatus,
        deleteVehicle,
        addUser,
        updateUser,
        toggleUserStatus,
        updateSettings,
        resetAllDemoData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
