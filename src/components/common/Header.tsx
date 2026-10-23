import React from 'react';
import {
  MessageSquare,
  ShieldAlert,
  Headphones,
  Smartphone,
  ChevronDown,
  LogOut,
  Bell,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    sessions,
    switchUser,
    logout,
    updateUserStatus,
    unreadTotal,
    setActivePage,
  } = useApp();

  const connectedSessions = sessions.filter((s) => s.status === 'connected');

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0 shadow-md">
      {/* Brand & Connection Status */}
      <div className="flex items-center space-x-3">
        <div
          onClick={() => setActivePage('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">OmniWatsApp Surveillance</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Server v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-Device Gateway & Team Inbox
            </p>
          </div>
        </div>

        {/* WhatsApp Gateway Server Status Pill */}
        <div
          onClick={() => setActivePage('whatsapp-channels')}
          className="hidden md:flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
          title="Click to manage WhatsApp Numbers"
        >
          <div className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                connectedSessions.length > 0 ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                connectedSessions.length > 0 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
          </div>
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">
            {connectedSessions.length} / {sessions.length} Lines Online
          </span>
        </div>
      </div>

      {/* Right Controls: Quick Switch, Unread Bell, Status, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Quick Role Switcher for Testing (Super Admin vs Call Center) */}
        <div className="relative group">
          <button
            type="button"
            className="flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            title="Switch User Role to test Call Center or Admin experience"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline text-slate-400">Switch Role:</span>
            <span className="font-semibold text-emerald-300">
              {currentUser?.role === 'super_admin' ? 'Super Admin' : 'Call Center'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 hidden group-hover:block group-focus-within:block z-50">
            <div className="px-3 py-1.5 border-b border-slate-700 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Switch Test Account
            </div>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => switchUser(user.id)}
                className={`w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-slate-700/70 transition ${
                  currentUser?.id === user.id ? 'bg-emerald-950/40 text-emerald-400' : 'text-slate-200'
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{user.name}</p>
                  <div className="flex items-center space-x-1">
                    <span
                      className={`text-[10px] px-1 rounded font-semibold ${
                        user.role === 'super_admin'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {user.role === 'super_admin' ? 'Super Admin' : 'Call Center'}
                    </span>
                  </div>
                </div>
                {currentUser?.id === user.id && <UserCheck className="w-4 h-4 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Unread Notifications Bell */}
        <button
          onClick={() => setActivePage('chat')}
          className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title={`${unreadTotal} Unread Messages`}
        >
          <Bell className="w-5 h-5" />
          {unreadTotal > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadTotal > 9 ? '9+' : unreadTotal}
            </span>
          )}
        </button>

        {/* Current User Status & Profile Card */}
        {currentUser && (
          <div className="flex items-center space-x-3 pl-2 sm:pl-3 border-l border-slate-800">
            {/* Status Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center space-x-1 text-xs bg-slate-800/80 px-2 py-1 rounded-md text-slate-300 hover:bg-slate-700 transition"
                title="Change availability status"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentUser.status === 'online'
                      ? 'bg-emerald-500'
                      : currentUser.status === 'busy'
                      ? 'bg-amber-500'
                      : 'bg-slate-500'
                  }`}
                />
                <span className="capitalize hidden sm:inline">{currentUser.status}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                {(['online', 'busy', 'offline'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateUserStatus(st)}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 flex items-center space-x-2"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        st === 'online'
                          ? 'bg-emerald-500'
                          : st === 'busy'
                          ? 'bg-amber-500'
                          : 'bg-slate-500'
                      }`}
                    />
                    <span className="capitalize">{st}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex items-center space-x-2.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/40"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-100 truncate max-w-[120px]">
                  {currentUser.name}
                </p>
                <div className="flex items-center space-x-1">
                  {currentUser.role === 'super_admin' ? (
                    <span className="flex items-center text-[10px] text-purple-400 font-medium">
                      <ShieldAlert className="w-2.5 h-2.5 mr-0.5" /> Super Admin
                    </span>
                  ) : (
                    <span className="flex items-center text-[10px] text-emerald-400 font-medium">
                      <Headphones className="w-2.5 h-2.5 mr-0.5" /> Call Center
                    </span>
                  )}
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
