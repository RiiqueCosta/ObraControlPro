import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isEmailUnverified = user && !user.emailVerified;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen flex flex-col">
        {isEmailUnverified && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-center justify-center gap-3 text-amber-800 text-sm font-medium sticky top-0 md:top-0 z-40">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Por favor, verifique seu e-mail para habilitar as funções de escrita (lançamentos e obras).</span>
          </div>
        )}
        <div className="p-4 lg:p-8 pt-20 lg:pt-8 flex-1">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
