import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Pages (to be implemented)
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Obras } from './pages/Obras';
import { Lancamentos } from './pages/Lancamentos';
import { NovoLancamento } from './pages/NovoLancamento';
import { Relatorios } from './pages/Relatorios';
import { Usuarios } from './pages/Usuarios';
import { Perfil } from './pages/Perfil';
import { VisualizarLancamento } from './pages/VisualizarLancamento';
import { EditarLancamento } from './pages/EditarLancamento';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/obras" element={
            <ProtectedRoute>
              <Layout>
                <Obras />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/lancamentos" element={
            <ProtectedRoute>
              <Layout>
                <Lancamentos />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/lancamentos/:id" element={
            <ProtectedRoute>
              <Layout>
                <VisualizarLancamento />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/lancamentos/:id/editar" element={
            <ProtectedRoute>
              <Layout>
                <EditarLancamento />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/novo-lancamento" element={
            <ProtectedRoute>
              <Layout>
                <NovoLancamento />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/relatorios" element={
            <ProtectedRoute>
              <Layout>
                <Relatorios />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/usuarios" element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <Usuarios />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          } />

          <Route path="/perfil" element={
            <ProtectedRoute>
              <Layout>
                <Perfil />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
