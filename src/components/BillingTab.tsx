import React, { useState, useMemo, useEffect } from 'react';
import { CustomSelect } from './CustomSelect';
import { 
  TrendingUp, 
  TrendingDown, 
  Info, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  FileText, 
  CreditCard,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  Award,
  Plus,
  Trash2,
  X,
  Filter,
  FileCheck2,
  FileCode2,
  Fingerprint,
  Key,
  Ban,
  Unlock,
  Mail,
  Send,
  Edit3,
  Building2,
  User,
  Layers,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Contract, Customer, Product, HostActivation, ProductBinary, License } from '../types';
import { initialBinaries } from '../data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BillingTabProps {
  contracts: Contract[];
  customers: Customer[];
  products: Product[];
  hostActivations: HostActivation[];
  onAddContract: (contract: Contract) => void;
  onEditContract: (contract: Contract) => void;
  onDeleteContract: (id: string) => void;
  t: Record<string, string>;
  isDark: boolean;
  filterCustomerName?: string; // Preselected filter
  triggerOpenAddModal: boolean;
  onResetTrigger: () => void;

  // PROPS MOVED FOR AUDITABILITY & REORGANIZATION
  licenses: License[];
  onAddLicense: (license: License) => void;
  onEditLicense: (license: License) => void;
  onDeleteLicense: (id: string) => void;
  onAddHostActivation: (activation: HostActivation) => void;
  onEditHostActivation: (activation: HostActivation) => void;
  onDeleteHostActivation: (id: string) => void;
  onSelectCustomer: (customerId: string) => void;
  addAuditLog?: (action: string, details: string, screen: 'Users' | 'Customers' | 'Products' | 'General' | 'Licenses') => void;
}

