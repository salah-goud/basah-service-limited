import React, { useState, useMemo } from 'react';
import {
  Truck,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Power,
  RotateCcw
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import VehicleFormModal from '../components/vehicles/VehicleFormModal';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';

export default function Vehicles() {
  const { vehicles, reports, addVehicle, updateVehicle, toggleVehicleStatus, deleteVehicle } = useData();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleToToggle, setVehicleToToggle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (statusFilter !== 'ALL' && v.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.registrationNumber.toLowerCase().includes(q) ||
          (v.makeModel && v.makeModel.toLowerCase().includes(q)) ||
          (v.assignedDriver && v.assignedDriver.toLowerCase().includes(q)) ||
          (v.type && v.type.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [vehicles, statusFilter, searchQuery]);

  // Count stats
  const activeCount = vehicles.filter((v) => v.status === 'Active').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'Maintenance').length;

  const handleToggleStatusConfirm = async () => {
    if (!vehicleToToggle) return;
    try {
      await toggleVehicleStatus(vehicleToToggle.id);
      addToast(`Status updated for ${vehicleToToggle.registrationNumber}`, 'success');
      setVehicleToToggle(null);
    } catch (err) {
      addToast('Error updating status: ' + err.message, 'danger');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;
    try {
      await deleteVehicle(vehicleToDelete.id);
      addToast(`Vehicle ${vehicleToDelete.registrationNumber} deleted from registry`, 'warning');
      setVehicleToDelete(null);
    } catch (err) {
      addToast('Error deleting vehicle: ' + err.message, 'danger');
    }
  };

  // Helper to count how many trips are logged for each vehicle
  const getVehicleTripCount = (reg) => {
    return reports.filter((r) => r.vehicleRegistration === reg).length;
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Title & Add Button */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">Fleet Vehicle Registry</h4>
          <p className="text-secondary small mb-0">
            Manage commercial heavy haulage prime movers, trailers, and delivery units.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-primary d-flex align-items-center gap-1 fw-semibold"
          onClick={() => setIsAddModalOpen(true)}
        >
          <PlusCircle size={15} />
          <span>Register New Vehicle</span>
        </button>
      </div>

      {/* Fleet Status Counters */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="card-modern p-3 bg-white">
            <span className="small text-secondary fw-semibold text-uppercase">Total Fleet Units</span>
            <div className="fs-4 fw-bold tabular-nums text-slate-900 mt-1">{vehicles.length}</div>
            <span className="small text-muted">Registered in fleet ledger</span>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="card-modern p-3 bg-white">
            <span className="small text-secondary fw-semibold text-uppercase">Active On Duty</span>
            <div className="fs-4 fw-bold tabular-nums text-success mt-1">{activeCount}</div>
            <span className="small text-muted">Ready for dispatch &amp; offload</span>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="card-modern p-3 bg-white">
            <span className="small text-secondary fw-semibold text-uppercase">Maintenance / Overhaul</span>
            <div className="fs-4 fw-bold tabular-nums text-warning mt-1">{maintenanceCount}</div>
            <span className="small text-muted">Workshop inspection</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="card-modern p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-secondary">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by registration (e.g. KDY 926B), driver, or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Units Only</option>
              <option value="Maintenance">Maintenance Units</option>
              <option value="Inactive">Inactive / Decommissioned</option>
            </select>
          </div>

          <div className="col-6 col-md-3 text-end">
            <span className="small text-secondary">
              Showing <strong>{filteredVehicles.length}</strong> of {vehicles.length} vehicles
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Grid & Table */}
      {filteredVehicles.length > 0 ? (
        <div className="card-modern bg-white overflow-hidden">
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Vehicle Registration</th>
                  <th>Make &amp; Model</th>
                  <th>Configuration / Type</th>
                  <th>Payload Capacity</th>
                  <th>Assigned Driver</th>
                  <th>Logged Trips</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => {
                  const trips = getVehicleTripCount(vehicle.registrationNumber);
                  const isPrimary = vehicle.registrationNumber === 'KDY 926B';

                  return (
                    <tr key={vehicle.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="vehicle-plate-badge text-dark">
                            {vehicle.registrationNumber}
                          </span>
                          {isPrimary && (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.65rem' }}>
                              Primary Excel Lead
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="small fw-semibold text-slate-800">
                        {vehicle.makeModel}
                      </td>
                      <td className="small text-secondary">
                        {vehicle.type}
                      </td>
                      <td className="small font-monospace">
                        {vehicle.capacity || '30.0 MT'}
                      </td>
                      <td className="small">
                        {vehicle.assignedDriver || (
                          <span className="text-muted fst-italic">Unassigned</span>
                        )}
                      </td>
                      <td className="small font-monospace">
                        <span className="badge bg-light text-secondary border">
                          {trips} trips
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            vehicle.status === 'Active'
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : vehicle.status === 'Maintenance'
                              ? 'bg-warning-subtle text-warning border border-warning-subtle'
                              : 'bg-secondary-subtle text-secondary'
                          }`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-primary p-1"
                            title="Edit Vehicle"
                            onClick={() => setEditingVehicle(vehicle)}
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm btn-link p-1 ${
                              vehicle.status === 'Active' ? 'text-warning' : 'text-success'
                            }`}
                            title={vehicle.status === 'Active' ? 'Set to Inactive' : 'Activate Vehicle'}
                            onClick={() => setVehicleToToggle(vehicle)}
                          >
                            <Power size={15} />
                          </button>

                          {!isPrimary && (
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger p-1"
                              title="Delete Vehicle"
                              onClick={() => setVehicleToDelete(vehicle)}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No vehicles match your search"
          description="Try clearing your search query or registering a new commercial fleet truck."
          actionText="Register Vehicle"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Modals */}
      <VehicleFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          await addVehicle(data);
          setIsAddModalOpen(false);
          addToast(`Registered vehicle ${data.registrationNumber}`, 'success');
        }}
      />

      <VehicleFormModal
        isOpen={!!editingVehicle}
        initialData={editingVehicle}
        onClose={() => setEditingVehicle(null)}
        onSubmit={async (data) => {
          await updateVehicle(editingVehicle.id, data);
          setEditingVehicle(null);
          addToast(`Vehicle ${data.registrationNumber} updated`, 'success');
        }}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!vehicleToToggle}
        title="Change Vehicle Operational Status"
        message={`Are you sure you want to mark ${vehicleToToggle?.registrationNumber} as ${
          vehicleToToggle?.status === 'Active' ? 'Inactive' : 'Active'
        }?`}
        confirmText={vehicleToToggle?.status === 'Active' ? 'Set Inactive' : 'Activate'}
        confirmVariant={vehicleToToggle?.status === 'Active' ? 'warning' : 'primary'}
        onConfirm={handleToggleStatusConfirm}
        onCancel={() => setVehicleToToggle(null)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!vehicleToDelete}
        title="Remove Vehicle from Fleet"
        message={`Are you sure you want to delete vehicle ${vehicleToDelete?.registrationNumber}? All future report linkages will require re-assignment.`}
        confirmText="Delete Vehicle"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setVehicleToDelete(null)}
      />
    </div>
  );
}
