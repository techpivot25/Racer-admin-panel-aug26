import { useState, useMemo } from 'react';
import { 
  Laptop, 
  Users, 
  CircleDollarSign, 
  ArrowUpRight, 
  Layers, 
  UserPlus, 
  FolderPlus, 
  FilePlus2, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  BookOpen,
  CalendarDays
} from 'lucide-react';
import { Product, Customer, Contract, Language } from '../types';

interface HomeTabProps {
  products: Product[];
  customers: Customer[];
  contracts: Contract[];
  t: Record<string, string>;
  isDark: boolean;
  onNavigate: (tab: 'dashboard' | 'reports' | 'audience' | 'settings' | 'home' | 'users' | 'products' | 'customers' | 'billing' | 'documentation' | 'support' | 'sitemap' | 'licenses', triggerAction?: string) => void;
  profileName: string;
  profileAdminType?: string;
  profilePhoto?: string | null;
  onSelectCustomer?: (customerId: string) => void;
}

export default function HomeTab({
  products,
  customers,
  contracts,
  t,
  isDark,
  onNavigate,
  profileName,
  profileAdminType = 'Super Admin',
  profilePhoto = null,
  onSelectCustomer
}: HomeTabProps) {
  const [revenuePeriod, setRevenuePeriod] = useState<'monthly' | 'annual'>('monthly');

  // Compute stats
  const totalProductsCount = products.length;
  const totalCustomersCount = customers.length;

  // Revenue computation: sum of purchasedUnits * unitPrice on contracts
  const monthlyRevenue = useMemo(() => {
    return contracts.reduce((sum, contract) => sum + (contract.purchasedUnits * contract.unitPrice), 0);
  }, [contracts]);

  const annualRevenue = monthlyRevenue * 12;

  return (
    <div className="space-y-6">
      
      {/* WELCOME HERO CARD */}
      <div className={`p-6 rounded-2xl border transition-all relative overflow-hidden ${isDark ? 'bg-linear-to-r from-blue-900/30 via-[#1A1D23] to-[#1A1D23] border-[#2D333D]' : 'bg-linear-to-r from-blue-500/10 via-white to-white border-slate-200 shadow-xs'}`}>
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Activity className="w-48 h-48 text-black" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-800 dark:text-slate-200' : 'text-black'}`}>
              B&J Enterprise Control Center
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-1">
            {profilePhoto ? (
              <img 
                src={profilePhoto} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-[rgb(14,145,145)] shadow-md shrink-0" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[rgb(14,145,145)] text-white flex items-center justify-center text-xl font-black shadow-md shrink-0 border-2 border-slate-200 dark:border-slate-800">
                {profileName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase()}
              </div>
            )}
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.welcomeBack}, <span className={isDark ? 'text-slate-200' : 'text-slate-900'}>{profileName}</span>
              </h2>
              <span className={`px-2 py-0.5 mt-1 inline-block text-[10px] font-black uppercase tracking-widest rounded-md ${
                isDark 
                  ? 'bg-teal-950/40 text-teal-400 border border-teal-800/30' 
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}>
                {profileAdminType}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium">
            <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <span>Session: <strong className={isDark ? 'text-white' : 'text-slate-800'}>2026-06-25 UTC</strong></span>
            </div>
            <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Permission Level: <strong className="text-emerald-500">Global {profileAdminType === 'Super Admin' ? 'Super-Admin' : 'Sub-Admin'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* THREE MAIN B&J COMPONENT CARDS (AS REQUESTED IN PRESENTATION) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: # of Products */}
        <div 
          onClick={() => onNavigate('products')}
          className={`p-6 rounded-xl border cursor-pointer transition-all hover:scale-102 group relative overflow-hidden ${isDark ? 'bg-[#1A1D23] border-[#2D333D] hover:border-[rgb(14,145,145)]/50' : 'bg-[#FFFFFF] border-[#E2E8F0] shadow-sm hover:border-[rgb(14,145,145)]'}`}
        >
          <div className="absolute top-0 right-0 p-4 text-black/10 group-hover:text-black/20 transition-all">
            <Laptop className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start">
            <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-900/40 text-slate-800 dark:text-slate-200' : 'bg-slate-50 dark:bg-slate-900/30 text-black'}`}>
              <Laptop className="w-5 h-5" />
            </div>
            <span className={`text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-slate-800 dark:text-slate-200' : 'text-black'}`}>
              Manage Products <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              {t.activeProducts}
            </div>
            <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalProductsCount}
            </div>
          </div>
          <div className={`mt-4 pt-4 border-t text-xs flex justify-between items-center ${isDark ? 'border-gray-800 text-gray-500' : 'border-slate-100 text-slate-400'}`}>
            <span>Enterprise core families</span>
            <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>BJ-SDK Platform</span>
          </div>
        </div>

        {/* Card 2: # of Customers */}
        <div 
          onClick={() => onNavigate('customers')}
          className={`p-6 rounded-xl border cursor-pointer transition-all hover:scale-102 group relative overflow-hidden ${isDark ? 'bg-[#1A1D23] border-[#2D333D] hover:border-[rgb(14,145,145)]/50' : 'bg-[#FFFFFF] border-[#E2E8F0] shadow-sm hover:border-[rgb(14,145,145)]'}`}
        >
          <div className="absolute top-0 right-0 p-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-all">
            <Users className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start">
            <div className={`p-2.5 rounded-lg ${isDark ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className={`text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Manage Customers <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              {t.activeCustomers}
            </div>
            <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalCustomersCount}
            </div>
          </div>
          <div className={`mt-4 pt-4 border-t text-xs flex justify-between items-center ${isDark ? 'border-gray-800 text-gray-500' : 'border-slate-100 text-slate-400'}`}>
            <span>SLA Gold, Silver & Bronze</span>
            <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>All active accounts</span>
          </div>
        </div>

        {/* Card 3: Projected Revenue (with Monthly/Annual toggle) */}
        <div 
          className={`p-6 rounded-xl border cursor-pointer hover:border-[rgb(14,145,145)]/30 transition-all group relative overflow-hidden ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-[#FFFFFF] border-[#E2E8F0] shadow-sm'}`}
        >
          <div className="absolute top-0 right-0 p-4 text-amber-500/10 transition-all">
            <CircleDollarSign className="w-24 h-24" />
          </div>
          
          <div className="flex justify-between items-start relative z-10">
            <div 
              onClick={() => onNavigate('billing')}
              className={`p-2.5 rounded-lg ${isDark ? 'bg-amber-950/40 text-amber-400' : 'bg-amber-50 text-amber-600'}`}
            >
              <CircleDollarSign className="w-5 h-5" />
            </div>
            
            {/* Toggle periods without bubbling click to parent tab navigation */}
            <div 
              className={`flex rounded-md p-0.5 border text-[10px] font-bold ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-100 border-slate-200'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setRevenuePeriod('monthly')}
                className={`px-2 py-0.5 rounded-md transition-all ${revenuePeriod === 'monthly' ? (isDark ? 'bg-amber-500 text-black' : 'bg-white text-amber-600 shadow-2xs') : (isDark ? 'text-gray-400' : 'text-slate-500')}`}
              >
                {t.monthly}
              </button>
              <button 
                onClick={() => setRevenuePeriod('annual')}
                className={`px-2 py-0.5 rounded-md transition-all ${revenuePeriod === 'annual' ? (isDark ? 'bg-amber-500 text-black' : 'bg-white text-amber-600 shadow-2xs') : (isDark ? 'text-gray-400' : 'text-slate-500')}`}
              >
                {t.annual}
              </button>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('billing')}
            className="mt-4 space-y-1"
          >
            <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              {t.projectedRevenue} ({revenuePeriod === 'monthly' ? t.monthly : t.annual})
            </div>
            <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
              ${(revenuePeriod === 'monthly' ? monthlyRevenue : annualRevenue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>

          <div 
            onClick={() => onNavigate('billing')}
            className={`mt-4 pt-4 border-t text-xs flex justify-between items-center ${isDark ? 'border-gray-800 text-gray-500' : 'border-slate-100 text-slate-400'}`}>
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% YoY
            </span>
            <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Contracts active</span>
          </div>
        </div>

      </div>

      {/* QUICK LINKS GRID */}
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-[#FFFFFF] border-[#E2E8F0] shadow-xs'}`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          {t.quickLinks}
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('users', 'addNewUser')}
            className={`p-4 rounded-xl border text-left transition-all hover:scale-102 flex flex-col gap-3 group ${isDark ? 'bg-[#0F1115] border-[#2D333D] hover:border-[rgb(14,145,145)]/50' : 'bg-slate-50 border-slate-200 hover:border-[rgb(14,145,145)] hover:bg-white shadow-2xs'}`}
          >
            <div className={`p-2 rounded-lg w-fit transition-colors ${isDark ? 'bg-slate-800 text-slate-200 group-hover:bg-[rgb(14,145,145)] group-hover:text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[rgb(14,145,145)] group-hover:text-white'}`}>
              <UserPlus className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.addNewUser}</div>
              <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'} mt-0.5`}>Register technical contacts</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('customers', 'addNewCustomer')}
            className={`p-4 rounded-xl border text-left transition-all hover:scale-102 flex flex-col gap-3 group ${isDark ? 'bg-[#0F1115] border-[#2D333D] hover:border-[rgb(14,145,145)]/50' : 'bg-slate-50 border-slate-200 hover:border-[rgb(14,145,145)] hover:bg-white shadow-2xs'}`}
          >
            <div className={`p-2 rounded-lg w-fit transition-colors ${isDark ? 'bg-emerald-950/40 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
              <FolderPlus className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.addNewCustomer}</div>
              <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'} mt-0.5`}>Onboard business entities</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('products', 'addNewProduct')}
            className={`p-4 rounded-xl border text-left transition-all hover:scale-102 flex flex-col gap-3 group ${isDark ? 'bg-[#0F1115] border-[#2D333D] hover:border-[rgb(14,145,145)]/50' : 'bg-slate-50 border-slate-200 hover:border-[rgb(14,145,145)] hover:bg-white shadow-2xs'}`}
          >
            <div className={`p-2 rounded-lg w-fit transition-colors ${isDark ? 'bg-amber-950/40 text-amber-400 group-hover:bg-amber-500 group-hover:text-white' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'}`}>
              <Laptop className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.addNewProduct}</div>
              <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'} mt-0.5`}>Define new B&J SaaS core modules</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('billing', 'addNewContract')}
            className={`p-4 rounded-xl border text-left transition-all hover:scale-102 flex flex-col gap-3 group ${isDark ? 'bg-[#0F1115] border-[#2D333D] hover:border-[rgb(14,145,145)]/50' : 'bg-slate-50 border-slate-200 hover:border-[rgb(14,145,145)] hover:bg-white shadow-2xs'}`}
          >
            <div className={`p-2 rounded-lg w-fit transition-colors ${isDark ? 'bg-purple-950/40 text-purple-400 group-hover:bg-purple-500 group-hover:text-white' : 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
              <FilePlus2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.addNewContract}</div>
              <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'} mt-0.5`}>Establish legal licensing terms</div>
            </div>
          </button>
        </div>
      </div>

      {/* PRODUCT DEPLOYMENTS & ACTIVE LICENSING CONTRACTS (PAGE 1 REQUIREMENT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Licensing Contracts List */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-4.5 h-4.5 text-indigo-500" />
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Active Licensing Agreements & Lengths</h4>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'} mb-4`}>
              List of active customer covenants specifying contract lengths and duration periods.
            </p>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {contracts.map(contract => {
                const isExpired = new Date(contract.endDate) < new Date();
                return (
                  <div 
                    key={contract.id}
                    className={`p-3 rounded-lg border text-xs flex justify-between items-center ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className={isDark ? 'text-white' : 'text-slate-900'}>{contract.name}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${isExpired ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </div>
                      <div className="text-gray-500 text-[10px] font-mono flex items-center flex-wrap gap-1">
                        <span>Client:</span>
                        <button
                          onClick={() => onSelectCustomer?.(contract.customerId)}
                          className="font-bold text-black dark:text-white hover:underline cursor-pointer focus:outline-hidden"
                          title="Click to redirect to Customer Admin details"
                        >
                          {contract.customerName}
                        </button>
                        <span>| SKUs: {contract.productSku}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{contract.termMonths} Months</div>
                      <div className="text-[9px] text-gray-500">{contract.startDate} to {contract.endDate}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate('billing')}
            className={`w-full mt-4 py-2 border text-center rounded-lg text-xs font-bold transition-colors ${
              isDark 
                ? 'text-white border-gray-700 hover:bg-gray-800' 
                : 'text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
          >
            View Contract Registry & Financials
          </button>
        </div>

        {/* Tabbed Product License Details */}
        <ProductLicenseTabs 
          products={products} 
          contracts={contracts} 
          isDark={isDark} 
          onNavigate={onNavigate} 
          t={t}
        />

      </div>

      {/* QUICK DOCUMENTATION & KNOWLEDGE PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Support Tier Quick Overview */}
        <div className={`p-5 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className={`w-4.5 h-4.5 ${isDark ? 'text-[rgb(14,145,145)]' : 'text-slate-700'}`} />
            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Active SLA Coverage Rules</h4>
          </div>
          <div className="space-y-3">
            <div className={`p-2.5 rounded-lg text-xs flex justify-between items-center ${isDark ? 'bg-[#0F1115]' : 'bg-slate-50'}`}>
              <div>
                <span className={`font-bold mr-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Gold Support Model:</span>
                <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>24/7 Hotline support SLO</span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-extrabold px-1.5 py-0.5 rounded-md">2-4 HOURS</span>
            </div>
            <div className={`p-2.5 rounded-lg text-xs flex justify-between items-center ${isDark ? 'bg-[#0F1115]' : 'bg-slate-50'}`}>
              <div>
                <span className="font-bold text-purple-500 mr-2">Standard Support Model:</span>
                <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Business-hours email & web SLO</span>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-500 font-extrabold px-1.5 py-0.5 rounded-md">4-8 HOURS</span>
            </div>
          </div>
        </div>

        {/* Database & Join Structure Info */}
        <div className={`p-5 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4.5 h-4.5 text-indigo-500" />
            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Admin Relational Join Architecture</h4>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'} mb-3`}>
            To audit license tracking values, contracts are combined dynamically with customers and products via structured keys:
          </p>
          <div className="font-mono text-[10px] p-2.5 rounded-lg bg-black/40 text-indigo-400 border border-indigo-950/50 space-y-1 overflow-x-auto">
            <div>CONTRACTS.contract_id = PROD_CUST_CONTRACTS.contract_id</div>
            <div>CUSTOMERS.customer_id = PROD_CUST_CONTRACTS.customer_id</div>
            <div>PRODUCTS.product_sku = PROD_CUST_CONTRACTS.product_sku</div>
          </div>
        </div>

      </div>

    </div>
  );
}

interface ProductLicenseTabsProps {
  products: Product[];
  contracts: Contract[];
  isDark: boolean;
  onNavigate: any;
  t: Record<string, string>;
}

function ProductLicenseTabs({ products, contracts, isDark, onNavigate, t }: ProductLicenseTabsProps) {
  const [activeProductIdx, setActiveProductIdx] = useState(0);

  const activeProduct = products[activeProductIdx] || products[0];

  // Calculate sum of active & purchased units for this product
  const metrics = useMemo(() => {
    if (!activeProduct) return { purchased: 0, active: 0 };
    const relevantContracts = contracts.filter(c => c.productSku === activeProduct.sku);
    const purchased = relevantContracts.reduce((sum, c) => sum + c.purchasedUnits, 0);
    const active = relevantContracts.reduce((sum, c) => sum + c.activeUnits, 0);
    return { purchased, active };
  }, [activeProduct, contracts]);

  if (!activeProduct) {
    return (
      <div className={`p-5 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
        <p className="text-xs text-gray-500 italic text-center p-8">No products found</p>
      </div>
    );
  }

  const utilizationRate = metrics.purchased > 0 ? ((metrics.active / metrics.purchased) * 100).toFixed(1) : '0.0';

  return (
    <div className={`p-5 rounded-xl border flex flex-col justify-between ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers className={`w-4.5 h-4.5 ${isDark ? 'text-[rgb(14,145,145)]' : 'text-slate-700'}`} />
          <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Product Deployment & License Details</h4>
        </div>
        <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'} mb-4`}>
          Click on any module tab below to trace active deployment containers against purchased units.
        </p>

        {/* Tab List Header */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none border-b dark:border-gray-800 border-slate-100">
          {products.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActiveProductIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-all border ${
                activeProductIdx === idx 
                  ? 'bg-[rgb(14,145,145)] text-white border-[rgb(14,145,145)] shadow-sm' 
                  : (isDark ? 'bg-[#0F1115] border-[#2D333D] text-gray-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900')
              }`}
            >
              {p.name.split(' ').slice(1).join(' ') || p.name}
            </button>
          ))}
        </div>

        {/* Selected Product Card Details */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-[9px] font-mono uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-500'} font-bold`}>
                {activeProduct.family}
              </span>
              <h5 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeProduct.name}
              </h5>
            </div>
            <span className="font-mono text-[10px] text-gray-500">SKU: {activeProduct.sku}</span>
          </div>

          {/* Deployment Metric Graph progress */}
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex justify-between text-[11px] mb-1.5 font-bold">
              <span className="text-gray-500">License Utilization Efficiency</span>
              <span className="text-emerald-500 font-mono">{utilizationRate}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${parseFloat(utilizationRate) > 90 ? 'bg-emerald-500' : 'bg-slate-50 dark:bg-slate-900/300'}`}
                style={{ width: `${Math.min(100, parseFloat(utilizationRate))}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono">
              <div>
                <span className="block text-gray-500 text-[9px] uppercase font-bold">Active instances</span>
                <strong className={isDark ? 'text-white' : 'text-slate-800'}>{metrics.active} Units</strong>
              </div>
              <div>
                <span className="block text-gray-500 text-[9px] uppercase font-bold">Purchased units</span>
                <strong className={isDark ? 'text-white' : 'text-slate-800'}>{metrics.purchased} Units</strong>
              </div>
            </div>
          </div>

          {/* Core Actions */}
          <div className="flex gap-2.5 pt-2">
            <button 
              onClick={() => onNavigate('documentation')}
              className="flex-1 py-1.5 border dark:border-gray-800 text-[10px] font-bold text-center rounded-lg hover:bg-black/10 dark:text-gray-300 cursor-pointer"
            >
              Get Handbooks
            </button>
            <button 
              onClick={() => onNavigate('support')}
              className="flex-1 py-1.5 border dark:border-gray-800 text-[10px] font-bold text-center rounded-lg hover:bg-black/10 dark:text-gray-300 cursor-pointer"
            >
              {t.support || 'Products'}
            </button>
          </div>
        </div>

      </div>

      <div className="mt-4 pt-4 border-t dark:border-gray-800 border-slate-100 text-[10px] text-center text-gray-500 italic">
        *Licensing figures combine deployments of all active contracts.
      </div>
    </div>
  );
}
