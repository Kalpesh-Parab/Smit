import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useTheme } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Home Dashboard & Service Analytics
import Dashboard from './pages/Dashboard/Dashboard';
import ServiceAnalytics from './pages/Analytics/ServiceAnalytics';

// Shared Components / Views
import Invoices from './components/Invoices/Invoices';
import Expenses from './components/Expenses/Expenses';

// Service-Specific Pages
import MyVehicles from './pages/Ambulance/MyVehicles';
import MyGenerators from './pages/Generators/MyGenerators';
import MyTowingVans from './pages/TowingVans/MyTowingVans';

export default function App() {
  const { theme } = useTheme();

  return (
    <>
      <Toaster richColors theme={theme} position='top-right' />
      <Routes>
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Main Home Analytics Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Ambulance Routes */}
          <Route
            path='ambulance'
            element={<Navigate to='/ambulance/vehicles' replace />}
          />
          <Route path='ambulance/vehicles' element={<MyVehicles />} />
          <Route
            path='ambulance/invoices'
            element={
              <Invoices serviceName='ambulance' title='Ambulance Invoices' />
            }
          />
          <Route
            path='ambulance/expenses'
            element={
              <Expenses serviceName='ambulance' title='Ambulance Expenses' />
            }
          />
          <Route
            path='ambulance/analytics'
            element={
              <ServiceAnalytics
                serviceName='ambulance'
                title='Ambulance Analytics'
              />
            }
          />

          {/* Generator Routes */}
          <Route
            path='generators'
            element={<Navigate to='/generators/my-generators' replace />}
          />
          <Route path='generators/my-generators' element={<MyGenerators />} />
          <Route
            path='generators/invoices'
            element={
              <Invoices serviceName='generators' title='Generator Invoices' />
            }
          />
          <Route
            path='generators/expenses'
            element={
              <Expenses serviceName='generators' title='Generator Expenses' />
            }
          />
          <Route
            path='generators/analytics'
            element={
              <ServiceAnalytics
                serviceName='generators'
                title='Generator Analytics'
              />
            }
          />

          {/* Towing Van Routes */}
          <Route
            path='towing-vans'
            element={<Navigate to='/towing-vans/my-towing-vans' replace />}
          />
          <Route path='towing-vans/my-towing-vans' element={<MyTowingVans />} />
          <Route
            path='towing-vans/invoices'
            element={
              <Invoices serviceName='towing-vans' title='Towing Van Invoices' />
            }
          />
          <Route
            path='towing-vans/expenses'
            element={
              <Expenses serviceName='towing-vans' title='Towing Van Expenses' />
            }
          />
          <Route
            path='towing-vans/analytics'
            element={
              <ServiceAnalytics
                serviceName='towing-vans'
                title='Towing Van Analytics'
              />
            }
          />

          {/* Catch-all */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Route>
      </Routes>
    </>
  );
}
