import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvoiceGenerator from './pages/InvoiceGenerator';
import Categories from './pages/Categories';
import { Toaster } from 'react-hot-toast';

// Quick Protected Route component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('hall_token');
  if (!token) {
    return <Navigate to='/login' replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
        <Toaster position="top-right"/>
      <Routes>
        {/* Public Route */}
        <Route path='/login' element={<Login />} />

        {/* Protected Dashboard & Management Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/invoices/new' element={<InvoiceGenerator />} />
          <Route path='/categories' element={<Categories />} />
        </Route>

        {/* Fallback */}
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    </BrowserRouter>
  );
}
