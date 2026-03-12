import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import { AdminLayout } from './layouts/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UserManagement } from './pages/UserManagement';
import { ModerationQueue } from './pages/ModerationQueue';
import { Reports } from './pages/Reports';

// Placeholder components
const ActivityLogs = () => <h1 className="text-2xl font-bold">Activity Logs</h1>;

function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="content" element={<ModerationQueue />} />
            <Route path="reports" element={<Reports />} />
            <Route path="logs" element={<ActivityLogs />} />
          </Route>
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export { App };
