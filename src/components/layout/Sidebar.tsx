import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  HardHat, 
  ClipboardList, 
  PlusCircle, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Obras', icon: HardHat, path: '/obras' },
    { name: 'Nova Obra', icon: PlusCircle, path: '/obras?novo=true' },
    { name: 'Lançamentos', icon: ClipboardList, path: '/lancamentos' },
    { name: 'Novo Lançamento', icon: PlusCircle, path: '/novo-lancamento' },
    { name: 'Relatórios', icon: FileText, path: '/relatorios' },
    ...(isAdmin ? [{ name: 'Usuários', icon: Users, path: '/usuarios' }] : []),
    { name: 'Perfil', icon: Settings, path: '/perfil' },
  ];

  const handleLogout = () => {
    auth.signOut();
  };

  const NavLink = ({ item, isActive }: { item: any; isActive: boolean; key?: React.Key }) => (
    <Link
      to={item.path}
      onClick={() => setIsOpen(false)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
        isActive
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
      )}
    >
      <item.icon className={cn(
        "w-5 h-5",
        isActive ? "text-blue-600" : "text-neutral-400 group-hover:text-neutral-600"
      )} />
      <span>{item.name}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-neutral-200 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <HardHat className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">ObraControl</h1>
          </div>

          <nav className="space-y-1">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 px-4">
              Menu Principal
            </div>
            {menuItems.map((item) => (
              <NavLink key={item.path} item={item} isActive={location.pathname === item.path} />
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 bg-neutral-50/80 border-t border-neutral-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
