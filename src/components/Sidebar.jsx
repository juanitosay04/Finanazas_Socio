import { LayoutDashboard, Receipt, Target, TrendingUp, Wallet, History, Settings } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', name: 'Resumen General', icon: LayoutDashboard },
    { id: 'expenses', name: 'Control de Gastos', icon: Receipt },
    { id: 'goals', name: 'Bolsillos de Ahorro', icon: Target },
    { id: 'investments', name: 'Inversiones', icon: TrendingUp },
    { id: 'history', name: 'Historial Cierres', icon: History },
    { id: 'config', name: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Wallet className="text-cyan" size={24} />
        <span className="sidebar-logo-text">SocioWealth</span>
      </div>
      
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </li>
          );
        })}
      </ul>
      
      <div className="sidebar-footer">
        <div>Control Patrimonial v1.0.0</div>
        <div className="partner-badge">SOCIO VIP</div>
      </div>
    </aside>
  );
}
