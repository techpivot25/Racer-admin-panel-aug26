import React, { useState, useMemo } from 'react';
import { CustomSelect } from './CustomSelect';
import { TypeaheadSelect } from './TypeaheadSelect';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle,
  Building2,
  User,
  Calendar,
  Layers,
  RefreshCw,
  FileText,
  DollarSign,
  Package,
  ArrowRight,
  ArrowLeft,
  LayoutGrid,
  List,
  ChevronDown,
  Info,
  Phone,
  Mail,
  ShieldCheck,
  Download,
  Paperclip,
  File
} from 'lucide-react';
import { Customer, Product, CustomerProductMapping, Contract, ContractProductLineItem, ContractAttachment } from '../types';

interface LicensesTabProps {
  customers: Customer[];
  products: Product[];
  contracts: Contract[];
  onAddContract: (contract: Contract) => void;
  onEditContract: (contract: Contract) => void;
  onDeleteContract: (id: string) => void;
  onSelectCustomer: (customerId: string) => void;
  isDark: boolean;
  t: Record<string, string>;
  addAuditLog?: (action: string, details: string, screen: 'Users' | 'Customers' | 'Products' | 'General' | 'Licenses') => void;
  customerProductMappings: CustomerProductMapping[];
  onAddMapping: (mapping: CustomerProductMapping) => void;
  onEditMapping: (mapping: CustomerProductMapping) => void;
  onDeleteMapping: (id: string) => void;
}

// Helpers for contract term date calculations
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
  if (!startDateStr || !endDateStr) return 1;
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
  if (end <= start) return 0;
  
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) {
    months -= 1;
  }
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const dayFraction = (end.getDate() - start.getDate()) / daysInMonth;
  const exactMonths = Math.round(months + dayFraction);

  return Math.max(1, exactMonths);
};

