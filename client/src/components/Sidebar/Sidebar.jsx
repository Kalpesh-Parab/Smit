import { NavLink, useLocation } from 'react-router-dom';
import {
  Zap,
  Wrench,
  Receipt,
  CreditCard,
  SirenIcon,
  BarChart3,
} from 'lucide-react';
import './Sidebar.scss';

const serviceConfig = {
  ambulance: {
    title: 'Ambulance Service',
    items: [
      { path: '/ambulance/vehicles', label: 'My Ambulances', icon: SirenIcon },
      { path: '/ambulance/invoices', label: 'Invoices', icon: Receipt },
      { path: '/ambulance/expenses', label: 'Expenses', icon: CreditCard },
      { path: '/ambulance/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  generators: {
    title: 'Generators Service',
    items: [
      { path: '/generators/my-generators', label: 'My Generators', icon: Zap },
      { path: '/generators/invoices', label: 'Invoices', icon: Receipt },
      { path: '/generators/expenses', label: 'Expenses', icon: CreditCard },
      { path: '/generators/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  'towing-vans': {
    title: 'Towing Vans Service',
    items: [
      {
        path: '/towing-vans/my-towing-vans',
        label: 'My Towing Vans',
        icon: Wrench,
      },
      { path: '/towing-vans/invoices', label: 'Invoices', icon: Receipt },
      { path: '/towing-vans/expenses', label: 'Expenses', icon: CreditCard },
      { path: '/towing-vans/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
};

export default function Sidebar() {
  const location = useLocation();

  const activeKey =
    Object.keys(serviceConfig).find((key) =>
      location.pathname.startsWith(`/${key}`),
    ) || 'ambulance';

  const currentService = serviceConfig[activeKey];

  return (
    <aside className='dashboard-sidebar'>
      <div className='sidebar-header'>
        <span className='service-category'>{currentService.title}</span>
      </div>

      <nav className='sidebar-menu'>
        {currentService.items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'menu-item active' : 'menu-item'
              }
            >
              <Icon size={18} className='menu-icon' />
              <span className='menu-label'>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
