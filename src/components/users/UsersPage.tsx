import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldAlert,
  Headphones,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  Star,
  MessageSquare,
  Lock,
  Smartphone,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, UserStatus } from '../../types';

export const UsersPage: React.FC = () => {
  const {
    users,
    currentUser,
    sessions,
    addUser,
    updateUser,
    deleteUser,
    updateUserStatus,
  } = useApp();

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');

  // Modal State for Adding/Editing User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'call_center' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online' as UserStatus,
    assignedChannels: ['all'] as string[],
  });

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      phone: '+62 8',
      role: 'call_center',
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 50000000)}?w=150&auto=format&fit=crop&q=80`,
      status: 'online',
      assignedChannels: ['all'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      status: user.status,
      assignedChannels: user.assignedChannels,
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingUserId) {
      updateUser(editingUserId, formData);
    } else {
      addUser(formData);
    }
    setIsModalOpen(false);
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Manajemen Pengguna & Agen Call Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {users.length} Total Akun
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pengaturan peran akses sistem:{' '}
            <strong className="text-purple-400">Super Admin</strong> (akses penuh) &{' '}
            <strong className="text-emerald-400">Call Center</strong> (antrian pesan & respon pelanggan).
          </p>
        </div>

        {/* Add User Button (Exclusive to Super Admin) */}
        {isSuperAdmin ? (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-lg shadow-emerald-900/30 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Agen / Admin Baru</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 text-xs bg-slate-800/80 text-slate-400 px-3 py-2 rounded-xl border border-slate-700">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode View: Hanya Super Admin yang dapat menambah/menghapus pengguna.</span>
          </div>
        )}
      </div>

      {/* Role Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block">
              Super Admin
            </span>
            <span className="text-2xl font-extrabold text-white">
              {users.filter((u) => u.role === 'super_admin').length} Akun
            </span>
            <span className="text-[11px] text-purple-300 block mt-0.5">
              Kelola nomor WA, user, & bot server
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
              Call Center Agents
            </span>
            <span className="text-2xl font-extrabold text-white">
              {users.filter((u) => u.role === 'call_center').length} Agen
            </span>
            <span className="text-[11px] text-emerald-300 block mt-0.5">
              Handling pesan & percakapan pelanggan
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Agen Sedang Online
            </span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {users.filter((u) => u.status === 'online').length} Aktif
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Siap membalas pesan masuk
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, atau nomor HP..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-xs text-slate-400 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none font-medium cursor-pointer"
            >
              <option value="all" className="bg-slate-800">Semua Role</option>
              <option value="super_admin" className="bg-slate-800">Super Admin</option>
              <option value="call_center" className="bg-slate-800">Call Center</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-400 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none font-medium cursor-pointer"
            >
              <option value="all" className="bg-slate-800">Semua Status</option>
              <option value="online" className="bg-slate-800">Online</option>
              <option value="busy" className="bg-slate-800">Busy</option>
              <option value="offline" className="bg-slate-800">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isCurrentUser = currentUser?.id === user.id;
          const isUserAdmin = user.role === 'super_admin';

          return (
            <div
              key={user.id}
              className={`p-5 rounded-2xl bg-slate-900 border transition relative space-y-4 ${
                isCurrentUser
                  ? 'border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header with Avatar, Role & Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                        user.status === 'online'
                          ? 'bg-emerald-500'
                          : user.status === 'busy'
                          ? 'bg-amber-500'
                          : 'bg-slate-600'
                      }`}
                      title={`Status: ${user.status}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-sm text-white truncate max-w-[160px]">
                        {user.name}
                      </h3>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
                          Anda
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
                    <p className="text-[11px] text-slate-500">{user.phone}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center ${
                    isUserAdmin
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isUserAdmin ? (
                    <>
                      <ShieldAlert className="w-3 h-3 mr-1" /> Super Admin
                    </>
                  ) : (
                    <>
                      <Headphones className="w-3 h-3 mr-1" /> Call Center
                    </>
                  )}
                </span>
              </div>

              {/* Channel Assignments */}
              <div className="text-xs space-y-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center">
                  <Smartphone className="w-3 h-3 mr-1 text-emerald-400" />
                  Saluran WhatsApp Ditugaskan:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.assignedChannels.includes('all') ? (
                    <span className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-medium">
                      Semua Nomor WhatsApp ({sessions.length})
                    </span>
                  ) : (
                    user.assignedChannels.map((chId) => {
                      const sess = sessions.find((s) => s.id === chId);
                      return (
                        <span
                          key={chId}
                          className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded font-mono"
                        >
                          {sess ? sess.phoneNumber : chId}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Chat Ditangani</span>
                  <span className="font-bold text-white flex items-center justify-center space-x-0.5">
                    <MessageSquare className="w-3 h-3 text-slate-400 mr-0.5" />
                    {user.totalChatsHandled}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Avg Respon</span>
                  <span className="font-bold text-emerald-400 flex items-center justify-center space-x-0.5">
                    <Clock className="w-3 h-3 mr-0.5" />
                    {user.avgResponseTimeMin}m
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Rating Kepuasan</span>
                  <span className="font-bold text-amber-400 flex items-center justify-center space-x-0.5">
                    <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                    {user.rating}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              {isSuperAdmin && (
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition"
                    title="Edit Data Pengguna"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!isCurrentUser && (
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Hapus Pengguna"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Adding or Editing User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingUserId ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
                <p className="text-xs text-slate-400">
                  Tentukan peran (Super Admin vs Call Center) & alokasi nomor WhatsApp.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Dimas Anggara"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Perusahaan</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="dimas@omnichat.io"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">No. WhatsApp/HP</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62 812-..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Pilih Peran Akun (Role)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'call_center' })}
                    className={`p-3 rounded-xl border text-left transition ${
                      formData.role === 'call_center'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold mb-1">
                      <Headphones className="w-4 h-4 text-emerald-400" />
                      <span>Call Center</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Menangani live chat pelanggan & template pesan.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'super_admin' })}
                    className={`p-3 rounded-xl border text-left transition ${
                      formData.role === 'super_admin'
                        ? 'bg-purple-950/40 border-purple-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold mb-1">
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      <span>Super Admin</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Akses tak terbatas kelola server & pengguna.
                    </p>
                  </button>
                </div>
              </div>

              {/* Channel Assignment */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Alokasi Nomor WhatsApp
                </label>
                <select
                  value={formData.assignedChannels[0] || 'all'}
                  onChange={(e) => setFormData({ ...formData, assignedChannels: [e.target.value] })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Semua Nomor WhatsApp</option>
                  {sessions.map((sess) => (
                    <option key={sess.id} value={sess.id}>
                      {sess.name} ({sess.phoneNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-900/30"
                >
                  {editingUserId ? 'Simpan Perubahan' : 'Buat Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
