import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import DailyReportModal from '../reports/DailyReportModal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const { vehicles, addReport } = useData();
  const { addToast } = useToast();

  const handleQuickAddReport = async (reportData) => {
    try {
      await addReport(reportData);
      setIsQuickAddModalOpen(false);
      addToast('Daily report record saved successfully', 'success');
    } catch (err) {
      addToast('Failed to save record: ' + err.message, 'danger');
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Collapsible / Responsive Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAddReport={() => setIsQuickAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-shell flex-grow-1 d-flex flex-column">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Page Content Viewport */}
        <main className="flex-grow-1 p-3 p-md-4 main-content">
          <Outlet />
        </main>
      </div>

      {/* Quick Add Daily Report Modal accessible from sidebar */}
      <DailyReportModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onSubmit={handleQuickAddReport}
        vehicles={vehicles}
      />
    </div>
  );
}
