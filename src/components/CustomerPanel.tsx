import React, { useState, useMemo, useRef } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Upload, 
  Download, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CreditCard, 
  FileText, 
  Calendar, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  ArrowLeft, 
  LogOut, 
  Lock, 
  RefreshCw, 
  FileSignature, 
  SlidersHorizontal, 
  BarChart3, 
  Eye, 
  EyeOff, 
  UserCog, 
  Check, 
  Copy,
  Laptop,
  Layers,
  FileSpreadsheet,
  Users,
  Shield,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Customer, Product, Contract, DocItem, AdminUser, License, AuditRecord, CustomerInvoice } from '../types';
import { CustomSelect } from './CustomSelect';

interface CustomerPanelProps {
  customer: Customer;
  products: Product[];
  contracts: Contract[];
  documents: DocItem[];
  users: AdminUser[];
  licenses: License[];
  onBackToAdmin: () => void;
  onUpdateCustomer: (updatedCustomer: Customer) => void;
  onAddSubUser: (user: AdminUser) => void;
  onEditSubUser: (user: AdminUser) => void;
  onDeleteSubUser: (uuid: string) => void;
  onAddContract: (contract: Contract) => void;
  onAddDoc: (doc: DocItem) => void;
  onEditDoc: (doc: DocItem) => void;
  onDeleteDoc: (id: string) => void;
  addAuditLog?: (action: string, details: string, screen: 'Users' | 'Customers' | 'Products' | 'General' | 'Licenses' | 'Support') => void;
  isDark: boolean;
}

const ALL_MODULE_PERMISSIONS = [
  'Dashboard & Metrics',
  'Profile Management',
  'User Management',
  'Products & Licensing',
  'Billing & Invoices',
  'Contracts & Legal',
  'Documents Repository',
  'Reports & Analytics'
];