// HELPER DATE UTILS
const calculateEndDate = (startDateStr: string, months: number): string => {
  if (!startDateStr || isNaN(months) || months <= 0) return '';
  const date = new Date(startDateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return '';
  date.setMonth(date.getMonth() + months);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const calculateDiffInMonths = (startDateStr: string, endDateStr: string): number => {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();
  const totalMonths = yearsDiff * 12 + monthsDiff;
  
  return totalMonths > 0 ? totalMonths : 0;
};

export default function BillingTab({
  contracts,
  customers,
  products,
  hostActivations = [],
  onAddContract,
  onEditContract,
  onDeleteContract,
  t,
  isDark,
  filterCustomerName = '',
  triggerOpenAddModal,
  onResetTrigger,

  licenses,
  onAddLicense,
  onEditLicense,
  onDeleteLicense,
  onAddHostActivation,
  onEditHostActivation,
  onDeleteHostActivation,
  onSelectCustomer,
  addAuditLog
}: BillingTabProps) {
  // SUB-SECTION TAB SELECTION ('reports' | 'activations' | 'licenses')
  const [activeSubSection, setActiveSubSection] = useState<'reports' | 'activations' | 'licenses'>('reports');

  // ==========================================
  // TAB 1: BILLING & REPORTS FILTERS & STATE
  // ==========================================
  const [filterCustomer, setFilterCustomer] = useState(filterCustomerName || 'all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterSku, setFilterSku] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'expired'
  const [filterValue, setFilterValue] = useState('all'); // 'all' | 'under10k' | ...

  // Handle parent customer selection triggers
  useEffect(() => {
    if (filterCustomerName) {
      setFilterCustomer(filterCustomerName);
      setActiveSubSection('reports'); // switch to reports automatically
    }
  }, [filterCustomerName]);

  // Binaries Repository state
  const [binaries, setBinaries] = useState<ProductBinary[]>(initialBinaries);
  const [isBinModalOpen, setIsBinModalOpen] = useState(false);
  const [binFileName, setBinFileName] = useState('');
  const [binVersion, setBinVersion] = useState('');
  const [binSku, setBinSku] = useState('');
  const [binSize, setBinSize] = useState('42.1 MB');
  const [binNotes, setBinNotes] = useState('');
  const [binCustomers, setBinCustomers] = useState<string[]>([]);
  const [selectedArtifactCustomerFilter, setSelectedArtifactCustomerFilter] = useState('all');

  useEffect(() => {
    if (filterCustomerName && filterCustomerName !== 'all') {
      setSelectedArtifactCustomerFilter(filterCustomerName);
    }
  }, [filterCustomerName]);

  // Binary Repository upload / manage functions
  function handleAddBinary(e: React.FormEvent) {
    e.preventDefault();
    const associatedProduct = products.find(p => p.sku === binSku);
    const newBin: ProductBinary = {
      id: `bin-${Date.now()}`,
      fileName: binFileName,
      version: binVersion,
      productSku: binSku,
      productName: associatedProduct ? associatedProduct.name : 'Unknown Product',
      fileSize: binSize || '15.4 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      md5Checksum: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
      targetCustomerIds: binCustomers,
      notes: binNotes
    };
    setBinaries([newBin, ...binaries]);
    setIsBinModalOpen(false);
    setBinFileName('');
    setBinVersion('');
    setBinSku('');
    setBinNotes('');
    setBinCustomers([]);
    
    // Log binary upload action
    addAuditLog?.('Upload Binary Artifact', `Uploaded software build artifact ${binFileName} (v${binVersion}) mapped to SKU: ${binSku}.`, 'General');
  }

  function handleDeleteBinary(id: string) {
    const foundBin = binaries.find(b => b.id === id);
    if (foundBin && confirm(`Are you sure you want to delete ${foundBin.fileName}?`)) {
      setBinaries(binaries.filter(b => b.id !== id));
      addAuditLog?.('Delete Binary Artifact', `Permanently deleted software build artifact reference for ${foundBin.fileName} (v${foundBin.version}).`, 'General');
    }
  }

  function toggleBinCustomer(id: string) {
    setBinCustomers(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  }

  const filteredBinaries = useMemo(() => {
    if (selectedArtifactCustomerFilter === 'all') {
      return binaries;
    }
    return binaries.filter(bin => bin.targetCustomerIds.includes(selectedArtifactCustomerFilter));
  }, [binaries, selectedArtifactCustomerFilter]);

  const handleResetFilters = () => {
    setFilterCustomer('all');
    setFilterProduct('all');
    setFilterSku('all');
    setFilterStatus('all');
    setFilterValue('all');
    addAuditLog?.('Clear Audit Filters', 'Reset multi-dimensional report customizer filters back to defaults.', 'Licenses');
  };

  // Memoized Filtered Contracts for Tab 1
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      if (filterCustomer !== 'all') {
        const matchByName = c.customerName.toLowerCase() === filterCustomer.toLowerCase();
        const matchById = c.customerId === filterCustomer;
        if (!matchByName && !matchById) return false;
      }
      if (filterProduct !== 'all' && c.productName !== filterProduct) {
        return false;
      }
      if (filterSku !== 'all' && c.productSku !== filterSku) {
        return false;
      }
      const today = new Date().toISOString().split('T')[0];
      const isExpired = c.endDate < today;
      if (filterStatus === 'active' && isExpired) return false;
      if (filterStatus === 'expired' && !isExpired) return false;

      const val = c.unitPrice * c.purchasedUnits * c.termMonths;
      if (filterValue === 'under10k' && val >= 10000) return false;
      if (filterValue === '10kto50k' && (val < 10000 || val > 50000)) return false;
      if (filterValue === '50kto150k' && (val < 50000 || val > 150000)) return false;
      if (filterValue === 'over150k' && val <= 150000) return false;

      return true;
    });
  }, [contracts, filterCustomer, filterProduct, filterSku, filterStatus, filterValue]);

  // Checkbox Selection & Pagination state for SLA Agreement Core Records (10 per page)
  const [selectedSlaContractIds, setSelectedSlaContractIds] = useState<string[]>([]);
  const [slaCurrentPage, setSlaCurrentPage] = useState<number>(1);
  const slaItemsPerPage = 10;

  const slaTotalPages = useMemo(() => {
    return Math.ceil(filteredContracts.length / slaItemsPerPage) || 1;
  }, [filteredContracts.length, slaItemsPerPage]);

  const safeSlaCurrentPage = useMemo(() => {
    return Math.min(Math.max(slaCurrentPage, 1), slaTotalPages);
  }, [slaCurrentPage, slaTotalPages]);

  const paginatedSlaContracts = useMemo(() => {
    const start = (safeSlaCurrentPage - 1) * slaItemsPerPage;
    return filteredContracts.slice(start, start + slaItemsPerPage);
  }, [filteredContracts, safeSlaCurrentPage, slaItemsPerPage]);

  const isAllSlaOnPageSelected = useMemo(() => {
    if (paginatedSlaContracts.length === 0) return false;
    return paginatedSlaContracts.every(c => selectedSlaContractIds.includes(c.id));
  }, [paginatedSlaContracts, selectedSlaContractIds]);

  const handleToggleSelectAllSlaOnPage = () => {
    if (isAllSlaOnPageSelected) {
      const pageIds = new Set(paginatedSlaContracts.map(c => c.id));
      setSelectedSlaContractIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const pageIds = paginatedSlaContracts.map(c => c.id);
      setSelectedSlaContractIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectSlaContract = (id: string) => {
    setSelectedSlaContractIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Dynamic calculations for the filtered state
  const totalValue = useMemo(() => {
    return filteredContracts.reduce((sum, c) => sum + (c.unitPrice * c.purchasedUnits * c.termMonths), 0);
  }, [filteredContracts]);

  const totalPurchasedUnits = useMemo(() => {
    return filteredContracts.reduce((sum, c) => sum + c.purchasedUnits, 0);
  }, [filteredContracts]);

  const totalConsumedUnits = useMemo(() => {
    return filteredContracts.reduce((sum, c) => {
      const consumedCount = hostActivations.filter(h => h.contractId === c.id && h.licenseActive).length;
      return sum + consumedCount;
    }, 0);
  }, [filteredContracts, hostActivations]);

  const totalMonthlyRunrate = useMemo(() => {
    return filteredContracts.reduce((sum, c) => sum + (c.unitPrice * c.purchasedUnits), 0);
  }, [filteredContracts]);

  // Map Data for Recharts Bar Graph
  const chartData = useMemo(() => {
    return filteredContracts.map(c => {
      const consumedCount = hostActivations.filter(h => h.contractId === c.id && h.licenseActive).length;
      return {
        name: c.customerName.length > 12 ? `${c.customerName.substring(0, 12)}...` : c.customerName,
        'Purchased Units': c.purchasedUnits,
        'Consumed Units': consumedCount,
        'Contract Value ($)': c.unitPrice * c.purchasedUnits * c.termMonths
      };
    });
  }, [filteredContracts, hostActivations]);


  // ==========================================
  // TAB 2: HOST ACTIVATIONS (GRANULAR AUDIT) STATE & HANDLERS
  // ==========================================
  const [activationSearchQuery, setActivationSearchQuery] = useState('');
  const [activationFilterCustomerId, setActivationFilterCustomerId] = useState('all');
  const [activationFilterContractId, setActivationFilterContractId] = useState('all');

  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [editingActivation, setEditingActivation] = useState<HostActivation | null>(null);

  const [actCustomerId, setActCustomerId] = useState('');
  const [actContractId, setActContractId] = useState('');
  const [actHostId, setActHostId] = useState('');
  const [actLicenseActive, setActLicenseActive] = useState(true);
  const [actStartDate, setActStartDate] = useState('');
  const [actEndDate, setActEndDate] = useState('');
  const [actLicenseKey, setActLicenseKey] = useState('');

  const handleOpenAddActivation = (prefilledContractId?: string) => {
    setEditingActivation(null);
    setActHostId('');
    setActLicenseActive(true);
    
    let initialCust = customers[0]?.id || '';
    let initialCon = '';
    
    if (prefilledContractId) {
      const foundCon = contracts.find(c => c.id === prefilledContractId);
      if (foundCon) {
        initialCust = foundCon.customerId;
        initialCon = foundCon.id;
      }
    } else {
      const custContracts = contracts.filter(c => c.customerId === initialCust);
      if (custContracts.length > 0) {
        initialCon = custContracts[0].id;
      }
    }

    setActCustomerId(initialCust);
    setActContractId(initialCon);
    
    const selectedContractObj = contracts.find(c => c.id === initialCon);
    const today = new Date().toISOString().split('T')[0];
    setActStartDate(selectedContractObj ? selectedContractObj.startDate : today);
    setActEndDate(selectedContractObj ? selectedContractObj.endDate : today);
    setActLicenseKey('');
    
    setIsActivationModalOpen(true);
  };

  const handleActivationCustomerChange = (custId: string) => {
    setActCustomerId(custId);
    const custContracts = contracts.filter(c => c.customerId === custId);
    if (custContracts.length > 0) {
      setActContractId(custContracts[0].id);
      setActStartDate(custContracts[0].startDate);
      setActEndDate(custContracts[0].endDate);
    } else {
      setActContractId('');
      setActStartDate(new Date().toISOString().split('T')[0]);
      setActEndDate(new Date().toISOString().split('T')[0]);
    }
    setActLicenseKey('');
  };

  const handleActivationContractChange = (conId: string) => {
    setActContractId(conId);
    const foundCon = contracts.find(c => c.id === conId);
    if (foundCon) {
      setActStartDate(foundCon.startDate);
      setActEndDate(foundCon.endDate);
    }
    setActLicenseKey('');
  };

  const handleGenerateHostLicenseKey = () => {
    if (!actHostId) {
      alert('Please provide a physical or virtual Host ID first.');
      return;
    }
    const customer = customers.find(c => c.id === actCustomerId);
    const contractObj = contracts.find(c => c.id === actContractId);
    const cleanHostId = actHostId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10);
    const cleanSku = contractObj ? contractObj.productSku.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : 'APP';
    const cleanCust = customer ? customer.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5) : 'CUST';
    
    const generated = `LIC-${cleanSku}-${cleanCust}-${cleanHostId}`;
    setActLicenseKey(generated);
  };

  const handleActivationFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === actCustomerId);
    const contractObj = contracts.find(c => c.id === actContractId);
    
    if (!actContractId) {
      alert('Please select an active contract agreement.');
      return;
    }

    let finalKey = actLicenseKey;
    if (!finalKey) {
      const cleanHostId = actHostId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10);
      const cleanSku = contractObj ? contractObj.productSku.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : 'APP';
      const cleanCust = customer ? customer.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5) : 'CUST';
      finalKey = `LIC-${cleanSku}-${cleanCust}-${cleanHostId}`;
    }

    const payload: HostActivation = {
      id: editingActivation ? editingActivation.id : `act-${Date.now()}`,
      contractId: actContractId,
      contractIsActive: true,
      productId: contractObj ? contractObj.productSku : 'prod-01',
      productSku: contractObj ? contractObj.productSku : 'APP',
      customerId: actCustomerId,
      customerName: customer ? customer.name : 'Unknown Customer',
      productName: contractObj ? contractObj.productName : 'BJ Core Software',
      customerHostId: actHostId,
      licenseKey: finalKey,
      licenseActive: actLicenseActive,
      licenseStartDate: actStartDate,
      licenseEndDate: actEndDate
    };

    if (editingActivation) {
      onEditHostActivation(payload);
      addAuditLog?.('Modify Host Activation', `Modified hardware node register for ${payload.customerName} on hardware Host ID: ${payload.customerHostId}.`, 'Licenses');
    } else {
      onAddHostActivation(payload);
      addAuditLog?.('Register Host Activation', `Registered physical hardware host node ${payload.customerHostId} for ${payload.customerName} under contract ${payload.contractId}.`, 'Licenses');
      
      // Automatically increment contract activeUnits if contract exists
      if (contractObj) {
        const activeCount = hostActivations.filter(h => h.contractId === contractObj.id && h.licenseActive).length + (actLicenseActive ? 1 : 0);
        onEditContract({
          ...contractObj,
          activeUnits: activeCount
        });
      }
    }
    
    setIsActivationModalOpen(false);
  };

  const handleDeactivateActivation = (act: HostActivation) => {
    const updated = { ...act, licenseActive: !act.licenseActive };
    onEditHostActivation(updated);
    
    // Sync contract count
    const contractObj = contracts.find(c => c.id === act.contractId);
    if (contractObj) {
      const activeCount = hostActivations.filter(h => h.contractId === contractObj.id && h.id !== act.id).length + (updated.licenseActive ? 1 : 0);
      onEditContract({
        ...contractObj,
        activeUnits: activeCount
      });
    }

    addAuditLog?.('Deactivate Host License', `Toggled activation of Host ${act.customerHostId} for ${act.customerName} to ${updated.licenseActive ? 'Active' : 'Deactivated'}.`, 'Licenses');
  };

  const handleDeleteHostActivationClick = (id: string) => {
    const act = hostActivations.find(h => h.id === id);
    if (act && confirm('Are you sure you want to delete this host activation audit record?')) {
      onDeleteHostActivation(id);
      addAuditLog?.('Delete Host Activation', `Permanently deleted physical hardware host node register ${act.customerHostId} for customer ${act.customerName}.`, 'Licenses');
      
      // Update contract count
      const contractObj = contracts.find(c => c.id === act.contractId);
      if (contractObj) {
        const activeCount = Math.max(0, hostActivations.filter(h => h.contractId === contractObj.id && h.id !== id && h.licenseActive).length);
        onEditContract({
          ...contractObj,
          activeUnits: activeCount
        });
      }
    }
  };

  const filteredActivations = useMemo(() => {
    return hostActivations.filter(act => {
      if (activationFilterCustomerId !== 'all' && act.customerId !== activationFilterCustomerId) return false;
      if (activationFilterContractId !== 'all' && act.contractId !== activationFilterContractId) return false;
      
      const q = activationSearchQuery.toLowerCase();
      if (!q) return true;
      return (
        act.customerHostId.toLowerCase().includes(q) ||
        act.licenseKey.toLowerCase().includes(q) ||
        act.customerName.toLowerCase().includes(q) ||
        act.productName.toLowerCase().includes(q) ||
        act.productSku.toLowerCase().includes(q)
      );
    });
  }, [hostActivations, activationSearchQuery, activationFilterCustomerId, activationFilterContractId]);


  // ==========================================
  // TAB 3: SEAT ALLOCATIONS (LEGACY) STATE & HANDLERS
  // ==========================================
  const [licenseSearchQuery, setLicenseSearchQuery] = useState('');

  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);

  const [formCompanyId, setFormCompanyId] = useState('');
  const [formAuthPerson, setFormAuthPerson] = useState('');
  const [formLicenseKey, setFormLicenseKey] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formCustomerUnitPrice, setFormCustomerUnitPrice] = useState<number>(0);
  const [formTermStartDate, setFormTermStartDate] = useState('');
  const [formTermMonths, setFormTermMonths] = useState<number | ''>('');
  const [formTermEndDate, setFormTermEndDate] = useState('');
  const [formInitialAuthState, setFormInitialAuthState] = useState<'Active' | 'Blocked' | 'POC'>('Active');

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailLicense, setEmailLicense] = useState<License | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const handleOpenAddLicenseModal = () => {
    setEditingLicense(null);
    const firstCust = customers[0];
    setFormCompanyId(firstCust?.id || '');
    setFormAuthPerson(firstCust?.primaryContactName || '');
    setFormEmail(firstCust?.primaryContactEmail || '');
    const firstProd = products[0];
    const initialSku = firstProd?.sku || '';
    setFormSku(initialSku);
    
    const initialPrice = firstProd?.unitPrice || 0;
    setFormCustomerUnitPrice(initialPrice);
    
    setFormLicenseKey(Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase());
    
    const today = new Date().toISOString().split('T')[0];
    setFormTermStartDate(today);
    setFormTermMonths(12);
    setFormTermEndDate(calculateEndDate(today, 12));
    setFormInitialAuthState('Active');
    setFormIsActive(true);
    setIsLicenseModalOpen(true);
  };

  const handleOpenEditLicenseModal = (license: License) => {
    setEditingLicense(license);
    setFormCompanyId(license.companyId);
    setFormAuthPerson(license.authPerson);
    setFormEmail(license.email);
    setFormSku(license.sku);
    setFormLicenseKey(license.licenseKey);
    setFormIsActive(license.isActive);
    
    const initialPrice = license.customerUnitPrice !== undefined 
      ? license.customerUnitPrice 
      : (products.find(p => p.sku === license.sku)?.unitPrice || 0);
    setFormCustomerUnitPrice(initialPrice);
    
    const startDate = license.termStartDate || license.renewalDate || new Date().toISOString().split('T')[0];
    setFormTermStartDate(startDate);
    
    const months = license.termMonths !== undefined ? license.termMonths : 12;
    setFormTermMonths(months);
    
    const endDate = license.termEndDate || license.renewalDate || calculateEndDate(startDate, months);
    setFormTermEndDate(endDate);
    
    setFormInitialAuthState(license.initialAuthState || (license.isActive ? 'Active' : 'Blocked'));
    
    setIsLicenseModalOpen(true);
  };

  const handleCompanyChange = (companyId: string) => {
    setFormCompanyId(companyId);
    const selectedCompany = customers.find(c => c.id === companyId);
    if (selectedCompany) {
      setFormAuthPerson(selectedCompany.primaryContactName);
      setFormEmail(selectedCompany.primaryContactEmail);
    }
  };

  const handleSkuChange = (sku: string) => {
    setFormSku(sku);
    const selectedProduct = products.find(p => p.sku === sku);
    if (selectedProduct) {
      setFormCustomerUnitPrice(selectedProduct.unitPrice);
    }
  };

  const handleStartDateChange = (val: string) => {
    setFormTermStartDate(val);
    if (val && formTermMonths !== '' && Number(formTermMonths) > 0) {
      const calculatedEnd = calculateEndDate(val, Number(formTermMonths));
      setFormTermEndDate(calculatedEnd);
    }
  };

  const handleTermMonthsChange = (val: string) => {
    const months = val === '' ? '' : parseInt(val, 10);
    setFormTermMonths(months);
    if (formTermStartDate && months !== '' && Number(months) > 0) {
      const calculatedEnd = calculateEndDate(formTermStartDate, Number(months));
      setFormTermEndDate(calculatedEnd);
    } else {
      setFormTermEndDate('');
    }
  };

  const handleEndDateChange = (val: string) => {
    setFormTermEndDate(val);
    if (formTermStartDate && val) {
      const calculatedMonths = calculateDiffInMonths(formTermStartDate, val);
      setFormTermMonths(calculatedMonths);
    }
  };

  const handleLicenseFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCompany = customers.find(c => c.id === formCompanyId);
    const companyName = selectedCompany ? selectedCompany.name : 'Unknown Company';
    const selectedProduct = products.find(p => p.sku === formSku);
    const listPrice = selectedProduct?.unitPrice || 0;

    const renewalDateValue = formTermEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const licensePayload: License = {
      id: editingLicense ? editingLicense.id : `lic-${Date.now()}`,
      companyId: formCompanyId,
      companyName,
      authPerson: formAuthPerson,
      licenseKey: formLicenseKey,
      sku: formSku,
      renewalDate: renewalDateValue,
      email: formEmail,
      isActive: formIsActive,
      listPrice,
      customerUnitPrice: formCustomerUnitPrice,
      termStartDate: formTermStartDate,
      termMonths: formTermMonths === '' ? undefined : Number(formTermMonths),
      termEndDate: formTermEndDate,
      initialAuthState: formInitialAuthState
    };

    if (editingLicense) {
      onEditLicense(licensePayload);
      addAuditLog?.('Modify Seat Allocation', `Modified legacy seat key ${licensePayload.licenseKey} allocations for corporate customer ${licensePayload.companyName}.`, 'Licenses');
    } else {
      onAddLicense(licensePayload);
      addAuditLog?.('Issue Seat License', `Issued brand new legacy seat key ${licensePayload.licenseKey} assigned to ${licensePayload.companyName} (${licensePayload.authPerson}).`, 'Licenses');
    }
    setIsLicenseModalOpen(false);
  };

  const handleToggleLicenseStatus = (license: License) => {
    const updated = {
      ...license,
      isActive: !license.isActive
    };
    onEditLicense(updated);
    addAuditLog?.('Toggle Seat License Status', `Changed legacy seat license key ${license.licenseKey} status to ${updated.isActive ? 'Active' : 'Blocked'}.`, 'Licenses');
  };

  const handleOpenEmailModal = (license: License) => {
    setEmailLicense(license);
    setEmailSubject(`Action Required: License Renewal Notification (${license.sku})`);
    setEmailMessage(
      `Hello ${license.authPerson},\n\nThis is an automated notification regarding your B&J platform license assigned to ${license.companyName}.\n\nYour license key: ${license.licenseKey}\nProduct SKU: ${license.sku}\nRenewal Date: ${license.renewalDate}\n\nPlease reach out to your Account Executive or reply to this email to coordinate your contract extension.\n\nBest Regards,\nEnterprise Operations Team\nB&J Cloud Systems`
    );
    setEmailSuccess(false);
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSuccess(true);
      if (emailLicense) {
        addAuditLog?.(
          'Dispatch Email', 
          `Published Renewal Notification to ${emailLicense.authPerson} <${emailLicense.email}> for product license key ${emailLicense.licenseKey} (SKU: ${emailLicense.sku}).`, 
          'Licenses'
        );
      }
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailSuccess(false);
        setEmailLicense(null);
      }, 1500);
    }, 1000);
  };

  const filteredLicenses = useMemo(() => {
    return licenses.filter((lic) => {
      const q = licenseSearchQuery.toLowerCase();
      if (!q) return true;
      return (
        lic.companyName.toLowerCase().includes(q) ||
        lic.authPerson.toLowerCase().includes(q) ||
        lic.licenseKey.toLowerCase().includes(q) ||
        lic.sku.toLowerCase().includes(q) ||
        (lic.email && lic.email.toLowerCase().includes(q))
      );
    });
  }, [licenses, licenseSearchQuery]);


  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {activeSubSection === 'reports' ? (
              <>
                <Briefcase className="w-5 h-5 text-[rgb(14,145,145)]" />
                <span>Audits</span>
              </>
            ) : activeSubSection === 'activations' ? (
              <>
                <Fingerprint className="w-5 h-5 text-[rgb(14,145,145)]" />
                <span>Host Activations (Granular Audit)</span>
              </>
            ) : (
              <>
                <Key className="w-5 h-5 text-[rgb(14,145,145)]" />
                <span>Seat Allocations (Legacy)</span>
              </>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-medium">
            {activeSubSection === 'reports' 
              ? "Conduct multi-dimensional audit queries, review resource consumption metrics, and verify physical deployment versus agreed license contracts."
              : activeSubSection === 'activations'
              ? "Tying single purchased license keys to physical MAC addresses or logical Host IDs. Ensure customer hardware usage never exceeds agreement terms."
              : "Track, issue, and manage physical or logical floating seat allocation licenses for legacy software versions."
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {activeSubSection === 'reports' && (
            <button
              onClick={handleResetFilters}
              className={`px-4 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isDark 
                  ? 'bg-[#1A1D23] border-[#2D333D] hover:border-gray-700 text-gray-300' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Filter Criteria</span>
            </button>
          )}

          {activeSubSection === 'activations' && (
            <button
              onClick={() => handleOpenAddActivation()}
              className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-[rgb(14,145,145)]/10 transition-all cursor-pointer shrink-0 animate-fade-in"
            >
              <Plus className="w-4 h-4" />
              <span>Activate Host Unit</span>
            </button>
          )}

          {activeSubSection === 'licenses' && (
            <button
              onClick={handleOpenAddLicenseModal}
              className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-[rgb(14,145,145)]/10 transition-all cursor-pointer shrink-0 animate-fade-in"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Legacy Seat Key</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-SECTION TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 dark:border-[#2D333D] gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubSection('reports')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubSection === 'reports'
              ? 'border-[rgb(14,145,145)] text-[rgb(14,145,145)] bg-slate-50 dark:bg-slate-900/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Billing & Usage Reports</span>
        </button>

        <button
          onClick={() => setActiveSubSection('activations')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubSection === 'activations'
              ? 'border-[rgb(14,145,145)] text-[rgb(14,145,145)] bg-slate-50 dark:bg-slate-900/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Host Activations (Granular Audit)</span>
        </button>

        <button
          onClick={() => setActiveSubSection('licenses')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubSection === 'licenses'
              ? 'border-[rgb(14,145,145)] text-[rgb(14,145,145)] bg-slate-50 dark:bg-slate-900/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Seat Allocations (Legacy)</span>
        </button>
      </div>


      {/* ==========================================================
          SUBSECTION 1: BILLING & USAGE REPORTS (ORIGINAL)
          ========================================================== */}
      {activeSubSection === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          {/* MULTI-CRITERIA AUDITING FILTER BOX */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Report Customizer Controls</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {/* Customer filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Customer Corporate
                </label>
                <CustomSelect
                  value={filterCustomer}
                  onChange={setFilterCustomer}
                  options={[
                    { value: 'all', label: 'All Customers' },
                    ...customers.map(c => ({ value: c.id, label: c.name }))
                  ]}
                  isDark={isDark}
                />
              </div>

              {/* Product filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Product Module
                </label>
                <CustomSelect
                  value={filterProduct}
                  onChange={setFilterProduct}
                  options={[
                    { value: 'all', label: 'All Products' },
                    ...Array.from(new Set(products.map(p => p.name))).map(name => ({ value: name, label: name }))
                  ]}
                  isDark={isDark}
                />
              </div>

              {/* SKU filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Product SKU
                </label>
                <CustomSelect
                  value={filterSku}
                  onChange={setFilterSku}
                  options={[
                    { value: 'all', label: 'All SKUs' },
                    ...products.map(p => ({ value: p.sku, label: p.sku }))
                  ]}
                  isDark={isDark}
                />
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Contract Status
                </label>
                <CustomSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'active', label: 'Active Contracts Only' },
                    { value: 'expired', label: 'Expired / Closed' }
                  ]}
                  isDark={isDark}
                />
              </div>

              {/* Value filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Contract Value Range
                </label>
                <CustomSelect
                  value={filterValue}
                  onChange={setFilterValue}
                  options={[
                    { value: 'all', label: 'All Price Values' },
                    { value: 'under10k', label: 'Under $10,000' },
                    { value: '10kto50k', label: '$10k to $50,000' },
                    { value: '50kto150k', label: '$50k to $150,000' },
                    { value: 'over150k', label: 'Over $150,000' }
                  ]}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>

          {/* QUICK STATUS INDICATOR TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Contract Value</p>
                  <p className="text-xl font-black mt-1 text-[rgb(14,145,145)]">${totalValue.toLocaleString()}</p>
                </div>
                <span className="p-2 rounded-lg bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)]">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Monthly Run-rate</p>
                  <p className="text-xl font-black mt-1 text-teal-500">${totalMonthlyRunrate.toLocaleString()}/mo</p>
                </div>
                <span className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Agreed Seat Capacity</p>
                  <p className="text-xl font-black mt-1 text-indigo-500">{totalPurchasedUnits.toLocaleString()} Seats</p>
                </div>
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Award className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Consumed License Units</p>
                  <p className="text-xl font-black mt-1 text-emerald-500">{totalConsumedUnits.toLocaleString()} Active</p>
                </div>
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Cpu className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* CHARTS CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Purchased vs Consumed Units Bar Chart */}
            <div className={`p-6 rounded-xl border lg:col-span-2 transition-all duration-300 ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Audit Metrics (Purchased Capacity vs. Hardware Consumption)
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-slate-400'} mt-0.5`}>
                    Compare agreed purchased license capacities with actual granular physical/virtual active host nodes.
                  </p>
                </div>
                {totalConsumedUnits > totalPurchasedUnits && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                    <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> Capacity Overflow
                  </span>
                )}
              </div>

              <div className="h-64 text-xs font-mono">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 italic">No contract parameters aligned with the filter criteria.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2D333D' : '#F1F5F9'} />
                      <XAxis dataKey="name" stroke={isDark ? '#9CA3AF' : '#64748B'} fontSize={10} />
                      <YAxis stroke={isDark ? '#9CA3AF' : '#64748B'} fontSize={10} />
                      <Tooltip 
                        cursor={false}
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1A1D23' : '#FFFFFF', 
                          borderColor: isDark ? '#2D333D' : '#E2E8F0',
                          color: isDark ? '#FFFFFF' : '#0F172A'
                        }} 
                        itemStyle={{
                          color: isDark ? '#F3F4F6' : '#1F2937'
                        }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey="Purchased Units" fill="rgb(14,145,145)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Consumed Units" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* License Allocation Efficiency Breakdown */}
            <div className={`p-6 rounded-xl border flex flex-col justify-between ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
              <div className="space-y-4">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                  Tenant SLA Allocation Utilization Rate
                </h4>
                
                <div className="space-y-4 text-xs">
                  {filteredContracts.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-8">No SLA data available.</p>
                  ) : (
                    filteredContracts.map(con => {
                      const consumed = hostActivations.filter(h => h.contractId === con.id && h.licenseActive).length;
                      const efficiency = con.purchasedUnits > 0 ? ((consumed / con.purchasedUnits) * 100).toFixed(1) : '0.0';
                      const floatEff = parseFloat(efficiency);

                      return (
                        <div key={con.id} className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="truncate max-w-[150px]">{con.customerName}</span>
                            <span className={floatEff > 100 ? 'text-rose-500 font-extrabold' : floatEff > 80 ? 'text-amber-500' : 'text-[rgb(14,145,145)]'}>
                              {efficiency}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                floatEff > 100 ? 'bg-rose-500' : floatEff > 80 ? 'bg-amber-500' : 'bg-[rgb(14,145,145)]'
                              }`} 
                              style={{ width: `${Math.min(100, floatEff)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                            <span>{consumed} node activations</span>
                            <span>{con.purchasedUnits} capacity limit</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="text-[10px] text-gray-400 border-t pt-4 dark:border-gray-800 flex items-start gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Ratios exceeding 100% indicate physical hardware node deployments in excess of current contract thresholds.</span>
              </div>
            </div>
          </div>

          {/* TABLE: BILLING AGREEMENTS AUDIT trail */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
            <h3 className="text-sm font-extrabold mb-4 flex items-center gap-2">
              <FileCheck2 className="w-4.5 h-4.5 text-[rgb(14,145,145)]" />
              <span>SLA Agreement Core Records ({filteredContracts.length})</span>
            </h3>

            {/* BULK ACTION BAR WHEN SLA ITEMS CHECKED */}
            {selectedSlaContractIds.length > 0 && (
              <div className="flex items-center justify-between p-3 px-4 mb-4 bg-[rgb(14,145,145)]/10 border border-[rgb(14,145,145)]/30 rounded-xl text-xs font-bold text-[rgb(14,145,145)]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{selectedSlaContractIds.length} SLA agreement record(s) selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSlaContractIds([])}
                    className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-200 cursor-pointer font-bold transition-all"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[10px] uppercase font-mono tracking-wider font-bold ${isDark ? 'text-gray-400' : 'text-slate-500 bg-slate-50'}`}>
                    <th className="px-3 py-3 text-center w-10">
                      <input 
                        type="checkbox" 
                        checked={isAllSlaOnPageSelected}
                        onChange={handleToggleSelectAllSlaOnPage}
                        className="w-4 h-4 rounded border-slate-300 text-[rgb(14,145,145)] focus:ring-[rgb(14,145,145)] cursor-pointer"
                        title="Select all on current page"
                      />
                    </th>
                    <th className="px-3 py-3 text-center w-14">S.No</th>
                    <th className="px-4 py-3">Client Corporate</th>
                    <th className="px-4 py-3">Agreement Reference</th>
                    <th className="px-4 py-3">Product Module</th>
                    <th className="px-4 py-3 text-right">Negotiated Seat Price</th>
                    <th className="px-4 py-3 text-center">Seat Capacity</th>
                    <th className="px-4 py-3 text-center">Host Active Nodes</th>
                    <th className="px-4 py-3 text-right">Calculated Contract Value</th>
                    <th className="px-4 py-3 text-center">Contract Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                  {filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500 italic">No agreements matched current filter specifications.</td>
                    </tr>
                  ) : (
                    paginatedSlaContracts.map((con, index) => {
                      const today = new Date().toISOString().split('T')[0];
                      const isExpired = con.endDate < today;
                      const activeNodes = hostActivations.filter(h => h.contractId === con.id && h.licenseActive).length;
                      const serialNumber = (safeSlaCurrentPage - 1) * slaItemsPerPage + index + 1;

                      return (
                        <tr key={con.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/10 transition-colors">
                          <td className="px-3 py-3.5 text-center w-10">
                            <input 
                              type="checkbox" 
                              checked={selectedSlaContractIds.includes(con.id)}
                              onChange={() => handleToggleSelectSlaContract(con.id)}
                              className="w-4 h-4 rounded border-slate-300 text-[rgb(14,145,145)] focus:ring-[rgb(14,145,145)] cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                            #{serialNumber}
                          </td>
                          <td className="px-4 py-3.5 font-bold">{con.customerName}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-gray-300">{con.name}</td>
                          <td className="px-4 py-3.5 font-mono">{con.productSku}</td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold">${con.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3.5 text-center font-bold text-slate-800 dark:text-white">{con.purchasedUnits}</td>
                          <td className="px-4 py-3.5 text-center font-bold font-mono">
                            <span className={`px-2 py-0.5 rounded-sm ${
                              activeNodes > con.purchasedUnits 
                                ? 'bg-rose-500/10 text-rose-500 font-extrabold' 
                                : activeNodes === con.purchasedUnits 
                                ? 'bg-amber-500/10 text-amber-500' 
                                : 'bg-emerald-500/10 text-emerald-500'
                            }`}>
                              {activeNodes} / {con.purchasedUnits}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-500">
                            ${(con.unitPrice * con.purchasedUnits * con.termMonths).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono">
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono">
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* SLA PAGINATION CONTROLS */}
            {filteredContracts.length > 0 && (
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t ${isDark ? 'border-[#2D333D]' : 'border-slate-200'} text-xs`}>
                <div className="text-slate-500 dark:text-gray-400 font-medium">
                  Showing <span className="font-bold text-slate-800 dark:text-white">{(safeSlaCurrentPage - 1) * slaItemsPerPage + 1}</span> to <span className="font-bold text-slate-800 dark:text-white">{Math.min(safeSlaCurrentPage * slaItemsPerPage, filteredContracts.length)}</span> of <span className="font-bold text-slate-800 dark:text-white">{filteredContracts.length}</span> records
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button with Arrow */}
                  <button
                    onClick={() => setSlaCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={safeSlaCurrentPage === 1}
                    className={`p-2 px-3 rounded-lg border font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      safeSlaCurrentPage === 1
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
                    {Array.from({ length: slaTotalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setSlaCurrentPage(pg)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          pg === safeSlaCurrentPage
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
                    onClick={() => setSlaCurrentPage(p => Math.min(p + 1, slaTotalPages))}
                    disabled={safeSlaCurrentPage === slaTotalPages}
                    className={`p-2 px-3 rounded-lg border font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      safeSlaCurrentPage === slaTotalPages
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
          </div>

          {/* SECTION 4: BINARIES REGISTRY (Page 4) */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <FileCode2 className="w-4.5 h-4.5 text-[rgb(14,145,145)]" />
                  <span>Licensed Software Binary Repository</span>
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-slate-400'} mt-0.5 font-medium`}>
                  Restricted deployment artifacts vault. Manage build binaries, map client permissions, and review md5 integrity hashes.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="w-40 text-xs font-medium">
                  <CustomSelect
                    value={selectedArtifactCustomerFilter}
                    onChange={setSelectedArtifactCustomerFilter}
                    options={[
                      { value: 'all', label: 'All Artifact Access' },
                      ...customers.map(c => ({ value: c.id, label: c.name }))
                    ]}
                    isDark={isDark}
                  />
                </div>
                <button
                  onClick={() => setIsBinModalOpen(true)}
                  className="px-3 py-1.5 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Binary</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBinaries.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-gray-500 italic border border-dashed rounded-lg">
                  No binary builds mapped to this client's license permissions.
                </div>
              ) : (
                filteredBinaries.map(bin => {
                  const matchingProd = products.find(p => p.sku === bin.productSku);
                  return (
                    <div 
                      key={bin.id} 
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        isDark ? 'bg-[#0F1115] border-gray-800' : 'bg-slate-50/50 border-slate-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-mono font-bold text-[rgb(14,145,145)] bg-[rgb(14,145,145)]/10 px-2 py-0.5 rounded-full">
                              v{bin.version}
                            </span>
                            <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-1.5">{bin.fileName}</h4>
                          </div>
                          <span className="text-[11px] font-mono text-gray-400">{bin.fileSize}</span>
                        </div>

                        <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">{bin.notes || 'No description notes provided.'}</p>

                        <div className="mt-3 space-y-1 text-[11px] font-mono">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Target SKU:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">{bin.productSku}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">MD5 Checksum:</span>
                            <span className="text-slate-500 truncate max-w-[180px]" title={bin.md5Checksum}>{bin.md5Checksum}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Permissioned Tenants:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">
                              {bin.targetCustomerIds.length === 0 
                                ? 'Global Registry' 
                                : `${bin.targetCustomerIds.length} customer tier${bin.targetCustomerIds.length > 1 ? 's' : ''}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t dark:border-gray-800/80 border-slate-200/50">
                        <span className="text-[10px] text-gray-400 font-mono">Uploaded: {bin.uploadDate}</span>
                        <button
                          onClick={() => handleDeleteBinary(bin.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                          title="Delete Binary artifact"
                        >
                          <Trash2 className="w-4 h-4" />
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


      {/* ==========================================================
          SUBSECTION 2: HOST ACTIVATIONS (GRANULAR AUDIT)
          ========================================================== */}
      {activeSubSection === 'activations' && (
        <div className="space-y-6 animate-fade-in">
          {/* MULTI-CRITERIA AUDITING CONTROLS */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Filter Corporate Client</label>
                <CustomSelect
                  value={activationFilterCustomerId}
                  onChange={(val) => {
                    setActivationFilterCustomerId(val);
                    setActivationFilterContractId('all');
                  }}
                  options={[
                    { value: 'all', label: 'All Corporate Clients' },
                    ...customers.map(c => ({ value: c.id, label: c.name }))
                  ]}
                  isDark={isDark}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Filter SLA Contract</label>
                <CustomSelect
                  value={activationFilterContractId}
                  onChange={setActivationFilterContractId}
                  options={[
                    { value: 'all', label: 'All Contract Agreements' },
                    ...contracts
                      .filter(c => activationFilterCustomerId === 'all' || c.customerId === activationFilterCustomerId)
                      .map(c => ({ value: c.id, label: `${c.id} - ${c.productName}` }))
                  ]}
                  isDark={isDark}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Search Hardware Elements</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={activationSearchQuery}
                    onChange={(e) => setActivationSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-hidden transition-all ${
                      isDark 
                        ? 'bg-[#0F1115] border-[#2D333D] text-white focus:border-[rgb(14,145,145)]' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[rgb(14,145,145)]'
                    }`}
                    placeholder="Search host keys, MAC addresses..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE HOST REGISTRIES */}
          <div className={`border rounded-xl overflow-hidden shadow-2xs ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[10px] uppercase font-mono tracking-wider font-extrabold ${isDark ? 'bg-[#0F1115]/60 border-[#2D333D] text-gray-400' : 'bg-slate-50/70 border-slate-100 text-slate-500'}`}>
                    <th className="px-5 py-3.5">Corporate Client</th>
                    <th className="px-5 py-3.5 font-mono">Contract ID</th>
                    <th className="px-5 py-3.5">Product Module</th>
                    <th className="px-5 py-3.5">SKU</th>
                    <th className="px-5 py-3.5">Physical Host ID</th>
                    <th className="px-5 py-3.5 font-mono">Platform License Key</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5">Active From</th>
                    <th className="px-5 py-3.5">Active To</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#2D333D]">
                  {filteredActivations.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-5 py-12 text-center text-slate-400 dark:text-gray-500 font-medium">
                        <Fingerprint className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700 animate-pulse" />
                        <span className="block font-bold">No Granular Host Activations Registered.</span>
                        <span className="text-[10px] text-gray-400 block mt-1">Select an active contract, configure physical host attributes and click "Activate Host Unit" to verify physical instances.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredActivations.map((act) => (
                      <tr key={act.id} className={`hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors ${!act.licenseActive ? 'opacity-60 bg-red-500/5' : ''}`}>
                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                          {act.customerName}
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-[rgb(14,145,145)]">
                          {act.contractId}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">
                          {act.productName}
                        </td>
                        <td className="px-5 py-4 font-mono text-gray-400">
                          {act.productSku}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border dark:border-slate-800 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {act.customerHostId}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-extrabold border border-indigo-100 dark:border-indigo-950">
                            {act.licenseKey}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {act.licenseActive ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[9px] font-black uppercase font-mono tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-[9px] font-black uppercase font-mono tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>Inactive</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-gray-400">
                          {act.licenseStartDate}
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-gray-400">
                          {act.licenseEndDate}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDeactivateActivation(act)}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                act.licenseActive 
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20' 
                                  : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                              }`}
                              title={act.licenseActive ? 'Deactivate physical node' : 'Re-activate physical node'}
                            >
                              {act.licenseActive ? <Ban className="w-4.5 h-4.5" /> : <Unlock className="w-4.5 h-4.5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteHostActivationClick(act.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                              title="Remove hardware host register"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
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


      {/* ==========================================================
          SUBSECTION 3: SEAT ALLOCATIONS (LEGACY)
          ========================================================== */}
      {activeSubSection === 'licenses' && (
        <div className="space-y-6 animate-fade-in">
          {/* QUICK STATUS OVERVIEW GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Active Keys</p>
              <p className="text-2xl font-black mt-1 text-emerald-500">{licenses.filter(l => l.isActive).length}</p>
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Blocked / Expired</p>
              <p className="text-2xl font-black mt-1 text-rose-500">{licenses.filter(l => !l.isActive).length}</p>
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Expiring in 60 Days</p>
              <p className="text-2xl font-black mt-1 text-amber-500">
                {licenses.filter(l => {
                  const renewal = new Date(l.renewalDate).getTime();
                  const limit = Date.now() + 60 * 24 * 60 * 60 * 1000;
                  return renewal > Date.now() && renewal < limit;
                }).length}
              </p>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={licenseSearchQuery}
              onChange={(e) => setLicenseSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-hidden transition-all ${
                isDark 
                  ? 'bg-[#0F1115] border-[#2D333D] text-white focus:border-[rgb(14,145,145)]' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[rgb(14,145,145)]'
              }`}
              placeholder="Search by company, authorized contact person, license key, or SKU..."
            />
          </div>

          {/* LICENSE TABLE */}
          <div className={`border rounded-xl overflow-hidden shadow-2xs ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[10px] uppercase tracking-wider font-mono font-extrabold ${isDark ? 'bg-[#0F1115]/60 border-[#2D333D] text-gray-400' : 'bg-slate-50/70 border-slate-100 text-slate-500'}`}>
                    <th className="px-5 py-3.5 text-center w-12">S/No.</th>
                    <th className="px-5 py-3.5">Company Name</th>
                    <th className="px-5 py-3.5">Authorized Contact</th>
                    <th className="px-5 py-3.5 font-mono">License Key</th>
                    <th className="px-5 py-3.5">SKU</th>
                    <th className="px-5 py-3.5">Renewal Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#2D333D]">
                  {filteredLicenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-slate-400 dark:text-gray-500">
                        <Key className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                        <span>No product licenses matched your query.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredLicenses.map((lic, index) => {
                      const isExpiringSoon = (() => {
                        const renewal = new Date(lic.renewalDate).getTime();
                        const limit = Date.now() + 60 * 24 * 60 * 60 * 1000;
                        return renewal > Date.now() && renewal < limit;
                      })();

                      return (
                        <tr key={lic.id} className={`hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors ${!lic.isActive ? 'opacity-70' : ''}`}>
                          <td className="px-5 py-4 text-center font-bold text-slate-400 font-mono">
                            {index + 1}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => onSelectCustomer(lic.companyId)}
                              className="font-extrabold text-black dark:text-white hover:underline flex items-center gap-1.5 cursor-pointer text-left focus:outline-hidden"
                            >
                              <Building2 className="w-3.5 h-3.5 shrink-0 opacity-70 text-[rgb(14,145,145)]" />
                              <span>{lic.companyName}</span>
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => onSelectCustomer(lic.companyId)}
                              className="font-medium text-slate-700 dark:text-slate-200 hover:text-black hover:underline flex items-center gap-1.5 text-left cursor-pointer focus:outline-hidden"
                            >
                              <User className="w-3.5 h-3.5 shrink-0 opacity-60 text-slate-400" />
                              <span>{lic.authPerson}</span>
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-black dark:text-white bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md text-xs font-mono">
                              {lic.licenseKey}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono text-[11px]">
                            {lic.sku}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className={`w-3.5 h-3.5 ${isExpiringSoon ? 'text-amber-500' : 'text-slate-400'}`} />
                              <span className={`font-medium ${isExpiringSoon ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-gray-300'}`}>
                                {lic.termEndDate || lic.renewalDate}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {lic.isActive ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                <span>Blocked</span>
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEmailModal(lic)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-black hover:bg-slate-50 dark:bg-slate-900/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer"
                                title="Send Renewal Email"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleLicenseStatus(lic)}
                                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                  lic.isActive 
                                    ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20' 
                                    : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                                  }`}
                                title={lic.isActive ? 'Block License Key' : 'Unblock License Key'}
                              >
                                {lic.isActive ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleOpenEditLicenseModal(lic)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all cursor-pointer"
                                title="Edit License Settings"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this seat register?')) {
                                    onDeleteLicense(lic.id);
                                    addAuditLog?.('Delete Seat License', `Permanently deleted legacy license record key: ${lic.licenseKey}`, 'Licenses');
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                                title="Permanently Delete Key"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODALS & DIALOG LAYERS (TAB-SPECIFIC)
          ========================================================== */}

      {/* MODAL: BINARY UPLOAD */}
      {isBinModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-[#1A1D23] border border-[#2D333D] text-white' : 'bg-white border text-slate-800'}`}>
            <div className="flex justify-between items-center pb-4 border-b dark:border-gray-800">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <FileCode2 className="w-4.5 h-4.5 text-[rgb(14,145,145)]" />
                <span>Upload Software Binary</span>
              </h3>
              <button onClick={() => setIsBinModalOpen(false)} className="text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBinary} className="mt-4 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-gray-400 uppercase font-bold tracking-wider mb-1">Executable File Name</label>
                <input 
                  type="text" 
                  value={binFileName}
                  onChange={(e) => setBinFileName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
                  placeholder="e.g. core-engine-service-v3.2.1-x86.tar.gz"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase font-bold tracking-wider mb-1">Semantic Version</label>
                  <input 
                    type="text" 
                    value={binVersion}
                    onChange={(e) => setBinVersion(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
                    placeholder="e.g. 3.2.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase font-bold tracking-wider mb-1">Target Product SKU</label>
                  <CustomSelect
                    value={binSku}
                    onChange={setBinSku}
                    options={products.map(p => ({ value: p.sku, label: `${p.name} (${p.sku})` }))}
                    isDark={isDark}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase font-bold tracking-wider mb-1">Estimated Size</label>
                <input 
                  type="text" 
                  value={binSize}
                  onChange={(e) => setBinSize(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
                  placeholder="e.g. 154.2 MB"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase font-bold tracking-wider mb-1">Notes / Release Changelog</label>
                <textarea 
                  value={binNotes}
                  onChange={(e) => setBinNotes(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
                  placeholder="Include security updates, vulnerability mitigation notes or critical warnings..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase font-bold tracking-wider mb-1.5">Permitted Downstream Clients (SLA Bound)</label>
                <div className="max-h-24 overflow-y-auto border rounded-lg p-2 dark:border-gray-800 space-y-1.5">
                  {customers.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={binCustomers.includes(c.id)}
                        onChange={() => toggleBinCustomer(c.id)}
                        className="rounded text-[rgb(14,145,145)] focus:ring-[rgb(14,145,145)]"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setIsBinModalOpen(false)}
                  className={`px-4 py-2 rounded-lg cursor-pointer font-bold ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg cursor-pointer font-bold"
                >
                  Register Binary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HOST ACTIVATION (REGISTER MACHINE) */}
      {isActivationModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] ${isDark ? 'bg-[#1A1D23] border border-[#2D333D] text-white' : 'bg-white border text-slate-800'}`}>
            <div className="flex items-center justify-between border-b pb-4 mb-4 dark:border-[#2D333D] border-slate-100">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-[rgb(14,145,145)]" />
                <span>Register Host Machine</span>
              </h3>
              <button 
                onClick={() => setIsActivationModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleActivationFormSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Corporate Client</label>
                <CustomSelect
                  value={actCustomerId}
                  onChange={handleActivationCustomerChange}
                  options={customers.map(c => ({ value: c.id, label: c.name }))}
                  isDark={isDark}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Associated Active Contract</label>
                {contracts.filter(c => c.customerId === actCustomerId).length === 0 ? (
                  <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
                    No active contract agreements found for this customer. Please register a contract first.
                  </div>
                ) : (
                  <CustomSelect
                    value={actContractId}
                    onChange={handleActivationContractChange}
                    options={contracts
                      .filter(c => c.customerId === actCustomerId)
                      .map(c => ({ value: c.id, label: `${c.id} - ${c.productName} (${c.productSku})` }))
                    }
                    isDark={isDark}
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Physical Host ID / MAC Address</label>
                <input 
                  type="text" 
                  value={actHostId}
                  onChange={(e) => setActHostId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
                  placeholder="e.g. sys-cyber-01-mac-00:25:90:ff:11:12"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Activation Start Date</label>
                  <input 
                    type="date" 
                    value={actStartDate}
                    onChange={(e) => setActStartDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Activation End Date</label>
                  <input 
                    type="date" 
                    value={actEndDate}
                    onChange={(e) => setActEndDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Generated System License Key</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={actLicenseKey}
                    onChange={(e) => setActLicenseKey(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border font-mono outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
                    placeholder="Click Generate to build safe key"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={handleGenerateHostLicenseKey}
                    className="px-3 py-2 rounded-lg bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white hover:bg-[rgb(12,125,125)] cursor-pointer font-bold shrink-0 text-xs"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer pt-2">
                  <input 
                    type="checkbox" 
                    checked={actLicenseActive}
                    onChange={(e) => setActLicenseActive(e.target.checked)}
                    className="rounded text-[rgb(14,145,145)] focus:ring-[rgb(14,145,145)]"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">License Instantly Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 dark:border-[#2D333D]">
                <button 
                  type="button" 
                  onClick={() => setIsActivationModalOpen(false)}
                  className={`px-4 py-2 rounded-lg cursor-pointer ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!actContractId}
                  className="px-4 py-2 bg-[rgb(14,145,145)] text-white rounded-lg cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Activate Host
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LEGACY SEAT LICENSE (Add / Edit) */}
      {isLicenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-[#1A1D23] border border-[#2D333D] text-white' : 'bg-white border text-slate-800'}`}>
            <div className="flex items-center justify-between border-b pb-4 mb-4 dark:border-gray-800">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Key className="w-5 h-5 text-black dark:text-white" />
                <span>{editingLicense ? 'Modify Legacy Seat License' : 'Issue Legacy Seat License'}</span>
              </h3>
              <button 
                onClick={() => setIsLicenseModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLicenseFormSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Corporate Tenant</label>
                <CustomSelect
                  value={formCompanyId}
                  onChange={(val) => handleCompanyChange(val)}
                  options={customers.map(c => ({ value: c.id, label: c.name }))}
                  isDark={isDark}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Authorized Contact Name</label>
                  <input
                    type="text"
                    value={formAuthPerson}
                    onChange={(e) => setFormAuthPerson(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Notification Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50'}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product SKU</label>
                <CustomSelect
                  value={formSku}
                  onChange={(val) => handleSkuChange(val)}
                  options={products.map(p => ({ value: p.sku, label: `${p.name} (${p.sku})` }))}
                  isDark={isDark}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Platform License Key</label>
                <input 
                  type="text" 
                  value={formLicenseKey}
                  onChange={(e) => setFormLicenseKey(e.target.value)}
                  className={`w-full px-3 py-2 font-mono rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50'}`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Negotiated Price ($)</label>
                  <input 
                    type="number" 
                    value={formCustomerUnitPrice}
                    onChange={(e) => setFormCustomerUnitPrice(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Duration (Months)</label>
                  <input 
                    type="number" 
                    value={formTermMonths}
                    onChange={(e) => handleTermMonthsChange(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50'}`}
                    placeholder="12"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Allocation Start Date</label>
                  <input 
                    type="date" 
                    value={formTermStartDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Allocation End Date</label>
                  <input 
                    type="date" 
                    value={formTermEndDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50'}`}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setIsLicenseModalOpen(false)}
                  className={`px-4 py-2 rounded-lg cursor-pointer ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[rgb(14,145,145)] text-white rounded-lg cursor-pointer font-bold"
                >
                  Save Seat License
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EMAIL RENEWAL Dispatch Hub */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-[#1A1D23] text-white border border-[#2D333D]' : 'bg-white text-slate-800 border'}`}>
            <div className="flex justify-between items-center pb-4 border-b dark:border-gray-800">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-500 animate-pulse" />
                <span>Renewal Dispatch Hub</span>
              </h3>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {emailSuccess ? (
              <div className="py-8 text-center space-y-3 animate-fade-in">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-sm font-extrabold text-emerald-500">Dispatch Successful!</h4>
                <p className="text-[11px] text-gray-400 font-medium font-bold">Agreement Renewal terms have been compiled and emailed successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="mt-4 space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-gray-400 uppercase font-bold tracking-wider mb-1">Subject</label>
                  <input 
                    type="text" 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase font-bold tracking-wider mb-1">Message Body</label>
                  <textarea 
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
                    rows={8}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSendingEmail}
                  className="w-full py-2.5 bg-[rgb(14,145,145)] text-white rounded-lg font-bold hover:bg-[rgb(12,125,125)] transition-all cursor-pointer"
                >
                  {isSendingEmail ? 'Dispatching Terms...' : 'Publish Renewals Email'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
