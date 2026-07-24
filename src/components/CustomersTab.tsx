import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CustomSelect } from './CustomSelect';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CreditCard,
  Laptop,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Download,
  CheckCircle,
  FileText,
  Clock,
  Briefcase,
  AlertTriangle,
  Calendar,
  FileSignature,
  DollarSign,
  Activity,
  Ban,
  Unlock,
  Send,
  Paperclip,
  SlidersHorizontal,
  List,
  LayoutGrid
} from 'lucide-react';
import { Customer, Product, Contract, DocItem, Language } from '../types';

interface CustomersTabProps {
  customers: Customer[];
  products: Product[];
  contracts: Contract[];
  documents: DocItem[];
  onAddCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddContract: (contract: Contract) => void;
  onEditContract: (contract: Contract) => void;
  onAddDoc: (doc: DocItem) => void;
  onEditDoc: (doc: DocItem) => void;
  onGoToBilling: (customerName: string) => void;
  onGoToProductDetails?: (customerId: string, productId: string) => void;
  onGoToContractsAndLicensing?: (customerId: string) => void;
  t: Record<string, string>;
  isDark: boolean;
  triggerOpenAddModal: boolean;
  onResetTrigger: () => void;
  auditLogs?: any[];
  preselectedCustomerId?: string;
  onClearPreselectedCustomerId?: () => void;
}