export default function LicensesTab({
  customers,
  products,
  contracts,
  onAddContract,
  onEditContract,
  onDeleteContract,
  onSelectCustomer,
  isDark,
  t,
  addAuditLog,
  customerProductMappings = [],
  onAddMapping,
  onEditMapping,
  onDeleteMapping
}: LicensesTabProps) {
  // Navigation tabs ('contracts' | 'mappings')
  const [activeSubSection, setActiveSubSection] = useState<'contracts' | 'mappings'>('contracts');
  
  // Active detail page within contracts tab ('none' | 'active-contracts' | 'contracted-revenue')
  const [activeDetailView, setActiveDetailView] = useState<'none' | 'active-contracts' | 'contracted-revenue'>('none');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // ==========================================
  // CONTRACTS STATE & FILTERS
  // ==========================================
  const [contractSearchQuery, setContractSearchQuery] = useState('');
  const [contractViewMode, setContractViewMode] = useState<'card' | 'table'>('table');
  const [contractFilterStatus, setContractFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [contractFilterCustomerId, setContractFilterCustomerId] = useState<string>('all');
  const [contractSortBy, setContractSortBy] = useState<'name' | 'value' | 'endDate'>('name');

  // Modal / Detail state
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [contractToDeleteId, setContractToDeleteId] = useState<string | null>(null);

  // Form fields for Contract Overview, Notes, Attachments
  const [contractName, setContractName] = useState('');
  const [contractDesc, setContractDesc] = useState('');
  const [contractCustomerId, setContractCustomerId] = useState('');
  const [contractProductSku, setContractProductSku] = useState('');
  const [contractUnitPrice, setContractUnitPrice] = useState<number>(0);
  const [contractPurchasedUnits, setContractPurchasedUnits] = useState<number>(10);
  const [contractActiveUnits, setContractActiveUnits] = useState<number>(0);
  const [contractTermMonths, setContractTermMonths] = useState<number>(12);
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [contractNotes, setContractNotes] = useState('');
  const [contractAttachments, setContractAttachments] = useState<ContractAttachment[]>([]);

  // Customer Typeahead Search
  const [customerSearchInput, setCustomerSearchInput] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Line Items State for Multi-Product Contracts
  const [lineItems, setLineItems] = useState<ContractProductLineItem[]>([]);

  // Line Item Builder Draft State
  const [lineProductId, setLineProductId] = useState('');
  const [lineProductName, setLineProductName] = useState('');
  const [lineProductSku, setLineProductSku] = useState('');
  const [lineStartDate, setLineStartDate] = useState('');
  const [lineEndDate, setLineEndDate] = useState('');
  const [lineDurationMonths, setLineDurationMonths] = useState<number>(12);
  const [lineDefaultPrice, setLineDefaultPrice] = useState<number>(0);
  const [lineContractedPrice, setLineContractedPrice] = useState<number>(0);
  const [lineUnits, setLineUnits] = useState<number>(10);

  // Selected customer profile for read-only customer details display
  const selectedCustomerForContract = useMemo(() => {
    return customers.find(c => c.id === contractCustomerId) || null;
  }, [customers, contractCustomerId]);

  const filteredCustomerOptions = useMemo(() => {
    if (!customerSearchInput) return customers;
    const q = customerSearchInput.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [customers, customerSearchInput]);

  // Associated SKUs for selected Product
  const availableSkusForProduct = useMemo(() => {
    if (!lineProductId) return products.map(p => p.sku);
    const selectedProd = products.find(p => p.id === lineProductId);
    if (!selectedProd) return products.map(p => p.sku);

    const matchingProds = products.filter(
      p => p.id === lineProductId || p.name === selectedProd.name || p.family === selectedProd.family
    );
    const skus = Array.from(new Set(matchingProds.map(p => p.sku)));
    return skus.length > 0 ? skus : [selectedProd.sku];
  }, [lineProductId, products]);

  // Line Item Helper Functions
  const handleLineProductSelect = (productId: string) => {
    setLineProductId(productId);
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setLineProductName(prod.name);
      // Reset SKU so user must select SKU in Step 2, keeping remaining form fields hidden
      setLineProductSku('');

      setLineDefaultPrice(prod.unitPrice);

      let price = prod.unitPrice;
      if (contractCustomerId) {
        const custNum = parseInt(contractCustomerId.replace(/\D/g, ''), 10);
        const prodNum = parseInt(prod.id.replace(/\D/g, ''), 10);
        const map = customerProductMappings.find(m => m.customerId === custNum && m.productId === prodNum);
        if (map) price = map.customerUnitPrice;
      }
      setLineContractedPrice(price);
    } else {
      setLineProductName('');
      setLineProductSku('');
    }
  };

  const handleLineSkuSelect = (sku: string) => {
    setLineProductSku(sku);
    const prod = products.find(p => p.id === lineProductId && p.sku === sku) || products.find(p => p.sku === sku);
    if (prod) {
      setLineProductId(prod.id);
      setLineProductName(prod.name);
      setLineDefaultPrice(prod.unitPrice);

      let price = prod.unitPrice;
      if (contractCustomerId) {
        const custNum = parseInt(contractCustomerId.replace(/\D/g, ''), 10);
        const prodNum = parseInt(prod.id.replace(/\D/g, ''), 10);
        const map = customerProductMappings.find(m => m.customerId === custNum && m.productId === prodNum);
        if (map) price = map.customerUnitPrice;
      }
      setLineContractedPrice(price);
    }
  };

  const minEndDate = useMemo(() => {
    if (!lineStartDate) return undefined;
    const d = new Date(lineStartDate + 'T00:00:00');
    if (isNaN(d.getTime())) return undefined;
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [lineStartDate]);

  const handleLineStartDateChange = (val: string) => {
    setLineStartDate(val);
    if (val && lineEndDate) {
      if (lineEndDate <= val) {
        const d = new Date(val + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        const newEnd = d.toISOString().split('T')[0];
        setLineEndDate(newEnd);
        setLineDurationMonths(calculateDiffInMonths(val, newEnd));
      } else {
        setLineDurationMonths(calculateDiffInMonths(val, lineEndDate));
      }
    }
  };

  const handleLineEndDateChange = (val: string) => {
    setLineEndDate(val);
    if (lineStartDate && val) {
      setLineDurationMonths(calculateDiffInMonths(lineStartDate, val));
    }
  };

  const handleLineDurationMonthsChange = (months: number) => {
    setLineDurationMonths(months);
    if (lineStartDate && months > 0) {
      setLineEndDate(calculateEndDate(lineStartDate, months));
    }
  };

  const handleAddLineItem = () => {
    if (!lineProductId && !lineProductName) return;
    const newItem: ContractProductLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: lineProductId,
      productName: lineProductName || 'Unknown Product',
      productSku: lineProductSku || 'SKU-01',
      licenseStartDate: lineStartDate || contractStartDate || today,
      licenseEndDate: lineEndDate || contractEndDate || today,
      licenseDurationMonths: lineDurationMonths || calculateDiffInMonths(lineStartDate || contractStartDate, lineEndDate || contractEndDate) || 12,
      defaultPrice: lineDefaultPrice || 0,
      contractedPrice: lineContractedPrice || 0,
      units: lineUnits || 1
    };
    setLineItems(prev => [...prev, newItem]);

    // Reset fields so only "Choose a Product" drop down is visible again
    setLineProductId('');
    setLineProductName('');
    setLineProductSku('');
    setLineDefaultPrice(0);
    setLineContractedPrice(0);
    setLineUnits(10);
    setLineStartDate('');
    setLineEndDate('');
    setLineDurationMonths(12);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEditLineItem = (item: ContractProductLineItem) => {
    setLineProductId(item.productId);
    setLineProductName(item.productName);
    setLineProductSku(item.productSku);
    setLineStartDate(item.licenseStartDate);
    setLineEndDate(item.licenseEndDate);
    setLineDurationMonths(item.licenseDurationMonths);
    setLineDefaultPrice(item.defaultPrice);
    setLineContractedPrice(item.contractedPrice);
    setLineUnits(item.units);
    setLineItems(prev => prev.filter(i => i.id !== item.id));
  };

  // Attachment Functions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      const dataUrl = uploadEvt.target?.result as string;
      const newAtt: ContractAttachment = {
        id: `att-${Date.now()}`,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toISOString().split('T')[0],
        fileDataUrl: dataUrl
      };
      setContractAttachments(prev => [...prev, newAtt]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAttachment = (attId: string) => {
    setContractAttachments(prev => prev.filter(a => a.id !== attId));
  };

  const handleDownloadAttachment = (att: ContractAttachment) => {
    if (att.fileDataUrl) {
      const a = document.createElement('a');
      a.href = att.fileDataUrl;
      a.download = att.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([`Contract Document Attachment: ${att.fileName}\nUploaded: ${att.uploadDate}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // ==========================================
  // CUSTOM MAPPINGS STATE & MODALS
  // ==========================================
  const [mappingSearchQuery, setMappingSearchQuery] = useState('');
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<CustomerProductMapping | null>(null);

  // Form fields
  const [mapCustomerId, setMapCustomerId] = useState<number>(0);
  const [mapProductId, setMapProductId] = useState<number>(0);
  const [mapProductSku, setMapProductSku] = useState('');
  const [mapProductPrice, setMapProductPrice] = useState<number>(0);
  const [mapCustomerPrice, setMapCustomerPrice] = useState<number>(0);

  // ==========================================
  // SEARCH / FILTER MEMOIZATIONS
  // ==========================================
  const filteredContracts = useMemo(() => {
    let result = contracts.filter(con => {
      // 1. Search Query
      const q = contractSearchQuery.toLowerCase();
      const matchesSearch = !q || (
        con.name.toLowerCase().includes(q) ||
        con.customerName.toLowerCase().includes(q) ||
        con.productName.toLowerCase().includes(q) ||
        con.productSku.toLowerCase().includes(q) ||
        con.id.toLowerCase().includes(q)
      );
      if (!matchesSearch) return false;

      // 2. Status Filter
      const today = new Date().toISOString().split('T')[0];
      const isExpired = con.endDate < today;
      if (contractFilterStatus === 'active' && isExpired) return false;
      if (contractFilterStatus === 'expired' && !isExpired) return false;

      // 3. Customer Filter
      if (contractFilterCustomerId !== 'all' && con.customerId !== contractFilterCustomerId) return false;

      return true;
    });

    // 4. Sorting
    return result.sort((a, b) => {
      if (contractSortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (contractSortBy === 'value') {
        const valA = a.unitPrice * a.purchasedUnits * a.termMonths;
        const valB = b.unitPrice * b.purchasedUnits * b.termMonths;
        return valB - valA; // Descending value
      } else if (contractSortBy === 'endDate') {
        return a.endDate.localeCompare(b.endDate); // Earliest end date first
      }
      return 0;
    });
  }, [contracts, contractSearchQuery, contractFilterStatus, contractFilterCustomerId, contractSortBy]);

  // Checkbox Selection & Pagination State
  const [selectedContractIds, setSelectedContractIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const totalPages = useMemo(() => {
    return Math.ceil(filteredContracts.length / itemsPerPage) || 1;
  }, [filteredContracts.length, itemsPerPage]);

  const safeCurrentPage = useMemo(() => {
    return Math.min(Math.max(currentPage, 1), totalPages);
  }, [currentPage, totalPages]);

  const paginatedContracts = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredContracts.slice(start, start + itemsPerPage);
  }, [filteredContracts, safeCurrentPage, itemsPerPage]);

  const isAllOnPageSelected = useMemo(() => {
    if (paginatedContracts.length === 0) return false;
    return paginatedContracts.every(c => selectedContractIds.includes(c.id));
  }, [paginatedContracts, selectedContractIds]);

  const handleToggleSelectAllOnPage = () => {
    if (isAllOnPageSelected) {
      const pageIds = new Set(paginatedContracts.map(c => c.id));
      setSelectedContractIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const pageIds = paginatedContracts.map(c => c.id);
      setSelectedContractIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectContract = (id: string) => {
    setSelectedContractIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredMappings = useMemo(() => {
    return customerProductMappings.filter(m => {
      const q = mappingSearchQuery.toLowerCase();
      if (!q) return true;
      
      const customerName = customers.find(c => parseInt(c.id.replace(/\D/g, ''), 10) === m.customerId)?.name || '';
      const productName = products.find(p => parseInt(p.id.replace(/\D/g, ''), 10) === m.productId)?.name || '';
      
      return (
        customerName.toLowerCase().includes(q) ||
        productName.toLowerCase().includes(q) ||
        m.productSku.toLowerCase().includes(q) ||
        String(m.customerId).includes(q) ||
        String(m.productId).includes(q)
      );
    });
  }, [customerProductMappings, mappingSearchQuery, customers, products]);

  // ==========================================
  // HANDLERS FOR CONTRACTS
  // ==========================================
  const populateContractFormFromObj = (con: Contract) => {
    setEditingContract(con);
    setContractName(con.name);
    setContractDesc(con.description || '');
    setContractCustomerId(con.customerId);
    const custObj = customers.find(c => c.id === con.customerId);
    setCustomerSearchInput(custObj ? custObj.name : con.customerName || '');
    setShowCustomerDropdown(false);

    setContractStartDate(con.startDate);
    setContractEndDate(con.endDate);
    setContractTermMonths(con.termMonths || 12);
    setContractNotes(con.notes || '');
    setContractAttachments(con.attachments || []);

    if (con.productsLineItems && con.productsLineItems.length > 0) {
      setLineItems(con.productsLineItems);
    } else if (con.productSku) {
      const legacyItem: ContractProductLineItem = {
        id: `item-legacy-${con.id}`,
        productId: products.find(p => p.sku === con.productSku)?.id || `prod-${con.productSku}`,
        productName: con.productName,
        productSku: con.productSku,
        licenseStartDate: con.startDate,
        licenseEndDate: con.endDate,
        licenseDurationMonths: con.termMonths || 12,
        defaultPrice: con.unitPrice,
        contractedPrice: con.unitPrice,
        units: con.purchasedUnits || 10
      };
      setLineItems([legacyItem]);
    } else {
      setLineItems([]);
    }

    const initialProd = products[0];
    if (initialProd) {
      setLineProductId(initialProd.id);
      setLineProductName(initialProd.name);
      setLineProductSku(initialProd.sku);
      setLineStartDate(con.startDate || today);
      setLineEndDate(con.endDate || calculateEndDate(today, 12));
      setLineDurationMonths(con.termMonths || 12);
      setLineDefaultPrice(initialProd.unitPrice);
      setLineContractedPrice(initialProd.unitPrice);
      setLineUnits(10);
    }
  };

  const handleOpenAddContract = () => {
    setEditingContract(null);
    const initialCust = customers[0]?.id || '';
    setContractNotes('');
    setContractAttachments([]);
    handleContractCustomerChange(initialCust);
    setIsContractModalOpen(true);
  };

  const handleContractCustomerChange = (custId: string) => {
    setContractCustomerId(custId);
    const custObj = customers.find(c => c.id === custId);
    if (!custObj) return;

    setCustomerSearchInput(custObj.name);
    setShowCustomerDropdown(false);

    const todayStr = new Date().toISOString().split('T')[0];

    // Check if an existing contract exists for this customer
    const existingCon = contracts.find(c => c.customerId === custId);

    if (existingCon) {
      setContractName(existingCon.name);
      setContractStartDate(existingCon.startDate);
      setContractEndDate(existingCon.endDate);
      setContractDesc(existingCon.description || '');

      if (existingCon.productsLineItems && existingCon.productsLineItems.length > 0) {
        setLineItems(existingCon.productsLineItems);
        const first = existingCon.productsLineItems[0];
        setLineProductId(first.productId);
        setLineProductName(first.productName);
        setLineProductSku(first.productSku);
        setLineStartDate(first.licenseStartDate);
        setLineEndDate(first.licenseEndDate);
        setLineDurationMonths(first.licenseDurationMonths);
        setLineDefaultPrice(first.defaultPrice);
        setLineContractedPrice(first.contractedPrice);
        setLineUnits(first.units);
      } else if (existingCon.productSku) {
        const prod = products.find(p => p.sku === existingCon.productSku);
        const legacyItem: ContractProductLineItem = {
          id: `item-legacy-${existingCon.id}`,
          productId: prod ? prod.id : `prod-${existingCon.productSku}`,
          productName: existingCon.productName,
          productSku: existingCon.productSku,
          licenseStartDate: existingCon.startDate,
          licenseEndDate: existingCon.endDate,
          licenseDurationMonths: existingCon.termMonths || 12,
          defaultPrice: existingCon.unitPrice,
          contractedPrice: existingCon.unitPrice,
          units: existingCon.purchasedUnits || 10
        };
        setLineItems([legacyItem]);
        setLineProductId(legacyItem.productId);
        setLineProductName(legacyItem.productName);
        setLineProductSku(legacyItem.productSku);
        setLineStartDate(legacyItem.licenseStartDate);
        setLineEndDate(legacyItem.licenseEndDate);
        setLineDurationMonths(legacyItem.licenseDurationMonths);
        setLineDefaultPrice(legacyItem.defaultPrice);
        setLineContractedPrice(legacyItem.contractedPrice);
        setLineUnits(legacyItem.units);
      }
    } else {
      // Auto pop/fill default contract overview details for this customer
      setContractName(`${custObj.name} - Enterprise License Agreement`);
      setContractStartDate(todayStr);
      setContractEndDate(calculateEndDate(todayStr, 12));
      setContractDesc(`Master software license & support agreement for ${custObj.name}.`);

      // Find allocated / assigned products for this customer from customerProductMappings
      const custNum = parseInt(custId.replace(/\D/g, ''), 10);
      const mappingsForCustomer = customerProductMappings.filter(
        m => m.customerId === custNum || String(m.customerId) === custId
      );

      if (mappingsForCustomer.length > 0) {
        const mappedLineItems: ContractProductLineItem[] = mappingsForCustomer.map(m => {
          const prod = products.find(p => p.id === `prod-${m.productId}` || p.sku === m.productSku);
          return {
            id: `item-${Date.now()}-${m.productId}-${Math.random().toString(36).substring(2, 6)}`,
            productId: prod ? prod.id : `prod-${m.productId}`,
            productName: prod ? prod.name : `Product ${m.productSku}`,
            productSku: m.productSku,
            licenseStartDate: todayStr,
            licenseEndDate: calculateEndDate(todayStr, 12),
            licenseDurationMonths: 12,
            defaultPrice: m.productUnitPrice || (prod ? prod.unitPrice : 100),
            contractedPrice: m.customerUnitPrice,
            units: 10
          };
        });
        setLineItems(mappedLineItems);

        const first = mappedLineItems[0];
        setLineProductId(first.productId);
        setLineProductName(first.productName);
        setLineProductSku(first.productSku);
        setLineStartDate(first.licenseStartDate);
        setLineEndDate(first.licenseEndDate);
        setLineDurationMonths(first.licenseDurationMonths);
        setLineDefaultPrice(first.defaultPrice);
        setLineContractedPrice(first.contractedPrice);
        setLineUnits(first.units);
      } else {
        // Fallback to first available product
        const initialProd = products[0];
        if (initialProd) {
          const defaultItem: ContractProductLineItem = {
            id: `item-${Date.now()}-default`,
            productId: initialProd.id,
            productName: initialProd.name,
            productSku: initialProd.sku,
            licenseStartDate: todayStr,
            licenseEndDate: calculateEndDate(todayStr, 12),
            licenseDurationMonths: 12,
            defaultPrice: initialProd.unitPrice,
            contractedPrice: initialProd.unitPrice,
            units: 10
          };
          setLineItems([defaultItem]);

          setLineProductId(initialProd.id);
          setLineProductName(initialProd.name);
          setLineProductSku(initialProd.sku);
          setLineStartDate(todayStr);
          setLineEndDate(calculateEndDate(todayStr, 12));
          setLineDurationMonths(12);
          setLineDefaultPrice(initialProd.unitPrice);
          setLineContractedPrice(initialProd.unitPrice);
          setLineUnits(10);
        }
      }
    }
  };

  const handleContractProductChange = (sku: string) => {
    handleLineSkuSelect(sku);
  };

  const handleContractStartDateChange = (val: string) => {
    setContractStartDate(val);
    if (val && contractTermMonths > 0) {
      setContractEndDate(calculateEndDate(val, contractTermMonths));
    }
  };

  const handleContractTermMonthsChange = (val: number) => {
    setContractTermMonths(val);
    if (contractStartDate && val > 0) {
      setContractEndDate(calculateEndDate(contractStartDate, val));
    }
  };

  const handleContractEndDateChange = (val: string) => {
    setContractEndDate(val);
    if (contractStartDate && val) {
      const months = calculateDiffInMonths(contractStartDate, val);
      setContractTermMonths(months);
    }
  };

  const handleContractFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === contractCustomerId);

    let finalLineItems = [...lineItems];
    if (finalLineItems.length === 0 && (lineProductId || lineProductName)) {
      const autoItem: ContractProductLineItem = {
        id: `item-auto-${Date.now()}`,
        productId: lineProductId || products[0]?.id || 'prod-1',
        productName: lineProductName || products[0]?.name || 'Product',
        productSku: lineProductSku || products[0]?.sku || 'SKU-01',
        licenseStartDate: lineStartDate || contractStartDate || today,
        licenseEndDate: lineEndDate || contractEndDate || today,
        licenseDurationMonths: lineDurationMonths || calculateDiffInMonths(contractStartDate, contractEndDate) || 12,
        defaultPrice: lineDefaultPrice || 0,
        contractedPrice: lineContractedPrice || 0,
        units: lineUnits || 10
      };
      finalLineItems.push(autoItem);
    }

    const firstItem = finalLineItems[0];
    const primarySku = firstItem ? firstItem.productSku : '';
    const primaryName = firstItem ? firstItem.productName : '';
    const primaryPrice = firstItem ? firstItem.contractedPrice : 0;
    const primaryUnits = finalLineItems.reduce((acc, item) => acc + item.units, 0);
    const primaryMonths = calculateDiffInMonths(contractStartDate, contractEndDate) || 12;

    const payload: Contract = {
      id: editingContract ? editingContract.id : `con-${Date.now()}`,
      name: contractName,
      description: contractDesc,
      customerId: contractCustomerId,
      customerName: customer ? customer.name : 'Unknown Customer',
      productSku: primarySku,
      productName: primaryName,
      unitPrice: primaryPrice,
      purchasedUnits: primaryUnits,
      activeUnits: editingContract ? editingContract.activeUnits : 0,
      termMonths: primaryMonths,
      startDate: contractStartDate,
      endDate: contractEndDate,
      createDate: editingContract ? editingContract.createDate : new Date().toISOString().split('T')[0],
      createdBy: editingContract ? editingContract.createdBy : 'Super Admin',
      lastUpdated: new Date().toISOString().split('T')[0],
      lastUpdatedBy: 'Super Admin',
      notes: contractNotes,
      attachments: contractAttachments,
      productsLineItems: finalLineItems
    };

    if (contractCustomerId && customer) {
      const custNum = parseInt(contractCustomerId.replace(/\D/g, ''), 10);
      finalLineItems.forEach(item => {
        const prodNum = parseInt(item.productId.replace(/\D/g, ''), 10);
        const existingMap = customerProductMappings.find(
          m => m.customerId === custNum && (m.productId === prodNum || m.productSku === item.productSku)
        );
        if (existingMap) {
          if (existingMap.customerUnitPrice !== item.contractedPrice) {
            onEditMapping({
              ...existingMap,
              customerUnitPrice: item.contractedPrice
            });
          }
        } else if (item.contractedPrice !== item.defaultPrice && prodNum) {
          onAddMapping({
            id: `map-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            customerId: custNum,
            productId: prodNum,
            productSku: item.productSku,
            productUnitPrice: item.defaultPrice,
            customerUnitPrice: item.contractedPrice
          });
        }
      });
    }

    if (editingContract) {
      onEditContract(payload);
      addAuditLog?.('Modify Contract Agreement', `Updated contract ${payload.id} (${payload.name}) for customer ${payload.customerName}.`, 'Licenses');
      if (selectedContractId === payload.id) {
        setEditingContract(payload);
      }
    } else {
      onAddContract(payload);
      addAuditLog?.('Create Contract Agreement', `Created brand-new contract agreement ${payload.name} (ID: ${payload.id}) for ${payload.customerName}.`, 'Licenses');
    }

    setIsContractModalOpen(false);
    setIsDetailEditing(false);
  };

  const handleDeleteContractClick = (id: string) => {
    setContractToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (contractToDeleteId) {
      const conObj = contracts.find(c => c.id === contractToDeleteId);
      if (conObj) {
        onDeleteContract(contractToDeleteId);
        addAuditLog?.('Delete Contract Agreement', `Soft-deleted agreement reference ${conObj.name} for customer ${conObj.customerName}.`, 'Licenses');
      }
      setSelectedContractId(null);
      setIsDetailEditing(false);
      setIsDeleteConfirmOpen(false);
      setContractToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setContractToDeleteId(null);
  };

  // ==========================================
  // RENDER COMPREHENSIVE CONTRACT FORM CONTENT (4 SECTIONS)
  // ==========================================
  const renderContractFormContent = () => (
    <div className="space-y-6 text-xs font-medium">
      {/* SECTION 1: CONTRACT OVERVIEW */}
      <div className={`p-4 sm:p-5 rounded-xl border ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50/80 border-slate-200'} space-y-4`}>
        <div className="flex items-center gap-2 border-b pb-3 dark:border-[#2D333D] border-slate-200">
          <FileText className="w-4 h-4 text-[rgb(14,145,145)] shrink-0" />
          <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-white">
            Contract Overview
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Contract Title / Contract Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
              placeholder="e.g. FY27 Enterprise Software & Support License"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={contractCustomerId}
              onChange={handleContractCustomerChange}
              options={customers.map(c => ({
                value: c.id,
                label: `${c.name} (${c.id})`
              }))}
              isDark={isDark}
              placeholder="Select Registered Customer..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Contract Start Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              value={contractStartDate}
              onChange={(e) => {
                setContractStartDate(e.target.value);
                if (e.target.value) {
                  setContractEndDate(calculateEndDate(e.target.value, 12));
                }
              }}
              className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider mb-1">
              Contract End Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              value={contractEndDate}
              onChange={(e) => setContractEndDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider mb-1">
            Contract Description
          </label>
          <textarea 
            value={contractDesc}
            onChange={(e) => setContractDesc(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
            placeholder="Enter contract scope, legal terms, or agreement notes..."
            rows={2}
          />
        </div>
      </div>

      {/* SECTION 2: CUSTOMER DETAILS (READ-ONLY) */}
      <div className={`p-4 sm:p-5 rounded-xl border ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50/80 border-slate-200'} space-y-4`}>
        <div className="flex items-center justify-between border-b pb-3 dark:border-[#2D333D] border-slate-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[rgb(14,145,145)] shrink-0" />
            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              Customer Details <span className="text-[10px] font-normal text-slate-400">(Read-Only Loaded from Customer Record)</span>
            </h4>
          </div>
          {selectedCustomerForContract && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              Active Customer
            </span>
          )}
        </div>

        {!selectedCustomerForContract ? (
          <div className="p-4 text-center text-slate-400 italic">
            Select a Customer Name in Section 1 to load customer contact details.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Primary Contact */}
            <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} space-y-2`}>
              <div className="font-extrabold text-[11px] text-[rgb(14,145,145)] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Primary Contact</span>
              </div>
              <div className="space-y-1 text-slate-700 dark:text-gray-200 text-xs">
                <div><span className="text-slate-400">Name:</span> <strong className="text-slate-900 dark:text-white">{selectedCustomerForContract.primaryContactName || 'N/A'}</strong></div>
                <div><span className="text-slate-400">Phone #:</span> {selectedCustomerForContract.primaryContactPhone || 'N/A'}</div>
                <div><span className="text-slate-400">Email:</span> {selectedCustomerForContract.primaryContactEmail || 'N/A'}</div>
              </div>
            </div>

            {/* Billing Contact */}
            <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} space-y-2`}>
              <div className="font-extrabold text-[11px] text-[rgb(14,145,145)] uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Billing Contact</span>
              </div>
              <div className="space-y-1 text-slate-700 dark:text-gray-200 text-xs">
                <div><span className="text-slate-400">Name:</span> <strong className="text-slate-900 dark:text-white">{selectedCustomerForContract.billingContactName || 'N/A'}</strong></div>
                <div><span className="text-slate-400">Phone #:</span> {selectedCustomerForContract.billingContactPhone || 'N/A'}</div>
                <div><span className="text-slate-400">Email:</span> {selectedCustomerForContract.billingContactEmail || 'N/A'}</div>
              </div>
            </div>

            {/* Technical Contact */}
            <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} space-y-2`}>
              <div className="font-extrabold text-[11px] text-[rgb(14,145,145)] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Technical Contact</span>
              </div>
              <div className="space-y-1 text-slate-700 dark:text-gray-200 text-xs">
                <div><span className="text-slate-400">Name:</span> <strong className="text-slate-900 dark:text-white">{selectedCustomerForContract.supportContactName || 'N/A'}</strong></div>
                <div><span className="text-slate-400">Phone #:</span> {selectedCustomerForContract.supportContactPhone || 'N/A'}</div>
                <div><span className="text-slate-400">Email:</span> {selectedCustomerForContract.supportContactEmail || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: PRODUCT DETAILS (1 OR MORE PRODUCTS) */}
      <div className={`p-4 sm:p-5 rounded-xl border ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50/80 border-slate-200'} space-y-4`}>
        <div className="flex items-center justify-between border-b pb-3 dark:border-[#2D333D] border-slate-200">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[rgb(14,145,145)] shrink-0" />
            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              Product Details & Contract Pricing
            </h4>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-gray-400 shrink-0">
            {lineItems.length} Product(s) Added
          </span>
        </div>

        {/* Configure Product Line Item Controls */}
        <div className={`p-5 rounded-xl border shadow-xs ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} space-y-5`}>
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 dark:border-[#2D333D] border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Configure Product Line Item
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Specify product, SKU, custom contracted pricing, and licensing timeframe.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0F1115] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2D333D]">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Line Subtotal:</span>
              <span className="text-xs font-mono font-bold text-[rgb(14,145,145)]">
                ${(lineContractedPrice * lineUnits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Form Fields Layout */}
          <div className="space-y-4">
            {/* Group 1: Product & SKU Selection */}
            <div>
              <div className="text-[10px] font-bold text-[rgb(14,145,145)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                <span>Product & SKU Selection</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Step 1: Choose a Product Typeahead */}
                <div>
                  <TypeaheadSelect
                    label="Choose a Product"
                    value={lineProductId}
                    onChange={handleLineProductSelect}
                    options={products.map(p => ({
                      value: p.id,
                      label: p.name,
                      subLabel: `ID: ${p.id}`
                    }))}
                    isDark={isDark}
                    placeholder="Type product name..."
                  />
                </div>

                {/* Step 2: Product SKU (Visible when Product is chosen) */}
                {Boolean(lineProductId) && (
                  <div>
                    <TypeaheadSelect
                      label="Choose Product SKU"
                      value={lineProductSku}
                      onChange={handleLineSkuSelect}
                      options={availableSkusForProduct.map(s => ({ value: s, label: s }))}
                      isDark={isDark}
                      placeholder="Type or select SKU..."
                    />
                  </div>
                )}

                {/* Captured Product ID (Visible when SKU is chosen) */}
                {Boolean(lineProductId && lineProductSku) && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">
                      Product ID (Captured)
                    </label>
                    <input 
                      type="text"
                      value={lineProductId}
                      readOnly
                      placeholder="Auto-captured ID"
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-bold outline-hidden ${
                        isDark 
                          ? 'bg-[#0F1115] border-[#2D333D] text-emerald-400 placeholder-slate-600' 
                          : 'bg-slate-100 border-slate-200 text-emerald-700 placeholder-slate-400'
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Groups 2 & 3: Visible ONLY when Product and SKU are selected */}
            {Boolean(lineProductId && lineProductSku) && (
              <>
                {/* Group 2: Pricing & Volume */}
                <div>
                  <div className="text-[10px] font-bold text-[rgb(14,145,145)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Pricing & License Units</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">
                        Default Price ($)
                      </label>
                      <input 
                        type="number"
                        value={lineDefaultPrice}
                        readOnly
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-bold outline-hidden ${
                          isDark 
                            ? 'bg-[#0F1115] border-[#2D333D] text-slate-400' 
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">
                        Contracted Price ($)
                      </label>
                      <input 
                        type="number"
                        value={lineContractedPrice}
                        onChange={(e) => setLineContractedPrice(Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-bold outline-hidden focus:ring-2 focus:ring-[rgb(14,145,145)]/40 ${
                          isDark 
                            ? 'bg-[#0F1115] border-[#2D333D] text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">
                        Product License Units
                      </label>
                      <input 
                        type="number"
                        value={lineUnits}
                        onChange={(e) => setLineUnits(Number(e.target.value))}
                        min={1}
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-bold outline-hidden focus:ring-2 focus:ring-[rgb(14,145,145)]/40 ${
                          isDark 
                            ? 'bg-[#0F1115] border-[#2D333D] text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Group 3: Duration & Term */}
                <div>
                  <div className="text-[10px] font-bold text-[rgb(14,145,145)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Contract Duration & Validity</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">
                        Contract Start Date
                      </label>
                      <input 
                        type="date"
                        value={lineStartDate}
                        max={lineEndDate || undefined}
                        onChange={(e) => handleLineStartDateChange(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden focus:ring-2 focus:ring-[rgb(14,145,145)]/40 ${
                          isDark 
                            ? 'bg-[#0F1115] border-[#2D333D] text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">
                        Contract End Date
                      </label>
                      <input 
                        type="date"
                        value={lineEndDate}
                        min={minEndDate}
                        onChange={(e) => handleLineEndDateChange(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border text-xs outline-hidden focus:ring-2 focus:ring-[rgb(14,145,145)]/40 ${
                          isDark 
                            ? 'bg-[#0F1115] border-[#2D333D] text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">
                        Contract Duration (months)
                      </label>
                      <input 
                        type="number"
                        value={lineDurationMonths}
                        readOnly
                        placeholder="Auto-calculated"
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-bold outline-hidden ${
                          isDark 
                            ? 'bg-[#0F1115] border-[#2D333D] text-emerald-400' 
                            : 'bg-slate-100 border-slate-200 text-emerald-700'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Save Action Footer */}
                <div className="flex items-center justify-between pt-3 border-t dark:border-[#2D333D] border-slate-200">
                  <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span>Calculated Line Subtotal:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ${(lineContractedPrice * lineUnits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product to Contract</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Line Items Table */}
        {lineItems.length === 0 ? (
          <div className="p-4 text-center text-slate-400 border border-dashed rounded-xl dark:border-slate-800">
            No products added to contract line items yet. Configure above and click "Add Product to Contract".
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-xl dark:border-[#2D333D]">
            <table className="w-full text-left text-xs">
              <thead className={`font-bold uppercase tracking-wider ${isDark ? 'bg-[#1A1D23] text-gray-400 border-b border-[#2D333D]' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}`}>
                <tr>
                  <th className="p-3">Product ID</th>
                  <th className="p-3">Product Name & SKU</th>
                  <th className="p-3">License Period</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3 text-right">Default Price</th>
                  <th className="p-3 text-right">Contracted Price</th>
                  <th className="p-3 text-center">Units</th>
                  <th className="p-3 text-right">Subtotal</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-[#2D333D] divide-slate-200 font-medium">
                {lineItems.map((item, idx) => {
                  const subtotal = item.contractedPrice * item.units;
                  return (
                    <tr key={item.id || idx} className={`${isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'}`}>
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.productId || 'N/A'}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{item.productName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{item.productSku}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {item.licenseStartDate} to {item.licenseEndDate}
                      </td>
                      <td className="p-3 font-bold text-emerald-500">
                        {item.licenseDurationMonths} mos
                      </td>
                      <td className="p-3 text-right font-mono text-slate-400">
                        ${item.defaultPrice.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ${item.contractedPrice.toFixed(2)}
                      </td>
                      <td className="p-3 text-center font-bold">
                        {item.units}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-[rgb(14,145,145)]">
                        ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditLineItem(item)}
                            className="p-1 rounded text-slate-400 hover:text-amber-500 cursor-pointer"
                            title="Edit line item"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 4: ADDITIONAL CONTRACT NOTES & ATTACHMENTS */}
      <div className={`p-4 sm:p-5 rounded-xl border ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50/80 border-slate-200'} space-y-4`}>
        <div className="flex items-center gap-2 border-b pb-3 dark:border-[#2D333D] border-slate-200">
          <FileText className="w-4 h-4 text-[rgb(14,145,145)] shrink-0" />
          <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-white">
            Additional Contract Notes & File Attachments
          </h4>
        </div>

        <div>
          <label className="block font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider mb-1">
            Additional Notes
          </label>
          <textarea 
            value={contractNotes}
            onChange={(e) => setContractNotes(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200'}`}
            placeholder="Add any additional remarks, custom covenants, payment milestone schedules, or special notes..."
            rows={3}
          />
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
              Attached Contract Documents
            </label>
            <label className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all">
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach File</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {contractAttachments.length === 0 ? (
            <div className="p-3 text-center text-slate-400 border border-dashed rounded-lg dark:border-slate-800 text-xs">
              No files attached to this contract yet. Click "Attach File" to upload contract PDFs or agreements.
            </div>
          ) : (
            <div className="space-y-2">
              {contractAttachments.map(att => (
                <div 
                  key={att.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[rgb(14,145,145)] shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{att.fileName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{att.fileSize} • Uploaded {att.uploadDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadAttachment(att)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-200 rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ==========================================
  // HANDLERS FOR MAPPINGS
  // ==========================================
  const handleOpenAddMappingModal = () => {
    setEditingMapping(null);
    const initialCust = customers[0];
    const initialProd = products[0];

    const numericCustId = initialCust ? parseInt(initialCust.id.replace(/\D/g, ''), 10) : 0;
    const numericProdId = initialProd ? parseInt(initialProd.id.replace(/\D/g, ''), 10) : 0;

    setMapCustomerId(numericCustId);
    setMapProductId(numericProdId);
    setMapProductSku(initialProd?.sku || '');
    setMapProductPrice(initialProd?.unitPrice || 0);
    setMapCustomerPrice(initialProd?.unitPrice || 0);

    setIsMappingModalOpen(true);
  };

  const handleOpenEditMappingModal = (mapping: CustomerProductMapping) => {
    setEditingMapping(mapping);
    setMapCustomerId(mapping.customerId);
    setMapProductId(mapping.productId);
    setMapProductSku(mapping.productSku);
    setMapProductPrice(mapping.productUnitPrice);
    setMapCustomerPrice(mapping.customerUnitPrice);

    setIsMappingModalOpen(true);
  };

  const handleMappingCustomerChange = (idStr: string) => {
    setMapCustomerId(parseInt(idStr, 10));
  };

  const handleMappingProductChange = (idStr: string) => {
    const numericId = parseInt(idStr, 10);
    setMapProductId(numericId);
    const matched = products.find(p => parseInt(p.id.replace(/\D/g, ''), 10) === numericId);
    if (matched) {
      setMapProductSku(matched.sku);
      setMapProductPrice(matched.unitPrice);
      setMapCustomerPrice(matched.unitPrice);
    }
  };

  const handleMappingFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CustomerProductMapping = {
      id: editingMapping ? editingMapping.id : `map-${Date.now()}`,
      customerId: mapCustomerId,
      productId: mapProductId,
      productSku: mapProductSku,
      productUnitPrice: mapProductPrice,
      customerUnitPrice: mapCustomerPrice
    };

    const customer = customers.find(c => parseInt(c.id.replace(/\D/g, ''), 10) === mapCustomerId);
    const product = products.find(p => parseInt(p.id.replace(/\D/g, ''), 10) === mapProductId);

    if (editingMapping) {
      onEditMapping(payload);
      addAuditLog?.('Modify Negotiated Rate', `Negotiated pricing custom index updated for ${customer?.name || 'Customer'}. SKU ${payload.productSku} price: $${payload.customerUnitPrice.toFixed(2)}`, 'Licenses');
    } else {
      onAddMapping(payload);
      addAuditLog?.('Associate Customer to Product', `Created client association and custom negotiated rate of $${payload.customerUnitPrice.toFixed(2)} on SKU ${payload.productSku} for ${customer?.name || 'Customer'}.`, 'Licenses');
    }

    setIsMappingModalOpen(false);
  };


  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[rgb(14,145,145)]" />
            <span>Licensing Hub</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-medium">
            Build enterprise contract agreements, customize negotiated pricing models, and map customer product associations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {activeSubSection === 'contracts' && !selectedContractId && (
            <button
              onClick={handleOpenAddContract}
              className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-[rgb(14,145,145)]/10 transition-all cursor-pointer shrink-0 animate-fade-in"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Contract</span>
            </button>
          )}

          {activeSubSection === 'mappings' && (
            <button
              onClick={handleOpenAddMappingModal}
              className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-[rgb(14,145,145)]/10 transition-all cursor-pointer shrink-0 animate-fade-in"
            >
              <Plus className="w-4 h-4" />
              <span>Associate Product to Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-SECTION TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 dark:border-[#2D333D] gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => {
            setActiveSubSection('contracts');
            setSelectedContractId(null);
            setIsDetailEditing(false);
            setActiveDetailView('none');
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubSection === 'contracts'
              ? 'border-[rgb(14,145,145)] text-[rgb(14,145,145)] bg-slate-50 dark:bg-slate-900/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Contract Agreements</span>
        </button>

        <button
          onClick={() => {
            setActiveSubSection('mappings');
            setActiveDetailView('none');
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubSection === 'mappings'
              ? 'border-[rgb(14,145,145)] text-[rgb(14,145,145)] bg-slate-50 dark:bg-slate-900/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Product Associations & Pricing</span>
        </button>
      </div>


      {/* ==========================================================
          SUBSECTION 1: CONTRACT AGREEMENTS
          ========================================================== */}
      {activeSubSection === 'contracts' && (
        <div className="space-y-6 animate-fade-in">
          
          {activeDetailView === 'active-contracts' ? (
            <ActiveContractsDetailView
              contracts={contracts}
              customers={customers}
              isDark={isDark}
              onBack={() => setActiveDetailView('none')}
              onSelectContract={(con) => {
                setSelectedContractId(con.id);
                setActiveDetailView('none');
              }}
            />
          ) : activeDetailView === 'contracted-revenue' ? (
            <ContractedRevenueDetailView
              contracts={contracts}
              isDark={isDark}
              onBack={() => setActiveDetailView('none')}
              onSelectContract={(con) => {
                setSelectedContractId(con.id);
                setActiveDetailView('none');
              }}
            />
          ) : selectedContractId ? (
            /* DETAILED VIEW CAPABILITY (DOCK OR OVERLAY LAYOUT) */
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-md'}`}>
              
              {/* Back button header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-gray-800 border-slate-100 mb-6">
                <button
                  onClick={() => {
                    setSelectedContractId(null);
                    setIsDetailEditing(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-gray-200' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Contracts Registry</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (isDetailEditing) {
                        setIsDetailEditing(false);
                      } else {
                        const orig = contracts.find(c => c.id === selectedContractId);
                        if (orig) {
                          populateContractFormFromObj(orig);
                        }
                        setIsDetailEditing(true);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                      isDetailEditing 
                        ? 'bg-rose-500 hover:bg-rose-600 border-rose-500 text-white' 
                        : 'bg-amber-500 hover:bg-amber-600 border-amber-500 text-white font-extrabold'
                    }`}
                  >
                    {isDetailEditing ? 'Cancel Edit' : 'Edit Contract Terms'}
                  </button>

                  <button
                    onClick={() => handleDeleteContractClick(selectedContractId)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg border border-red-600 cursor-pointer transition-all"
                  >
                    Delete Contract
                  </button>
                </div>
              </div>

              {isDetailEditing ? (
                /* INLINE EDIT FORM FOR SELECTED CONTRACT */
                <form onSubmit={handleContractFormSubmit} className="space-y-6">
                  {renderContractFormContent()}
                  <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
                    <button 
                      type="button"
                      onClick={() => setIsDetailEditing(false)}
                      className={`px-5 py-2.5 rounded-lg font-bold cursor-pointer ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg cursor-pointer font-extrabold shadow-md transition-all"
                    >
                      Save Contract Modifications
                    </button>
                  </div>
                </form>
              ) : (
                /* BEAUTIFUL COMPREHENSIVE DETAIL READOUT CARD */
                (() => {
                  const selCon = contracts.find(c => c.id === selectedContractId);
                  if (!selCon) return null;

                  const cust = customers.find(c => c.id === selCon.customerId);
                  const items = (selCon.productsLineItems && selCon.productsLineItems.length > 0)
                    ? selCon.productsLineItems
                    : [{
                        id: `item-legacy-${selCon.id}`,
                        productId: `prod-${selCon.productSku}`,
                        productName: selCon.productName,
                        productSku: selCon.productSku,
                        licenseStartDate: selCon.startDate,
                        licenseEndDate: selCon.endDate,
                        licenseDurationMonths: selCon.termMonths,
                        defaultPrice: selCon.unitPrice,
                        contractedPrice: selCon.unitPrice,
                        units: selCon.purchasedUnits
                      }];

                  const totalValue = items.reduce((acc, it) => acc + (it.contractedPrice * it.units * (it.licenseDurationMonths || 12)), 0);

                  return (
                    <div className="space-y-6 text-xs">
                      {/* Top Header Banner */}
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border dark:border-gray-800 border-slate-100">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[rgb(14,145,145)]" />
                            <span>{selCon.name}</span>
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-400 font-mono mt-1">
                            <span>Agreement ID: {selCon.id}</span>
                            <span>•</span>
                            <span>Client: <strong className="text-slate-900 dark:text-white font-sans">{selCon.customerName}</strong></span>
                            <span>•</span>
                            <span>Term: {selCon.startDate} to {selCon.endDate}</span>
                          </div>
                        </div>

                        <div className="flex flex-col text-left md:text-right">
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Contract Value</span>
                          <span className="text-2xl font-black text-emerald-500 font-mono">
                            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Customer Contact Details Card */}
                      {cust && (
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50/80 border-slate-200'} space-y-3`}>
                          <div className="flex items-center gap-2 border-b pb-2 dark:border-[#2D333D] border-slate-200">
                            <Building2 className="w-4 h-4 text-[rgb(14,145,145)]" />
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                              Customer Contact Details ({cust.name})
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
                              <div className="font-bold text-[10px] text-[rgb(14,145,145)] uppercase mb-1">Primary Contact</div>
                              <div className="font-bold text-slate-900 dark:text-white">{cust.primaryContactName || 'N/A'}</div>
                              <div className="text-slate-400 text-[11px] font-mono">{cust.primaryContactPhone || 'N/A'}</div>
                              <div className="text-slate-400 text-[11px] font-mono">{cust.primaryContactEmail || 'N/A'}</div>
                            </div>

                            <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
                              <div className="font-bold text-[10px] text-[rgb(14,145,145)] uppercase mb-1">Billing Contact</div>
                              <div className="font-bold text-slate-900 dark:text-white">{cust.billingContactName || 'N/A'}</div>
                              <div className="text-slate-400 text-[11px] font-mono">{cust.billingContactPhone || 'N/A'}</div>
                              <div className="text-slate-400 text-[11px] font-mono">{cust.billingContactEmail || 'N/A'}</div>
                            </div>

                            <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
                              <div className="font-bold text-[10px] text-[rgb(14,145,145)] uppercase mb-1">Technical Contact</div>
                              <div className="font-bold text-slate-900 dark:text-white">{cust.supportContactName || 'N/A'}</div>
                              <div className="text-slate-400 text-[11px] font-mono">{cust.supportContactPhone || 'N/A'}</div>
                              <div className="text-slate-400 text-[11px] font-mono">{cust.supportContactEmail || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Products Line Items Table */}
                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50/80 border-slate-200'} space-y-3`}>
                        <div className="flex items-center gap-2 border-b pb-2 dark:border-[#2D333D] border-slate-200">
                          <Layers className="w-4 h-4 text-[rgb(14,145,145)]" />
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                            Licensed Products & Contract Pricing ({items.length} Product Line Items)
                          </h4>
                        </div>

                        <div className="overflow-x-auto border rounded-xl dark:border-[#2D333D]">
                          <table className="w-full text-left text-xs">
                            <thead className={`font-bold uppercase tracking-wider ${isDark ? 'bg-[#1A1D23] text-gray-400 border-b border-[#2D333D]' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}`}>
                              <tr>
                                <th className="p-3">Product Name & SKU</th>
                                <th className="p-3">License Period</th>
                                <th className="p-3">Duration</th>
                                <th className="p-3 text-right">Default Price</th>
                                <th className="p-3 text-right">Contracted Price</th>
                                <th className="p-3 text-center">Units</th>
                                <th className="p-3 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-[#2D333D] divide-slate-200 font-medium">
                              {items.map((it, i) => (
                                <tr key={it.id || i} className={isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'}>
                                  <td className="p-3">
                                    <div className="font-bold text-slate-900 dark:text-white">{it.productName}</div>
                                    <div className="text-[10px] font-mono text-slate-400">{it.productSku}</div>
                                  </td>
                                  <td className="p-3 font-mono text-[11px]">{it.licenseStartDate} to {it.licenseEndDate}</td>
                                  <td className="p-3 font-bold text-emerald-500">{it.licenseDurationMonths} mos</td>
                                  <td className="p-3 text-right font-mono text-slate-400">${it.defaultPrice.toFixed(2)}</td>
                                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">${it.contractedPrice.toFixed(2)}</td>
                                  <td className="p-3 text-center font-bold">{it.units}</td>
                                  <td className="p-3 text-right font-mono font-extrabold text-[rgb(14,145,145)]">
                                    ${(it.contractedPrice * it.units).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Notes and Attachments */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50/80 border-slate-200'} space-y-2`}>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Contract Scope & Notes</h4>
                          <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {selCon.notes || selCon.description || 'No notes specified.'}
                          </p>
                        </div>

                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50/80 border-slate-200'} space-y-2`}>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Attached Documents</h4>
                          {(!selCon.attachments || selCon.attachments.length === 0) ? (
                            <p className="text-xs text-slate-400 italic">No document attachments uploaded.</p>
                          ) : (
                            <div className="space-y-2">
                              {selCon.attachments.map(att => (
                                <div key={att.id} className={`flex items-center justify-between p-2.5 rounded-lg border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[rgb(14,145,145)]" />
                                    <div>
                                      <div className="font-bold text-slate-900 dark:text-white text-xs">{att.fileName}</div>
                                      <div className="text-[10px] text-slate-400 font-mono">{att.fileSize} • {att.uploadDate}</div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDownloadAttachment(att)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-200 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Download</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            /* CONSOLIDATED LIST VIEW WITH INTERACTIVE MULTI-FILTERS & TOGGLE */
            <div className="space-y-6">
              
              {/* ADVANCED FILTER BAR */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs space-y-4`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  
                  {/* Status Selection */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Agreement Status</label>
                    <CustomSelect
                      value={contractFilterStatus}
                      onChange={setContractFilterStatus}
                      options={[
                        { value: 'all', label: 'All Statuses' },
                        { value: 'active', label: 'Active Only' },
                        { value: 'expired', label: 'Expired / Inactive' }
                      ]}
                      isDark={isDark}
                    />
                  </div>

                  {/* Customer Selection */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tenant Corporate</label>
                    <CustomSelect
                      value={contractFilterCustomerId}
                      onChange={setContractFilterCustomerId}
                      options={[
                        { value: 'all', label: 'All Clients' },
                        ...customers.map(c => ({ value: c.id, label: c.name }))
                      ]}
                      isDark={isDark}
                    />
                  </div>

                  {/* Sort Controls */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sort Sequence</label>
                    <CustomSelect
                      value={contractSortBy}
                      onChange={setContractSortBy}
                      options={[
                        { value: 'name', label: 'Contract Title' },
                        { value: 'value', label: 'Total Value (High-Low)' },
                        { value: 'endDate', label: 'End Date (Earliest First)' }
                      ]}
                      isDark={isDark}
                    />
                  </div>

                  {/* Search Query */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Search Keywords</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={contractSearchQuery}
                        onChange={(e) => setContractSearchQuery(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-hidden transition-all ${
                          isDark 
                            ? 'bg-[#0F1115] border-[#2D333D] text-white focus:border-[rgb(14,145,145)]' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[rgb(14,145,145)]'
                        }`}
                        placeholder="Search customer, title, SKU..."
                      />
                    </div>
                  </div>

                </div>

                {/* VIEW MODE SELECTION BAR */}
                <div className="flex justify-between items-center border-t dark:border-gray-800 pt-3 border-slate-100">
                  <div className="text-[11px] text-gray-400 font-mono">
                    Showing <span className="font-bold text-slate-800 dark:text-white">{filteredContracts.length}</span> of <span className="font-bold">{contracts.length}</span> active corporate contracts
                  </div>

                  <div className="flex items-center gap-1.5 border dark:border-gray-800 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/60">
                    <button
                      onClick={() => setContractViewMode('table')}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        contractViewMode === 'table'
                          ? 'bg-[rgb(14,145,145)] text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                      }`}
                      title="Table Layout View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setContractViewMode('card')}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        contractViewMode === 'card'
                          ? 'bg-[rgb(14,145,145)] text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                      }`}
                      title="Grid Cards View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* QUICK NUMERIC SUMMARY STATS TILES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div 
                  onClick={() => setActiveDetailView('active-contracts')}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group shadow-2xs ${
                    isDark 
                      ? 'bg-[#1A1D23] border-[#2D333D] hover:border-emerald-500 hover:bg-[#1E2530]' 
                      : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md'
                  }`}
                  title="Click to open Active Contract Agreements details page"
                >
                  <p className="text-[10px] uppercase font-mono font-bold text-slate-400 group-hover:text-emerald-500 transition-colors">Active Contract Agreements</p>
                  <p className="text-2xl font-black mt-1 text-emerald-500">
                    {contracts.filter(c => c.endDate >= today).length}
                  </p>
                  <div className="text-[9px] text-teal-600 dark:text-teal-400 font-bold mt-2 flex items-center gap-1 group-hover:underline">
                    <span>Analyze active SLAs & terms</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveDetailView('contracted-revenue')}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group shadow-2xs ${
                    isDark 
                      ? 'bg-[#1A1D23] border-[#2D333D] hover:border-[rgb(14,145,145)] hover:bg-[#1E2530]' 
                      : 'bg-white border-slate-200 hover:border-[rgb(14,145,145)] hover:shadow-md'
                  }`}
                  title="Click to open Total Contracted Revenue details page"
                >
                  <p className="text-[10px] uppercase font-mono font-bold text-slate-400 group-hover:text-[rgb(14,145,145)] transition-colors">Total Contracted Revenue</p>
                  <p className="text-2xl font-black mt-1 text-[rgb(14,145,145)]">
                    ${contracts.reduce((sum, c) => sum + (c.unitPrice * c.purchasedUnits * c.termMonths), 0).toLocaleString()}
                  </p>
                  <div className="text-[9px] text-teal-600 dark:text-teal-400 font-bold mt-2 flex items-center gap-1 group-hover:underline">
                    <span>Audit revenue splits & pipelines</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
                  <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Seats Bound</p>
                  <p className="text-2xl font-black mt-1 text-indigo-500">
                    {contracts.reduce((sum, c) => sum + c.purchasedUnits, 0).toLocaleString()} Seats
                  </p>
                  <div className="text-[9px] text-slate-400 font-mono mt-2">
                    Across {contracts.length} agreements
                  </div>
                </div>
              </div>

              {/* BULK ACTION BAR WHEN ITEMS CHECKED */}
              {selectedContractIds.length > 0 && (
                <div className="flex items-center justify-between p-3 px-4 bg-[rgb(14,145,145)]/10 border border-[rgb(14,145,145)]/30 rounded-xl text-xs font-bold text-[rgb(14,145,145)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>{selectedContractIds.length} customer contract(s) selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedContractIds([])}
                      className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-200 cursor-pointer font-bold transition-all"
                    >
                      Deselect All
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${selectedContractIds.length} selected contract(s)?`)) {
                          selectedContractIds.forEach(id => onDeleteContract(id));
                          setSelectedContractIds([]);
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer font-bold flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedContractIds.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TABLE OR CARD RENDERING FOR CONTRACTS */}
              {contractViewMode === 'table' ? (
                /* 1. TABLE LAYOUT */
                <div className={`border rounded-xl overflow-hidden shadow-2xs ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className={`border-b text-[10px] uppercase font-mono tracking-wider font-extrabold ${isDark ? 'bg-[#0F1115]/60 border-[#2D333D] text-gray-400' : 'bg-slate-50/70 border-slate-100 text-slate-500'}`}>
                          <th className="px-3 py-3.5 text-center w-10">
                            <input 
                              type="checkbox" 
                              checked={isAllOnPageSelected}
                              onChange={handleToggleSelectAllOnPage}
                              className="w-4 h-4 rounded border-slate-300 text-[rgb(14,145,145)] focus:ring-[rgb(14,145,145)] cursor-pointer"
                              title="Select all on current page"
                            />
                          </th>
                          <th className="px-3 py-3.5 text-center w-14">S.No</th>
                          <th className="px-5 py-3.5">Client Corporate</th>
                          <th className="px-5 py-3.5">Contract Reference Name</th>
                          <th className="px-5 py-3.5">Software Module SKU</th>
                          <th className="px-5 py-3.5 text-right">Negotiated Seat Price</th>
                          <th className="px-5 py-3.5 text-center">Seat Capacity</th>
                          <th className="px-5 py-3.5 text-right">Contract Value</th>
                          <th className="px-5 py-3.5">Termination Date</th>
                          <th className="px-5 py-3.5 text-center">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#2D333D]">
                        {filteredContracts.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="px-5 py-12 text-center text-gray-400 italic font-medium">
                              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                              <span>No contractual records match current criteria.</span>
                            </td>
                          </tr>
                        ) : (
                          paginatedContracts.map((con, index) => {
                            const today = new Date().toISOString().split('T')[0];
                            const isActive = con.endDate >= today;
                            const totalVal = con.unitPrice * con.purchasedUnits * con.termMonths;
                            const serialNumber = (safeCurrentPage - 1) * itemsPerPage + index + 1;

                            return (
                              <tr key={con.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/10 transition-colors">
                                <td className="px-3 py-4 text-center w-10">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedContractIds.includes(con.id)}
                                    onChange={() => handleToggleSelectContract(con.id)}
                                    className="w-4 h-4 rounded border-slate-300 text-[rgb(14,145,145)] focus:ring-[rgb(14,145,145)] cursor-pointer"
                                  />
                                </td>
                                <td className="px-3 py-4 text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                                  #{serialNumber}
                                </td>
                                <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                                  {con.customerName}
                                </td>
                                <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                                  {con.name}
                                </td>
                                <td className="px-5 py-4 font-mono font-medium text-slate-400">
                                  {con.productSku}
                                </td>
                                <td className="px-5 py-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                                  ${con.unitPrice.toFixed(2)}
                                </td>
                                <td className="px-5 py-4 text-center font-bold text-slate-900 dark:text-white">
                                  {con.purchasedUnits}
                                </td>
                                <td className="px-5 py-4 text-right font-mono font-black text-emerald-500">
                                  ${totalVal.toLocaleString()}
                                </td>
                                <td className="px-5 py-4 font-mono font-semibold text-slate-500">
                                  {con.endDate}
                                </td>
                                <td className="px-5 py-4 text-center">
                                  {isActive ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider">
                                      Expired
                                    </span>
                                  )}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => {
                                        setSelectedContractId(con.id);
                                        setEditingContract(con);
                                        setContractName(con.name);
                                        setContractDesc(con.description);
                                        setContractCustomerId(con.customerId);
                                        setContractProductSku(con.productSku);
                                        setContractUnitPrice(con.unitPrice);
                                        setContractPurchasedUnits(con.purchasedUnits);
                                        setContractActiveUnits(con.activeUnits);
                                        setContractTermMonths(con.termMonths);
                                        setContractStartDate(con.startDate);
                                        setContractEndDate(con.endDate);
                                        setIsDetailEditing(false);
                                      }}
                                      className="px-2.5 py-1 text-slate-600 dark:text-gray-300 hover:text-white hover:bg-[rgb(14,145,145)] bg-slate-100 dark:bg-slate-800 rounded-md font-bold transition-all cursor-pointer"
                                    >
                                      Open Details
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
              ) : (
                /* 2. CARD VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredContracts.length === 0 ? (
                    <div className={`col-span-2 p-12 text-center border rounded-xl ${
                      isDark ? 'border-[#2D333D] text-gray-400' : 'border-slate-200 text-slate-400 shadow-3xs'
                    }`}>
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                      <span>No contract agreements matched your custom criteria.</span>
                    </div>
                  ) : (
                    paginatedContracts.map((con, index) => {
                      const today = new Date().toISOString().split('T')[0];
                      const isActive = con.endDate >= today;
                      const serialNumber = (safeCurrentPage - 1) * itemsPerPage + index + 1;

                      return (
                        <div 
                          key={con.id}
                          onClick={() => {
                            setSelectedContractId(con.id);
                            setEditingContract(con);
                            setContractName(con.name);
                            setContractDesc(con.description);
                            setContractCustomerId(con.customerId);
                            setContractProductSku(con.productSku);
                            setContractUnitPrice(con.unitPrice);
                            setContractPurchasedUnits(con.purchasedUnits);
                            setContractActiveUnits(con.activeUnits);
                            setContractTermMonths(con.termMonths);
                            setContractStartDate(con.startDate);
                            setContractEndDate(con.endDate);
                            setIsDetailEditing(false);
                          }}
                          className={`group p-5 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-101 hover:shadow-lg ${
                            isDark 
                              ? 'bg-[#1A1D23] border-[#2D333D] hover:border-[rgb(14,145,145)]/50' 
                              : 'bg-white border-slate-200 shadow-2xs hover:border-[rgb(14,145,145)]'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedContractIds.includes(con.id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleSelectContract(con.id);
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-[rgb(14,145,145)] focus:ring-[rgb(14,145,145)] cursor-pointer"
                                />
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                                  #{serialNumber}
                                </span>
                              </div>

                              <div>
                                <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                  {con.name}
                                </h3>
                                <p className="text-[10px] font-mono text-gray-500 mt-0.5">ID: {con.id}</p>
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-xs">
                                  <span className="font-bold text-gray-400">Customer: </span>
                                  <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{con.customerName}</span>
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  <p>
                                    <span className="font-bold text-gray-400">Start: </span>
                                    <span className="font-mono">{con.startDate}</span>
                                  </p>
                                  <p>
                                    <span className="font-bold text-gray-400">End: </span>
                                    <span className="font-mono">{con.endDate}</span>
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider">
                                  Expired
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* PAGINATION CONTROLS */}
              {filteredContracts.length > 0 && (
                <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t ${isDark ? 'border-[#2D333D]' : 'border-slate-200'} text-xs`}>
                  <div className="text-slate-500 dark:text-gray-400 font-medium">
                    Showing <span className="font-bold text-slate-800 dark:text-white">{(safeCurrentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-800 dark:text-white">{Math.min(safeCurrentPage * itemsPerPage, filteredContracts.length)}</span> of <span className="font-bold text-slate-800 dark:text-white">{filteredContracts.length}</span> entries
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
                    <div className="flex items-center gap-1">
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
            </div>
          )}
        </div>
      )}


      {/* ==========================================================
          SUBSECTION 2: PRODUCT ASSOCIATIONS & NEGOTIATED PRICING
          ========================================================== */}
      {activeSubSection === 'mappings' && (
        <div className="space-y-4 animate-fade-in">
          {/* QUICK SUMMARY FOR MAPPINGS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Customer-Product Associations</p>
              <p className="text-2xl font-black mt-1 text-[rgb(14,145,145)]">{customerProductMappings.length}</p>
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Custom Negotiated Rates Enabled</p>
              <p className="text-2xl font-black mt-1 text-amber-500">
                {customerProductMappings.filter(m => m.customerUnitPrice !== m.productUnitPrice).length}
              </p>
            </div>
          </div>

          {/* SEARCH BAR FOR MAPPINGS */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={mappingSearchQuery}
              onChange={(e) => setMappingSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-hidden transition-all ${
                isDark 
                  ? 'bg-[#0F1115] border-[#2D333D] text-white focus:border-[rgb(14,145,145)]' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[rgb(14,145,145)]'
              }`}
              placeholder="Search mappings by company name, product name, SKU..."
            />
          </div>

          {/* MAPPING TABLE */}
          <div className={`border rounded-xl overflow-hidden shadow-2xs ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] uppercase tracking-wider font-mono font-extrabold ${isDark ? 'bg-[#0F1115]/60 border-[#2D333D] text-gray-400' : 'bg-slate-50/70 border-slate-100 text-slate-500'}`}>
                    <th className="px-5 py-3.5 text-center w-12">S/No.</th>
                    <th className="px-5 py-3.5">Customer (ID)</th>
                    <th className="px-5 py-3.5">Product (ID)</th>
                    <th className="px-5 py-3.5 font-mono">Product SKU</th>
                    <th className="px-5 py-3.5">List Price</th>
                    <th className="px-5 py-3.5">Customer Unit Price</th>
                    <th className="px-5 py-3.5">Price Delta Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#2D333D] text-xs">
                  {filteredMappings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-slate-400 dark:text-gray-500">
                        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                        <span>No customer-product associations matched your query.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredMappings.map((map, index) => {
                      const customer = customers.find(c => parseInt(c.id.replace(/\D/g, ''), 10) === map.customerId);
                      const product = products.find(p => parseInt(p.id.replace(/\D/g, ''), 10) === map.productId);
                      
                      const diff = map.productUnitPrice - map.customerUnitPrice;
                      const hasCustomPrice = map.customerUnitPrice !== map.productUnitPrice;
                      
                      return (
                        <tr key={map.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-5 py-4 text-center font-bold text-slate-400 font-mono">
                            {index + 1}
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                            <div>{customer?.name || `Customer #${map.customerId}`}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {map.customerId}</div>
                          </td>
                          <td className="px-5 py-4 text-slate-700 dark:text-slate-200">
                            <div className="font-semibold">{product?.name || `Product #${map.productId}`}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {map.productId}</div>
                          </td>
                          <td className="px-5 py-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                            {map.productSku}
                          </td>
                          <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-300">
                            ${map.productUnitPrice.toFixed(2)}
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-[rgb(14,145,145)]">
                            ${map.customerUnitPrice.toFixed(2)}
                          </td>
                          <td className="px-5 py-4">
                            {hasCustomPrice ? (
                              diff > 0 ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                                  <span>Discount: -${diff.toFixed(2)}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                                  <span>Premium: +${(-diff).toFixed(2)}</span>
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                                  <span>Standard List Rate</span>
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditMappingModal(map)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this product association pricing?')) {
                                    onDeleteMapping(map.id);
                                    addAuditLog?.('Delete Negotiated Price Map', `Permanently deleted mapping pricing register index: ${map.id}`, 'Licenses');
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
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

      {/* ==========================================
          MODALS
          ========================================== */}

      {/* MODAL 1: CONTRACT MODAL */}
      {isContractModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className={`w-full max-w-4xl rounded-2xl shadow-2xl p-6 my-8 overflow-y-auto max-h-[90vh] ${isDark ? 'bg-[#1A1D23] border border-[#2D333D] text-white' : 'bg-white border text-slate-800'}`}>
            <div className="flex items-center justify-between border-b pb-4 mb-6 dark:border-[#2D333D] border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)]">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    {editingContract ? 'Edit Customer Contract' : 'Add New Customer Contract'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Define contract overview, customer contact details, product line items with contracted pricing, and notes.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsContractModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContractFormSubmit} className="space-y-6">
              {renderContractFormContent()}

              <div className="flex justify-end gap-3 border-t pt-4 dark:border-[#2D333D]">
                <button 
                  type="button" 
                  onClick={() => setIsContractModalOpen(false)}
                  className={`px-5 py-2.5 rounded-lg cursor-pointer font-bold ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg cursor-pointer font-extrabold shadow-md shadow-[rgb(14,145,145)]/20 transition-all"
                >
                  {editingContract ? 'Save Contract Modifications' : 'Save Customer Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOM MAPPING MODAL */}
      {isMappingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-7 border transition-all ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex items-center justify-between border-b pb-4 mb-5 dark:border-[#2D333D] border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    {editingMapping ? 'Modify Negotiated Rate' : 'Associate Client to Product'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">
                    Map corporate clients to software modules and set custom contracted rates.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsMappingModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMappingFormSubmit} className="space-y-5 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-200 mb-1.5">
                    Select Customer
                  </label>
                  <CustomSelect
                    value={String(mapCustomerId)}
                    onChange={handleMappingCustomerChange}
                    options={customers.map(c => ({ value: String(parseInt(c.id.replace(/\D/g, ''), 10)), label: c.name }))}
                    isDark={isDark}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-200 mb-1.5">
                    Select Product Module
                  </label>
                  <CustomSelect
                    value={String(mapProductId)}
                    onChange={handleMappingProductChange}
                    options={products.map(p => ({ value: String(parseInt(p.id.replace(/\D/g, ''), 10)), label: `${p.name} (${p.sku})` }))}
                    isDark={isDark}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border dark:border-[#2D333D] border-slate-100 bg-slate-50/50 dark:bg-[#0F1115]/30">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-gray-400 text-[11px] mb-1.5">
                    Product SKU
                  </label>
                  <input 
                    type="text" 
                    value={mapProductSku || '-'}
                    readOnly
                    className={`w-full px-3 py-2 rounded-lg border font-mono font-bold outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-gray-400 text-[11px] mb-1.5">
                    Standard List Price
                  </label>
                  <input 
                    type="text" 
                    value={`$${mapProductPrice.toFixed(2)}`}
                    readOnly
                    className={`w-full px-3 py-2 rounded-lg border font-mono font-bold outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-gray-200 text-[11px] mb-1.5">
                    Negotiated Rate ($)
                  </label>
                  <input 
                    type="number" 
                    value={mapCustomerPrice}
                    onChange={(e) => setMapCustomerPrice(Number(e.target.value))}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 rounded-lg border font-mono font-bold outline-hidden focus:ring-2 focus:ring-[rgb(14,145,145)]/40 ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-emerald-400' : 'bg-white border-slate-300 text-emerald-700'}`}
                    required
                  />
                </div>
              </div>

              {/* Price Variance Summary Badge */}
              {mapProductPrice > 0 && (
                <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-lg border dark:border-[#2D333D] border-slate-100 bg-slate-50 dark:bg-slate-900/40">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Price Variance relative to List:</span>
                  <span className={`font-bold font-mono ${mapCustomerPrice < mapProductPrice ? 'text-emerald-500' : mapCustomerPrice > mapProductPrice ? 'text-amber-500' : 'text-slate-400'}`}>
                    {mapCustomerPrice < mapProductPrice 
                      ? `-$${(mapProductPrice - mapCustomerPrice).toFixed(2)} (${(((mapProductPrice - mapCustomerPrice) / mapProductPrice) * 100).toFixed(1)}% Discount)`
                      : mapCustomerPrice > mapProductPrice
                      ? `+$${(mapCustomerPrice - mapProductPrice).toFixed(2)} (${(((mapCustomerPrice - mapProductPrice) / mapProductPrice) * 100).toFixed(1)}% Premium)`
                      : 'Standard List Price (0% variance)'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t pt-4 dark:border-[#2D333D] border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsMappingModalOpen(false)}
                  className={`px-5 py-2 rounded-lg cursor-pointer font-bold ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg cursor-pointer font-extrabold shadow-md shadow-[rgb(14,145,145)]/20 transition-all"
                >
                  {editingMapping ? 'Save Rate Modifications' : 'Save Client Association'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] ${isDark ? 'bg-[#1A1D23] border border-[#2D333D] text-white' : 'bg-white border text-slate-800'}`}>
            <div className="flex items-center gap-3 border-b pb-4 mb-4 dark:border-[#2D333D] border-slate-100">
              <Trash2 className="w-6 h-6 text-red-500 shrink-0" />
              <h3 className="font-extrabold text-lg text-red-500">
                Confirm Deletion
              </h3>
            </div>
            
            <p className="text-sm font-medium mb-6 text-slate-600 dark:text-gray-300">
              Do you want to delete the Contract?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={handleCancelDelete}
                className={`px-4 py-2 rounded-lg cursor-pointer text-xs font-bold transition-all ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                No
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer text-xs font-bold shadow-md shadow-red-600/10 transition-all"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// DETAILED "ACTIVE CONTRACT AGREEMENTS" PAGE
// ==========================================
interface ActiveContractsDetailViewProps {
  contracts: Contract[];
  customers: Customer[];
  isDark: boolean;
  onBack: () => void;
  onSelectContract: (con: Contract) => void;
}

function ActiveContractsDetailView({
  contracts,
  customers,
  isDark,
  onBack,
  onSelectContract
}: ActiveContractsDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  const activeContracts = useMemo(() => {
    return contracts.filter(c => c.endDate >= today);
  }, [contracts, today]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return activeContracts.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.productSku.toLowerCase().includes(q)
    );
  }, [activeContracts, searchQuery]);

  const totalSeats = useMemo(() => {
    return activeContracts.reduce((sum, c) => sum + c.purchasedUnits, 0);
  }, [activeContracts]);

  const totalValue = useMemo(() => {
    return activeContracts.reduce((sum, c) => sum + (c.unitPrice * c.purchasedUnits * c.termMonths), 0);
  }, [activeContracts]);

  const avgRate = useMemo(() => {
    if (activeContracts.length === 0) return 0;
    return activeContracts.reduce((sum, c) => sum + c.unitPrice, 0) / activeContracts.length;
  }, [activeContracts]);

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#1E2530] border-[#2D333D]' : 'bg-white border-slate-200 shadow-sm'} flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div className="space-y-2">
          <button
            onClick={onBack}
            className={`flex items-center gap-1.5 px-3 py-1 font-bold rounded-lg border transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-gray-200' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-3xs'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Registry</span>
          </button>
          <div>
            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>Active Contract Agreements Audit</span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              A comprehensive multi-dimensional view of currently operational corporate SLAs and seat allocations.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-lg border outline-hidden transition-all ${
              isDark 
                ? 'bg-[#0F1115] border-[#2D333D] text-white focus:border-[rgb(14,145,145)]' 
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[rgb(14,145,145)]'
            }`}
            placeholder="Search active agreements..."
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Active Agreements</p>
          <p className="text-2xl font-black mt-1 text-emerald-500">{activeContracts.length}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Seats Committed</p>
          <p className="text-2xl font-black mt-1 text-indigo-500">{totalSeats.toLocaleString()} Seats</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Active Value Pipeline</p>
          <p className="text-2xl font-black mt-1 text-[rgb(14,145,145)]">${totalValue.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Avg. Seat Rate / Mo</p>
          <p className="text-2xl font-black mt-1 text-amber-500">${avgRate.toFixed(2)}</p>
        </div>
      </div>

      {/* Active Contracts Table or Cards */}
      <div className={`border rounded-xl overflow-hidden shadow-2xs ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-mono tracking-wider font-extrabold ${isDark ? 'bg-[#0F1115]/60 border-[#2D333D] text-gray-400' : 'bg-slate-50/70 border-slate-100 text-slate-500'}`}>
                <th className="px-5 py-3">Client Corporate</th>
                <th className="px-5 py-3">Agreement Title</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3 text-center">Seat Capacity</th>
                <th className="px-5 py-3 text-right">Negotiated Rate</th>
                <th className="px-5 py-3 text-right">Lifetime Value</th>
                <th className="px-5 py-3">Term Remaining Timeline</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2D333D]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 italic font-medium">
                    No active agreements match your search.
                  </td>
                </tr>
              ) : (
                filtered.map(con => {
                  const start = new Date(con.startDate).getTime();
                  const end = new Date(con.endDate).getTime();
                  const now = new Date().getTime();
                  let percentElapsed = 0;
                  if (end > start) {
                    percentElapsed = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
                  }
                  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
                  const monthsLeft = (daysLeft / 30.4).toFixed(1);

                  return (
                    <tr key={con.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/10 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                        {con.customerName}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                        {con.name}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-400">
                        {con.productSku}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-slate-900 dark:text-white">
                        {con.purchasedUnits} Seats
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        ${con.unitPrice.toFixed(2)}/mo
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-black text-emerald-500">
                        ${(con.unitPrice * con.purchasedUnits * con.termMonths).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                            <span>{percentElapsed.toFixed(0)}% elapsed</span>
                            <span className="font-bold text-emerald-500">{monthsLeft} mo left</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${percentElapsed}%` }}
                            />
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">Expires: {con.endDate}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => onSelectContract(con)}
                          className="px-2.5 py-1 text-slate-600 dark:text-gray-300 hover:text-white hover:bg-[rgb(14,145,145)] bg-slate-100 dark:bg-slate-800 rounded-md font-bold transition-all cursor-pointer"
                        >
                          View Contract
                        </button>
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
  );
}

// ==========================================
// DETAILED "TOTAL CONTRACTED REVENUE" PAGE
// ==========================================
interface ContractedRevenueDetailViewProps {
  contracts: Contract[];
  isDark: boolean;
  onBack: () => void;
  onSelectContract: (con: Contract) => void;
}

function ContractedRevenueDetailView({
  contracts,
  isDark,
  onBack,
  onSelectContract
}: ContractedRevenueDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const totalRevenue = useMemo(() => {
    return contracts.reduce((sum, c) => sum + (c.unitPrice * c.purchasedUnits * c.termMonths), 0);
  }, [contracts]);

  const today = new Date().toISOString().split('T')[0];
  
  const activePipeline = useMemo(() => {
    return contracts
      .filter(c => c.endDate >= today)
      .reduce((sum, c) => sum + (c.unitPrice * c.purchasedUnits * c.termMonths), 0);
  }, [contracts, today]);

  const expiredValue = useMemo(() => {
    return contracts
      .filter(c => c.endDate < today)
      .reduce((sum, c) => sum + (c.unitPrice * c.purchasedUnits * c.termMonths), 0);
  }, [contracts, today]);

  const contractedMRR = useMemo(() => {
    return contracts
      .filter(c => c.endDate >= today)
      .reduce((sum, c) => sum + (c.unitPrice * c.purchasedUnits), 0);
  }, [contracts, today]);

  // Client breakdown
  const clientRevenue = useMemo(() => {
    const map: Record<string, { name: string, value: number, count: number }> = {};
    contracts.forEach(c => {
      const val = c.unitPrice * c.purchasedUnits * c.termMonths;
      if (!map[c.customerId]) {
        map[c.customerId] = { name: c.customerName, value: 0, count: 0 };
      }
      map[c.customerId].value += val;
      map[c.customerId].count += 1;
    });
    return Object.values(map)
      .map(x => ({ ...x, percentage: totalRevenue > 0 ? (x.value / totalRevenue) * 100 : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [contracts, totalRevenue]);

  // Module breakdown
  const moduleRevenue = useMemo(() => {
    const map: Record<string, { sku: string, name: string, value: number }> = {};
    contracts.forEach(c => {
      const val = c.unitPrice * c.purchasedUnits * c.termMonths;
      if (!map[c.productSku]) {
        map[c.productSku] = { sku: c.productSku, name: c.productName, value: 0 };
      }
      map[c.productSku].value += val;
    });
    return Object.values(map)
      .map(x => ({ ...x, percentage: totalRevenue > 0 ? (x.value / totalRevenue) * 100 : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [contracts, totalRevenue]);

  const filteredContracts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return contracts.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.productSku.toLowerCase().includes(q)
    ).sort((a, b) => {
      const valA = a.unitPrice * a.purchasedUnits * a.termMonths;
      const valB = b.unitPrice * b.purchasedUnits * b.termMonths;
      return valB - valA; // High-to-low revenue by default
    });
  }, [contracts, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#1E2530] border-[#2D333D]' : 'bg-white border-slate-200 shadow-sm'} flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div className="space-y-2">
          <button
            onClick={onBack}
            className={`flex items-center gap-1.5 px-3 py-1 font-bold rounded-lg border transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-gray-200' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-3xs'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Registry</span>
          </button>
          <div>
            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
              <DollarSign className="w-5 h-5 text-[rgb(14,145,145)]" />
              <span>Total Contracted Revenue Analysis</span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              Detailed audit of cumulative software revenue pipelines, corporate client values, and module contribution shares.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-lg border outline-hidden transition-all ${
              isDark 
                ? 'bg-[#0F1115] border-[#2D333D] text-white focus:border-[rgb(14,145,145)]' 
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[rgb(14,145,145)]'
            }`}
            placeholder="Search and sort by value..."
          />
        </div>
      </div>

      {/* Financial Performance Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Cumulative Value</p>
          <p className="text-2xl font-black mt-1 text-[rgb(14,145,145)]">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Active Contract Pipeline</p>
          <p className="text-2xl font-black mt-1 text-emerald-500">${activePipeline.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Expired/Archived Value</p>
          <p className="text-2xl font-black mt-1 text-rose-500">${expiredValue.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs`}>
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Active Monthly MRR Equivalent</p>
          <p className="text-2xl font-black mt-1 text-amber-500">${contractedMRR.toLocaleString()}/mo</p>
        </div>
      </div>

      {/* Revenue Breakdown Charts (Bento Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Client Contribution */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs space-y-4`}>
          <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400">Corporate Clients Revenue Share</h4>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {clientRevenue.map(client => (
              <div key={client.name} className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>{client.name} ({client.count} agreement{client.count > 1 ? 's' : ''})</span>
                  <span className="font-mono text-[rgb(14,145,145)] font-bold">
                    ${client.value.toLocaleString()} ({client.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[rgb(14,145,145)] rounded-full transition-all duration-500" 
                    style={{ width: `${client.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. SKU Contribution */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'} shadow-2xs space-y-4`}>
          <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400">Product Module Contribution Rate</h4>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {moduleRevenue.map(mod => (
              <div key={mod.sku} className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>{mod.name} ({mod.sku})</span>
                  <span className="font-mono text-emerald-500 font-bold">
                    ${mod.value.toLocaleString()} ({mod.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${mod.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contract Revenue Registry Table */}
      <div className={`border rounded-xl overflow-hidden shadow-2xs ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
        <div className="p-4 border-b dark:border-gray-800 border-slate-100 flex justify-between items-center bg-slate-50/50 dark:bg-[#0F1115]/20">
          <h4 className="font-bold text-slate-700 dark:text-slate-200">Revenue Ledger (Sorted by Value)</h4>
          <span className="text-[10px] text-slate-400 font-mono">Consolidated Database View</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-mono tracking-wider font-extrabold ${isDark ? 'bg-[#0F1115]/60 border-[#2D333D] text-gray-400' : 'bg-slate-50/70 border-slate-100 text-slate-500'}`}>
                <th className="px-5 py-3">Client Corporate</th>
                <th className="px-5 py-3">Agreement Reference</th>
                <th className="px-5 py-3 text-center">Duration</th>
                <th className="px-5 py-3 text-right">Negotiated Rate</th>
                <th className="px-5 py-3 text-center">Seat Capacity</th>
                <th className="px-5 py-3 text-right">Revenue Value</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2D333D]">
              {filteredContracts.map(con => {
                const val = con.unitPrice * con.purchasedUnits * con.termMonths;
                const isExpired = con.endDate < today;

                return (
                  <tr key={con.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/10 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {con.customerName}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                      {con.name}
                    </td>
                    <td className="px-5 py-4 text-center font-semibold font-mono">
                      {con.termMonths} Months
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ${con.unitPrice.toFixed(2)}/mo
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-slate-900 dark:text-white">
                      {con.purchasedUnits} seats
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-black text-[rgb(14,145,145)]">
                      ${val.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {!isExpired ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider">
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onSelectContract(con)}
                        className="px-2.5 py-1 text-slate-600 dark:text-gray-300 hover:text-white hover:bg-[rgb(14,145,145)] bg-slate-100 dark:bg-slate-800 rounded-md font-bold transition-all cursor-pointer"
                      >
                        View Contract
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
