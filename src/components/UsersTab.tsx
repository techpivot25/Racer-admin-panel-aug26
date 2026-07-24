import React, { useState, useMemo } from 'react';
import { CustomSelect } from './CustomSelect';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  User, 
  ShieldCheck, 
  SlidersHorizontal,
  Mail,
  Phone,
  Briefcase,
  Layers,
  X
} from 'lucide-react';
import { AdminUser, Customer, Language, AuditRecord } from '../types';

interface UsersTabProps {
  users: AdminUser[];
  customers: Customer[];
  onAddUser: (user: AdminUser) => void;
  onEditUser: (user: AdminUser) => void;
  onDeleteUser: (uuid: string) => void;
  t: Record<string, string>;
  isDark: boolean;
  triggerOpenAddModal: boolean;
  onResetTrigger: () => void;
  auditLogs?: AuditRecord[];
}

export default function UsersTab({
  users,
  customers,
  onAddUser,
  onEditUser,
  onDeleteUser,
  t,
  isDark,
  triggerOpenAddModal,
  onResetTrigger,
  auditLogs = []
}: UsersTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'admin' | 'customer'>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [adminRole, setAdminRole] = useState<'Super Admin' | 'Billing Specialist' | 'Support Specialist' | 'User Admin' | 'Customer Operator'>('Super Admin');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(true);
  const [authMethod, setAuthMethod] = useState<'local' | 'sso'>('local');
  const [ssoProvider, setSsoProvider] = useState<string>('Okta Enterprise IDP');

  // Trigger modal open from Quick Links
  if (triggerOpenAddModal) {
    setTimeout(() => {
      openAddModal(activeSubTab === 'admin');
      onResetTrigger();
    }, 100);
  }

  function openAddModal(adminType: boolean) {
    setEditingUser(null);
    setFirstName('');
    setLastName('');
    setTitle('');
    setEmail('');
    setPhone('');
    setCustomerId(customers[0]?.id || '');
    setNotes('');
    setIsAdminUser(adminType);
    setAdminRole(adminType ? 'Super Admin' : 'Customer Operator');
    setAuthMethod('local');
    setSsoProvider('Okta Enterprise IDP');
    setIsModalOpen(true);
  }

  function openEditModal(user: AdminUser) {
    setEditingUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setTitle(user.title);
    setEmail(user.email);
    setPhone(user.phone);
    setCustomerId(user.customerId);
    setNotes(user.notes);
    setIsAdminUser(user.isAdminUser);
    setAdminRole(user.adminRole || (user.isAdminUser ? 'Super Admin' : 'Customer Operator'));
    setAuthMethod(user.authMethod || 'local');
    setSsoProvider(user.ssoProvider || 'Okta Enterprise IDP');
    setIsModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selectedCust = customers.find(c => c.id === customerId);
    
    const userData: AdminUser = {
      uuid: editingUser ? editingUser.uuid : `u-${Date.now()}`,
      firstName,
      lastName,
      title,
      phone,
      email,
      customerId,
      customerName: selectedCust ? selectedCust.name : 'Unknown Customer',
      customerTierId: selectedCust ? selectedCust.id : '',
      customerTier: selectedCust ? selectedCust.supportTier : 'Standard Support Model',
      notes,
      createDate: editingUser ? editingUser.createDate : new Date().toISOString().split('T')[0],
      createdBy: editingUser ? editingUser.createdBy : 'Global Admin',
      lastModified: new Date().toISOString().split('T')[0],
      lastModifiedBy: 'developerbe25@gmail.com',
      isAdminUser,
      adminRole,
      authMethod,
      ssoProvider: authMethod === 'sso' ? ssoProvider : undefined
    };

    const performSave = () => {
      if (editingUser) {
        onEditUser(userData);
      } else {
        onAddUser(userData);
      }
      setIsModalOpen(false);
      setConfirmModal(null);
    };

    if (editingUser) {
      setConfirmModal({
        isOpen: true,
        title: 'Confirm Profile Update',
        message: `Are you sure you want to save modifications for "${firstName} ${lastName}"? This will update their credentials and permissions in the directory.`,
        onConfirm: performSave
      });
    } else {
      performSave();
    }
  }

  const requestDeleteUser = (user: AdminUser) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User Account',
      message: `Are you sure you want to delete the user account for "${user.firstName} ${user.lastName}"? This will permanently deactivate their system login.`,
      onConfirm: () => {
        onDeleteUser(user.uuid);
        setConfirmModal(null);
      }
    });
  };

  // Filter and Sort users
  const filteredUsers = useMemo(() => {
    let result = users.filter(u => u.isAdminUser === (activeSubTab === 'admin'));

    if (selectedCustomerId !== 'all') {
      result = result.filter(u => u.customerId === selectedCustomerId);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        u => 
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.title.toLowerCase().includes(q) ||
          u.customerName.toLowerCase().includes(q)
      );
    }

    // Default sorted by name (first name + last name)
    return result.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [users, activeSubTab, selectedCustomerId, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* GRID CONTROL TABS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className={`flex rounded-xl p-1 border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveSubTab('admin')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'admin' ? (isDark ? 'bg-[rgb(14,145,145)] text-white' : 'bg-white text-[rgb(14,145,145)] shadow-2xs') : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.adminUsers}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('customer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'customer' ? (isDark ? 'bg-[rgb(14,145,145)] text-white' : 'bg-white text-[rgb(14,145,145)] shadow-2xs') : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
          >
            <User className="w-4 h-4" />
            <span>{t.customerUsers}</span>
          </button>
        </div>

        <button
          onClick={() => openAddModal(activeSubTab === 'admin')}
          className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-[rgb(14,145,145)]/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewUser}</span>
        </button>
      </div>

      <div className={`p-4 rounded-xl border flex flex-row flex-wrap gap-4 items-center justify-between ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-100 shadow-2xs'}`}>
        <div className="relative flex-1 min-w-[200px] md:max-w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-hidden transition-all ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-white focus:border-[rgb(14,145,145)]' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[rgb(14,145,145)]'}`}
            placeholder={t.searchUsers}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Filter className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t.filterByCustomer}:</span>
          <CustomSelect
            value={selectedCustomerId}
            onChange={(val) => setSelectedCustomerId(val)}
            options={[
              { value: 'all', label: t.all },
              ...customers.map(c => ({ value: c.id, label: c.name }))
            ]}
            className="w-48"
            isDark={isDark}
          />
        </div>
      </div>

      {/* USERS DATA GRID */}
      <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-[#2D333D]' : 'border-slate-100 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs font-bold ${isDark ? 'bg-[#1E232B] text-gray-400' : 'bg-slate-50/75 text-slate-500'} border-b ${isDark ? 'border-[#2D333D]' : 'border-slate-100'}`}>
                <th className="p-4">UUID</th>
                <th className="p-4">User Details</th>
                <th className="p-4">Title / Role</th>
                <th className="p-4">Customer Entity / Auth</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-[#2D333D] text-gray-300' : 'divide-slate-100 text-slate-700'}`}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No users found matching search or filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.uuid} className={`hover:bg-[rgb(14,145,145)]/5 transition-colors`}>
                    <td className="p-4 font-mono text-[10px] text-[rgb(14,145,145)] font-bold">{user.uuid}</td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1 text-gray-500 font-mono text-[10px]">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Briefcase className="w-3.5 h-3.5 text-[rgb(14,145,145)]" />
                        <span>{user.title}</span>
                      </div>
                      <div className="mt-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          user.isAdminUser 
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {user.adminRole || (user.isAdminUser ? 'Super Admin' : 'Customer Operator')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold">{user.customerName}</div>
                      <div className="text-[10px] text-gray-500 font-mono">ID: {user.customerId}</div>
                      {user.authMethod === 'sso' ? (
                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] border border-[rgb(14,145,145)]/20">
                          SSO: {user.ssoProvider || 'IDP'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-gray-500/10 text-gray-400 border border-gray-500/15">
                          Local credentials
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded-md hover:bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] transition-colors cursor-pointer"
                          title="Modify User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => requestDeleteUser(user)}
                          className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED ADD / MODIFY DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          <div className={`relative w-full max-w-lg rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base">
                {editingUser ? 'Modify User Profile' : 'Register New User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-black/10 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)}
                    className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Last Name</label>
                  <input 
                    type="text" 
                    required
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)}
                    className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Job Title / Role</label>
                <input 
                  type="text" 
                  required
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Customer Association</label>
                  <CustomSelect
                    value={customerId}
                    onChange={val => setCustomerId(val)}
                    options={customers.map(c => ({ value: c.id, label: c.name }))}
                    isDark={isDark}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">System Privilege</label>
                  <CustomSelect
                    value={adminRole}
                    onChange={val => {
                      setAdminRole(val as any);
                      setIsAdminUser(val !== 'Customer Operator');
                    }}
                    options={[
                      { value: "Super Admin", label: "Super Administrator (Full System Read/Write)" },
                      { value: "Billing Specialist", label: "Billing Specialist (Contracts & Billing Tiers)" },
                      { value: "Support Specialist", label: "Support Specialist (SLAs & Support Records)" },
                      { value: "User Admin", label: "Identity & Access Manager (SSO & Credentials)" },
                      { value: "Customer Operator", label: "Customer Portal Operator (Customer UI Only)" }
                    ]}
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* AUTH METHOD SELECTOR (PAGE 3 REQUIREMENT) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Login Method</label>
                  <CustomSelect
                    value={authMethod}
                    onChange={val => setAuthMethod(val as any)}
                    options={[
                      { value: "local", label: "Local credentials" },
                      { value: "sso", label: "SSO Federated IDP" }
                    ]}
                    isDark={isDark}
                  />
                </div>
                {authMethod === 'sso' && (
                  <div className="space-y-1">
                    <label className="font-bold">SSO Identity Provider</label>
                    <CustomSelect
                      value={ssoProvider}
                      onChange={val => setSsoProvider(val)}
                      options={[
                        { value: "Okta Enterprise IDP", label: "Okta IDP" },
                        { value: "Google Workspace", label: "Google Workspace" },
                        { value: "Microsoft Azure AD", label: "Microsoft Azure AD" },
                        { value: "Auth0 Security Gate", label: "Auth0 Secure Gate" }
                      ]}
                      isDark={isDark}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold">Notes</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-lg border cursor-pointer ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg font-bold cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUDIT LOG SECTION FOR THE USERS TAB */}
      <div className={`mt-8 p-6 rounded-2xl border ${isDark ? 'bg-[#13161C] border-[#2D333D]' : 'bg-white border-slate-100 shadow-3xs'}`}>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-700/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[rgb(14,145,145)] animate-pulse"></span>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[rgb(14,145,145)]">Directory Audit Trail (User Admin Records)</h4>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">Status: Connected to Log Store</span>
        </div>
        <div className="space-y-3.5 max-h-48 overflow-y-auto pr-2">
          {auditLogs.filter(log => log.screen === 'Users').length === 0 ? (
            <p className="text-xs text-gray-500 italic">No directory audit logs registered in this session.</p>
          ) : (
            auditLogs.filter(log => log.screen === 'Users').map(log => (
              <div key={log.id} className="flex gap-4 text-[11px] leading-relaxed pb-3 border-b border-slate-100 dark:border-gray-800 last:border-0 last:pb-0">
                <span className="text-gray-400 font-mono shrink-0 select-none">[{log.timestamp}]</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-extrabold text-[rgb(14,145,145)]">{log.action}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 font-medium">Actor: {log.user}</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-sans">{log.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CONFIRMATION POPUP MODAL */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`relative w-full max-w-md rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <h3 className="text-base font-extrabold mb-2 text-rose-500 flex items-center gap-2">
              ⚠️ {confirmModal.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className={`px-4 py-2 rounded-lg border cursor-pointer font-bold ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                {t.cancel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold cursor-pointer"
              >
                Acknowledge & Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
