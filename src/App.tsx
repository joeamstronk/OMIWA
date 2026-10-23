import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { UsersPage } from './components/users/UsersPage';
import { AddWhatsAppPage } from './components/whatsapp/AddWhatsAppPage';
import { ChatPage } from './components/chat/ChatPage';
import { SettingsPage } from './components/settings/SettingsPage';

const AppContent: React.FC = () => {
  const { currentUser, activePage } = useApp();

  // If not logged in, render the login page
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activePage === 'dashboard' && <DashboardPage />}
          {activePage === 'users' && <UsersPage />}
          {activePage === 'whatsapp-channels' && <AddWhatsAppPage />}
          {activePage === 'chat' && <ChatPage />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