export default function CustomerPanel({
  customer,
  products,
  contracts,
  documents,
  users,
  licenses,
  onBackToAdmin,
  onUpdateCustomer,
  onAddSubUser,
  onEditSubUser,
  onDeleteSubUser,
  onAddContract,
  onEditDoc,
  onAddDoc,
  onDeleteDoc,
  addAuditLog,
  isDark
}: CustomerPanelProps) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'profile' | 'organization' | 'products' | 'billing' | 'contracts' | 'documents' | 'reports'
  >('dashboard');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // ----------------------------------------------------
  // LOCAL INVOICES STATE FOR CUSTOMER
  // ----------------------------------------------------
  const [invoices, setInvoices] = useState<CustomerInvoice[]>(() => {
    return [
      {
        id: `inv-${customer.id}-1`,
        customerId: customer.id,
        customerName: customer.name,
        invoiceNumber: `INV-${customer.id.toUpperCase()}-2026-001`,
        issueDate: '2026-01-15',
        dueDate: '2026-02-15',
        paidDate: '2026-01-20',
        amount: 4500,
        paidAmount: 4500,
        status: 'Paid',
        description: 'Enterprise License Platform Base Fee - Q1',
        paymentMethod: 'Corporate ACH Wire',
        items: [{ name: 'Enterprise Core Platform', sku: 'ECP-100', units: 1, amount: 4500 }]
      },
      {
        id: `inv-${customer.id}-2`,
        customerId: customer.id,
        customerName: customer.name,
        invoiceNumber: `INV-${customer.id.toUpperCase()}-2026-002`,
        issueDate: '2026-04-15',
        dueDate: '2026-05-15',
        amount: 12500,
        paidAmount: 0,
        status: 'Pending',
        description: 'Software Subscriptions & SLA Add-ons',
        items: [{ name: 'Gold SLA Tier Extension', sku: 'SLA-GOLD', units: 1, amount: 12500 }]
      },
      {
        id: `inv-${customer.id}-3`,
        customerId: customer.id,
        customerName: customer.name,
        invoiceNumber: `INV-${customer.id.toUpperCase()}-2026-003`,
        issueDate: '2026-05-01',
        dueDate: '2026-06-01',
        amount: 3200,
        paidAmount: 0,
        status: 'Overdue',
        description: 'Annual Penetration & Security Compliance Audit',
        items: [{ name: 'Security Audit', sku: 'SEC-AUDIT', units: 1, amount: 3200 }]
      },
      {
        id: `inv-${customer.id}-4`,
        customerId: customer.id,
        customerName: customer.name,
        invoiceNumber: `INV-${customer.id.toUpperCase()}-2026-004`,
        issueDate: '2026-07-01',
        dueDate: '2026-08-01',
        amount: 1850,
        paidAmount: 0,
        status: 'Raised',
        description: 'Gemini AI API Compute Tokens - Q2',
        items: [{ name: 'AI Compute Tokens', sku: 'AI-TOKENS', units: 100, amount: 1850 }]
      }
    ];
  });

  // Invoice Filters & Modals
  const [invoiceFilter, setInvoiceFilter] = useState<'All' | 'Raised' | 'Pending' | 'Paid' | 'Overdue'>('All');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [payingInvoice, setPayingInvoice] = useState<CustomerInvoice | null>(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState('Credit Card (Stripe)');
  const [receiptInvoice, setReceiptInvoice] = useState<CustomerInvoice | null>(null);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  // Form states for raising invoice
  const [newInvNum, setNewInvNum] = useState('');
  const [newInvAmt, setNewInvAmt] = useState(2500);
  const [newInvDue, setNewInvDue] = useState('');
  const [newInvDesc, setNewInvDesc] = useState('');
  const [newInvStatus, setNewInvStatus] = useState<'Raised' | 'Pending' | 'Paid' | 'Overdue'>('Pending');

  // ----------------------------------------------------
  // PROFILE & ACCOUNT MANAGEMENT FORM STATE
  // ----------------------------------------------------
  const [companyName, setCompanyName] = useState(customer.name);
  const [companyAddress, setCompanyAddress] = useState(customer.address);
  const [registeredMobile, setRegisteredMobile] = useState(customer.registeredMobile || customer.primaryContactPhone || '');
  const [primaryContactName, setPrimaryContactName] = useState(customer.primaryContactName);
  const [primaryContactPhone, setPrimaryContactPhone] = useState(customer.primaryContactPhone);
  const [primaryContactEmail, setPrimaryContactEmail] = useState(customer.primaryContactEmail);
  const [billingContactName, setBillingContactName] = useState(customer.billingContactName);
  const [billingContactPhone, setBillingContactPhone] = useState(customer.billingContactPhone);
  const [billingContactEmail, setBillingContactEmail] = useState(customer.billingContactEmail);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(customer.logoUrl || '');
  const [supportTier, setSupportTier] = useState(customer.supportTier);
  const [notes, setNotes] = useState(customer.notes);

  // Logo file ref
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('Logo file size exceeds 5MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setCompanyLogoUrl(dataUrl);
          showToast('Company logo updated successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Customer = {
      ...customer,
      name: companyName,
      address: companyAddress,
      registeredMobile,
      primaryContactName,
      primaryContactPhone,
      primaryContactEmail,
      billingContactName,
      billingContactPhone,
      billingContactEmail,
      logoUrl: companyLogoUrl,
      supportTier,
      notes,
      lastModified: new Date().toISOString().split('T')[0],
      lastModifiedBy: 'Impersonated Admin'
    };
    onUpdateCustomer(updated);
    addAuditLog?.('Update Customer Profile', `Updated self-service profile and contact details for ${companyName}`, 'Customers');
    showToast('Profile & Contact details updated successfully!');
  };

  // ----------------------------------------------------
  // PASSWORD RESET MODULE STATE
  // ----------------------------------------------------
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: 'None', color: 'bg-slate-300' };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (newPassword.length >= 12) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 65, label: 'Medium', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  }, [newPassword]);

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      showToast('Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long');
      return;
    }

    addAuditLog?.('Reset Customer Password', `Reset master customer security password for ${customer.name} (${customer.primaryContactEmail})`, 'Customers');
    showToast(`Password successfully reset for customer primary account (${customer.primaryContactEmail})`);
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordResetModalOpen(false);
  };

  // ----------------------------------------------------
  // SUB-USER MANAGEMENT STATE
  // ----------------------------------------------------
  const customerSubUsers = useMemo(() => {
    return users.filter(u => u.customerId === customer.id || u.customerName === customer.name);
  }, [users, customer.id, customer.name]);

  const [isSubUserModalOpen, setIsSubUserModalOpen] = useState(false);
  const [editingSubUser, setEditingSubUser] = useState<AdminUser | null>(null);

  const [subFirstName, setSubFirstName] = useState('');
  const [subLastName, setSubLastName] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [subRole, setSubRole] = useState('Standard Member');
  const [subPermissions, setSubPermissions] = useState<string[]>(['Dashboard & Metrics', 'Products & Licensing']);
  const [subPassword, setSubPassword] = useState('');

  const openAddSubUserModal = () => {
    setEditingSubUser(null);
    setSubFirstName('');
    setSubLastName('');
    setSubTitle('Organization Member');
    setSubEmail(`user-${Date.now().toString().slice(-4)}@${customer.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);
    setSubPhone(customer.primaryContactPhone || '+1 (555) 012-3456');
    setSubRole('Standard Member');
    setSubPermissions(['Dashboard & Metrics', 'Products & Licensing', 'Documents Repository']);
    setSubPassword('TempPass123!');
    setIsSubUserModalOpen(true);
  };

  const openEditSubUserModal = (u: AdminUser) => {
    setEditingSubUser(u);
    setSubFirstName(u.firstName);
    setSubLastName(u.lastName);
    setSubTitle(u.title);
    setSubEmail(u.email);
    setSubPhone(u.phone);
    setSubRole(u.adminRole || 'Standard Member');
    setSubPermissions(u.permissions && u.permissions.length > 0 ? u.permissions : ['Dashboard & Metrics']);
    setSubPassword(u.password || '');
    setIsSubUserModalOpen(true);
  };

  const handleSubUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userPayload: AdminUser = {
      uuid: editingSubUser ? editingSubUser.uuid : `usr-${Date.now()}`,
      firstName: subFirstName,
      lastName: subLastName,
      title: subTitle,
      email: subEmail,
      phone: subPhone,
      customerId: customer.id,
      customerName: customer.name,
      customerTierId: customer.id,
      customerTier: customer.supportTier,
      notes: `Managed via Customer Panel for ${customer.name}`,
      createDate: editingSubUser ? editingSubUser.createDate : new Date().toISOString().split('T')[0],
      createdBy: 'Customer Panel',
      lastModified: new Date().toISOString().split('T')[0],
      lastModifiedBy: 'Impersonated Admin',
      isAdminUser: false,
      adminRole: subRole,
      permissions: subPermissions,
      password: subPassword || 'Secret123!',
      isBlocked: editingSubUser ? editingSubUser.isBlocked : false
    };

    if (editingSubUser) {
      onEditSubUser(userPayload);
      showToast(`Updated sub-user ${subFirstName} ${subLastName}`);
    } else {
      onAddSubUser(userPayload);
      showToast(`Added new sub-user ${subFirstName} ${subLastName} to ${customer.name}`);
    }
    setIsSubUserModalOpen(false);
  };

  const togglePermission = (perm: string) => {
    setSubPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  // ----------------------------------------------------
  // PRODUCTS & CONTRACTS DATA FOR THIS CUSTOMER
  // ----------------------------------------------------
  const customerContracts = useMemo(() => {
    return contracts.filter(c => c.customerId === customer.id);
  }, [contracts, customer.id]);

  const customerProducts = useMemo(() => {
    // Products directly associated or in contracts
    const skusFromContracts = new Set(customerContracts.map(c => c.productSku));
    return products.filter(p => p.customerIds.includes(customer.id) || skusFromContracts.has(p.sku));
  }, [products, customer.id, customerContracts]);

  const totalTCV = useMemo(() => {
    return customerContracts.reduce((sum, c) => sum + (c.unitPrice * c.purchasedUnits * (c.termMonths / 12)), 0);
  }, [customerContracts]);

  // ----------------------------------------------------
  // DOCUMENTS DATA FOR THIS CUSTOMER
  // ----------------------------------------------------
  const customerDocuments = useMemo(() => {
    return documents.filter(d => d.targetCustomerIds?.includes(customer.id) || d.targetCustomerIds?.includes('all'));
  }, [documents, customer.id]);

  const docInputRef = useRef<HTMLInputElement>(null);
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc: DocItem = {
        id: `doc-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        category: 'Support Documentation',
        associatedProducts: customerProducts.map(p => p.sku),
        isPublished: true,
        notes: `Uploaded via Customer Panel for ${customer.name}`,
        uploadDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        targetCustomerIds: [customer.id]
      };
      onAddDoc(newDoc);
      showToast(`Uploaded document "${newDoc.title}"`);
    }
  };

  // ----------------------------------------------------
  // REPORTING & CSV EXPORT FUNCTIONS
  // ----------------------------------------------------
  const [reportDateRange, setReportDateRange] = useState<'30' | '90' | 'ytd' | 'all'>('30');

  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded CSV: ${filename}`);
  };

  const exportFullAccountCSV = () => {
    const headers = ['Customer ID', 'Company Name', 'Primary Contact', 'Primary Email', 'Registered Mobile', 'Support Tier', 'Status', 'Active Contracts', 'Sub-Users Count', 'Invoices Count'];
    const rows = [[
      customer.id,
      customer.name,
      customer.primaryContactName,
      customer.primaryContactEmail,
      registeredMobile,
      customer.supportTier,
      customer.status || 'Active',
      customerContracts.length,
      customerSubUsers.length,
      invoices.length
    ]];
    downloadCSV(`${customer.name.toLowerCase().replace(/\s+/g, '_')}_account_overview.csv`, headers, rows);
  };

  const exportLicensesCSV = () => {
    const headers = ['Contract ID', 'Contract Name', 'Product SKU', 'Product Name', 'Purchased Units', 'Active Units', 'Unit Price ($)', 'Start Date', 'End Date', 'Term (Months)'];
    const rows = customerContracts.map(c => [
      c.id,
      c.name,
      c.productSku,
      c.productName,
      c.purchasedUnits,
      c.activeUnits,
      c.unitPrice,
      c.startDate,
      c.endDate,
      c.termMonths
    ]);
    downloadCSV(`${customer.name.toLowerCase().replace(/\s+/g, '_')}_licenses_contracts.csv`, headers, rows);
  };

  const exportFinancialsCSV = () => {
    const headers = ['Invoice Number', 'Issue Date', 'Due Date', 'Description', 'Total Amount ($)', 'Paid Amount ($)', 'Status'];
    const rows = invoices.map(inv => [
      inv.invoiceNumber,
      inv.issueDate,
      inv.dueDate,
      inv.description,
      inv.amount,
      inv.paidAmount,
      inv.status
    ]);
    downloadCSV(`${customer.name.toLowerCase().replace(/\s+/g, '_')}_financial_statement.csv`, headers, rows);
  };

  const exportSubUsersCSV = () => {
    const headers = ['UUID', 'First Name', 'Last Name', 'Title', 'Email', 'Phone', 'Role', 'Permissions', 'Blocked'];
    const rows = customerSubUsers.map(u => [
      u.uuid,
      u.firstName,
      u.lastName,
      u.title,
      u.email,
      u.phone,
      u.adminRole || 'Member',
      (u.permissions || []).join('; '),
      u.isBlocked ? 'Yes' : 'No'
    ]);
    downloadCSV(`${customer.name.toLowerCase().replace(/\s+/g, '_')}_sub_users.csv`, headers, rows);
  };

  // Card theme style variables
  const cardBg = isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-2xs';
  const subCardBg = isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200';
  const inputBg = isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white focus:border-purple-600' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-purple-600';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-950 dark:bg-slate-900 border border-purple-600/50 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* IMPERSONATION BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl border border-indigo-500/30 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <UserCog className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Admin Impersonation View
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                Tenant ID: {customer.tenant_id || `tnnt_${customer.id}`}
              </span>
              <span className="text-xs text-indigo-300 font-mono px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-700/40">
                URL: https://{customer.subdomain || `${customer.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")}.techpivot.in`}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight mt-0.5">
              Managing Portal as: <span className="text-indigo-200 underline underline-offset-4">{customer.name}</span>
            </h2>
          </div>
        </div>

        <button
          onClick={onBackToAdmin}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-600/20 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Customer Panel</span>
        </button>
      </div>

      {/* CUSTOMER HEADER INFO BAR */}
      <div className={`p-6 rounded-2xl border ${cardBg}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative group shrink-0">
              {companyLogoUrl ? (
                <img 
                  src={companyLogoUrl} 
                  alt={customer.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-600/40 shadow-md" 
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 text-white flex items-center justify-center font-black text-2xl shadow-md">
                  {customer.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold"
                title="Change Company Logo"
              >
                Upload Logo
              </button>
              <input 
                type="file" 
                ref={logoInputRef} 
                onChange={handleLogoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-black">{customer.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  customer.status === 'Blocked' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'
                }`}>
                  {customer.status === 'Blocked' ? 'Account Blocked' : 'Active Partner'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  customer.supportTier === 'Gold Support Model' ? 'bg-amber-500/20 text-amber-500' : 'bg-purple-600/20 text-purple-600'
                }`}>
                  {customer.supportTier}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>{customer.primaryContactEmail}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  <span>{registeredMobile || customer.primaryContactPhone}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{customer.address}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isDark ? 'border-gray-800 bg-[#020617] hover:bg-gray-800 text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Edit3 className="w-4 h-4 text-purple-600" />
              <span>Edit Account</span>
            </button>

            <button
              onClick={() => setIsPasswordResetModalOpen(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Key className="w-4 h-4" />
              <span>Reset Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 border-b dark:border-gray-800 border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'profile', label: 'Profile & Account', icon: User },
          { id: 'organization', label: 'Organization & Users', icon: Users },
          { id: 'products', label: 'Products & Services', icon: Laptop },
          { id: 'billing', label: 'Billing & Financials', icon: CreditCard },
          { id: 'contracts', label: 'Contracts & Legal', icon: FileSignature },
          { id: 'documents', label: 'Document Repository', icon: FileText },
          { id: 'reports', label: 'Reporting & Analytics', icon: FileSpreadsheet },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                  : isDark
                  ? 'bg-[#0f172a]/60 border-transparent text-gray-400 hover:text-white hover:bg-[#0f172a]'
                  : 'bg-white/60 border-transparent text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT MODULES */}

      {/* 1. DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* METRICS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${cardBg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">Assigned Products</span>
                <div className="p-2 rounded-lg bg-purple-600/10 text-purple-600">
                  <Laptop className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black">{customerProducts.length}</p>
              <span className="text-[11px] text-gray-400 mt-1 block">{customerContracts.length} active contract lines</span>
            </div>

            <div className={`p-5 rounded-2xl border ${cardBg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">Total Contract Value</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-500">${totalTCV.toLocaleString()}</p>
              <span className="text-[11px] text-gray-400 mt-1 block">Contract portfolio value</span>
            </div>

            <div className={`p-5 rounded-2xl border ${cardBg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">Organization Users</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black">{customerSubUsers.length}</p>
              <span className="text-[11px] text-gray-400 mt-1 block">Internal sub-accounts</span>
            </div>

            <div className={`p-5 rounded-2xl border ${cardBg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">Open Invoices</span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-500">
                ${invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-gray-400 mt-1 block">
                {invoices.filter(i => i.status !== 'Paid').length} unpaid invoice(s)
              </span>
            </div>
          </div>

          {/* DASHBOARD DETAILS & QUICK SHORTCUTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border lg:col-span-2 space-y-4 ${cardBg}`}>
              <h3 className="text-sm font-black flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Account Status & Operational Health</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium pt-2">
                <div className={`p-4 rounded-xl border ${subCardBg} space-y-1`}>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">SLA Support Program</span>
                  <div className="text-sm font-extrabold text-purple-600">{customer.supportTier}</div>
                  <p className="text-[11px] text-gray-400 mt-1">Direct support liaison contact: {customer.supportContactName || 'System Dedicated Desk'}</p>
                </div>

                <div className={`p-4 rounded-xl border ${subCardBg} space-y-1`}>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Federated SSO Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${customer.ssoEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="font-bold text-xs">{customer.ssoEnabled ? `SSO Active (${customer.ssoProvider || 'IDP'})` : 'SSO Disabled'}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Corporate domain: {customer.ssoDomain || 'Not configured'}</p>
                </div>
              </div>

              {/* RECENT REPOSITORIES / ACTIVITY */}
              <div className="pt-4 border-t dark:border-gray-800 border-slate-100">
                <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-3">Recent Customer Activity</h4>
                <div className="space-y-2.5 text-xs">
                  <div className={`p-3 rounded-xl border ${subCardBg} flex items-center justify-between`}>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <div>
                        <div className="font-bold">Customer Self-Service Panel Accessed</div>
                        <div className="text-[10px] text-gray-400">Admin impersonation session initialized</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">Just now</span>
                  </div>

                  {customerSubUsers.length > 0 && (
                    <div className={`p-3 rounded-xl border ${subCardBg} flex items-center justify-between`}>
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <div>
                          <div className="font-bold">Organization Sub-User Directory Active</div>
                          <div className="text-[10px] text-gray-400">{customerSubUsers.length} sub-users provisioned</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS PANEL */}
            <div className={`p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <h3 className="text-sm font-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Self-Service Actions</span>
              </h3>

              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isDark ? 'hover:bg-gray-800 border-gray-800' : 'hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-purple-600" />
                    <span>Update Contact & Logo</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => { setActiveTab('organization'); openAddSubUserModal(); }}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isDark ? 'hover:bg-gray-800 border-gray-800' : 'hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4 text-indigo-500" />
                    <span>Invite Organization Sub-User</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => setActiveTab('billing')}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isDark ? 'hover:bg-gray-800 border-gray-800' : 'hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>View Statements & Invoices</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={exportFullAccountCSV}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isDark ? 'hover:bg-gray-800 border-gray-800' : 'hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-amber-500" />
                    <span>Export Full Account CSV</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFILE & ACCOUNT MANAGEMENT */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                <span>Customer Profile & Account Details</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Update primary organizational contacts, company logo, registered mobile number, and address information.
              </p>
            </div>

            {/* COMPANY LOGO SECTION */}
            <div className={`p-5 rounded-xl border ${subCardBg} space-y-3`}>
              <label className="text-xs font-extrabold uppercase text-gray-400 tracking-wider block">Company Logo</label>
              <div className="flex items-center gap-5 flex-wrap">
                {companyLogoUrl ? (
                  <img src={companyLogoUrl} alt="Logo" className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-600" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-3xl">
                    {companyName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload New Logo</span>
                    </button>

                    {companyLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setCompanyLogoUrl('')}
                        className="px-3 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400">Supported formats: PNG, JPG, SVG, WEBP (Max 5MB)</p>
                </div>
              </div>
            </div>

            {/* GENERAL COMPANY INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-xl border outline-hidden ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Registered Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={registeredMobile}
                  onChange={(e) => setRegisteredMobile(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className={`w-full p-2.5 text-xs rounded-xl border outline-hidden ${inputBg}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Headquarters Address</label>
              <input
                type="text"
                required
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className={`w-full p-2.5 text-xs rounded-xl border outline-hidden ${inputBg}`}
              />
            </div>

            {/* CONTACTS MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-gray-800 border-slate-100">
              {/* PRIMARY CONTACT */}
              <div className={`p-4 rounded-xl border ${subCardBg} space-y-3`}>
                <h4 className="text-xs font-extrabold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Primary Contact</span>
                </h4>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                    className={`w-full p-2 text-xs rounded-lg border outline-hidden ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={primaryContactEmail}
                    onChange={(e) => setPrimaryContactEmail(e.target.value)}
                    className={`w-full p-2 text-xs rounded-lg border outline-hidden ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={primaryContactPhone}
                    onChange={(e) => setPrimaryContactPhone(e.target.value)}
                    className={`w-full p-2 text-xs rounded-lg border outline-hidden ${inputBg}`}
                  />
                </div>
              </div>

              {/* BILLING CONTACT */}
              <div className={`p-4 rounded-xl border ${subCardBg} space-y-3`}>
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Billing & Invoicing</span>
                </h4>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Billing Contact Name</label>
                  <input
                    type="text"
                    required
                    value={billingContactName}
                    onChange={(e) => setBillingContactName(e.target.value)}
                    className={`w-full p-2 text-xs rounded-lg border outline-hidden ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Billing Contact Email</label>
                  <input
                    type="email"
                    required
                    value={billingContactEmail}
                    onChange={(e) => setBillingContactEmail(e.target.value)}
                    className={`w-full p-2 text-xs rounded-lg border outline-hidden ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Billing Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={billingContactPhone}
                    onChange={(e) => setBillingContactPhone(e.target.value)}
                    className={`w-full p-2 text-xs rounded-lg border outline-hidden ${inputBg}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3. ORGANIZATION & USER MANAGEMENT (ROLE-BASED ACCESS) */}
      {activeTab === 'organization' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  <span>Organization & Sub-User Directory</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Manage sub-users and customize granular role-based module access permissions for {customer.name}.
                </p>
              </div>

              <button
                onClick={openAddSubUserModal}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Sub-User</span>
              </button>
            </div>

            {/* SUB-USERS TABLE */}
            <div className="overflow-x-auto rounded-xl border dark:border-gray-800 border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] uppercase font-mono font-bold ${isDark ? 'bg-[#020617] border-gray-800 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <th className="px-4 py-3">User Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Email & Phone</th>
                    <th className="px-4 py-3">Module Permissions</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                  {customerSubUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic text-xs">
                        No sub-users created yet for this customer organization. Click "Add Sub-User" to invite internal staff.
                      </td>
                    </tr>
                  ) : (
                    customerSubUsers.map((usr) => (
                      <tr key={usr.uuid} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-extrabold text-slate-900 dark:text-white">{usr.firstName} {usr.lastName}</div>
                          <span className="text-[10px] text-gray-400">{usr.title || 'Member'}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            {usr.adminRole || 'Standard Member'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px]">
                          <div>{usr.email}</div>
                          <div className="text-[10px] text-gray-400">{usr.phone}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(usr.permissions || ['Dashboard & Metrics']).map((p, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[9px] font-semibold">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${usr.isBlocked ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'}`}>
                            {usr.isBlocked ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditSubUserModal(usr)}
                              className="p-1.5 rounded-lg hover:bg-purple-600/10 text-purple-600 cursor-pointer"
                              title="Edit User & Permissions"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                onEditSubUser({ ...usr, isBlocked: !usr.isBlocked });
                                showToast(`User ${usr.firstName} ${usr.isBlocked ? 'reactivated' : 'suspended'}`);
                              }}
                              className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-500 cursor-pointer"
                              title={usr.isBlocked ? 'Reactivate' : 'Suspend'}
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete user ${usr.firstName} ${usr.lastName}?`)) {
                                  onDeleteSubUser(usr.uuid);
                                  showToast(`Deleted sub-user ${usr.firstName}`);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                              title="Delete Sub-User"
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
        </div>
      )}

      {/* 4. PRODUCTS & SERVICES */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <Laptop className="w-5 h-5 text-purple-600" />
                <span>Assigned Products & Active Software Subscriptions</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                View all software products, licenses, and support SLAs provisioned for {customer.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerProducts.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-gray-400 italic text-xs border border-dashed rounded-xl">
                  No products currently assigned to this customer account.
                </div>
              ) : (
                customerProducts.map((p) => {
                  const matchingContract = customerContracts.find(c => c.productSku === p.sku);
                  return (
                    <div key={p.id} className={`p-5 rounded-xl border space-y-3 ${subCardBg}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-purple-600 font-bold uppercase">{p.sku}</span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">{p.name}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-600/10 text-purple-600 border border-purple-600/20">
                          {p.tierName || 'Enterprise'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{p.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t dark:border-gray-800 border-slate-200">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Purchased Units</span>
                          <span className="font-bold">{matchingContract ? matchingContract.purchasedUnits : 10} Units</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Unit Price</span>
                          <span className="font-bold font-mono">${p.unitPrice} / mo</span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          onClick={() => showToast(`License Key for ${p.sku}: LIC-${customer.id.toUpperCase()}-${p.sku}-ACTIVE`)}
                          className="px-3 py-1.5 bg-purple-600/10 text-purple-600 hover:bg-purple-600/20 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          View License Key
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. BILLING & FINANCIALS */}
      {activeTab === 'billing' && (() => {
        const totalRaised = invoices.reduce((acc, i) => acc + i.amount, 0);
        const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
        const totalPending = invoices.filter(i => i.status === 'Pending' || i.status === 'Raised').reduce((acc, i) => acc + i.amount, 0);
        const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((acc, i) => acc + i.amount, 0);

        const filteredInvoices = invoices.filter(inv => {
          const matchesStatus = invoiceFilter === 'All' || inv.status === invoiceFilter;
          const matchesSearch = inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                                inv.description.toLowerCase().includes(invoiceSearch.toLowerCase());
          return matchesStatus && matchesSearch;
        });

        return (
          <div className="space-y-6">
            {/* KPI METRIC CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Total Invoices Raised</span>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black font-mono text-blue-500">${totalRaised.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-gray-400">{invoices.length} Invoices</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Pending Payment</span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black font-mono text-amber-500">${totalPending.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-amber-500">{invoices.filter(i => i.status === 'Pending' || i.status === 'Raised').length} Pending</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Paid Invoices</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black font-mono text-emerald-500">${totalPaid.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-emerald-500">{invoices.filter(i => i.status === 'Paid').length} Paid</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Overdue Invoices</span>
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black font-mono text-rose-500">${totalOverdue.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-rose-500">{invoices.filter(i => i.status === 'Overdue').length} Overdue</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-black flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    <span>Invoices & Financial Ledger</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage active customer invoices, view payment statuses (Raised, Pending, Paid, Overdue), and make direct payments.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRaiseModalOpen(true)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Raise Invoice</span>
                  </button>

                  <button
                    onClick={exportFinancialsCSV}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* FILTER & SEARCH TOOLBAR */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {(['All', 'Raised', 'Pending', 'Paid', 'Overdue'] as const).map(status => {
                    const count = status === 'All' ? invoices.length : invoices.filter(i => i.status === status).length;
                    const isActive = invoiceFilter === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setInvoiceFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-xs'
                            : isDark
                              ? 'bg-[#020617] text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        <span>{status}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-500/15 text-gray-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    placeholder="Search invoice # or description..."
                    className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border outline-hidden ${
                      isDark ? 'bg-[#020617] border-gray-800 text-white placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* INVOICES TABLE */}
              <div className="overflow-x-auto rounded-xl border dark:border-gray-800 border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b text-[10px] uppercase font-mono font-bold ${isDark ? 'bg-[#020617] border-gray-800 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Issue Date</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Payment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-xs italic">
                          No invoices found matching the selected filter query.
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-purple-600">
                            <button
                              onClick={() => setReceiptInvoice(inv)}
                              className="hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <span>{inv.invoiceNumber}</span>
                              <Eye className="w-3 h-3 opacity-60" />
                            </button>
                          </td>
                          <td className="px-4 py-3.5 font-medium max-w-xs truncate">{inv.description}</td>
                          <td className="px-4 py-3.5 text-gray-400 font-mono">{inv.issueDate}</td>
                          <td className="px-4 py-3.5 text-gray-400 font-mono">{inv.dueDate}</td>
                          <td className="px-4 py-3.5 font-bold font-mono text-emerald-500">${inv.amount.toLocaleString()}</td>
                          <td className="px-4 py-3.5">
                            {inv.status === 'Paid' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 inline-flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Paid</span>
                              </span>
                            )}
                            {inv.status === 'Pending' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/20 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Pending Payment</span>
                              </span>
                            )}
                            {inv.status === 'Raised' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 inline-flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span>Raised</span>
                              </span>
                            )}
                            {inv.status === 'Overdue' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-500 border border-rose-500/20 inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />
                                <span>Overdue</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {inv.status !== 'Paid' ? (
                                <button
                                  onClick={() => setPayingInvoice(inv)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg cursor-pointer flex items-center gap-1 shadow-xs transition-all hover:scale-105"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  <span>Pay Invoice</span>
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-500/80 font-mono">
                                  Paid {inv.paidDate || 'Recently'}
                                </span>
                              )}

                              <button
                                onClick={() => setReceiptInvoice(inv)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 cursor-pointer"
                                title="View Receipt"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => downloadCSV(`${inv.invoiceNumber}.csv`, ['Invoice Number', 'Amount', 'Status', 'DueDate'], [[inv.invoiceNumber, inv.amount, inv.status, inv.dueDate]])}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 cursor-pointer"
                                title="Download Invoice CSV"
                              >
                                <Download className="w-3.5 h-3.5 text-purple-600" />
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
          </div>
        );
      })()}

      {/* 6. CONTRACTS & LEGAL */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-amber-500" />
                <span>Contracts & Legal Agreements</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Active service level agreements, master contracts, and term commitments.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border dark:border-gray-800 border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] uppercase font-mono font-bold ${isDark ? 'bg-[#020617] border-gray-800 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <th className="px-4 py-3">Contract Name</th>
                    <th className="px-4 py-3">Product SKU</th>
                    <th className="px-4 py-3">Units</th>
                    <th className="px-4 py-3">Term</th>
                    <th className="px-4 py-3">TCV</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                  {customerContracts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic text-xs">
                        No active contracts found for this customer.
                      </td>
                    </tr>
                  ) : (
                    customerContracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{c.name}</td>
                        <td className="px-4 py-3.5 font-mono text-purple-600">{c.productSku}</td>
                        <td className="px-4 py-3.5 font-medium">{c.purchasedUnits} Units</td>
                        <td className="px-4 py-3.5 text-gray-400 font-mono">{c.startDate} to {c.endDate} ({c.termMonths}m)</td>
                        <td className="px-4 py-3.5 font-bold font-mono text-emerald-500">${(c.unitPrice * c.purchasedUnits * (c.termMonths / 12)).toLocaleString()}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-500">
                            Active Contract
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. DOCUMENT MANAGEMENT */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Customer Document Repository</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Upload, inspect, and manage agreements, audit compliance records, and software release specs.
                </p>
              </div>

              <div>
                <input 
                  type="file" 
                  ref={docInputRef} 
                  onChange={handleDocUpload} 
                  className="hidden" 
                />
                <button
                  onClick={() => docInputRef.current?.click()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {customerDocuments.length === 0 ? (
                <div className="p-8 text-center text-gray-400 italic text-xs border border-dashed rounded-xl">
                  No documents in repository for this customer. Use "Upload Document" to add files.
                </div>
              ) : (
                customerDocuments.map((doc) => (
                  <div key={doc.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${subCardBg}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-purple-600/10 text-purple-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                          <span>•</span>
                          <span>{doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const text = `Document Title: ${doc.title}\nCategory: ${doc.category}\nCustomer: ${customer.name}\nUpload Date: ${doc.uploadDate}`;
                          const blob = new Blob([text], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${doc.title}.txt`;
                          a.click();
                          showToast(`Downloaded ${doc.title}`);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteDoc(doc.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. REPORTING & ANALYTICS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                  <span>Custom Reporting & CSV Exports</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Generate account analytics and download complete records in standard CSV format.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <CustomSelect
                  value={reportDateRange}
                  onChange={(val) => setReportDateRange(val as any)}
                  options={[
                    { value: "30", label: "Last 30 Days" },
                    { value: "90", label: "Last 90 Days" },
                    { value: "ytd", label: "Year-to-Date" },
                    { value: "all", label: "All Time" }
                  ]}
                  isDark={isDark}
                />
              </div>
            </div>

            {/* MANDATORY CSV EXPORT BUTTONS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <button
                onClick={exportFullAccountCSV}
                className="p-4 rounded-xl border border-purple-600/30 bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 flex flex-col items-start gap-2 text-left cursor-pointer transition-all"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-extrabold">Account Summary CSV</span>
                <span className="text-[10px] opacity-80">Export tenant profile metadata</span>
              </button>

              <button
                onClick={exportLicensesCSV}
                className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 flex flex-col items-start gap-2 text-left cursor-pointer transition-all"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-extrabold">Licenses & Usage CSV</span>
                <span className="text-[10px] opacity-80">Export active contracts & units</span>
              </button>

              <button
                onClick={exportFinancialsCSV}
                className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex flex-col items-start gap-2 text-left cursor-pointer transition-all"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-extrabold">Financial Statement CSV</span>
                <span className="text-[10px] opacity-80">Export invoice & spend ledger</span>
              </button>

              <button
                onClick={exportSubUsersCSV}
                className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 flex flex-col items-start gap-2 text-left cursor-pointer transition-all"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-extrabold">Sub-Users List CSV</span>
                <span className="text-[10px] opacity-80">Export team directory & roles</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {isPasswordResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsPasswordResetModalOpen(false)}></div>
          <div className={`relative w-full max-w-md rounded-2xl p-6 border shadow-2xl transition-all ${cardBg}`}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-800 border-slate-100">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-600" />
                <span>Reset Customer Master Password</span>
              </h3>
              <button onClick={() => setIsPasswordResetModalOpen(false)} className="p-1 rounded-lg hover:bg-black/10 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-xs text-gray-400">
                You are performing a secure administrative password reset for <strong>{customer.name}</strong> ({customer.primaryContactEmail}).
              </p>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">New Master Password</label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full p-2.5 pr-10 text-xs rounded-xl border outline-hidden ${inputBg}`}
                    placeholder="Enter strong password..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white cursor-pointer"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* STRENGTH BAR */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${passwordStrength.score}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-400 font-extrabold text-right">
                      Strength: <span className="uppercase">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Confirm New Password</label>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-xl border outline-hidden ${inputBg}`}
                  placeholder="Re-enter password..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-800 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs border border-slate-300 dark:border-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Confirm Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-USER MODAL */}
      {isSubUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsSubUserModalOpen(false)}></div>
          <div className={`relative w-full max-w-lg rounded-2xl p-6 border shadow-2xl transition-all ${cardBg}`}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-800 border-slate-100">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <UserCog className="w-4 h-4 text-indigo-500" />
                <span>{editingSubUser ? 'Modify Organization Sub-User' : 'Invite New Sub-User'}</span>
              </h3>
              <button onClick={() => setIsSubUserModalOpen(false)} className="p-1 rounded-lg hover:bg-black/10 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubUserSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={subFirstName}
                    onChange={(e) => setSubFirstName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-hidden ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={subLastName}
                    onChange={(e) => setSubLastName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-hidden ${inputBg}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-hidden ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Access Role</label>
                  <CustomSelect
                    value={subRole}
                    onChange={(val) => setSubRole(val)}
                    options={[
                      { value: "Org Admin", label: "Org Admin" },
                      { value: "Billing Manager", label: "Billing Manager" },
                      { value: "Technical Lead", label: "Technical Lead" },
                      { value: "Standard Member", label: "Standard Member" },
                      { value: "Read-Only Viewer", label: "Read-Only Viewer" }
                    ]}
                    isDark={isDark}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-hidden ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    value={subPhone}
                    onChange={(e) => setSubPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-hidden ${inputBg}`}
                  />
                </div>
              </div>

              {/* MODULE PERMISSIONS CHECKLIST */}
              <div className="space-y-2 pt-2 border-t dark:border-gray-800 border-slate-100">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Custom Module Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_MODULE_PERMISSIONS.map((perm) => (
                    <label key={perm} className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                      subPermissions.includes(perm) ? 'border-purple-600 bg-purple-600/10 text-purple-600' : subCardBg
                    }`}>
                      <input
                        type="checkbox"
                        checked={subPermissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-600"
                      />
                      <span className="text-[11px] font-bold">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t dark:border-gray-800 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {editingSubUser ? 'Save Sub-User' : 'Create Sub-User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY INVOICE MODAL */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-5 shadow-2xl ${isDark ? 'bg-[#12151B] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b dark:border-gray-800 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Process Invoice Payment</h3>
                  <p className="text-xs text-gray-400 font-mono">{payingInvoice.invoiceNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setPayingInvoice(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex justify-between items-center ${isDark ? 'bg-[#020617] border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Customer & Invoice</span>
                  <span className="text-xs font-extrabold block">{customer.name}</span>
                  <span className="text-[11px] text-gray-400">{payingInvoice.description}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Amount Due</span>
                  <span className="text-lg font-black font-mono text-emerald-500">${payingInvoice.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-gray-400 block">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Credit Card (Stripe)', label: 'Credit Card / Visa', desc: 'Instant Processing' },
                    { id: 'Corporate ACH Wire', label: 'ACH / Wire Transfer', desc: 'Direct Bank Settlement' },
                    { id: 'Corporate Check', label: 'Corporate Check', desc: 'Manual Audit Clearance' },
                    { id: 'Account Balance', label: 'Account Credit', desc: 'SLA Pre-paid Credits' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayMethod(method.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedPayMethod === method.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                          : isDark ? 'border-gray-800 bg-[#020617] text-gray-300 hover:border-gray-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{method.label}</span>
                        {selectedPayMethod === method.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-0.5 block">{method.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Upon payment confirmation, status will immediately shift to <strong>PAID</strong> across all reporting portals.</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t dark:border-gray-800 border-slate-100">
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
                className={`px-4 py-2 text-xs rounded-xl border cursor-pointer ${isDark ? 'border-gray-800 hover:bg-gray-800 text-gray-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setInvoices(prev => prev.map(inv => inv.id === payingInvoice.id ? { ...inv, status: 'Paid', paidAmount: inv.amount, paidDate: today, paymentMethod: selectedPayMethod } : inv));
                  showToast(`Invoice ${payingInvoice.invoiceNumber} paid successfully! Status updated to PAID.`);
                  setPayingInvoice(null);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md transition-all hover:scale-102"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Payment (${payingInvoice.amount.toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAISE NEW INVOICE MODAL */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${isDark ? 'bg-[#12151B] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b dark:border-gray-800 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-600/15 text-purple-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Raise New Invoice</h3>
                  <p className="text-xs text-gray-400">Issue a new invoice for {customer.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRaiseModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const today = new Date().toISOString().split('T')[0];
              const invNum = newInvNum.trim() || `INV-${customer.id.toUpperCase()}-${Date.now().toString().slice(-4)}`;
              const newInvoice: CustomerInvoice = {
                id: `inv-${Date.now()}`,
                customerId: customer.id,
                customerName: customer.name,
                invoiceNumber: invNum,
                issueDate: today,
                dueDate: newInvDue || today,
                amount: Number(newInvAmt),
                paidAmount: newInvStatus === 'Paid' ? Number(newInvAmt) : 0,
                paidDate: newInvStatus === 'Paid' ? today : undefined,
                status: newInvStatus,
                description: newInvDesc || 'Enterprise Software Subscription License',
                items: [{ name: newInvDesc || 'Software License', sku: 'SKU-LICENSE', units: 1, amount: Number(newInvAmt) }]
              };

              setInvoices(prev => [newInvoice, ...prev]);
              showToast(`Invoice ${invNum} created successfully with status "${newInvStatus}"`);
              setIsRaiseModalOpen(false);
              setNewInvNum('');
              setNewInvAmt(2500);
              setNewInvDue('');
              setNewInvDesc('');
              setNewInvStatus('Pending');
            }} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Invoice Number (Auto/Custom)</label>
                <input
                  type="text"
                  value={newInvNum}
                  onChange={(e) => setNewInvNum(e.target.value)}
                  placeholder={`e.g. INV-${customer.id.toUpperCase()}-2026-005`}
                  className={`w-full p-2.5 text-xs font-mono rounded-xl border outline-hidden ${inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newInvAmt}
                    onChange={(e) => setNewInvAmt(Number(e.target.value))}
                    className={`w-full p-2.5 text-xs font-mono rounded-xl border outline-hidden ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newInvDue}
                    onChange={(e) => setNewInvDue(e.target.value)}
                    className={`w-full p-2.5 text-xs font-mono rounded-xl border outline-hidden ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Description / Line Item</label>
                <input
                  type="text"
                  required
                  value={newInvDesc}
                  onChange={(e) => setNewInvDesc(e.target.value)}
                  placeholder="e.g. Annual Cloud Infrastructure Subscription"
                  className={`w-full p-2.5 text-xs rounded-xl border outline-hidden ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Initial Status</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Raised', 'Pending', 'Paid', 'Overdue'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewInvStatus(st)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        newInvStatus === st
                          ? st === 'Paid' ? 'bg-emerald-500 text-white border-emerald-500'
                            : st === 'Pending' ? 'bg-amber-500 text-white border-amber-500'
                            : st === 'Overdue' ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-indigo-500 text-white border-indigo-500'
                          : isDark ? 'border-gray-800 bg-[#020617] text-gray-400' : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t dark:border-gray-800 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRaiseModalOpen(false)}
                  className={`px-4 py-2 text-xs rounded-xl border cursor-pointer ${isDark ? 'border-gray-800 hover:bg-gray-800 text-gray-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Raise Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RECEIPT MODAL */}
      {receiptInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-5 shadow-2xl ${isDark ? 'bg-[#12151B] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b dark:border-gray-800 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Official Invoice Receipt</h3>
                  <p className="text-xs text-gray-400 font-mono">{receiptInvoice.invoiceNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setReceiptInvoice(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#020617] border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-extrabold">{customer.name}</h4>
                    <p className="text-[11px] text-gray-400">{customer.address}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Contact: {customer.primaryContactEmail}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                      receiptInvoice.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                        : receiptInvoice.status === 'Pending' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                        : receiptInvoice.status === 'Overdue' ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20'
                        : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {receiptInvoice.status}
                    </span>
                    {receiptInvoice.paidDate && (
                      <span className="block text-[9px] text-gray-400 font-mono mt-1">Paid Date: {receiptInvoice.paidDate}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t dark:border-gray-800 border-slate-200 font-mono">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Issue Date</span>
                    <span>{receiptInvoice.issueDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Due Date</span>
                    <span>{receiptInvoice.dueDate}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-2">Itemized Breakdown</span>
                <div className="rounded-xl border dark:border-gray-800 border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className={`text-[10px] uppercase font-mono ${isDark ? 'bg-[#020617] text-gray-400' : 'bg-slate-100 text-slate-600'}`}>
                      <tr>
                        <th className="p-2.5">Item Description</th>
                        <th className="p-2.5 text-center">Units</th>
                        <th className="p-2.5 text-right">Total ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                      {receiptInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium">{item.name}</td>
                          <td className="p-2.5 text-center font-mono text-gray-400">{item.units}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-500">${item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 font-mono">
                <span className="text-xs font-bold text-gray-400">Total Invoice Amount:</span>
                <span className="text-lg font-black text-emerald-500">${receiptInvoice.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t dark:border-gray-800 border-slate-100">
              <button
                type="button"
                onClick={() => downloadCSV(`${receiptInvoice.invoiceNumber}_receipt.csv`, ['Invoice #', 'Customer', 'Amount', 'Status', 'DueDate'], [[receiptInvoice.invoiceNumber, customer.name, receiptInvoice.amount, receiptInvoice.status, receiptInvoice.dueDate]])}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download CSV</span>
              </button>

              <div className="flex items-center gap-2">
                {receiptInvoice.status !== 'Paid' && (
                  <button
                    type="button"
                    onClick={() => {
                      setPayingInvoice(receiptInvoice);
                      setReceiptInvoice(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Invoice</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setReceiptInvoice(null)}
                  className={`px-4 py-2 text-xs rounded-xl border cursor-pointer ${isDark ? 'border-gray-800 hover:bg-gray-800 text-gray-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
