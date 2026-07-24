import React, { useState, useMemo, useEffect } from 'react';
import { CustomSelect } from './CustomSelect';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Laptop, 
  Tags, 
  Layers, 
  DollarSign, 
  Code,
  Users,
  X,
  FolderLock,
  Download,
  Filter,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { Product, Customer, Language, AuditRecord } from '../types';

interface ProductsTabProps {
  products: Product[];
  customers: Customer[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  t: Record<string, string>;
  isDark: boolean;
  triggerOpenAddModal: boolean;
  onResetTrigger: () => void;
  auditLogs?: AuditRecord[];
  preselectedCustomerId?: string;
  preselectedProductId?: string;
  onClearPreselection?: () => void;
}

export default function ProductsTab({
  products,
  customers,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  t,
  isDark,
  triggerOpenAddModal,
  onResetTrigger,
  auditLogs = [],
  preselectedCustomerId = 'all',
  preselectedProductId = '',
  onClearPreselection
}: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('all');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (preselectedCustomerId && preselectedCustomerId !== 'all') {
      setSelectedCustomerFilter(preselectedCustomerId);
    }
  }, [preselectedCustomerId]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Portfolio quick-assignment modal states (Page 4 requirement)
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolioProduct, setPortfolioProduct] = useState<Product | null>(null);
  const [portfolioCustomerIds, setPortfolioCustomerIds] = useState<string[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tierName, setTierName] = useState('');
  const [sku, setSku] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [family, setFamily] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [viewingProductDetail, setViewingProductDetail] = useState<Product | null>(null);
  const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null);
  const [inactiveProductIds, setInactiveProductIds] = useState<string[]>([]);

  // Product Details panel editing state
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [detailName, setDetailName] = useState('');
  const [detailDescription, setDetailDescription] = useState('');
  const [detailSku, setDetailSku] = useState('');
  const [detailUnitPrice, setDetailUnitPrice] = useState<number>(0);
  const [detailFamily, setDetailFamily] = useState('');
  const [detailTierName, setDetailTierName] = useState('');
  const [detailNotes, setDetailNotes] = useState('');

  useEffect(() => {
    if (selectedProductForView) {
      setDetailName(selectedProductForView.name);
      setDetailDescription(selectedProductForView.description);
      setDetailSku(selectedProductForView.sku);
      setDetailUnitPrice(selectedProductForView.unitPrice);
      setDetailFamily(selectedProductForView.family);
      setDetailTierName(selectedProductForView.tierName);
      setDetailNotes(selectedProductForView.notes || '');
      setIsDetailEditing(false);
    } else {
      setIsDetailEditing(false);
    }
  }, [selectedProductForView]);

  function requestSaveProduct() {
    if (!selectedProductForView) return;
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Save Product Changes',
      message: `Are you sure you want to save the modifications made to "${selectedProductForView.name}"? This will update the catalog definitions across the enterprise repository.`,
      onConfirm: () => {
        const updatedProduct: Product = {
          ...selectedProductForView,
          name: detailName,
          description: detailDescription,
          sku: detailSku,
          unitPrice: Number(detailUnitPrice),
          family: detailFamily,
          tierName: detailTierName,
          notes: detailNotes,
          lastModified: new Date().toISOString().split('T')[0],
          lastModifiedBy: 'developerbe25@gmail.com'
        };
        onEditProduct(updatedProduct);
        setSelectedProductForView(updatedProduct);
        setIsDetailEditing(false);
        setConfirmModal(null);
      }
    });
  }

  function requestDeleteProductDetail() {
    if (!selectedProductForView) return;
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Product Soft-Deletion',
      message: `Are you sure you want to mark the product "${selectedProductForView.name}" as INACTIVE? This acts as a soft-delete: the product will be preserved in records but deactivated from active service, catalog grids, and future contract mappings.`,
      onConfirm: () => {
        onDeleteProduct(selectedProductForView.id);
        setSelectedProductForView(null);
        setIsDetailEditing(false);
        setConfirmModal(null);
      }
    });
  }

  useEffect(() => {
    if (preselectedProductId) {
      const prod = products.find(p => p.id === preselectedProductId);
      if (prod) {
        setViewingProductDetail(prod);
        setName(prod.name);
        setDescription(prod.description);
        setSku(prod.sku);
        setUnitPrice(prod.unitPrice);
        setFamily(prod.family);
        setTierName(prod.tierName);
        setNotes(prod.notes);
        setSelectedProductForView(prod);
      }
    }
  }, [preselectedProductId, products]);

  // RELATIONAL MODEL JUNCTION COMPONENT STATE & MEMOS (Satisfying spec requirement)
  const productCustomerRows = useMemo(() => {
    const rows: { id: string; productId: string; productSku: string; customerId: string }[] = [];
    products.forEach((p, idx) => {
      if (p.customerIds && Array.isArray(p.customerIds)) {
        p.customerIds.forEach(cid => {
          rows.push({
            id: `PC_REC_${idx + 1}_${p.id.substring(0, 5).toUpperCase()}_${cid.substring(0, 5).toUpperCase()}`,
            productId: p.id,
            productSku: p.sku,
            customerId: cid
          });
        });
      }
    });
    return rows;
  }, [products]);

  const resolvedJoins = useMemo(() => {
    const joins: {
      joinId: string;
      productId: string;
      productName: string;
      productSku: string;
      customerId: string;
      customerName: string;
      unitPrice: number;
      family: string;
    }[] = [];

    productCustomerRows.forEach(row => {
      const product = products.find(p => p.id === row.productId);
      const customer = customers.find(c => c.id === row.customerId);
      if (product && customer) {
        joins.push({
          joinId: `${product.id} ⨝ ${customer.id}`,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          customerId: customer.id,
          customerName: customer.name,
          unitPrice: product.unitPrice,
          family: product.family
        });
      }
    });
    return joins;
  }, [productCustomerRows, products, customers]);

  // Active filter for Interactive Relational Join View
  const [interactiveSelectedSku, setInteractiveSelectedSku] = useState('ALL');
  const [interactiveSelectedCust, setInteractiveSelectedCust] = useState('ALL');

  const filteredJoins = useMemo(() => {
    return resolvedJoins.filter(join => {
      const matchesSku = interactiveSelectedSku === 'ALL' || join.productSku === interactiveSelectedSku;
      const matchesCust = interactiveSelectedCust === 'ALL' || join.customerId === interactiveSelectedCust;
      return matchesSku && matchesCust;
    });
  }, [resolvedJoins, interactiveSelectedSku, interactiveSelectedCust]);

  // Handle trigger from Quick Links
  if (triggerOpenAddModal) {
    setTimeout(() => {
      openAddModal();
      onResetTrigger();
    }, 100);
  }

  function openAddModal() {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setTierName('Enterprise Core');
    setSku(`BJ-PROD-${Math.floor(100 + Math.random() * 900)}`);
    setUnitPrice(100.00);
    setFamily('Virtualization & Cloud');
    setSelectedCustomerIds([]);
    setNotes('');
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setTierName(product.tierName);
    setSku(product.sku);
    setUnitPrice(product.unitPrice);
    setFamily(product.family);
    setSelectedCustomerIds(product.customerIds);
    setNotes(product.notes);
    setIsModalOpen(true);
  }

  function toggleCustomerAssociation(custId: string) {
    if (selectedCustomerIds.includes(custId)) {
      setSelectedCustomerIds(selectedCustomerIds.filter(id => id !== custId));
    } else {
      setSelectedCustomerIds([...selectedCustomerIds, custId]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name,
      description,
      tierName,
      sku,
      unitPrice,
      family,
      customerIds: selectedCustomerIds,
      notes,
      createDate: editingProduct ? editingProduct.createDate : new Date().toISOString().split('T')[0],
      createdBy: editingProduct ? editingProduct.createdBy : 'Global Admin',
      lastModified: new Date().toISOString().split('T')[0],
      lastModifiedBy: 'developerbe25@gmail.com'
    };

    const performSave = () => {
      if (editingProduct) {
        onEditProduct(productData);
      } else {
        onAddProduct(productData);
      }
      setIsModalOpen(false);
      setConfirmModal(null);
    };

    if (editingProduct) {
      setConfirmModal({
        isOpen: true,
        title: 'Confirm Product Update',
        message: `Are you sure you want to save modifications for "${name}"? This will update the system pricing, customer association and SKU instantly.`,
        onConfirm: performSave
      });
    } else {
      performSave();
    }
  }

  const requestDeleteProduct = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Product Deletion',
      message: `Are you sure you want to delete the product "${product.name}"? This will remove it from the catalog and revoke associated customer licenses.`,
      onConfirm: () => {
        onDeleteProduct(product.id);
        setConfirmModal(null);
      }
    });
  };

  // Portfolio quick assignment functions (Page 4)
  function openPortfolioModal(product: Product) {
    setPortfolioProduct(product);
    setPortfolioCustomerIds(product.customerIds);
    setIsPortfolioModalOpen(true);
  }

  function handleSavePortfolio(e: React.FormEvent) {
    e.preventDefault();
    if (!portfolioProduct) return;
    const updatedProduct = {
      ...portfolioProduct,
      customerIds: portfolioCustomerIds,
      lastModified: new Date().toISOString().split('T')[0],
      lastModifiedBy: 'developerbe25@gmail.com'
    };
    onEditProduct(updatedProduct);
    setIsPortfolioModalOpen(false);
  }

  function togglePortfolioCustomer(id: string) {
    setPortfolioCustomerIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  }



  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.status !== 'Inactive');
    if (selectedProductFilter !== 'all') {
      result = result.filter(p => p.id === selectedProductFilter);
    } else if (selectedCustomerFilter !== 'all') {
      result = result.filter(p => p.customerIds.includes(selectedCustomerFilter));
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p => 
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.family.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, searchQuery, selectedCustomerFilter, selectedProductFilter]);

  useEffect(() => {
    if (filteredProducts.length > 0) {
      const exists = filteredProducts.some(p => p.id === selectedProductForView?.id);
      if (!exists) {
        setSelectedProductForView(filteredProducts[0]);
      }
    } else {
      setSelectedProductForView(null);
    }
  }, [filteredProducts, selectedProductForView]);



  return (
    <div className="space-y-6">
      
      {viewingProductDetail ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setViewingProductDetail(null);
                if (onClearPreselection) onClearPreselection();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                isDark 
                  ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-[rgb(14,145,145)]" />
              <span>Back to Product Catalog</span>
            </button>
            <span className="text-xs font-mono text-gray-500">
              Editing Specifications: <span className="font-bold text-[rgb(14,145,145)]">{viewingProductDetail.id}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: PRODUCT METRICS & DETAILS PROFILE */}
            <div className={`lg:col-span-5 p-6 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-[#13161C] border-[#2D333D]' : 'bg-slate-50/50 border-slate-100 shadow-3xs'
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[10px] font-black font-mono uppercase px-2.5 py-1 rounded-md ${
                    isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {viewingProductDetail.family}
                  </span>
                  <span className={`text-[10px] font-black font-mono uppercase px-2.5 py-1 rounded-md ${
                    isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {viewingProductDetail.tierName}
                  </span>
                </div>

                <h2 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {viewingProductDetail.name}
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  {viewingProductDetail.description}
                </p>

                {/* Info block */}
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-gray-800' : 'bg-white border-slate-100'}`}>
                    <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Standard Pricing Matrix</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${viewingProductDetail.unitPrice}</span>
                      <span className="text-xs text-gray-500">/ user / month</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-black/20 border-gray-800' : 'bg-white border-slate-100'}`}>
                      <span className="text-[9px] font-mono text-gray-500 uppercase block mb-0.5">Deployment SKU</span>
                      <span className="text-xs font-bold font-mono text-slate-800 dark:text-gray-200">{viewingProductDetail.sku}</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-black/20 border-gray-800' : 'bg-white border-slate-100'}`}>
                      <span className="text-[9px] font-mono text-gray-500 uppercase block mb-0.5">Assigned Portfolios</span>
                      <span className="text-xs font-bold font-mono text-slate-800 dark:text-gray-200">
                        {customers.filter(c => viewingProductDetail.customerIds.includes(c.id)).length} Customers
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-gray-800' : 'bg-white border-slate-100'}`}>
                    <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1.5">Additional Notes & Specifications</span>
                    <p className="text-xs text-gray-500 leading-relaxed italic">
                      {viewingProductDetail.notes || 'No additional technical specifications recorded for this module.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-dashed border-gray-700/10 text-[11px] text-gray-500 space-y-1">
                <div>Created: <span className="font-mono">{viewingProductDetail.createDate}</span> by {viewingProductDetail.createdBy}</div>
                <div>Last Modified: <span className="font-mono">{viewingProductDetail.lastModified}</span> by {viewingProductDetail.lastModifiedBy}</div>
              </div>
            </div>

            {/* RIGHT COLUMN: MODIFY PRODUCT SPECIFICATIONS FORM */}
            <div className={`lg:col-span-7 p-6 rounded-2xl border ${
              isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
            }`}>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-gray-700/10">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[rgb(14,145,145)] font-bold block">Enterprise SaaS Architect</span>
                  <h3 className="font-black text-lg tracking-tight text-[rgb(14,145,145)]">Modify Product Specifications</h3>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="font-bold text-gray-500 block">Product ID (Primary Key)</label>
                  <input 
                    type="text" 
                    disabled
                    value={viewingProductDetail.id} 
                    className={`w-full p-2.5 rounded-lg border outline-hidden opacity-70 font-mono ${
                      isDark ? 'bg-[#0F1115] border-[#2D333D] text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500 block">Product Name</label>
                  <input 
                    type="text" 
                    required
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-hidden ${
                      isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[rgb(14,145,145)]'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500 block">Product Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-hidden ${
                      isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[rgb(14,145,145)]'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">Product SKU</label>
                    <input 
                      type="text" 
                      required
                      value={sku} 
                      onChange={e => setSku(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-hidden ${
                        isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[rgb(14,145,145)]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">Unit Price ($ / month)</label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      step={0.01}
                      value={unitPrice} 
                      onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)}
                      className={`w-full p-2.5 rounded-lg border outline-hidden ${
                        isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[rgb(14,145,145)]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">Product Family</label>
                    <CustomSelect
                      value={family}
                      onChange={val => setFamily(val)}
                      options={[
                        { value: 'Virtualization & Cloud', label: 'Virtualization & Cloud' },
                        { value: 'Database & Storage', label: 'Database & Storage' },
                        { value: 'Cybersecurity', label: 'Cybersecurity' },
                        { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
                        { value: 'Developer Tools', label: 'Developer Tools' }
                      ]}
                      isDark={isDark}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">Product Tier Name</label>
                    <input 
                      type="text" 
                      required
                      value={tierName} 
                      onChange={e => setTierName(e.target.value)}
                      placeholder="e.g. Enterprise Core"
                      className={`w-full p-2.5 rounded-lg border outline-hidden ${
                        isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[rgb(14,145,145)]'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500 block">Additional Notes</label>
                  <textarea 
                    rows={2}
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Technical specifications, region constraints, deployment notes..."
                    className={`w-full p-2.5 rounded-lg border outline-hidden ${
                      isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[rgb(14,145,145)]'
                    }`}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 text-xs">
                  <button 
                    type="button" 
                    onClick={() => {
                      setViewingProductDetail(null);
                      if (onClearPreselection) onClearPreselection();
                    }}
                    className={`px-4 py-2.5 rounded-lg border cursor-pointer font-bold transition-all ${
                      isDark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg font-bold cursor-pointer transition-all flex items-center gap-2 shadow-md shadow-[rgb(14,145,145)]/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Specifications</span>
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      ) : (
        <>
          {/* HEADER CONTROL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-stretch sm:items-center gap-3.5 w-full md:w-auto">
          {/* 1. CUSTOMERS FILTER */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 relative z-30">
            <span className={`text-[11px] font-bold ${isDark ? 'text-gray-400' : 'text-slate-600'} flex items-center gap-1 shrink-0`}>
              <Filter className="w-3.5 h-3.5 text-[rgb(14,145,145)] shrink-0" />
              <span className="whitespace-nowrap">Customer Portfolio:</span>
            </span>
            <CustomSelect
              value={selectedCustomerFilter}
              onChange={(val) => {
                setSelectedCustomerFilter(val);
                if (val !== 'all') {
                  setSelectedProductFilter('all');
                }
                if (onClearPreselection && val === 'all') {
                  onClearPreselection();
                }
              }}
              options={[
                { value: 'all', label: 'All Customers' },
                ...customers.map(c => ({ value: c.id, label: c.name }))
              ]}
              className="w-full sm:w-48 shrink-0"
              isDark={isDark}
            />
          </div>

          {/* 2. PRODUCTS FILTER */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 relative z-20">
            <span className={`text-[11px] font-bold ${isDark ? 'text-gray-400' : 'text-slate-600'} flex items-center gap-1 shrink-0`}>
              <Laptop className="w-3.5 h-3.5 text-[rgb(14,145,145)] shrink-0" />
              <span className="whitespace-nowrap">Product Selection:</span>
            </span>
            <CustomSelect
              value={selectedProductFilter}
              onChange={(val) => {
                setSelectedProductFilter(val);
                if (val !== 'all') {
                  setSelectedCustomerFilter('all');
                }
              }}
              options={[
                { value: 'all', label: 'All Products' },
                ...products.map(p => ({ value: p.id, label: p.name }))
              ]}
              className="w-full sm:w-48 shrink-0"
              isDark={isDark}
            />
          </div>

          {/* 3. SEARCH BOX */}
          <div className="relative w-full sm:w-64 z-10">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-hidden transition-all ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white focus:border-[rgb(14,145,145)]' : 'bg-white border-slate-200 text-slate-800 focus:border-[rgb(14,145,145)] shadow-2xs'}`}
              placeholder="Search B&J SaaS modules..."
            />
          </div>

          {(preselectedProductId || (preselectedCustomerId && preselectedCustomerId !== 'all')) && (
            <button
              onClick={() => {
                setSelectedCustomerFilter('all');
                if (onClearPreselection) onClearPreselection();
              }}
              className="px-2.5 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-rose-500/20 transition-all cursor-pointer relative z-10"
            >
              Clear Redirect Focus ✕
            </button>
          )}
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-[rgb(14,145,145)]/10 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewProduct}</span>
        </button>
      </div>

      {/* PRODUCTS GRID & READ-ONLY FORM SIDE-BY-SIDE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PRODUCTS GRID (50% WIDTH ON DESKTOP) */}
        <div className="lg:col-span-6 space-y-4">
          <div className={`border rounded-2xl overflow-hidden ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-100 shadow-3xs'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className={`font-bold ${isDark ? 'bg-[#1E232B] text-gray-200' : 'bg-slate-50 text-slate-800'} border-b ${isDark ? 'border-[#2D333D]' : 'border-slate-100'}`}>
                    <th className="p-4 text-xs font-black uppercase tracking-wider whitespace-nowrap">Product Name</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider whitespace-nowrap">Product Description</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider whitespace-nowrap">Product SKU</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#2D333D] text-gray-300' : 'divide-slate-100 text-slate-700'}`}>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500 italic font-medium">
                        No SaaS products found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => {
                      const isSelected = selectedProductForView?.id === product.id;
                      const isProductActive = !inactiveProductIds.includes(product.id);

                      return (
                        <tr 
                          key={product.id} 
                          onClick={() => setSelectedProductForView(product)}
                          className={`transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[rgb(14,145,145)]/10 dark:bg-[rgb(14,145,145)]/15 font-bold border-l-4 border-[rgb(14,145,145)]' 
                              : 'hover:bg-[rgb(14,145,145)]/5'
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProductForView(product);
                                }}
                                className="text-sm font-extrabold tracking-tight text-left hover:underline text-[rgb(14,145,145)] cursor-pointer"
                                title="Click to select and load details"
                              >
                                {product.name}
                              </button>
                              {isSelected && (
                                <span className="text-[10px] bg-[rgb(14,145,145)] text-white px-2 py-0.5 rounded-full font-extrabold uppercase animate-pulse">
                                  🎯 Selected
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-xs text-gray-500 dark:text-gray-400 font-sans whitespace-normal break-words max-w-[220px] leading-relaxed">
                            {product.description}
                          </td>
                          <td className="p-4 font-mono text-xs whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 dark:text-white">{product.sku}</div>
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (inactiveProductIds.includes(product.id)) {
                                    setInactiveProductIds(inactiveProductIds.filter(id => id !== product.id));
                                  } else {
                                    setInactiveProductIds([...inactiveProductIds, product.id]);
                                  }
                                }}
                                className={`p-1.5 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                  isProductActive 
                                    ? 'hover:bg-emerald-500/10 text-emerald-500' 
                                    : 'hover:bg-rose-500/10 text-rose-500'
                                }`}
                                title={isProductActive ? "Mark as Inactive" : "Mark as Active"}
                              >
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isProductActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                <span className="text-[10px] font-bold font-mono uppercase">{isProductActive ? 'Active' : 'Blocked'}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPortfolioModal(product);
                                }}
                                className="p-1.5 rounded-md hover:bg-amber-500/10 text-amber-500 transition-colors cursor-pointer"
                                title="Quick Assign Customer Portfolio"
                              >
                                <FolderLock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingProductDetail(product);
                                  setName(product.name);
                                  setDescription(product.description);
                                  setSku(product.sku);
                                  setUnitPrice(product.unitPrice);
                                  setFamily(product.family);
                                  setTierName(product.tierName);
                                  setNotes(product.notes);
                                }}
                                className="p-1.5 rounded-md hover:bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] transition-colors cursor-pointer"
                                title="Modify Product Details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestDeleteProduct(product);
                                }}
                                className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                                title="Delete Product"
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

        {/* READ-ONLY & EDITABLE DETAIL FORM (50% WIDTH ON DESKTOP) */}
        <div className="lg:col-span-6">
          <div className={`p-6 rounded-2xl border ${
            isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-3xs'
          }`}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-gray-700/10">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[rgb(14,145,145)] font-bold block">Enterprise SaaS Module</span>
                <h3 className="font-black text-lg tracking-tight text-[rgb(14,145,145)]">
                  {isDetailEditing ? 'Edit Product Specifications' : 'Product Details (Read-Only)'}
                </h3>
              </div>
              {selectedProductForView && !isDetailEditing && (
                <button
                  type="button"
                  onClick={() => setIsDetailEditing(true)}
                  className={`p-2 rounded-lg cursor-pointer transition-all ${
                    isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                  title="Edit Product"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
            </div>

            {selectedProductForView ? (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500 block">Product ID (Primary Key)</label>
                  <input 
                    type="text" 
                    readOnly
                    disabled
                    value={selectedProductForView.id} 
                    className={`w-full p-2.5 rounded-lg border outline-none font-mono opacity-65 ${
                      isDark ? 'bg-[#0F1115] border-[#2D333D]/60 text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500 block">Product Name</label>
                  <input 
                    type="text" 
                    readOnly={!isDetailEditing}
                    value={detailName} 
                    onChange={e => setDetailName(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none transition-all ${
                      isDetailEditing 
                        ? (isDark ? 'bg-[#0F1115] border-[rgb(14,145,145)] text-white focus:ring-1 focus:ring-[rgb(14,145,145)]' : 'bg-white border-[rgb(14,145,145)] text-slate-900 focus:ring-1 focus:ring-[rgb(14,145,145)]')
                        : (isDark ? 'bg-[#0F1115] border-[#2D333D]/60 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500 block">Product Description</label>
                  <textarea 
                    readOnly={!isDetailEditing}
                    rows={3}
                    value={detailDescription} 
                    onChange={e => setDetailDescription(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none transition-all ${
                      isDetailEditing 
                        ? (isDark ? 'bg-[#0F1115] border-[rgb(14,145,145)] text-white focus:ring-1 focus:ring-[rgb(14,145,145)]' : 'bg-white border-[rgb(14,145,145)] text-slate-900 focus:ring-1 focus:ring-[rgb(14,145,145)]')
                        : (isDark ? 'bg-[#0F1115] border-[#2D333D]/60 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">Product SKU</label>
                    <input 
                      type="text" 
                      readOnly={!isDetailEditing}
                      value={detailSku} 
                      onChange={e => setDetailSku(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-mono transition-all ${
                        isDetailEditing 
                          ? (isDark ? 'bg-[#0F1115] border-[rgb(14,145,145)] text-white focus:ring-1 focus:ring-[rgb(14,145,145)]' : 'bg-white border-[rgb(14,145,145)] text-slate-900 focus:ring-1 focus:ring-[rgb(14,145,145)]')
                          : (isDark ? 'bg-[#0F1115] border-[#2D333D]/60 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">Unit Price ($ / month)</label>
                    <div className="relative">
                      {isDetailEditing && (
                        <span className="absolute left-3 top-2.5 text-gray-500 font-mono font-bold">$</span>
                      )}
                      <input 
                        type={isDetailEditing ? "number" : "text"}
                        step="0.01"
                        readOnly={!isDetailEditing}
                        value={isDetailEditing ? detailUnitPrice : `$${Number(detailUnitPrice).toFixed(2)}`} 
                        onChange={e => setDetailUnitPrice(Number(e.target.value))}
                        className={`w-full p-2.5 rounded-lg border outline-none font-mono transition-all ${
                          isDetailEditing ? 'pl-7' : ''
                        } ${
                          isDetailEditing 
                            ? (isDark ? 'bg-[#0F1115] border-[rgb(14,145,145)] text-white focus:ring-1 focus:ring-[rgb(14,145,145)]' : 'bg-white border-[rgb(14,145,145)] text-slate-900 focus:ring-1 focus:ring-[rgb(14,145,145)]')
                            : (isDark ? 'bg-[#0F1115] border-[#2D333D]/60 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">Product Family</label>
                    <input 
                      type="text" 
                      readOnly={!isDetailEditing}
                      value={detailFamily} 
                      onChange={e => setDetailFamily(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none transition-all ${
                        isDetailEditing 
                          ? (isDark ? 'bg-[#0F1115] border-[rgb(14,145,145)] text-white focus:ring-1 focus:ring-[rgb(14,145,145)]' : 'bg-white border-[rgb(14,145,145)] text-slate-900 focus:ring-1 focus:ring-[rgb(14,145,145)]')
                          : (isDark ? 'bg-[#0F1115] border-[#2D333D]/60 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">Product Tier Name</label>
                    <input 
                      type="text" 
                      readOnly={!isDetailEditing}
                      value={detailTierName} 
                      onChange={e => setDetailTierName(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none transition-all ${
                        isDetailEditing 
                          ? (isDark ? 'bg-[#0F1115] border-[rgb(14,145,145)] text-white focus:ring-1 focus:ring-[rgb(14,145,145)]' : 'bg-white border-[rgb(14,145,145)] text-slate-900 focus:ring-1 focus:ring-[rgb(14,145,145)]')
                          : (isDark ? 'bg-[#0F1115] border-[#2D333D]/60 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500 block">Additional Notes</label>
                  <textarea 
                    readOnly={!isDetailEditing}
                    rows={2}
                    value={detailNotes} 
                    onChange={e => setDetailNotes(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none transition-all ${
                      isDetailEditing 
                        ? (isDark ? 'bg-[#0F1115] border-[rgb(14,145,145)] text-white focus:ring-1 focus:ring-[rgb(14,145,145)]' : 'bg-white border-[rgb(14,145,145)] text-slate-900 focus:ring-1 focus:ring-[rgb(14,145,145)]')
                        : (isDark ? 'bg-[#0F1115] border-[#2D333D]/60 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                    }`}
                    placeholder="No additional specifications recorded."
                  />
                </div>

                <div className="pt-4 mt-4 border-t border-dashed border-gray-700/10 text-[10px] text-gray-500 space-y-1">
                  <div>Created: <span className="font-mono">{selectedProductForView.createDate}</span> by {selectedProductForView.createdBy}</div>
                  <div>Last Modified: <span className="font-mono">{selectedProductForView.lastModified}</span> by {selectedProductForView.lastModifiedBy}</div>
                </div>

                {isDetailEditing && (
                  <div className="pt-4 flex items-center justify-between gap-3 border-t border-dashed border-gray-700/10">
                    <button
                      type="button"
                      onClick={requestDeleteProductDetail}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-600/15"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Product</span>
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedProductForView) {
                            setDetailName(selectedProductForView.name);
                            setDetailDescription(selectedProductForView.description);
                            setDetailSku(selectedProductForView.sku);
                            setDetailUnitPrice(selectedProductForView.unitPrice);
                            setDetailFamily(selectedProductForView.family);
                            setDetailTierName(selectedProductForView.tierName);
                            setDetailNotes(selectedProductForView.notes || '');
                          }
                          setIsDetailEditing(false);
                        }}
                        className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          isDark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={requestSaveProduct}
                        className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md shadow-[rgb(14,145,145)]/15"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 italic text-xs">
                Select a product from the grid to load details.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          <div className={`relative w-full max-w-lg rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base">
                {editingProduct ? 'Modify Product Specifications' : 'Define New SaaS Module'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-black/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {editingProduct && (
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">Product ID (Primary Key)</label>
                  <input 
                    type="text" 
                    disabled
                    value={editingProduct.id} 
                    className={`w-full p-2 rounded-lg border outline-hidden opacity-70 font-mono ${isDark ? 'bg-[#0F1115] border-[#2D333D] text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  placeholder="e.g. BJ Cloud Storage Core"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Product Description</label>
                <textarea 
                  required
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  placeholder="Provide detailed description of the module"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Product SKU</label>
                  <input 
                    type="text" 
                    required
                    value={sku} 
                    onChange={e => setSku(e.target.value)}
                    className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Unit Price ($ / month)</label>
                  <input 
                    type="number" 
                    required
                    min={0.01}
                    step={0.01}
                    value={unitPrice} 
                    onChange={e => setUnitPrice(parseFloat(e.target.value))}
                    className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Product Family</label>
                  <CustomSelect
                    value={family}
                    onChange={val => setFamily(val)}
                    options={[
                      { value: "Virtualization & Cloud", label: "Virtualization & Cloud" },
                      { value: "Database & Storage", label: "Database & Storage" },
                      { value: "Cybersecurity", label: "Cybersecurity" },
                      { value: "Artificial Intelligence", label: "Artificial Intelligence" }
                    ]}
                    isDark={isDark}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Product Tier Name</label>
                  <input 
                    type="text" 
                    required
                    value={tierName} 
                    onChange={e => setTierName(e.target.value)}
                    className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>



              <div className="space-y-1">
                <label className="font-bold">Additional Notes</label>
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
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'}`}
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



      {/* PORTFOLIO QUICK ASSIGN MODAL (PAGE 4 REQUIREMENT) */}
      {isPortfolioModalOpen && portfolioProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsPortfolioModalOpen(false)}></div>
          <div className={`relative w-full max-w-md rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-mono text-gray-500">PORTFOLIO FAST ACTION</span>
                <h3 className="font-extrabold text-base">Assign Customer Portfolio</h3>
              </div>
              <button onClick={() => setIsPortfolioModalOpen(false)} className="p-1 rounded-lg hover:bg-black/10 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4 text-xs">
              <p className="text-gray-500">
                Directly add or remove <strong className={isDark ? 'text-white' : 'text-slate-900'}>{portfolioProduct.name}</strong> from customer core portfolios without modifying primary product settings.
              </p>
              <div className="p-2.5 rounded-lg bg-black/10 dark:bg-black/30 font-mono text-[11px] text-gray-500">
                Product SKU: {portfolioProduct.sku}
              </div>
            </div>

            <form onSubmit={handleSavePortfolio} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold block mb-1">Target Customer Accounts</label>
                <div className={`p-3 rounded-lg border max-h-52 overflow-y-auto space-y-2.5 ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}>
                  {customers.length === 0 ? (
                    <p className="text-center italic text-gray-500 py-4">No customers registered</p>
                  ) : (
                    customers.map(c => {
                      const isAssoc = portfolioCustomerIds.includes(c.id);
                      return (
                        <label key={c.id} className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isAssoc}
                            onChange={() => togglePortfolioCustomer(c.id)}
                            className="rounded-sm border-slate-300 text-[rgb(14,145,145)] focus:ring-[rgb(14,145,145)]"
                          />
                          <div>
                            <span className="font-bold block">{c.name}</span>
                            <span className="text-[9px] text-gray-500 block font-mono">{c.supportTier}</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs">
                <button 
                  type="button" 
                  onClick={() => setIsPortfolioModalOpen(false)}
                  className={`px-4 py-2 rounded-lg border cursor-pointer ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  Close
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Portfolio Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* AUDIT LOG SECTION FOR THE PRODUCTS TAB */}
      <div className={`mt-8 p-6 rounded-2xl border ${isDark ? 'bg-[#13161C] border-[#2D333D]' : 'bg-white border-slate-100 shadow-3xs'}`}>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-700/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[rgb(14,145,145)] animate-pulse"></span>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[rgb(14,145,145)]">SaaS Catalog Audit Trail (Product Records)</h4>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">Status: Connected to Log Store</span>
        </div>
        <div className="space-y-3.5 max-h-48 overflow-y-auto pr-2">
          {auditLogs.filter(log => log.screen === 'Products').length === 0 ? (
            <p className="text-xs text-gray-500 italic">No SaaS catalog audit logs registered in this session.</p>
          ) : (
            auditLogs.filter(log => log.screen === 'Products').map(log => (
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

        </>
      )}

      {/* CONFIRMATION POPUP MODAL */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`relative w-full max-w-md rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <h3 className="text-base font-extrabold mb-2 text-[rgb(14,145,145)] flex items-center gap-2">
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
                Cancel
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
