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
  Mail,
  Phone,
  Briefcase,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Lock,
  Shield,
  ShieldAlert,
  Crown,
  Key,
  Info,
  Ban,
  UserCheck,
  UserX,
  History,
  MessageSquare,
  Send,
  Bold,
  Italic,
  Underline,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  FileText,
  Scissors,
  Copy,
  Clipboard,
  Paintbrush,
  Strikethrough,
  Subscript,
  Superscript,
  Highlighter,
  Baseline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListTree,
  Indent,
  Outdent,
  ArrowUpDown,
  Pilcrow,
  AArrowUp,
  AArrowDown,
  Eraser,
  Palette,
  Grid,
  CaseSensitive
} from 'lucide-react';
import { AdminUser, Customer, AuditRecord, CommunicationLog } from '../types';

export const ROLE_MODULES = [
  'Admin',
  'Analytics',
  'Custom Reports',
  'Customers',
  'Customer Reports',
  'Dashboard',
  'Finance',
  'Inquiries',
  'Orders',
  'Reports',
  'Sales',
  'Settings',
  'Licenses',
  'Products',
  'Support',
  'System Logs'
];

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
  currentUserRole?: 'Super Admin' | 'Admin' | 'Sub Admin';
}

interface SubPerms {
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
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
  auditLogs = [],
  currentUserRole = 'Super Admin'
}: UsersTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'admin' | 'customer'>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Checkbox selection state & Pagination state
  const [selectedUserUuids, setSelectedUserUuids] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };
  
  // User Create/Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Email Composer Modal State & MS Word Formatting Toolbar
  const [emailComposerUser, setEmailComposerUser] = useState<AdminUser | null>(null);
  const [emailSender, setEmailSender] = useState('techpivot25@gmail.com');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // MS Word Ribbon Formatting States
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [fontSize, setFontSize] = useState(11);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [textCase, setTextCase] = useState<'normal' | 'uppercase' | 'lowercase' | 'capitalize'>('normal');
  const [fontColor, setFontColor] = useState('#1e293b');
  const [highlightColor, setHighlightColor] = useState('transparent');
  const [shadingColor, setShadingColor] = useState('transparent');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [listType, setListType] = useState<'none' | 'bullet' | 'number' | 'multilevel'>('none');
  const [indent, setIndent] = useState(0);
  const [lineSpacing, setLineSpacing] = useState('1.15');
  const [hasBorder, setHasBorder] = useState(false);
  const [showParagraphMarks, setShowParagraphMarks] = useState(false);
  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showShadingPicker, setShowShadingPicker] = useState(false);
  const [showCaseMenu, setShowCaseMenu] = useState(false);
  const [showLineSpacingMenu, setShowLineSpacingMenu] = useState(false);

  // Communication Log Drawer State
  const [commLogsUser, setCommLogsUser] = useState<AdminUser | null>(null);
  const [expandedLogIds, setExpandedLogIds] = useState<string[]>([]);

  const toggleExpandLog = (logId: string) => {
    setExpandedLogIds(prev =>
      prev.includes(logId) ? prev.filter(id => id !== logId) : [...prev, logId]
    );
  };

  const openCommLogs = (user: AdminUser) => {
    setCommLogsUser(user);
    setExpandedLogIds([]);
  };

  // Change Password Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<AdminUser | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showPasswordToggle, setShowPasswordToggle] = useState(false);

  // Block / Unblock Modal State
  const [blockModalUser, setBlockModalUser] = useState<AdminUser | null>(null);
  
  // General Action Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Form states matching user screenshot layout
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminType, setAdminType] = useState<'Super Admin' | 'Admin' | 'Sub Admin'>('Sub Admin');
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(true);

  // Permission selection state
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Dashboard', 'Customers', 'Orders']);
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);
  const [roleSubPerms, setRoleSubPerms] = useState<Record<string, SubPerms>>(() => {
    const initial: Record<string, SubPerms> = {};
    ROLE_MODULES.forEach(mod => {
      initial[mod] = {
        read: ['Dashboard', 'Customers', 'Orders'].includes(mod),
        create: ['Dashboard', 'Customers'].includes(mod),
        edit: ['Dashboard', 'Customers'].includes(mod),
        delete: false,
        export: false
      };
    });
    return initial;
  });

  // Check if all roles are selected
  const isAllRolesSelected = useMemo(() => {
    return ROLE_MODULES.every(mod => selectedRoles.includes(mod));
  }, [selectedRoles]);

  // Toggle "Select all" roles
  const handleSelectAllRoles = (checked: boolean) => {
    if (checked) {
      setSelectedRoles([...ROLE_MODULES]);
      const nextSubPerms: Record<string, SubPerms> = {};
      ROLE_MODULES.forEach(mod => {
        nextSubPerms[mod] = { read: true, create: true, edit: true, delete: true, export: true };
      });
      setRoleSubPerms(nextSubPerms);
    } else {
      setSelectedRoles([]);
      const nextSubPerms: Record<string, SubPerms> = {};
      ROLE_MODULES.forEach(mod => {
        nextSubPerms[mod] = { read: false, create: false, edit: false, delete: false, export: false };
      });
      setRoleSubPerms(nextSubPerms);
    }
  };

  // Toggle single module role selection
  const handleToggleModuleRole = (moduleName: string) => {
    const isSelected = selectedRoles.includes(moduleName);
    if (isSelected) {
      setSelectedRoles(prev => prev.filter(m => m !== moduleName));
      setRoleSubPerms(prev => ({
        ...prev,
        [moduleName]: { read: false, create: false, edit: false, delete: false, export: false }
      }));
    } else {
      setSelectedRoles(prev => [...prev, moduleName]);
      setRoleSubPerms(prev => ({
        ...prev,
        [moduleName]: { read: true, create: true, edit: true, delete: false, export: false }
      }));
    }
  };

  // Toggle expand/collapse card
  const handleToggleExpandRole = (moduleName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRoles(prev => 
      prev.includes(moduleName) ? prev.filter(m => m !== moduleName) : [...prev, moduleName]
    );
  };

  // Toggle individual sub-permission
  const handleToggleSubPerm = (moduleName: string, permKey: keyof SubPerms) => {
    setRoleSubPerms(prev => {
      const current = prev[moduleName] || { read: false, create: false, edit: false, delete: false, export: false };
      const updated = { ...current, [permKey]: !current[permKey] };
      
      // Auto-update parent selection state
      const hasAny = Object.values(updated).some(Boolean);
      if (hasAny && !selectedRoles.includes(moduleName)) {
        setSelectedRoles(r => [...r, moduleName]);
      } else if (!hasAny && selectedRoles.includes(moduleName)) {
        setSelectedRoles(r => r.filter(m => m !== moduleName));
      }

      return { ...prev, [moduleName]: updated };
    });
  };

  // Trigger modal open from Quick Links
  if (triggerOpenAddModal) {
    setTimeout(() => {
      openAddModal(activeSubTab === 'admin');
      onResetTrigger();
    }, 100);
  }

  function openAddModal(isAdmin: boolean) {
    setEditingUser(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setTitle(isAdmin ? 'System Administrator' : 'Customer Account Representative');
    setCustomerId(customers[0]?.id || 'c-1');
    setNotes('');
    setIsAdminUser(isAdmin);
    
    // Hierarchy Enforcement on creation
    if (currentUserRole === 'Admin') {
      setAdminType('Sub Admin');
    } else {
      setAdminType(isAdmin ? 'Super Admin' : 'Sub Admin');
    }

    // Default permission setup
    setSelectedRoles(['Dashboard', 'Customers', 'Orders']);
    const defaultSub: Record<string, SubPerms> = {};
    ROLE_MODULES.forEach(mod => {
      defaultSub[mod] = {
        read: ['Dashboard', 'Customers', 'Orders'].includes(mod),
        create: ['Dashboard', 'Customers'].includes(mod),
        edit: ['Dashboard', 'Customers'].includes(mod),
        delete: false,
        export: false
      };
    });
    setRoleSubPerms(defaultSub);
    setIsModalOpen(true);
  }

  function openEditModal(user: AdminUser) {
    // Hierarchy check: Admin cannot edit Super Admin
    if (currentUserRole === 'Admin' && user.adminRole === 'Super Admin') {
      triggerToast('🔒 Security Access Denied: Admin role cannot modify Super Admin accounts.');
      return;
    }

    setEditingUser(user);
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setPassword(user.password || '');
    setAdminType((user.adminRole as any) || (user.isAdminUser ? 'Sub Admin' : 'Sub Admin'));
    setTitle(user.title || '');
    setCustomerId(user.customerId || customers[0]?.id || 'c-1');
    setNotes(user.notes || '');
    setIsAdminUser(user.isAdminUser);

    const initialRoles = user.permissions || ['Dashboard', 'Customers'];
    setSelectedRoles(initialRoles);

    const nextSubPerms: Record<string, SubPerms> = {};
    ROLE_MODULES.forEach(mod => {
      const isAssigned = initialRoles.includes(mod);
      nextSubPerms[mod] = {
        read: isAssigned,
        create: isAssigned,
        edit: isAssigned,
        delete: false,
        export: false
      };
    });
    setRoleSubPerms(nextSubPerms);
    setIsModalOpen(true);
  }

  // EMAIL COMPOSER LOGIC & MS WORD FORMATTING
  const openEmailComposer = (user: AdminUser) => {
    setEmailComposerUser(user);
    setEmailSender('techpivot25@gmail.com');
    setEmailRecipient(user.email);
    setEmailSubject(`Welcome to Admin Panel - Login Credentials & Portal URL`);
    const appUrl = window.location.origin || 'https://admin-panel.example.com';
    setEmailBody(
      `Dear ${user.firstName} ${user.lastName},\n\nYour user account (${user.adminRole || 'Sub Admin'}) has been provisioned on the Admin Portal.\n\nAccess Credentials:\n- Admin Panel URL: ${appUrl}\n- Registered Email: ${user.email}\n- Temporary Password: ${user.password || '••••••••'}\n\nPlease log in and update your password upon initial sign-in.\n\nRegards,\nAdmin Operations Team`
    );
    // Reset MS Word ribbon defaults
    setFontFamily('Calibri');
    setFontSize(11);
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
    setIsStrikethrough(false);
    setIsSubscript(false);
    setIsSuperscript(false);
    setTextCase('normal');
    setFontColor(isDark ? '#e2e8f0' : '#1e293b');
    setHighlightColor('transparent');
    setShadingColor('transparent');
    setTextAlign('left');
    setListType('none');
    setIndent(0);
    setLineSpacing('1.15');
    setHasBorder(false);
    setShowParagraphMarks(false);
    setFormatPainterActive(false);
    setShowFontColorPicker(false);
    setShowHighlightPicker(false);
    setShowShadingPicker(false);
    setShowCaseMenu(false);
    setShowLineSpacingMenu(false);
  };

  // MS Word Ribbon Formatting Actions
  const handleClearFormatting = () => {
    setFontFamily('Calibri');
    setFontSize(11);
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
    setIsStrikethrough(false);
    setIsSubscript(false);
    setIsSuperscript(false);
    setTextCase('normal');
    setFontColor(isDark ? '#e2e8f0' : '#1e293b');
    setHighlightColor('transparent');
    setShadingColor('transparent');
    setTextAlign('left');
    setListType('none');
    setIndent(0);
    setLineSpacing('1.15');
    setHasBorder(false);
    setShowParagraphMarks(false);
    setFormatPainterActive(false);
    triggerToast('🧹 Formatting cleared to Calibri 11pt default.');
  };

  const handleClipboardAction = (action: 'paste' | 'cut' | 'copy') => {
    if (action === 'copy') {
      navigator.clipboard?.writeText(emailBody);
      triggerToast('📋 Text copied to clipboard.');
    } else if (action === 'cut') {
      navigator.clipboard?.writeText(emailBody);
      setEmailBody('');
      triggerToast('✂️ Text cut to clipboard.');
    } else if (action === 'paste') {
      if (navigator.clipboard?.readText) {
        navigator.clipboard.readText().then(text => {
          if (text) setEmailBody(prev => prev + text);
        }).catch(() => {
          triggerToast('📋 Pasted clipboard content.');
        });
      } else {
        triggerToast('📋 Paste ready.');
      }
    }
  };

  const handleSendEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailComposerUser) return;
    if (!emailSubject.trim()) {
      triggerToast('⚠️ Please provide an email subject line.');
      return;
    }
    if (!emailBody.trim()) {
      triggerToast('⚠️ Please write an email message body before sending.');
      return;
    }

    const adminPanelUrl = window.location.origin || 'https://admin-panel.example.com';
    const userName = `${emailComposerUser.firstName} ${emailComposerUser.lastName}`.trim();
    const userRole = emailComposerUser.adminRole || 'Sub Admin';
    const userPass = emailComposerUser.password || '••••••••';

    // Parse variables in subject and body
    const parsedSubject = emailSubject
      .replaceAll('[User Name]', userName)
      .replaceAll('[User Role]', userRole)
      .replaceAll('[Recipient Email]', emailRecipient)
      .replaceAll('[Password]', userPass)
      .replaceAll('[Admin Panel URL]', adminPanelUrl);

    const parsedBody = emailBody
      .replaceAll('[User Name]', userName)
      .replaceAll('[User Role]', userRole)
      .replaceAll('[Recipient Email]', emailRecipient)
      .replaceAll('[Password]', userPass)
      .replaceAll('[Admin Panel URL]', adminPanelUrl);

    const activeSender = emailSender.trim() || 'techpivot25@gmail.com';

    const newLog: CommunicationLog = {
      id: `comm-${Date.now()}`,
      senderEmail: activeSender,
      recipientEmail: emailRecipient,
      subject: parsedSubject,
      body: parsedBody,
      timestamp: new Date().toLocaleString(),
      sentBy: currentUserRole || 'Super Admin',
      templateName: 'MS Word Formatted Email'
    };

    const updatedLogs = [newLog, ...(emailComposerUser.communicationLogs || [])];
    const updatedUser: AdminUser = {
      ...emailComposerUser,
      communicationLogs: updatedLogs,
      lastModified: new Date().toISOString().split('T')[0],
      lastModifiedBy: activeSender
    };

    // Trigger local email client mailto protocol
    const mailtoUrl = `mailto:${encodeURIComponent(emailRecipient)}?subject=${encodeURIComponent(parsedSubject)}&body=${encodeURIComponent(parsedBody)}`;
    try {
      window.open(mailtoUrl, '_blank');
    } catch {
      // fallback
    }

    onEditUser(updatedUser);
    triggerToast(`📧 Email logged & triggered to ${emailRecipient} from ${activeSender}`);
    setEmailComposerUser(null);
  };

  // CHANGE PASSWORD MODAL LOGIC
  const openPasswordModal = (user: AdminUser) => {
    if (currentUserRole === 'Admin' && user.adminRole === 'Super Admin') {
      triggerToast('🔒 Security Access Denied: Admin role cannot modify Super Admin passwords.');
      return;
    }
    setPasswordModalUser(user);
    setNewPasswordVal(user.password || 'Cyber#2026!Sec');
    setShowPasswordToggle(false);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let rand = '';
    for (let i = 0; i < 10; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordVal(rand);
  };

  const handleSavePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    if (newPasswordVal.trim().length < 6) {
      triggerToast('⚠️ Password must be at least 6 characters long.');
      return;
    }

    const updatedUser: AdminUser = {
      ...passwordModalUser,
      password: newPasswordVal.trim(),
      lastModified: new Date().toISOString().split('T')[0],
      lastModifiedBy: currentUserRole || 'Super Admin'
    };

    onEditUser(updatedUser);
    triggerToast(`🔑 Password updated for ${passwordModalUser.firstName} ${passwordModalUser.lastName}`);
    setPasswordModalUser(null);
  };

  // BLOCK / UNBLOCK LOGIC
  const handleConfirmBlockToggle = () => {
    if (!blockModalUser) return;
    const nextBlocked = !blockModalUser.isBlocked;

    const updatedUser: AdminUser = {
      ...blockModalUser,
      isBlocked: nextBlocked,
      lastModified: new Date().toISOString().split('T')[0],
      lastModifiedBy: currentUserRole || 'Super Admin'
    };

    onEditUser(updatedUser);
    triggerToast(
      nextBlocked
        ? `🚫 Account for "${blockModalUser.firstName} ${blockModalUser.lastName}" is now BLOCKED`
        : `✅ Account for "${blockModalUser.firstName} ${blockModalUser.lastName}" is now UNBLOCKED & ACTIVE`
    );
    setBlockModalUser(null);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Safety check for Admin role hierarchy rule
    if (currentUserRole === 'Admin' && adminType === 'Super Admin') {
      triggerToast('⚠️ Rule Violation: Admin accounts are restricted to creating Sub Admin users only.');
      return;
    }

    const selectedCust = customers.find(c => c.id === customerId);
    
    const userData: AdminUser = {
      uuid: editingUser ? editingUser.uuid : `u-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      title: title.trim() || `${adminType} Specialist`,
      phone: phone.trim(),
      email: email.trim(),
      password,
      customerId,
      customerName: selectedCust ? selectedCust.name : 'Platform System',
      customerTierId: selectedCust ? selectedCust.id : 'tier-gold',
      customerTier: selectedCust ? selectedCust.supportTier : 'Gold Support Model',
      notes,
      createDate: editingUser ? editingUser.createDate : new Date().toISOString().split('T')[0],
      createdBy: editingUser ? editingUser.createdBy : (currentUserRole || 'Super Admin'),
      lastModified: new Date().toISOString().split('T')[0],
      lastModifiedBy: currentUserRole || 'Super Admin',
      isAdminUser: adminType === 'Super Admin' || adminType === 'Admin' || adminType === 'Sub Admin',
      adminRole: adminType,
      permissions: selectedRoles,
      authMethod: 'local',
      isBlocked: editingUser ? editingUser.isBlocked : false,
      communicationLogs: editingUser ? editingUser.communicationLogs : []
    };

    if (editingUser) {
      onEditUser(userData);
      triggerToast(`Updated user account "${firstName} ${lastName}" (${adminType})`);
    } else {
      onAddUser(userData);
      triggerToast(`Successfully registered new ${adminType}: "${firstName} ${lastName}" with ${selectedRoles.length} assigned permissions`);
    }
    setIsModalOpen(false);
  }

  function requestDeleteUser(user: AdminUser) {
    if (currentUserRole === 'Admin' && user.adminRole === 'Super Admin') {
      triggerToast('🔒 Security Access Denied: Admin role cannot delete Super Admin accounts.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Confirm Account Deletion',
      message: `Are you sure you want to delete administrator "${user.firstName} ${user.lastName}" (${user.email})? This action will permanently remove access credentials and module privileges.`,
      onConfirm: () => {
        onDeleteUser(user.uuid);
        triggerToast(`Deleted user account "${user.firstName} ${user.lastName}"`);
        setConfirmModal(null);
      }
    });
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Sub-tab filter: admin vs customer
      if (activeSubTab === 'admin' && !user.isAdminUser) return false;
      if (activeSubTab === 'customer' && user.isAdminUser) return false;

      // Search query
      const full = `${user.firstName} ${user.lastName} ${user.email} ${user.title} ${user.customerName}`.toLowerCase();
      if (searchQuery && !full.includes(searchQuery.toLowerCase())) return false;

      // Customer filter
      if (selectedCustomerId !== 'all' && user.customerId !== selectedCustomerId) return false;

      // Role filter
      if (roleFilter !== 'all' && user.adminRole !== roleFilter) return false;

      return true;
    });
  }, [users, activeSubTab, searchQuery, selectedCustomerId, roleFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, safeCurrentPage, itemsPerPage]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3 animate-bounce">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-extrabold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-xl font-black tracking-tight">{t.adminUsers || 'Admin Users'} & Access Governance</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl font-medium">
            Manage administrative platform operators, customer support representatives, role hierarchies, and granular module permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openAddModal(activeSubTab === 'admin')}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-900 hover:to-indigo-950 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'admin'
                ? 'bg-purple-800 text-white shadow-sm'
                : 'text-gray-500 hover:bg-slate-100 dark:hover:bg-gray-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Users ({users.filter(u => u.isAdminUser).length})</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('customer')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'customer'
                ? 'bg-purple-800 text-white shadow-sm'
                : 'text-gray-500 hover:bg-slate-100 dark:hover:bg-gray-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Customer Users ({users.filter(u => !u.isAdminUser).length})</span>
          </button>
        </div>

        {currentUserRole && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-extrabold">
            <Crown className="w-3.5 h-3.5" />
            <span>Your Session Role: {currentUserRole}</span>
          </div>
        )}
      </div>

      {/* Search & Filters Toolbar */}
      <div className={`p-4 rounded-2xl border shadow-xs flex flex-wrap items-center justify-between gap-3 ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200'}`}>
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by user name, email, title, or customer..."
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 ${
              isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-[180px]">
            <CustomSelect
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'Super Admin', label: 'Super Admin' },
                { value: 'Admin', label: 'Admin' },
                { value: 'Sub Admin', label: 'Sub Admin' }
              ]}
              isDark={isDark}
            />
          </div>

          <div className="w-[200px]">
            <CustomSelect
              value={selectedCustomerId}
              onChange={setSelectedCustomerId}
              options={[
                { value: 'all', label: 'All Customers' },
                ...customers.map(c => ({ value: c.id, label: c.name }))
              ]}
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className={`rounded-2xl border shadow-xs overflow-hidden ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-semibold text-xs ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUserUuids.includes(u.uuid))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const pageUuids = paginatedUsers.map(u => u.uuid);
                        setSelectedUserUuids(prev => Array.from(new Set([...prev, ...pageUuids])));
                      } else {
                        const pageUuids = new Set(paginatedUsers.map(u => u.uuid));
                        setSelectedUserUuids(prev => prev.filter(id => !pageUuids.has(id)));
                      }
                    }}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                    title="Select / Deselect all on this page"
                  />
                </th>
                <th className="px-3 py-3.5 w-10 text-center">S.No.</th>
                <th className="px-3 py-3.5">User Details</th>
                <th className="px-3 py-3.5">Title</th>
                <th className="px-3 py-3.5">User Type</th>
                <th className="px-3 py-3.5">Assigned Access</th>
                <th className="px-3 py-3.5">Customer Account</th>
                <th className="px-3 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 font-bold">
                    No users matching search filters found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => {
                  const isSuperAdminUser = user.adminRole === 'Super Admin';
                  const isProtectedFromCurrentActor = currentUserRole === 'Admin' && isSuperAdminUser;
                  const serialNumber = (safeCurrentPage - 1) * itemsPerPage + index + 1;
                  const isSelected = selectedUserUuids.includes(user.uuid);

                  return (
                    <tr key={user.uuid} className={`hover:bg-purple-500/5 transition-colors ${user.isBlocked ? 'opacity-70 bg-rose-500/5' : ''} ${isSelected ? 'bg-purple-500/10' : ''}`}>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedUserUuids(prev =>
                              prev.includes(user.uuid)
                                ? prev.filter(id => id !== user.uuid)
                                : [...prev, user.uuid]
                            );
                          }}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3 text-center font-normal text-gray-500 dark:text-gray-400 font-mono text-xs">
                        {serialNumber}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </span>
                          {isSuperAdminUser && (
                            <span className="p-0.5 rounded bg-amber-400/20 text-amber-600 dark:text-amber-400" title="Super Admin Platform Owner">
                              <Crown className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {user.isBlocked && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 text-[9px] font-semibold uppercase flex items-center gap-1">
                              <Ban className="w-2.5 h-2.5" /> Blocked
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 mt-0.5 text-gray-500 font-mono text-[11px] font-normal">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {user.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {user.phone || '+1 (555) 019-2831'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 font-normal text-xs text-slate-700 dark:text-slate-300">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>{user.title || 'Administrator'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-normal text-slate-700 dark:text-slate-300">
                          {user.adminRole || 'Sub Admin'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 font-normal text-xs text-slate-700 dark:text-slate-300">
                          <Key className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>
                            {user.permissions ? `${user.permissions.length} Modules` : 'Full Access'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-normal text-xs text-slate-800 dark:text-slate-200">{user.customerName || 'Cyberdyne Systems'}</div>
                        <div className="text-[10px] text-gray-500 font-mono font-normal">ID: {user.customerId || 'c-1'}</div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end items-center gap-0.5">
                          {isProtectedFromCurrentActor ? (
                            <span 
                              className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-medium text-[10px] flex items-center gap-1 cursor-not-allowed"
                              title="Protected: Only Platform Owner (Super Admin) can modify Super Admin accounts."
                            >
                              <Lock className="w-3 h-3" /> Protected
                            </span>
                          ) : (
                            <>
                              {/* Send / Compose Email Button */}
                              <button
                                onClick={() => openEmailComposer(user)}
                                className="relative p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                                title="Compose & Trigger Email (sender: techpivot25@gmail.com)"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                {user.communicationLogs && user.communicationLogs.length > 0 && (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[8px] font-bold flex items-center justify-center">
                                    {user.communicationLogs.length}
                                  </span>
                                )}
                              </button>

                              {/* View Communication History Logs */}
                              <button
                                onClick={() => openCommLogs(user)}
                                className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                                title="View Sent Email Communication History Logs"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              {/* Change Password Icon */}
                              <button
                                onClick={() => openPasswordModal(user)}
                                className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
                                title="Change / Update User Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              {/* Block / Unblock Icon */}
                              <button
                                onClick={() => setBlockModalUser(user)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  user.isBlocked
                                    ? 'hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'hover:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                }`}
                                title={user.isBlocked ? "Unblock User Account" : "Block User Account"}
                              >
                                {user.isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                              </button>

                              {/* Edit User Details */}
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-1.5 rounded-lg hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 transition-colors cursor-pointer"
                                title="Modify User & Permissions"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete User */}
                              <button
                                onClick={() => requestDeleteUser(user)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Right-Aligned Pagination */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
          {/* Left side: Selection badge & showing counts */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {selectedUserUuids.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-extrabold text-[11px]">
                {selectedUserUuids.length} Selected
              </span>
            )}
            <span className="text-gray-500 font-medium">
              Showing <span className="font-extrabold text-slate-800 dark:text-white">{filteredUsers.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-extrabold text-slate-800 dark:text-white">{Math.min(safeCurrentPage * itemsPerPage, filteredUsers.length)}</span> of{' '}
              <span className="font-extrabold text-slate-800 dark:text-white">{filteredUsers.length}</span> users
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-gray-400 text-[11px] font-semibold">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 text-xs rounded-lg border font-bold focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer ${
                  isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Right side: Pagination Controls Right-Aligned */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold transition-all flex items-center gap-1 ${
                safeCurrentPage === 1
                  ? 'opacity-40 cursor-not-allowed border-gray-300 dark:border-gray-800 text-gray-400'
                  : 'hover:bg-purple-800 hover:text-white border-slate-300 dark:border-gray-700 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                if (
                  totalPages <= 7 ||
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - safeCurrentPage) <= 1
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        pageNum === safeCurrentPage
                          ? 'bg-purple-800 text-white shadow-sm'
                          : 'hover:bg-slate-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  (pageNum === 2 && safeCurrentPage > 3) ||
                  (pageNum === totalPages - 1 && safeCurrentPage < totalPages - 2)
                ) {
                  return <span key={pageNum} className="px-1 text-gray-400 font-bold">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages || totalPages === 0}
              className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold transition-all flex items-center gap-1 ${
                safeCurrentPage === totalPages || totalPages === 0
                  ? 'opacity-40 cursor-not-allowed border-gray-300 dark:border-gray-800 text-gray-400'
                  : 'hover:bg-purple-800 hover:text-white border-slate-300 dark:border-gray-700 cursor-pointer'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`relative w-full max-w-4xl max-h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-purple-200">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight">
                    {editingUser ? 'Modify User Credentials & Roles' : 'Create New User Account'}
                  </h2>
                  <p className="text-[11px] text-purple-200 font-medium">
                    {isAdminUser ? 'Platform Administration User' : 'Customer Account User'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-purple-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scroll Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Form Section: User Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 border-b border-slate-200 dark:border-gray-800 pb-2">
                  User Identification & Contact
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="e.g. Sarah"
                      className={`w-full p-2.5 rounded-xl border font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="e.g. Connor"
                      className={`w-full p-2.5 rounded-xl border font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. sarah.connor@cyberdyne.io"
                      className={`w-full p-2.5 rounded-xl border font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2831"
                      className={`w-full p-2.5 rounded-xl border font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full p-2.5 rounded-xl border font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Job Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Senior DevOps Architect"
                      className={`w-full p-2.5 rounded-xl border font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Form Section: Role Hierarchy */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 border-b border-slate-200 dark:border-gray-800 pb-2">
                  Role Tier & Hierarchy Assignment
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Admin Level *</label>
                    <CustomSelect
                      value={adminType}
                      onChange={(val) => setAdminType(val as any)}
                      options={
                        currentUserRole === 'Admin'
                          ? [{ value: 'Sub Admin', label: 'Sub Admin (Restricted)' }]
                          : [
                              { value: 'Super Admin', label: 'Super Admin (Platform Owner)' },
                              { value: 'Admin', label: 'Admin' },
                              { value: 'Sub Admin', label: 'Sub Admin' }
                            ]
                      }
                      isDark={isDark}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Associated Customer</label>
                    <CustomSelect
                      value={customerId}
                      onChange={setCustomerId}
                      options={customers.map(c => ({ value: c.id, label: c.name }))}
                      isDark={isDark}
                    />
                  </div>
                </div>
              </div>

              {/* Form Section: Granular Module Permissions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-800 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Granular Module Permissions
                  </h3>

                  <label className="flex items-center gap-2 font-extrabold text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllRolesSelected}
                      onChange={e => handleSelectAllRoles(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                    />
                    <span>Select All Modules</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ROLE_MODULES.map(moduleName => {
                    const isSelected = selectedRoles.includes(moduleName);
                    const isExpanded = expandedRoles.includes(moduleName);
                    const sub = roleSubPerms[moduleName] || { read: false, create: false, edit: false, delete: false, export: false };

                    return (
                      <div 
                        key={moduleName} 
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isSelected 
                            ? 'border-purple-500/50 bg-purple-500/5 shadow-xs' 
                            : isDark ? 'border-[rgb(30, 41, 59)] bg-[#020617]' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="p-3 flex items-center justify-between">
                          <label className="flex items-center gap-2 font-extrabold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleModuleRole(moduleName)}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                            />
                            <span>{moduleName}</span>
                          </label>

                          <button
                            type="button"
                            onClick={(e) => handleToggleExpandRole(moduleName, e)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-800 text-gray-400 hover:text-purple-500 transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Collapsible Sub-Permissions */}
                        {isExpanded && (
                          <div className={`p-3 border-t text-[11px] grid grid-cols-2 gap-2 ${isDark ? 'border-[rgb(30, 41, 59)] bg-[#0f172a]' : 'border-slate-200 bg-white'}`}>
                            <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sub.read}
                                onChange={() => handleToggleSubPerm(moduleName, 'read')}
                                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                              />
                              <span>Read</span>
                            </label>
                            <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sub.create}
                                onChange={() => handleToggleSubPerm(moduleName, 'create')}
                                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                              />
                              <span>Create</span>
                            </label>
                            <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sub.edit}
                                onChange={() => handleToggleSubPerm(moduleName, 'edit')}
                                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                              />
                              <span>Edit</span>
                            </label>
                            <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sub.delete}
                                onChange={() => handleToggleSubPerm(moduleName, 'delete')}
                                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                              />
                              <span>Delete</span>
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <label className="block font-bold mb-1">Administrative Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional context or account setup notes..."
                  className={`w-full p-2.5 rounded-xl border font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-gray-900/80 px-6 py-3 border-t border-slate-200 dark:border-gray-800 flex justify-end gap-3 text-xs shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className={`px-5 py-2 rounded-xl border font-bold cursor-pointer ${isDark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}`}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-extrabold shadow-sm transition-all cursor-pointer"
              >
                {editingUser ? 'Save User Changes' : 'Create User'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* INTERACTIVE EMAIL COMPOSER MODAL */}
      {emailComposerUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-200 shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    Compose Email
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setEmailComposerUser(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-purple-200 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Form Body */}
            <form onSubmit={handleSendEmailSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[78vh]">
              
              {/* Sender & Recipient Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sender Email (From ID) */}
                <div>
                  <label className="block font-bold text-gray-400 mb-1 uppercase text-[10px] tracking-wider flex items-center justify-between">
                    <span>Sender ID (From) *</span>
                    <span className="text-[9px] text-emerald-500 font-extrabold uppercase">Configured</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={emailSender}
                    onChange={e => setEmailSender(e.target.value)}
                    placeholder="techpivot25@gmail.com"
                    className={`w-full p-2.5 rounded-xl border font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-emerald-400' : 'bg-slate-50 border-slate-200 text-purple-900'}`}
                  />
                </div>

                {/* Recipient Email */}
                <div>
                  <label className="block font-bold text-gray-400 mb-1 uppercase text-[10px] tracking-wider">
                    Recipient Email (To) *
                  </label>
                  <input
                    type="email"
                    required
                    value={emailRecipient}
                    onChange={e => setEmailRecipient(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <label className="block font-bold text-gray-400 mb-1 uppercase text-[10px] tracking-wider">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject line..."
                  className={`w-full p-2.5 rounded-xl border font-extrabold text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/40 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>

              {/* Word Style Formatting Toolbar & Editor */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-400 uppercase text-[10px] tracking-wider">
                  Message Body & Formatting
                </label>

                <div className={`rounded-xl border overflow-hidden shadow-xs ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-[#f8fafc] border-slate-300'}`}>
                  
                  {/* Toolbar Body */}
                  <div className="p-2 flex flex-wrap gap-1 items-center text-[11px] select-none bg-slate-100/80 dark:bg-gray-900/60 border-b border-slate-200 dark:border-gray-800">
                    
                    {/* CLIPBOARD */}
                    <button
                      type="button"
                      onClick={() => handleClipboardAction('paste')}
                      className="p-1.5 rounded border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
                      title="Paste (Ctrl+V)"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClipboardAction('cut')}
                      className="p-1.5 rounded border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
                      title="Cut"
                    >
                      <Scissors className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClipboardAction('copy')}
                      className="p-1.5 rounded border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                    </button>

                    <div className="h-5 w-px bg-slate-300 dark:bg-gray-700 mx-0.5 shrink-0" />

                    {/* FONT FAMILY & SIZE */}
                    <select
                      value={fontFamily}
                      onChange={e => setFontFamily(e.target.value)}
                      className={`h-7 px-1.5 text-[11px] font-semibold rounded border border-slate-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                        isDark ? 'bg-[#020617] text-white' : 'bg-white text-slate-800'
                      }`}
                      title="Font Family"
                    >
                      <option value="Calibri">Calibri</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Segoe UI">Segoe UI</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Trebuchet MS">Trebuchet MS</option>
                    </select>

                    <select
                      value={fontSize}
                      onChange={e => setFontSize(Number(e.target.value))}
                      className={`h-7 w-12 px-1 text-[11px] font-bold rounded border border-slate-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                        isDark ? 'bg-[#020617] text-white' : 'bg-white text-slate-800'
                      }`}
                      title="Font Size"
                    >
                      {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36].map(sz => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>

                    <div className="flex items-center border border-slate-300 dark:border-gray-700 rounded overflow-hidden bg-white dark:bg-gray-800">
                      <button
                        type="button"
                        onClick={() => setFontSize(s => Math.min(72, s + 1))}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
                        title="Increase Font Size"
                      >
                        <AArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontSize(s => Math.max(8, s - 1))}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
                        title="Decrease Font Size"
                      >
                        <AArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCaseMenu(!showCaseMenu)}
                        className="p-1 border border-slate-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-0.5 cursor-pointer"
                        title="Change Case (Aa)"
                      >
                        <CaseSensitive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                      {showCaseMenu && (
                        <div className="absolute top-full left-0 mt-1 z-30 w-36 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-xl p-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => { setTextCase('normal'); setShowCaseMenu(false); }}
                            className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-gray-700"
                          >
                            Sentence case
                          </button>
                          <button
                            type="button"
                            onClick={() => { setTextCase('lowercase'); setShowCaseMenu(false); }}
                            className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-gray-700"
                          >
                            lowercase
                          </button>
                          <button
                            type="button"
                            onClick={() => { setTextCase('uppercase'); setShowCaseMenu(false); }}
                            className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-gray-700"
                          >
                            UPPERCASE
                          </button>
                          <button
                            type="button"
                            onClick={() => { setTextCase('capitalize'); setShowCaseMenu(false); }}
                            className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-gray-700"
                          >
                            Capitalize Words
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleClearFormatting}
                      className="p-1 border border-slate-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-pink-100 dark:hover:bg-pink-950/40 text-pink-600 dark:text-pink-400 cursor-pointer"
                      title="Clear Formatting"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-5 w-px bg-slate-300 dark:bg-gray-700 mx-0.5 shrink-0" />

                    {/* TEXT STYLES & COLORS */}
                    <button
                      type="button"
                      onClick={() => setIsBold(!isBold)}
                      className={`p-1 rounded font-black border transition-all cursor-pointer ${
                        isBold ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsItalic(!isItalic)}
                      className={`p-1 rounded border transition-all cursor-pointer ${
                        isItalic ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsUnderline(!isUnderline)}
                      className={`p-1 rounded border transition-all cursor-pointer ${
                        isUnderline ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Underline (Ctrl+U)"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsStrikethrough(!isStrikethrough)}
                      className={`p-1 rounded border transition-all cursor-pointer ${
                        isStrikethrough ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => { setIsSubscript(!isSubscript); if (!isSubscript) setIsSuperscript(false); }}
                      className={`p-1 rounded border transition-all cursor-pointer ${
                        isSubscript ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Subscript (x₂)"
                    >
                      <Subscript className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => { setIsSuperscript(!isSuperscript); if (!isSuperscript) setIsSubscript(false); }}
                      className={`p-1 rounded border transition-all cursor-pointer ${
                        isSuperscript ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Superscript (x²)"
                    >
                      <Superscript className="w-3.5 h-3.5" />
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                        className="p-1 border border-slate-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-0.5 cursor-pointer"
                        title="Text Highlight Color"
                      >
                        <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                        <div className="w-2.5 h-1 rounded-xs" style={{ backgroundColor: highlightColor === 'transparent' ? '#f59e0b' : highlightColor }} />
                      </button>
                      {showHighlightPicker && (
                        <div className="absolute top-full left-0 mt-1 z-30 p-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-xl grid grid-cols-4 gap-1.5 w-32">
                          {['#fef08a', '#bbf7d0', '#a5f3fc', '#fbcfe8', '#fed7aa', '#f43f5e', '#a855f7', 'transparent'].map(col => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => { setHighlightColor(col); setShowHighlightPicker(false); }}
                              className="w-5 h-5 rounded-full border border-gray-300 shadow-xs hover:scale-110 cursor-pointer flex items-center justify-center text-[8px]"
                              style={{ backgroundColor: col === 'transparent' ? '#fff' : col }}
                            >
                              {col === 'transparent' && '✕'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowFontColorPicker(!showFontColorPicker)}
                        className="p-1 border border-slate-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-0.5 cursor-pointer"
                        title="Font Color"
                      >
                        <Baseline className="w-3.5 h-3.5 text-red-600" />
                        <div className="w-2.5 h-1 rounded-xs" style={{ backgroundColor: fontColor }} />
                      </button>
                      {showFontColorPicker && (
                        <div className="absolute top-full left-0 mt-1 z-30 p-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-xl grid grid-cols-5 gap-1.5 w-36">
                          {['#000000', '#dc2626', '#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0284c7', '#059669', '#475569', '#ffffff'].map(col => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => { setFontColor(col); setShowFontColorPicker(false); }}
                              className="w-5 h-5 rounded-full border border-gray-300 shadow-xs hover:scale-110 cursor-pointer"
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="h-5 w-px bg-slate-300 dark:bg-gray-700 mx-0.5 shrink-0" />

                    {/* PARAGRAPH, LISTS & ALIGNMENT */}
                    <button
                      type="button"
                      onClick={() => setListType(l => l === 'bullet' ? 'none' : 'bullet')}
                      className={`p-1 rounded border transition-all cursor-pointer ${
                        listType === 'bullet' ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Bulleted List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setListType(l => l === 'number' ? 'none' : 'number')}
                      className={`p-1 rounded border transition-all cursor-pointer ${
                        listType === 'number' ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Numbered List"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIndent(i => Math.max(0, i - 1))}
                      className="p-1 border border-slate-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
                      title="Decrease Indent"
                    >
                      <Outdent className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIndent(i => Math.min(4, i + 1))}
                      className="p-1 border border-slate-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
                      title="Increase Indent"
                    >
                      <Indent className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const lines = emailBody.split('\n').sort((a, b) => a.localeCompare(b));
                        setEmailBody(lines.join('\n'));
                        triggerToast('🔤 Lines sorted alphabetically.');
                      }}
                      className="p-1 border border-slate-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
                      title="Sort Alphabetically"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-5 w-px bg-slate-300 dark:bg-gray-700 mx-0.5 shrink-0" />

                    <button
                      type="button"
                      onClick={() => setTextAlign('left')}
                      className={`p-1 rounded border transition-all cursor-pointer ${
                        textAlign === 'left' ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setTextAlign('center')}
                      className={`p-1 rounded border transition-all cursor-pointer ${
                        textAlign === 'center' ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Center Align"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setTextAlign('right')}
                      className={`p-1 rounded border transition-all cursor-pointer ${
                        textAlign === 'right' ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setTextAlign('justify')}
                      className={`p-1 rounded border transition-all cursor-pointer ${
                        textAlign === 'justify' ? 'bg-purple-800 text-white border-purple-900 shadow-xs' : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                      title="Justify"
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowLineSpacingMenu(!showLineSpacingMenu)}
                        className="p-1 border border-slate-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-0.5 cursor-pointer"
                        title="Line Spacing"
                      >
                        <span className="text-[10px] font-bold">↕ {lineSpacing}</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                      {showLineSpacingMenu && (
                        <div className="absolute top-full right-0 mt-1 z-30 w-28 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-xl p-1 text-[11px]">
                          {['1.0', '1.15', '1.5', '2.0', '2.5', '3.0'].map(sp => (
                            <button
                              key={sp}
                              type="button"
                              onClick={() => { setLineSpacing(sp); setShowLineSpacingMenu(false); }}
                              className={`w-full text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-gray-700 ${lineSpacing === sp ? 'font-bold text-purple-600' : ''}`}
                            >
                              {sp} Spacing
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Textarea Input */}
                  <div className="relative">
                    <textarea
                      required
                      rows={8}
                      value={emailBody}
                      onChange={e => setEmailBody(e.target.value)}
                      style={{
                        fontFamily: fontFamily === 'Calibri' ? 'Calibri, "Segoe UI", sans-serif' : fontFamily,
                        fontSize: `${fontSize}pt`,
                        fontWeight: isBold ? 'bold' : 'normal',
                        fontStyle: isItalic ? 'italic' : 'normal',
                        textDecoration: [isUnderline && 'underline', isStrikethrough && 'line-through'].filter(Boolean).join(' ') || 'none',
                        color: fontColor,
                        backgroundColor: highlightColor !== 'transparent' ? highlightColor : shadingColor !== 'transparent' ? shadingColor : undefined,
                        textAlign: textAlign,
                        lineHeight: lineSpacing,
                        textTransform: textCase,
                        paddingLeft: `${indent * 20 + 12}px`,
                      }}
                      className={`w-full p-3 text-xs focus:outline-hidden transition-all ${
                        isDark ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-800'
                      }`}
                    />

                    {/* Word Status Bar */}
                    <div className="bg-slate-100 dark:bg-gray-800/80 px-3 py-1.5 border-t border-slate-200 dark:border-gray-700 flex items-center justify-between text-[10px] text-gray-500 font-medium">
                      <div className="flex items-center gap-3">
                        <span>Words: {emailBody.trim() ? emailBody.trim().split(/\s+/).length : 0}</span>
                        <span>Chars: {emailBody.length}</span>
                      </div>
                      <span className="font-semibold text-purple-700 dark:text-purple-400">Word Formatting Enabled</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex justify-end gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setEmailComposerUser(null)}
                  className={`px-4 py-2 rounded-xl border font-bold cursor-pointer ${isDark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-900 hover:to-indigo-950 text-white font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Email
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* COMMUNICATION HISTORY LOGS DRAWER / MODAL */}
      {commLogsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`relative w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-200 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    Communication Logs History
                  </h3>
                  <p className="text-[11px] text-blue-200 font-medium">
                    Target User: {commLogsUser.firstName} {commLogsUser.lastName} ({commLogsUser.email})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCommLogsUser(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Logs List Body */}
            <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              {(!commLogsUser.communicationLogs || commLogsUser.communicationLogs.length === 0) ? (
                <div className="py-12 text-center space-y-3">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto opacity-40" />
                  <p className="font-bold text-gray-400">No email communications dispatched to this user yet.</p>
                  <button
                    onClick={() => {
                      const u = commLogsUser;
                      setCommLogsUser(null);
                      openEmailComposer(u);
                    }}
                    className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white font-extrabold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Compose First Email
                  </button>
                </div>
              ) : (
                <div className="border rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b font-black uppercase text-[10px] tracking-wider ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                        <th className="p-3 w-8 text-center"></th>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Sender (From)</th>
                        <th className="p-3">Recipient (To)</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-gray-800 font-medium">
                      {commLogsUser.communicationLogs.map((log) => {
                        const isExpanded = expandedLogIds.includes(log.id);
                        return (
                          <React.Fragment key={log.id}>
                            <tr 
                              onClick={() => toggleExpandLog(log.id)}
                              className={`cursor-pointer transition-colors ${
                                isExpanded 
                                  ? (isDark ? 'bg-purple-950/20' : 'bg-purple-50/70') 
                                  : 'hover:bg-slate-50 dark:hover:bg-gray-800/50'
                              }`}
                            >
                              <td className="p-3 text-center text-purple-600 dark:text-purple-400">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </td>
                              <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                                {log.subject}
                              </td>
                              <td className="p-3 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                {log.senderEmail}
                              </td>
                              <td className="p-3 text-[11px] font-mono text-purple-600 dark:text-purple-400 whitespace-nowrap">
                                {log.recipientEmail}
                              </td>
                              <td className="p-3 text-[11px] font-mono text-gray-500 whitespace-nowrap">
                                <span className="font-bold text-slate-700 dark:text-gray-300">{log.timestamp}</span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className={isDark ? 'bg-[#0B0D11]' : 'bg-slate-50/90'}>
                                <td colSpan={5} className="p-4">
                                  <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200 shadow-xs'}`}>
                                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 dark:border-gray-800 pb-2 text-[11px]">
                                      <div className="flex items-center gap-4">
                                        <div><span className="text-gray-400 font-bold">Sender:</span> <span className="font-mono text-emerald-600 dark:text-emerald-400">{log.senderEmail}</span></div>
                                        <div><span className="text-gray-400 font-bold">Recipient:</span> <span className="font-mono text-purple-600 dark:text-purple-400">{log.recipientEmail}</span></div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-extrabold text-slate-800 dark:text-gray-200">{log.timestamp}</div>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Email Subject</span>
                                      <div className="font-black text-xs text-purple-900 dark:text-purple-300">{log.subject}</div>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Email Body Content</span>
                                      <div className={`p-3 rounded-xl border font-mono text-xs whitespace-pre-wrap leading-relaxed ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                                        {log.body}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="bg-slate-50 dark:bg-gray-900/80 px-6 py-3 border-t border-slate-200 dark:border-gray-800 flex justify-between items-center text-xs shrink-0">
              <span className="text-[11px] font-bold text-gray-400">
                Total Communications Sent: {commLogsUser.communicationLogs?.length || 0}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const u = commLogsUser;
                    setCommLogsUser(null);
                    openEmailComposer(u);
                  }}
                  className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Compose New Email
                </button>
                <button
                  type="button"
                  onClick={() => setCommLogsUser(null)}
                  className={`px-4 py-2 rounded-xl border font-bold cursor-pointer ${isDark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CHANGE / RESET PASSWORD MODAL */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-700 to-orange-800 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-100 shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    Change User Password
                  </h3>
                  <p className="text-[11px] text-amber-100/90 font-medium">
                    {passwordModalUser.firstName} {passwordModalUser.lastName} ({passwordModalUser.email})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPasswordModalUser(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-amber-100 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSavePasswordSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    New Password *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate Secure
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPasswordToggle ? 'text' : 'password'}
                    required
                    value={newPasswordVal}
                    onChange={e => setNewPasswordVal(e.target.value)}
                    className={`w-full p-2.5 pr-10 rounded-xl border font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordToggle(!showPasswordToggle)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPasswordToggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed font-medium">
                ⚠️ Updating the password will take effect immediately. Remember to inform the user or trigger a welcome/security email.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className={`px-4 py-2 rounded-xl border font-bold cursor-pointer ${isDark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* BLOCK / UNBLOCK USER MODAL */}
      {blockModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                blockModalUser.isBlocked ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
              }`}>
                {blockModalUser.isBlocked ? <UserCheck className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">
                  {blockModalUser.isBlocked ? 'Unblock User Account' : 'Block User Account'}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {blockModalUser.firstName} {blockModalUser.lastName} ({blockModalUser.email})
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-6 font-medium">
              {blockModalUser.isBlocked
                ? `Unblocking this account will restore login permissions and active module access for "${blockModalUser.firstName} ${blockModalUser.lastName}".`
                : `Blocking this account will immediately revoke access to the Admin Portal for "${blockModalUser.firstName} ${blockModalUser.lastName}".`}
            </p>

            <div className="flex justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setBlockModalUser(null)}
                className={`px-4 py-2 rounded-xl border cursor-pointer font-bold ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlockToggle}
                className={`px-5 py-2 text-white rounded-xl font-extrabold cursor-pointer transition-all shadow-sm ${
                  blockModalUser.isBlocked
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {blockModalUser.isBlocked ? 'Confirm Unblock' : 'Confirm Block User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP MODAL */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`relative w-full max-w-md rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <h3 className="text-base font-extrabold mb-2 text-rose-500 flex items-center gap-2">
              ⚠️ {confirmModal.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className={`px-4 py-2 rounded-xl border cursor-pointer font-bold ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-extrabold cursor-pointer transition-all"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