export default function CustomersTab({
  customers,
  products,
  contracts,
  documents,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onAddContract,
  onEditContract,
  onAddDoc,
  onEditDoc,
  onGoToBilling,
  onGoToProductDetails,
  onGoToContractsAndLicensing,
  t,
  isDark,
  triggerOpenAddModal,
  onResetTrigger,
  auditLogs = [],
  preselectedCustomerId,
  onClearPreselectedCustomerId
}: CustomersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customerViewMode, setCustomerViewMode] = useState<'grid' | 'list'>('grid');
  
  // Drill-down Detail state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedCustomerId) {
      setSelectedCustomerId(preselectedCustomerId);
      if (onClearPreselectedCustomerId) {
        onClearPreselectedCustomerId();
      }
    }
  }, [preselectedCustomerId, onClearPreselectedCustomerId]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // New License modal/form state
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [selectedProductSku, setSelectedProductSku] = useState('');
  const [licenseName, setLicenseName] = useState('');
  const [licensePurchasedUnits, setLicensePurchasedUnits] = useState(10);
  const [licenseActiveUnits, setLicenseActiveUnits] = useState(0);
  const [licenseUnitPrice, setLicenseUnitPrice] = useState(150);
  const [licenseTermMonths, setLicenseTermMonths] = useState(12);
  const [licenseStartDate, setLicenseStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Document preview modal state
  const [previewingDoc, setPreviewingDoc] = useState<DocItem | null>(null);

  // Form states for customer onboarding/editing
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [primaryContactPhone, setPrimaryContactPhone] = useState('');
  const [primaryContactEmail, setPrimaryContactEmail] = useState('');
  const [billingContactName, setBillingContactName] = useState('');
  const [billingContactPhone, setBillingContactPhone] = useState('');
  const [billingContactEmail, setBillingContactEmail] = useState('');
  const [supportTier, setSupportTier] = useState<'Gold Support Model' | 'Standard Support Model'>('Standard Support Model');
  const [supportContactName, setSupportContactName] = useState('');
  const [supportContactPhone, setSupportContactPhone] = useState('');
  const [supportContactEmail, setSupportContactEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [parentId, setParentId] = useState('');

  // Drag and drop / file upload state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email Composer States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailCustomer, setEmailCustomer] = useState<Customer | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailAttachment, setEmailAttachment] = useState<File | null>(null);

  // Local notifications
  const [localToast, setLocalToast] = useState<string | null>(null);
  const triggerLocalToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => {
      setLocalToast(null);
    }, 3000);
  };

  function openEmailModal(cust: Customer, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setEmailCustomer(cust);
    setEmailSubject(`Enterprise SLA Notification - ${cust.name}`);
    setEmailMessage(`Dear ${cust.primaryContactName},\n\nWe would like to share key operational updates with respect to your enterprise integration services.\n\nBest regards,\nSarah Connor\nSuper Admin Support Liaison`);
    setEmailAttachment(null);
    setIsEmailModalOpen(true);
  }

  function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!emailCustomer) return;
    const attName = emailAttachment ? ` with attachment "${emailAttachment.name}"` : '';
    triggerLocalToast(`Email successfully sent to ${emailCustomer.primaryContactEmail}${attName}!`);
    setIsEmailModalOpen(false);
    setEmailCustomer(null);
    setEmailSubject('');
    setEmailMessage('');
    setEmailAttachment(null);
  }

  // Handle trigger from Quick Links
  if (triggerOpenAddModal) {
    setTimeout(() => {
      openAddModal();
      onResetTrigger();
    }, 100);
  }

  function openAddModal() {
    setEditingCustomer(null);
    setName('');
    setAddress('');
    setPrimaryContactName('');
    setPrimaryContactPhone('');
    setPrimaryContactEmail('');
    setBillingContactName('');
    setBillingContactPhone('');
    setBillingContactEmail('');
    setSupportTier('Standard Support Model');
    setSupportContactName('');
    setSupportContactPhone('');
    setSupportContactEmail('');
    setNotes('');
    setParentId('');
    setIsModalOpen(true);
  }

  function openEditModal(cust: Customer, e?: React.MouseEvent) {
    if (e) e.stopPropagation(); // Avoid triggering drill-down
    setEditingCustomer(cust);
    setName(cust.name);
    setAddress(cust.address);
    setPrimaryContactName(cust.primaryContactName);
    setPrimaryContactPhone(cust.primaryContactPhone);
    setPrimaryContactEmail(cust.primaryContactEmail);
    setBillingContactName(cust.billingContactName);
    setBillingContactPhone(cust.billingContactPhone);
    setBillingContactEmail(cust.billingContactEmail);
    setSupportTier(cust.supportTier);
    setSupportContactName(cust.supportContactName);
    setSupportContactPhone(cust.supportContactPhone);
    setSupportContactEmail(cust.supportContactEmail);
    setNotes(cust.notes);
    setParentId(cust.parentId || '');
    setIsModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const customerData: Customer = {
      id: editingCustomer ? editingCustomer.id : `c-${Date.now()}`,
      name,
      address,
      primaryContactName,
      primaryContactPhone,
      primaryContactEmail,
      billingContactName,
      billingContactPhone,
      billingContactEmail,
      supportTier,
      supportContactName,
      supportContactPhone,
      supportContactEmail,
      notes,
      parentId: parentId || undefined,
      status: editingCustomer ? (editingCustomer.status || 'Active') : 'Active',
      ssoEnabled: editingCustomer ? editingCustomer.ssoEnabled : undefined,
      ssoProvider: editingCustomer ? editingCustomer.ssoProvider : undefined,
      ssoProtocol: editingCustomer ? editingCustomer.ssoProtocol : undefined,
      ssoDomain: editingCustomer ? editingCustomer.ssoDomain : undefined,
      ssoUrl: editingCustomer ? editingCustomer.ssoUrl : undefined,
      createDate: editingCustomer ? editingCustomer.createDate : new Date().toISOString().split('T')[0],
      createdBy: editingCustomer ? editingCustomer.createdBy : 'Global Admin',
      lastModified: new Date().toISOString().split('T')[0],
      lastModifiedBy: 'developerbe25@gmail.com'
    };

    if (editingCustomer) {
      onEditCustomer(customerData);
    } else {
      onAddCustomer(customerData);
    }
    setIsModalOpen(false);
  }

  // Toggle Customer status (Block/Unblock)
  function handleToggleBlock(cust: Customer) {
    const nextStatus = cust.status === 'Blocked' ? 'Active' : 'Blocked';
    const message = nextStatus === 'Blocked' 
      ? `Are you sure you want to block ${cust.name}? Blocked customers will be flagged across licensing and SLA audits.`
      : `Are you sure you want to reactivate ${cust.name}?`;
      
    if (confirm(message)) {
      onEditCustomer({
        ...cust,
        status: nextStatus,
        lastModified: new Date().toISOString().split('T')[0],
        lastModifiedBy: 'developerbe25@gmail.com'
      });
      triggerLocalToast(`Customer "${cust.name}" status successfully updated to ${nextStatus}!`);
    }
  }

  // Add License submission
  function handleAddLicenseSubmit(e: React.FormEvent, customerId: string, customerName: string) {
    e.preventDefault();
    const product = products.find(p => p.sku === selectedProductSku);
    if (!product) return;

    // Calculate end date based on term months
    const start = new Date(licenseStartDate);
    start.setMonth(start.getMonth() + Number(licenseTermMonths));
    const endDate = start.toISOString().split('T')[0];

    const newContract: Contract = {
      id: `con-${Date.now()}`,
      name: licenseName || `${product.name} Enterprise License`,
      description: `Administrative license provisioned for ${customerName}`,
      customerId,
      customerName,
      productSku: product.sku,
      productName: product.name,
      unitPrice: Number(licenseUnitPrice),
      purchasedUnits: Number(licensePurchasedUnits),
      activeUnits: Number(licenseActiveUnits),
      termMonths: Number(licenseTermMonths),
      startDate: licenseStartDate,
      endDate,
      createDate: new Date().toISOString().split('T')[0],
      createdBy: 'Global Admin',
      lastUpdated: new Date().toISOString().split('T')[0],
      lastUpdatedBy: 'developerbe25@gmail.com'
    };

    onAddContract(newContract);
    setIsLicenseModalOpen(false);
    
    // Reset form states
    setLicenseName('');
    setSelectedProductSku('');
  }

  // Auto-fill price when product changes in licensing form
  function handleProductSkuChange(sku: string) {
    setSelectedProductSku(sku);
    const prod = products.find(p => p.sku === sku);
    if (prod) {
      setLicenseUnitPrice(prod.unitPrice);
      setLicenseName(`${prod.name} Enterprise Access`);
    }
  }

  // Handle mock file selection/drag-drop
  function handleFileUpload(file: File, customerId: string) {
    const newDoc: DocItem = {
      id: `doc-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""), // File name without extension
      category: file.name.endsWith('.pdf') ? 'Product Documentation' : 'Support Documentation',
      associatedProducts: [],
      isPublished: false, // Default is Pending Approval
      notes: `Uploaded specifically for audit tracking of client ID: ${customerId}`,
      uploadDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      targetCustomerIds: [customerId]
    };

    onAddDoc(newDoc);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave() {
    setIsDragging(false);
  }

  function onDrop(e: React.DragEvent, customerId: string) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0], customerId);
    }
  }

  // File download mock generator
  function handleDownloadDocument(doc: DocItem) {
    const textContent = `B&J Enterprise Document Audit\n===============================\nDocument ID: ${doc.id}\nTitle: ${doc.title}\nCategory: ${doc.category}\nUpload Date: ${doc.uploadDate}\nOperational status: ${doc.isPublished ? 'Approved and Certified' : 'Pending Internal Admin Review'}\n\nThis is a securely authorized administrative download of client records.\nContact developerbe25@gmail.com for system credentials.`;
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${doc.title.toLowerCase().replace(/\s+/g, '_')}_certified.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Document approval
  function handleApproveDocument(doc: DocItem) {
    onEditDoc({
      ...doc,
      isPublished: true, // Marked as approved
      lastModified: new Date().toISOString().split('T')[0]
    });
  }

  const filteredCustomers = useMemo(() => {
    if (searchQuery.trim() === '') return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      c => 
        c.name.toLowerCase().includes(q) ||
        c.primaryContactName.toLowerCase().includes(q) ||
        c.primaryContactEmail.toLowerCase().includes(q) ||
        c.supportTier.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  // Pagination state for customers tab (10 per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const totalPages = useMemo(() => {
    return Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  }, [filteredCustomers.length, itemsPerPage]);

  const safeCurrentPage = useMemo(() => {
    return Math.min(Math.max(currentPage, 1), totalPages);
  }, [currentPage, totalPages]);

  const paginatedCustomers = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, safeCurrentPage, itemsPerPage]);

  // Selected customer details
  const currentCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Contracts specific to selected customer
  const customerContracts = useMemo(() => {
    if (!selectedCustomerId) return [];
    return contracts.filter(con => con.customerId === selectedCustomerId);
  }, [contracts, selectedCustomerId]);

  // Documents specific to selected customer
  const customerDocs = useMemo(() => {
    if (!selectedCustomerId) return [];
    return documents.filter(doc => doc.targetCustomerIds?.includes(selectedCustomerId));
  }, [documents, selectedCustomerId]);

  // Customer SSO local state for editing
  const [custSsoEnabled, setCustSsoEnabled] = useState(false);
  const [custSsoProvider, setCustSsoProvider] = useState('Okta Enterprise IDP');
  const [custSsoProtocol, setCustSsoProtocol] = useState('SAML 2.0');
  const [custSsoDomain, setCustSsoDomain] = useState('');
  const [custSsoUrl, setCustSsoUrl] = useState('');
  const [ssoTestResult, setSsoTestResult] = useState<string | null>(null);
  const [ssoTesting, setSsoTesting] = useState(false);

  useEffect(() => {
    if (currentCustomer) {
      setCustSsoEnabled(currentCustomer.ssoEnabled ?? false);
      setCustSsoProvider(currentCustomer.ssoProvider ?? 'Okta Enterprise IDP');
      setCustSsoProtocol(currentCustomer.ssoProtocol ?? 'SAML 2.0');
      
      const defaultDomain = `${currentCustomer.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.okta.com`;
      setCustSsoDomain(currentCustomer.ssoDomain ?? defaultDomain);
      setCustSsoUrl(currentCustomer.ssoUrl ?? `https://${currentCustomer.ssoDomain || defaultDomain}/sso/saml`);
      setSsoTestResult(null);
      setSsoTesting(false);
    }
  }, [selectedCustomerId]);

  // ----------------------------------------------------
  // 1. DETAIL VIEW RENDERING
  // ----------------------------------------------------
  if (currentCustomer) {
    const isBlocked = currentCustomer.status === 'Blocked';
    return (
      <div className="space-y-6">
        {/* LOCAL TOAST NOTIFICATION */}
        {localToast && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-950 dark:bg-slate-900 border border-[rgb(14,145,145)]/40 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-[rgb(14,145,145)] animate-pulse" />
            <span className="text-xs font-bold">{localToast}</span>
          </div>
        )}
        {/* Detail view header bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b dark:border-gray-800 border-slate-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedCustomerId(null)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${isDark ? 'border-[#2D333D] hover:bg-gray-800 text-gray-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
              title="Return to list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                  {currentCustomer.name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 uppercase tracking-wider ${
                  isBlocked ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                  {isBlocked ? 'Account Blocked' : 'Active Partner'}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-mono">Enterprise Tenant Reference: {currentCustomer.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Block / Unblock customer button */}
            <button
              onClick={() => handleToggleBlock(currentCustomer)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isBlocked
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                  : 'border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
              }`}
            >
              {isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              <span>{isBlocked ? 'Reactivate Client' : 'Block Customer Account'}</span>
            </button>

            {/* Edit details */}
            <button
              onClick={(e) => openEditModal(currentCustomer, e)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isDark ? 'border-[#2D333D] bg-[#1A1D23] hover:bg-gray-800 text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Edit3 className="w-4 h-4 text-[rgb(14,145,145)]" />
              <span>Modify Profile</span>
            </button>

            {/* Quick contracts redirect */}
            <button
              onClick={() => onGoToBilling(currentCustomer.name)}
              className="px-3.5 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Billing Audit</span>
            </button>
          </div>
        </div>

        {/* Warning block message if blocked */}
        {isBlocked && (
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black uppercase text-rose-500 tracking-wider">Operational Account Hold Active</h4>
              <p className="text-xs text-rose-400 mt-1 font-medium">
                This customer portfolio has been blocked by system administration. Product license authorizations and API connectivity are currently under restriction. Review associated SLA contracts and security uploads below.
              </p>
            </div>
          </div>
        )}

        {/* SECTION 1: Customer details and metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts and details */}
          <div className={`p-6 rounded-2xl border lg:col-span-2 space-y-6 ${isDark ? 'bg-[#161920] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
            <div>
              <h3 className={`text-sm font-extrabold flex items-center gap-2 mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                <Building2 className="w-4 h-4 text-[rgb(14,145,145)]" />
                <span>Tenant Overview</span>
              </h3>
              <p className="text-[11px] text-gray-400">Headquarters location and organizational point of contacts.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">HQ Address</span>
                <span className={isDark ? 'text-gray-200' : 'text-slate-700'}>{currentCustomer.address}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Support SLA Program</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-block ${
                  currentCustomer.supportTier === 'Gold Support Model' ? 'bg-amber-500/10 text-amber-500' : 'bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)]'
                }`}>
                  {currentCustomer.supportTier}
                </span>
              </div>
            </div>

            {/* Contacts matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t dark:border-gray-800 border-slate-100 pt-4">
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#0F1115] border-gray-800' : 'bg-slate-50 border-slate-100'}`}>
                <span className="font-bold text-[10px] text-[rgb(14,145,145)] block uppercase tracking-wider mb-2 flex items-center gap-1">
                  <User className="w-3 h-3" /> Technical Liaison
                </span>
                <div className="text-xs font-bold">{currentCustomer.primaryContactName}</div>
                <div className="text-[10px] font-mono text-gray-400 mt-1 space-y-0.5">
                  <div className="truncate">{currentCustomer.primaryContactEmail}</div>
                  <div>{currentCustomer.primaryContactPhone}</div>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#0F1115] border-gray-800' : 'bg-slate-50 border-slate-100'}`}>
                <span className="font-bold text-[10px] text-amber-500 block uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Billing Office
                </span>
                <div className="text-xs font-bold">{currentCustomer.billingContactName}</div>
                <div className="text-[10px] font-mono text-gray-400 mt-1 space-y-0.5">
                  <div className="truncate">{currentCustomer.billingContactEmail}</div>
                  <div>{currentCustomer.billingContactPhone}</div>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#0F1115] border-gray-800' : 'bg-slate-50 border-slate-100'}`}>
                <span className="font-bold text-[10px] text-purple-500 block uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Dedicated Support
                </span>
                <div className="text-xs font-bold">{currentCustomer.supportContactName}</div>
                <div className="text-[10px] font-mono text-gray-400 mt-1 space-y-0.5">
                  <div className="truncate">{currentCustomer.supportContactEmail}</div>
                  <div>{currentCustomer.supportContactPhone}</div>
                </div>
              </div>
            </div>

            {currentCustomer.notes && (
              <div className={`p-3 rounded-xl border border-dashed text-xs italic ${isDark ? 'bg-black/30 border-gray-800 text-gray-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                <span className="font-extrabold not-italic block uppercase text-[9px] tracking-wider text-gray-500 mb-1">Administrative Notes</span>
                "{currentCustomer.notes}"
              </div>
            )}
          </div>

          {/* Quick info metrics panel */}
          <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-[#161920] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
            <div>
              <h3 className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Account Metrics</span>
              </h3>
              <p className="text-[11px] text-gray-400">Key statistics on active contracts and assets (Click to navigate).</p>
            </div>

             <div className="space-y-3.5">
              <div 
                onClick={() => onGoToContractsAndLicensing?.(currentCustomer.id)}
                className={`p-3 rounded-xl ${isDark ? 'bg-black/20 hover:bg-black/40' : 'bg-slate-50 hover:bg-slate-100/80'} flex justify-between items-center cursor-pointer transition-all border border-transparent hover:border-[rgb(14,145,145)]/20`}
                title="Click to view Licensing"
              >
                <span className="text-xs font-bold text-gray-400">Total active contracts</span>
                <span className="text-sm font-extrabold text-[rgb(14,145,145)]">{customerContracts.length}</span>
              </div>

              <div 
                onClick={() => onGoToBilling(currentCustomer.name)}
                className={`p-3 rounded-xl ${isDark ? 'bg-black/20 hover:bg-black/40' : 'bg-slate-50 hover:bg-slate-100/80'} flex justify-between items-center cursor-pointer transition-all border border-transparent hover:border-emerald-500/20`}
                title="Click to view Billing & Usage reports"
              >
                <span className="text-xs font-bold text-gray-400">Contract Capitalization</span>
                <span className="text-sm font-extrabold text-emerald-500">
                  ${customerContracts.reduce((sum, con) => sum + (con.unitPrice * con.purchasedUnits * con.termMonths), 0).toLocaleString()}
                </span>
              </div>

              <div 
                onClick={() => onGoToContractsAndLicensing?.(currentCustomer.id)}
                className={`p-3 rounded-xl ${isDark ? 'bg-black/20 hover:bg-black/40' : 'bg-slate-50 hover:bg-slate-100/80'} flex justify-between items-center cursor-pointer transition-all border border-transparent hover:border-[rgb(14,145,145)]/20`}
                title="Click to view Licensing"
              >
                <span className="text-xs font-bold text-gray-400">Assigned licenses</span>
                <span className="text-sm font-extrabold text-purple-500">
                  {customerContracts.reduce((sum, con) => sum + con.purchasedUnits, 0)} Units
                </span>
              </div>

              <div className={`p-3 rounded-xl ${isDark ? 'bg-black/20' : 'bg-slate-50'} flex justify-between items-center`}>
                <span className="text-xs font-bold text-gray-400">Audited Documents</span>
                <span className="text-sm font-extrabold text-amber-500">{customerDocs.length} Documents</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: LICENSES / CONTRACTS MANAGEMENT */}
        <div className={`p-6 rounded-2xl border space-y-6 ${isDark ? 'bg-[#161920] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className={`text-base font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                <Briefcase className="w-5 h-5 text-[rgb(14,145,145)]" />
                <span>Authorized Active Licenses</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Enterprise licenses, seat volumes, active durations, and pricing agreements.</p>
            </div>

            <button
              onClick={() => {
                // Prepopulate defaults
                if (products.length > 0) {
                  handleProductSkuChange(products[0].sku);
                }
                setIsLicenseModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New License</span>
            </button>
          </div>

          {customerContracts.length === 0 ? (
            <div className={`p-8 text-center rounded-xl border border-dashed ${isDark ? 'border-gray-800' : 'border-slate-100'} text-xs text-gray-500 italic`}>
              No active licensing contracts are registered for this client. Click "Add New License" above to provision.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerContracts.map((con) => (
                <div 
                   key={con.id}
                   className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all hover:border-[rgb(14,145,145)]/50 ${
                     isDark ? 'bg-[#0F1115] border-gray-800' : 'bg-slate-50 border-slate-100'
                   }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-extrabold">{con.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">ID: {con.id}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (onGoToProductDetails) {
                            const foundProduct = products.find(p => p.sku === con.productSku);
                            if (foundProduct) {
                              onGoToProductDetails(currentCustomer.id, foundProduct.id);
                            }
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold hover:underline cursor-pointer ${isDark ? 'bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)]' : 'bg-[rgb(14,145,145)]/10 text-[rgb(10,115,115)]'}`}
                        title="Click to view Product Details"
                      >
                        {con.productSku}
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-400 italic line-clamp-1">{con.description}</p>

                    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-dashed dark:border-gray-800 border-slate-100 text-[11px] font-medium">
                      <div>
                        <span className="text-gray-400 text-[9px] uppercase font-bold block mb-0.5">Seat Volume</span>
                        <span className={isDark ? 'text-gray-200' : 'text-slate-800'}>
                          {con.activeUnits} active / {con.purchasedUnits} seats
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[9px] uppercase font-bold block mb-0.5">Agreement Price</span>
                        <span className={isDark ? 'text-gray-200' : 'text-slate-800'}>
                          ${con.unitPrice} / unit / mo
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[9px] uppercase font-bold block mb-0.5">License Term</span>
                        <span className={isDark ? 'text-gray-200' : 'text-slate-800'}>
                          {con.termMonths} Months
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[9px] uppercase font-bold block mb-0.5">Total Value</span>
                        <span className="font-extrabold text-emerald-500">
                          ${(con.unitPrice * con.purchasedUnits * con.termMonths).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-dashed dark:border-gray-800 border-slate-100 flex items-center justify-between text-[10px] font-bold text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[rgb(14,145,145)]" />
                      <span>{con.startDate} to {con.endDate}</span>
                    </span>

                    <button
                      onClick={() => onGoToContractsAndLicensing?.(currentCustomer.id)}
                      className="text-[rgb(14,145,145)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      title="View complete contract and granular licensing activations"
                    >
                      <span>Manage Licensing</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: DOCUMENT MANAGEMENT & APPROVALS */}
        <div className={`p-6 rounded-2xl border space-y-6 ${isDark ? 'bg-[#161920] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
          <div>
            <h3 className={`text-base font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Certified Document Audit & Uploads</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Upload certified client agreements, sign-offs, and SLA technical scopes. Review and approve client documentation.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Drag and Drop Upload Zone */}
            <div className="lg:col-span-1">
              <span className="text-xs font-extrabold text-gray-400 block mb-2 uppercase tracking-wide">Upload Certified Document</span>
              
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, currentCustomer.id)}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[rgb(14,145,145)] bg-[rgb(14,145,145)]/5 scale-[1.01]'
                    : isDark 
                      ? 'border-[#2D333D] hover:border-[rgb(14,145,145)]/50 hover:bg-gray-800 bg-[#0F1115]' 
                      : 'border-slate-200 hover:border-[rgb(14,145,145)]/50 hover:bg-slate-50 bg-white'
                }`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0], currentCustomer.id);
                    }
                  }}
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.txt,.csv"
                />
                <Upload className="w-8 h-8 text-[rgb(14,145,145)] mb-3 animate-bounce" />
                <h4 className="text-xs font-bold">Drag and drop file here</h4>
                <p className="text-[10px] text-gray-500 mt-1">or click to browse local files</p>
                <p className="text-[9px] text-gray-400 font-bold mt-2 font-mono">PDF, DOCX, TXT or CSV (Max 10MB)</p>
              </div>
            </div>

            {/* List of documents */}
            <div className="lg:col-span-2 space-y-3">
              <span className="text-xs font-extrabold text-gray-400 block mb-2 uppercase tracking-wide">Audit Ledger ({customerDocs.length})</span>
              
              {customerDocs.length === 0 ? (
                <div className={`p-8 text-center rounded-xl border border-dashed ${isDark ? 'border-gray-800' : 'border-slate-100'} text-xs text-gray-500 italic`}>
                  No documentation has been uploaded yet for this enterprise customer. Use the panel on the left to upload.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {customerDocs.map((doc) => (
                    <div 
                      key={doc.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all hover:border-[rgb(14,145,145)]/30 ${
                        isDark ? 'bg-[#0F1115] border-gray-800 hover:bg-[#12151B]' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                          <FileSignature className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold truncate max-w-xs">{doc.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-medium">
                            <span className="font-mono">{doc.fileSize}</span>
                            <span>•</span>
                            <span>Uploaded: {doc.uploadDate}</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.2 rounded-sm text-[8px] font-black uppercase tracking-wider ${
                              doc.isPublished 
                                ? 'bg-emerald-500/15 text-emerald-500' 
                                : 'bg-amber-500/15 text-amber-400 animate-pulse'
                            }`}>
                              {doc.isPublished ? 'Approved ✅' : 'Pending Approval ⏳'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        {/* Approval button if pending */}
                        {!doc.isPublished && (
                          <button
                            onClick={() => handleApproveDocument(doc)}
                            className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/10 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                            title="Verify and Approve agreement document"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* View mock document */}
                        <button
                          onClick={() => setPreviewingDoc(doc)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isDark ? 'border-gray-800 bg-[#161920] hover:bg-gray-800 text-gray-300' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                          title="Preview document audit records"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Download document action */}
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isDark ? 'border-gray-800 bg-[#161920] hover:bg-gray-800 text-gray-300' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                          title="Download document text file"
                        >
                          <Download className="w-4 h-4 text-[rgb(14,145,145)]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: SSO & IDP INTEGRATION */}
        <div className={`p-6 rounded-2xl border space-y-6 ${isDark ? 'bg-[#161920] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className={`text-base font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                <SlidersHorizontal className="w-5 h-5 text-[rgb(14,145,145)]" />
                <span>Federated SSO & IDP Integration Settings</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Configure Single Sign-On (SSO) and Identity Provider (IDP) metadata for this customer tenant. When active, authorized users can sign in using corporate credentials.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                custSsoEnabled 
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' 
                  : 'bg-rose-500/15 text-rose-500 border border-rose-500/20'
              }`}>
                {custSsoEnabled ? 'SSO Active' : 'SSO Disabled'}
              </span>
              <button
                type="button"
                onClick={() => setCustSsoEnabled(!custSsoEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  custSsoEnabled
                    ? 'border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                }`}
              >
                {custSsoEnabled ? 'Deactivate SSO' : 'Activate SSO'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 border-t dark:border-gray-800 border-slate-100">
            {/* Form Settings inputs */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Identity Provider Name</label>
                  <CustomSelect
                    value={custSsoProvider}
                    onChange={(val) => {
                      setCustSsoProvider(val);
                      // Update default protocol and domain based on provider
                      if (val === 'Okta Enterprise IDP') {
                        setCustSsoProtocol('SAML 2.0');
                      } else if (val === 'Google Workspace') {
                        setCustSsoProtocol('OIDC / OAuth2');
                      } else if (val === 'Microsoft Azure AD') {
                        setCustSsoProtocol('OIDC');
                      } else if (val === 'Auth0 Security Gate') {
                        setCustSsoProtocol('SAML 2.0');
                      }
                    }}
                    options={[
                      { value: "Okta Enterprise IDP", label: "Okta Enterprise IDP" },
                      { value: "Google Workspace", label: "Google Workspace" },
                      { value: "Microsoft Azure AD", label: "Microsoft Azure AD" },
                      { value: "Auth0 Security Gate", label: "Auth0 Security Gate" },
                      { value: "Custom SSO Gate", label: "Custom SSO Gate" }
                    ]}
                    isDark={isDark}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Federation Protocol</label>
                  <CustomSelect
                    value={custSsoProtocol}
                    onChange={(val) => setCustSsoProtocol(val)}
                    options={[
                      { value: "SAML 2.0", label: "SAML 2.0" },
                      { value: "OIDC", label: "OIDC" },
                      { value: "OIDC / OAuth2", label: "OIDC / OAuth2" }
                    ]}
                    isDark={isDark}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Corporate Auth Domain</label>
                  <input
                    type="text"
                    value={custSsoDomain}
                    onChange={(e) => {
                      setCustSsoDomain(e.target.value);
                      setCustSsoUrl(`https://${e.target.value}/sso/saml`);
                    }}
                    placeholder="e.g. enterprise.okta.com"
                    className={`w-full p-2.5 text-xs rounded-lg border outline-hidden transition-all ${
                      isDark ? 'bg-[#0F1115] border-[#2D333D] text-white focus:border-[rgb(14,145,145)]' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[rgb(14,145,145)]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Metadata Sign-On URL</label>
                  <input
                    type="text"
                    value={custSsoUrl}
                    onChange={(e) => setCustSsoUrl(e.target.value)}
                    placeholder="https://identity-gateway.com/sso"
                    className={`w-full p-2.5 text-xs rounded-lg border outline-hidden transition-all ${
                      isDark ? 'bg-[#0F1115] border-[#2D333D] text-white focus:border-[rgb(14,145,145)]' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[rgb(14,145,145)]'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onEditCustomer({
                      ...currentCustomer,
                      ssoEnabled: custSsoEnabled,
                      ssoProvider: custSsoProvider,
                      ssoProtocol: custSsoProtocol,
                      ssoDomain: custSsoDomain,
                      ssoUrl: custSsoUrl,
                      lastModified: new Date().toISOString().split('T')[0],
                      lastModifiedBy: 'developerbe25@gmail.com'
                    });
                    triggerLocalToast(`SSO Provider "${custSsoProvider}" configured and saved for ${currentCustomer.name}!`);
                  }}
                  className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm"
                >
                  Save SSO Configuration
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSsoTesting(true);
                    setSsoTestResult(null);
                    setTimeout(() => {
                      setSsoTesting(false);
                      setSsoTestResult(`Success: Federated SSO connection established with ${custSsoProvider}. SAML/OIDC metadata successfully validated for domain ${custSsoDomain}.`);
                    }, 1200);
                  }}
                  disabled={ssoTesting}
                  className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                    isDark ? 'border-[#2D333D] bg-gray-800 text-white hover:bg-gray-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  } disabled:opacity-50`}
                >
                  {ssoTesting ? 'Handshaking...' : 'Test SSO Link'}
                </button>
              </div>
            </div>

            {/* SSO Guidance & Test Panel */}
            <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-black/20 border-gray-800' : 'bg-slate-50 border-slate-100'}`}>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-[rgb(14,145,145)]">SAML 2.0 / OIDC Integration</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  Enterprise Tenants have the ability to manage their own IDP provider. B&J Admins can also pre-configure SSO/IDP profiles on behalf of the customer using this panel. Ensure Auth domains are unique to prevent routing conflicts.
                </p>
              </div>

              {ssoTestResult && (
                <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 font-medium text-[11px] leading-relaxed relative animate-fadeIn">
                  <span>{ssoTestResult}</span>
                  <button 
                    type="button"
                    onClick={() => setSsoTestResult(null)} 
                    className="absolute top-1 right-1 text-emerald-400 hover:text-emerald-300 font-bold text-[10px]"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CORPORATE HIERARCHY TREE VISUALIZATION (PAGE 5 REQUIREMENT) */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
          <div className="mb-4">
            <h4 className={`text-base font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
              <Building2 className="w-5 h-5 text-amber-500" />
              <span>Enterprise Hierarchy Map</span>
            </h4>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'} mt-0.5`}>
              A structured visual map representing the parent enterprise holding body and affiliated corporate subsidiaries of this customer.
            </p>
          </div>

          <div className="space-y-6">
            {(() => {
              // 1. Find direct parent if exists
              const parent = currentCustomer.parentId 
                ? customers.find(c => c.id === currentCustomer.parentId) 
                : null;

              // 2. Find direct children
              const directChildren = customers.filter(c => c.parentId === currentCustomer.id);

              return (
                <div className="space-y-4 font-sans">
                  {/* Parent segment (if exists) */}
                  {parent && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-slate-400/20" />
                        <div>
                          <h5 className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                            {parent.name}
                          </h5>
                          <span className="text-[10px] text-gray-500 font-mono">PARENT ENTERPRISE HOLDING BODY (ID: {parent.id})</span>
                        </div>
                      </div>
                      
                      {/* Connector line to Selected Customer */}
                      <div className="pl-1 ml-1 border-l-2 border-dashed border-gray-600/50 h-4" />
                    </div>
                  )}

                  {/* Selected Customer segment (Always visible, highlighted) */}
                  <div className={`p-4 rounded-xl border relative transition-all ${
                    isDark 
                      ? 'bg-[#1E2530] border-[rgb(14,145,145)] ring-2 ring-[rgb(14,145,145)]/20 shadow-lg' 
                      : 'bg-white border-[rgb(14,145,145)] ring-2 ring-[rgb(14,145,145)]/20 shadow-md'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-[rgb(14,145,145)] ring-4 ring-[rgb(14,145,145)]/20" />
                        <div>
                          <h5 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {currentCustomer.name}
                          </h5>
                          <span className="text-[10px] text-[rgb(14,145,145)] font-mono font-bold">SELECTED CUSTOMER (ID: {currentCustomer.id})</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgb(14,145,145)]/15 text-[rgb(14,145,145)] font-mono">
                        Active View
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-2 font-mono">
                      SLA Model: {currentCustomer.supportTier} • Address: {currentCustomer.address}
                    </div>
                  </div>

                  {/* Children segment (if they exist) */}
                  {directChildren.length > 0 && (
                    <div className="space-y-4">
                      {/* Connector line from Selected Customer to Children */}
                      <div className="pl-1 ml-1 border-l-2 border-dashed border-gray-600/50 h-4" />

                      <div className="pl-6 ml-1 border-l-2 border-dashed border-gray-600/50 space-y-3">
                        {directChildren.map(child => (
                          <div key={child.id} className="relative flex items-start gap-3">
                            <div className="absolute -left-[26px] top-3.5 w-4 border-t-2 border-dashed border-gray-600/50" />
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomerId(child.id);
                              }}
                              className={`p-3 rounded-lg border cursor-pointer hover:border-[rgb(14,145,145)] transition-all flex-1 max-w-md ${
                                isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-800'}`}>{child.name}</span>
                              </div>
                              <div className="text-[10px] text-gray-500 font-mono mt-0.5">AFFILIATED SUBSIDIARY • SLA: {child.supportTier}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!parent && directChildren.length === 0 && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg text-center text-slate-400 text-xs italic border border-dashed dark:border-slate-800">
                      This customer has no parent organization or corporate subsidiaries.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* LICENSE CREATION MODAL */}
        {isLicenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsLicenseModalOpen(false)}></div>
            <div className={`relative w-full max-w-md rounded-2xl p-6 border shadow-2xl ${
              isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[rgb(14,145,145)]" />
                  <span>Provision New License</span>
                </h3>
                <button onClick={() => setIsLicenseModalOpen(false)} className="p-1 rounded-lg hover:bg-black/10 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => handleAddLicenseSubmit(e, currentCustomer.id, currentCustomer.name)} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-gray-400 text-[10px] uppercase font-bold block">License Name</label>
                  <input
                    type="text"
                    required
                    value={licenseName}
                    onChange={(e) => setLicenseName(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                    placeholder="e.g. Cyberdyne Cloud Engine Advanced Tier"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 text-[10px] uppercase font-bold block">Product SKU Template</label>
                  <CustomSelect
                    value={selectedProductSku}
                    onChange={(val) => handleProductSkuChange(val)}
                    options={[
                      { value: "", label: "Select base enterprise product..." },
                      ...products.map(p => ({ value: p.sku, label: `${p.name} (${p.sku})` }))
                    ]}
                    isDark={isDark}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase font-bold block">Purchased Seats</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={licensePurchasedUnits}
                      onChange={(e) => setLicensePurchasedUnits(Number(e.target.value))}
                      className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase font-bold block">Active Seats</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={licensePurchasedUnits}
                      value={licenseActiveUnits}
                      onChange={(e) => setLicenseActiveUnits(Number(e.target.value))}
                      className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase font-bold block">Unit Price (Monthly)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500 font-bold">$</span>
                      <input
                        type="number"
                        required
                        min={1}
                        value={licenseUnitPrice}
                        onChange={(e) => setLicenseUnitPrice(Number(e.target.value))}
                        className={`w-full pl-6 pr-2.5 py-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase font-bold block">Duration (Months)</label>
                    <CustomSelect
                      value={String(licenseTermMonths)}
                      onChange={(val) => setLicenseTermMonths(Number(val))}
                      options={[
                        { value: "1", label: "1 Month (Trial)" },
                        { value: "6", label: "6 Months (Semi-Annual)" },
                        { value: "12", label: "12 Months (Annual)" },
                        { value: "24", label: "24 Months (2-Year)" },
                        { value: "36", label: "36 Months (3-Year)" }
                      ]}
                      isDark={isDark}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 text-[10px] uppercase font-bold block">Start Date</label>
                  <input
                    type="date"
                    required
                    value={licenseStartDate}
                    onChange={(e) => setLicenseStartDate(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-black/20 border-gray-800' : 'bg-slate-50 border-slate-100'} text-right`}>
                  <span className="text-[10px] text-gray-400 font-bold block">Estimated Project TCV</span>
                  <span className="text-sm font-black text-emerald-500 font-mono">
                    ${(licenseUnitPrice * licensePurchasedUnits * licenseTermMonths).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsLicenseModalOpen(false)}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'} cursor-pointer`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg font-black cursor-pointer"
                  >
                    Provision License
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DOCUMENT PREVIEW MODAL */}
        {previewingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setPreviewingDoc(null)}></div>
            <div className={`relative w-full max-w-xl rounded-2xl p-6 border shadow-2xl ${
              isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex justify-between items-center mb-4 border-b dark:border-gray-800 border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wide">Document Record Preview</h3>
                    <span className="text-[10px] font-mono text-gray-400">ID: {previewingDoc.id}</span>
                  </div>
                </div>
                <button onClick={() => setPreviewingDoc(null)} className="p-1 rounded-lg hover:bg-black/10 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`p-6 rounded-xl border space-y-4 max-h-96 overflow-y-auto ${
                isDark ? 'bg-[#0F1115] border-gray-800 text-gray-200' : 'bg-slate-50 border-slate-100 text-slate-800'
              }`}>
                <div className="text-center pb-4 border-b dark:border-gray-800 border-slate-100 space-y-1">
                  <h2 className="text-base font-extrabold tracking-tight">B&J ENTERPRISE LICENSING BOARD</h2>
                  <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Official Certification Record</span>
                </div>

                <div className="text-xs space-y-2 leading-relaxed">
                  <p>
                    <strong>Subject Asset Title:</strong> <span className="font-mono">{previewingDoc.title}</span>
                  </p>
                  <p>
                    <strong>Category Ledger:</strong> {previewingDoc.category}
                  </p>
                  <p>
                    <strong>Official Release:</strong> {previewingDoc.uploadDate}
                  </p>
                  <p>
                    <strong>Status:</strong> {previewingDoc.isPublished ? 'APPROVED & VERIFIED' : 'PENDING TECHNICAL REVIEW'}
                  </p>
                  <p className="pt-4 text-gray-400 italic">
                    "This certification confirms that Cyberdyne systems SLA tier {currentCustomer.supportTier} conforms with security policies under code developerbe25@gmail.com. Files verified on system launch."
                  </p>
                </div>

                <div className="pt-4 border-t dark:border-gray-800 border-slate-100 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      handleDownloadDocument(previewingDoc);
                      setPreviewingDoc(null);
                    }}
                    className="px-3.5 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Asset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMAIL COMPOSER MODAL */}
        {isEmailModalOpen && emailCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => { setIsEmailModalOpen(false); setEmailCustomer(null); }}></div>
            <div className={`relative w-full max-w-lg rounded-2xl p-6 border shadow-2xl transition-all ${
              isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-dashed dark:border-gray-800 border-slate-100">
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[rgb(14,145,145)]" />
                  <span>Send Email Correspondence</span>
                </h3>
                <button 
                  onClick={() => { setIsEmailModalOpen(false); setEmailCustomer(null); }} 
                  className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-4 text-xs font-semibold">
                {/* Recipient info */}
                <div className="space-y-1">
                  <label className="text-gray-400 text-[10px] uppercase font-bold block">To (Primary Contact Email)</label>
                  <div className={`w-full p-2.5 rounded-lg border flex items-center justify-between font-mono ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="font-bold">{emailCustomer.primaryContactEmail}</span>
                    <span className="text-[10px] opacity-75">({emailCustomer.primaryContactName})</span>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-gray-400 text-[10px] uppercase font-bold block">Subject</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                    placeholder="Enter email subject"
                  />
                </div>

                {/* Message Body */}
                <div className="space-y-1">
                  <label className="text-gray-400 text-[10px] uppercase font-bold block">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-hidden font-sans resize-none ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                    placeholder="Compose message..."
                  />
                </div>

                {/* File Attachment */}
                <div className="space-y-2">
                  <label className="text-gray-400 text-[10px] uppercase font-bold block">Attachment</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      id="email-attachment-input-detail" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setEmailAttachment(e.target.files[0]);
                        }
                      }}
                    />
                    <label 
                      htmlFor="email-attachment-input-detail"
                      className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer text-[11px] font-bold transition-all ${
                        isDark 
                          ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[rgb(14,145,145)]" />
                      <span>Attach File</span>
                    </label>

                    {emailAttachment && (
                      <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-2 border font-mono text-[10px] ${
                        isDark ? 'bg-black/30 border-gray-800 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <span className="truncate max-w-[180px] font-bold">{emailAttachment.name}</span>
                        <span className="opacity-60">({(emailAttachment.size / 1024).toFixed(1)} KB)</span>
                        <button 
                          type="button" 
                          onClick={() => setEmailAttachment(null)}
                          className="text-rose-500 hover:text-rose-600 font-extrabold cursor-pointer text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-2.5 pt-2 border-t border-dashed dark:border-gray-800 border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setIsEmailModalOpen(false); setEmailCustomer(null); }}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'} cursor-pointer`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }


  // ----------------------------------------------------
  // 2. MAIN CUSTOMERS CARD LIST RENDERING
  // ----------------------------------------------------
  return (
    <div className="space-y-6">
      {/* LOCAL TOAST NOTIFICATION */}
      {localToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-950 dark:bg-slate-900 border border-[rgb(14,145,145)]/40 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-[rgb(14,145,145)] animate-pulse" />
          <span className="text-xs font-bold">{localToast}</span>
        </div>
      )}
      
      {/* HEADER CONTROL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-hidden transition-all ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white focus:border-[rgb(14,145,145)]' : 'bg-white border-slate-200 text-slate-800 focus:border-[rgb(14,145,145)] shadow-2xs'}`}
            placeholder="Search enterprise clients..."
          />
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-[rgb(14,145,145)]/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewCustomer}</span>
        </button>
      </div>

      {/* VIEW MODE SELECTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t dark:border-gray-800 pt-3 border-slate-100">
        <div className="text-[11px] text-gray-400 font-mono">
          Showing <span className="font-bold text-slate-800 dark:text-white">{filteredCustomers.length > 0 ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-slate-800 dark:text-white">{Math.min(safeCurrentPage * itemsPerPage, filteredCustomers.length)}</span> of <span className="font-bold">{filteredCustomers.length}</span> active enterprise clients
        </div>

        <div className="flex items-center gap-1.5 border dark:border-gray-800 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/60 self-end sm:self-auto">
          <button
            onClick={() => setCustomerViewMode('list')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              customerViewMode === 'list'
                ? 'bg-[rgb(14,145,145)] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
            }`}
            title="List Layout View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCustomerViewMode('grid')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              customerViewMode === 'grid'
                ? 'bg-[rgb(14,145,145)] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
            }`}
            title="Grid Cards View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CUSTOMERS GRID */}
      <div className={`grid gap-6 ${customerViewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {paginatedCustomers.map(cust => {
          // Find associated products
          const associatedProducts = products.filter(p => p.customerIds.includes(cust.id));
          const isBlocked = cust.status === 'Blocked';

          return (
            <div 
              key={cust.id}
              onClick={() => setSelectedCustomerId(cust.id)}
              className={`group p-6 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-102 hover:shadow-xl hover:shadow-[rgb(14,145,145)]/10 ${
                isBlocked
                  ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50'
                  : isDark 
                    ? 'bg-[#1A1D23] border-[#2D333D] hover:border-[rgb(14,145,145)]/50' 
                    : 'bg-white border-slate-200 shadow-2xs hover:border-[rgb(14,145,145)]'
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* 1. Entity Overview */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg transition-colors duration-300 ${
                      isDark 
                        ? 'bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] group-hover:bg-[rgb(14,145,145)] group-hover:text-white' 
                        : 'bg-[rgb(14,145,145)]/10 text-[rgb(10,115,115)] group-hover:bg-[rgb(12,125,125)] group-hover:text-white'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-black'}`}>
                          {cust.name}
                        </h3>
                        {isBlocked && (
                          <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-rose-500/20 text-rose-500 uppercase tracking-wider">
                            Blocked
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">ID: {cust.id}</span>
                    </div>
                  </div>

                  <div className={`text-xs flex items-start gap-1.5 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span>{cust.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${cust.supportTier === 'Gold Support Model' ? 'bg-amber-500/10 text-amber-500' : 'bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)]'}`}>
                      {cust.supportTier}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid card click drill-down
                        onGoToBilling(cust.name);
                      }}
                      className={`text-[11px] font-bold text-[rgb(14,145,145)] hover:underline flex items-center gap-1 cursor-pointer`}
                    >
                      <span>Contracts & Usage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* CORPORATE HIERARCHY IN-CARD (PAGE 5 REQUIREMENT) */}
                  {(() => {
                    const parent = customers.find(c => c.id === cust.parentId);
                    const children = customers.filter(c => c.parentId === cust.id);
                    if (!parent && children.length === 0) return null;
                    return (
                      <div className="pt-2.5 border-t border-dashed dark:border-gray-800 border-slate-100 space-y-1.5 text-[11px]">
                        {parent && (
                          <div className="flex items-center gap-1.5 text-[rgb(14,145,145)]">
                            <span className="font-extrabold uppercase text-[9px] tracking-wider text-gray-500">Parent Corp:</span>
                            <span className="font-semibold">{parent.name}</span>
                          </div>
                        )}
                        {children.length > 0 && (
                          <div className="space-y-0.5">
                            <span className="font-extrabold uppercase text-[9px] tracking-wider text-gray-500 block mb-0.5">Subsidiaries ({children.length}):</span>
                            <div className="flex flex-wrap gap-1">
                              {children.map(ch => (
                                <span key={ch.id} className={`px-1.5 py-0.5 rounded-sm font-semibold text-[10px] ${isDark ? 'bg-black/20 text-gray-400' : 'bg-slate-100 text-slate-700'}`}>
                                  ↳ {ch.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Actions */}
                <div className="flex items-start justify-end shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => openEditModal(cust, e)}
                      className="p-1.5 rounded-md hover:bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] transition-colors cursor-pointer"
                      title="Modify Client Entity"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBlock(cust);
                      }}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        isBlocked 
                          ? 'hover:bg-emerald-500/10 text-emerald-500' 
                          : 'hover:bg-amber-500/10 text-amber-500'
                      }`}
                      title={isBlocked ? "Unblock Customer" : "Block Customer"}
                    >
                      {isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => openEmailModal(cust, e)}
                      className="p-1.5 rounded-md hover:bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] transition-colors cursor-pointer"
                      title="Send Email to Customer"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCustomer(cust.id)}
                      className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                      title="Delete Customer Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* NOTES BAR */}
              {cust.notes && (
                <div className={`mt-4 p-2.5 rounded-lg border border-dashed text-xs italic ${isDark ? 'bg-black/30 border-gray-800 text-gray-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                  <strong>Operational Notes:</strong> {cust.notes}
                </div>
              )}

              {/* Click to open label */}
              <div className="mt-4 pt-2 border-t dark:border-gray-800 border-slate-100 flex items-center justify-between text-[10px] font-bold text-[rgb(14,145,145)]">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Licensed assets: {contracts.filter(c => c.customerId === cust.id).length} active</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION CONTROLS */}
      {filteredCustomers.length > 0 && (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t ${isDark ? 'border-[#2D333D]' : 'border-slate-200'} text-xs`}>
          <div className="text-slate-500 dark:text-gray-400 font-medium">
            Showing <span className="font-bold text-slate-800 dark:text-white">{(safeCurrentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-800 dark:text-white">{Math.min(safeCurrentPage * itemsPerPage, filteredCustomers.length)}</span> of <span className="font-bold text-slate-800 dark:text-white">{filteredCustomers.length}</span> entries
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button with Arrow */}
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={safeCurrentPage === 1}
              className={`p-2 px-3 rounded-lg border font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                safeCurrentPage === 1
                  ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400 dark:border-[#2D333D]'
                  : isDark 
                    ? 'bg-[#1A1D23] border-[#2D333D] text-white hover:bg-slate-800' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Previous Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pg === safeCurrentPage
                      ? 'bg-[rgb(14,145,145)] text-white shadow-xs font-extrabold'
                      : isDark
                        ? 'bg-[#1A1D23] border border-[#2D333D] text-gray-300 hover:bg-slate-800'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pg}
                </button>
              ))}
            </div>

            {/* Next Button with Arrow */}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              className={`p-2 px-3 rounded-lg border font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                safeCurrentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400 dark:border-[#2D333D]'
                  : isDark 
                    ? 'bg-[#1A1D23] border-[#2D333D] text-white hover:bg-slate-800' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CLIENT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          <div className={`relative w-full max-w-2xl rounded-2xl p-6 border shadow-2xl overflow-y-auto max-h-[90vh] ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base">
                {editingCustomer ? 'Modify Client Profile' : 'Onboard Enterprise Customer'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-black/10 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Core Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Enterprise Legal Name</label>
                  <input 
                    type="text" 
                    required
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Support SLA Level Tier</label>
                  <CustomSelect
                    value={supportTier}
                    onChange={val => setSupportTier(val as any)}
                    options={[
                      { value: "Gold Support Model", label: "Gold Support Model (24/7/365 Continuous)" },
                      { value: "Standard Support Model", label: "Standard Support Model (M-F 9AM-5PM Business Hours)" }
                    ]}
                    isDark={isDark}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Headquarters Address</label>
                  <input 
                    type="text" 
                    required
                    value={address} 
                    onChange={e => setAddress(e.target.value)}
                    className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Parent Organization (Hierarchy)</label>
                  <CustomSelect
                    value={parentId}
                    onChange={val => setParentId(val)}
                    options={[
                      { value: "", label: "None (Top-Level Enterprise Corporate Parent)" },
                      ...customers
                        .filter(c => c.id !== (editingCustomer?.id))
                        .map(c => ({ value: c.id, label: c.name }))
                    ]}
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* Contacts Grid */}
              <div className="border-t pt-4 dark:border-gray-800 border-slate-100">
                <h4 className="font-bold text-[rgb(14,145,145)] mb-2 uppercase tracking-wide">Contacts Matrix</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Primary Contact */}
                  <div className="space-y-2 p-3 rounded-lg border dark:border-gray-800 border-slate-100">
                    <span className="font-bold block text-slate-500 border-b pb-1 dark:border-gray-800">Primary Technical</span>
                    <div className="space-y-1">
                      <label className="block">Name</label>
                      <input 
                        type="text" required value={primaryContactName} onChange={e => setPrimaryContactName(e.target.value)}
                        className={`w-full p-1 rounded border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block">Email</label>
                      <input 
                        type="email" required value={primaryContactEmail} onChange={e => setPrimaryContactEmail(e.target.value)}
                        className={`w-full p-1 rounded border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block">Phone</label>
                      <input 
                        type="text" required value={primaryContactPhone} onChange={e => setPrimaryContactPhone(e.target.value)}
                        className={`w-full p-1 rounded border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>

                  {/* Billing Contact */}
                  <div className="space-y-2 p-3 rounded-lg border dark:border-gray-800 border-slate-100">
                    <span className="font-bold block text-slate-500 border-b pb-1 dark:border-gray-800">Finance & Billing</span>
                    <div className="space-y-1">
                      <label className="block">Name</label>
                      <input 
                        type="text" required value={billingContactName} onChange={e => setBillingContactName(e.target.value)}
                        className={`w-full p-1 rounded border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block">Email</label>
                      <input 
                        type="email" required value={billingContactEmail} onChange={e => setBillingContactEmail(e.target.value)}
                        className={`w-full p-1 rounded border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block">Phone</label>
                      <input 
                        type="text" required value={billingContactPhone} onChange={e => setBillingContactPhone(e.target.value)}
                        className={`w-full p-1 rounded border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>

                  {/* Support Contact */}
                  <div className="space-y-2 p-3 rounded-lg border dark:border-gray-800 border-slate-100">
                    <span className="font-bold block text-slate-500 border-b pb-1 dark:border-gray-800">Active SLA Support</span>
                    <div className="space-y-1">
                      <label className="block">Name</label>
                      <input 
                        type="text" required value={supportContactName} onChange={e => setSupportContactName(e.target.value)}
                        className={`w-full p-1 rounded border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block">Email</label>
                      <input 
                        type="email" required value={supportContactEmail} onChange={e => setSupportContactEmail(e.target.value)}
                        className={`w-full p-1 rounded border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block">Phone</label>
                      <input 
                        type="text" required value={supportContactPhone} onChange={e => setSupportContactPhone(e.target.value)}
                        className={`w-full p-1 rounded border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Additional Operational Notes</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 text-xs">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'} cursor-pointer`}
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

      {/* EMAIL COMPOSER MODAL */}
      {isEmailModalOpen && emailCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => { setIsEmailModalOpen(false); setEmailCustomer(null); }}></div>
          <div className={`relative w-full max-w-lg rounded-2xl p-6 border shadow-2xl transition-all ${
            isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-dashed dark:border-gray-800 border-slate-100">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Mail className="w-5 h-5 text-[rgb(14,145,145)]" />
                <span>Send Email Correspondence</span>
              </h3>
              <button 
                onClick={() => { setIsEmailModalOpen(false); setEmailCustomer(null); }} 
                className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4 text-xs font-semibold">
              {/* Recipient info */}
              <div className="space-y-1">
                <label className="text-gray-400 text-[10px] uppercase font-bold block">To (Primary Contact Email)</label>
                <div className={`w-full p-2.5 rounded-lg border flex items-center justify-between font-mono ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold">{emailCustomer.primaryContactEmail}</span>
                  <span className="text-[10px] opacity-75">({emailCustomer.primaryContactName})</span>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-gray-400 text-[10px] uppercase font-bold block">Subject</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  placeholder="Enter email subject"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <label className="text-gray-400 text-[10px] uppercase font-bold block">Message</label>
                <textarea
                  required
                  rows={6}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-hidden font-sans resize-none ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  placeholder="Compose message..."
                />
              </div>

              {/* File Attachment */}
              <div className="space-y-2">
                <label className="text-gray-400 text-[10px] uppercase font-bold block">Attachment</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    id="email-attachment-input-list" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setEmailAttachment(e.target.files[0]);
                      }
                    }}
                  />
                  <label 
                    htmlFor="email-attachment-input-list"
                    className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer text-[11px] font-bold transition-all ${
                      isDark 
                        ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200' 
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Paperclip className="w-3.5 h-3.5 text-[rgb(14,145,145)]" />
                    <span>Attach File</span>
                  </label>

                  {emailAttachment && (
                    <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-2 border font-mono text-[10px] ${
                      isDark ? 'bg-black/30 border-gray-800 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <span className="truncate max-w-[180px] font-bold">{emailAttachment.name}</span>
                      <span className="opacity-60">({(emailAttachment.size / 1024).toFixed(1)} KB)</span>
                      <button 
                        type="button" 
                        onClick={() => setEmailAttachment(null)}
                        className="text-rose-500 hover:text-rose-600 font-extrabold cursor-pointer text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-dashed dark:border-gray-800 border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsEmailModalOpen(false); setEmailCustomer(null); }}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'} cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
