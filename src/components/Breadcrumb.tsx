import { 
  Home, 
  LayoutDashboard, 
  Users, 
  Laptop, 
  Building2, 
  CircleDollarSign, 
  BookOpen, 
  ShieldAlert, 
  ChevronRight,
  Globe,
  Key
} from 'lucide-react';

interface BreadcrumbProps {
  activeTab: 'home' | 'dashboard' | 'users' | 'products' | 'licenses' | 'customers' | 'billing' | 'documentation' | 'support' | 'sitemap';
  onNavigate: (tab: 'home' | 'dashboard' | 'users' | 'products' | 'licenses' | 'customers' | 'billing' | 'documentation' | 'support' | 'sitemap') => void;
  isDark: boolean;
  t: Record<string, string>;
}

export default function Breadcrumb({ activeTab, onNavigate, isDark, t }: BreadcrumbProps) {
  // Map tab to category and metadata
  const tabMetadata = {
    home: {
      category: 'Overview & Monitoring',
      categoryTab: 'home',
      label: t.home || 'Home',
      icon: Home,
    },
    dashboard: {
      category: 'Overview & Monitoring',
      categoryTab: 'home',
      label: t.dashboard || 'Dashboard',
      icon: LayoutDashboard,
    },
    users: {
      category: t.management || 'Enterprise Admin',
      categoryTab: 'users',
      label: t.users || 'Users',
      icon: Users,
    },
    products: {
      category: t.management || 'Enterprise Admin',
      categoryTab: 'users',
      label: t.products || 'Product Admin',
      icon: Laptop,
    },
    licenses: {
      category: t.management || 'Enterprise Admin',
      categoryTab: 'users',
      label: t.contracts || 'Licensing',
      icon: Key,
    },
    customers: {
      category: t.management || 'Enterprise Admin',
      categoryTab: 'users',
      label: t.customers || 'Customer Admin',
      icon: Building2,
    },
    billing: {
      category: t.management || 'Enterprise Admin',
      categoryTab: 'users',
      label: t.billing || 'Audits',
      icon: CircleDollarSign,
    },
    documentation: {
      category: 'Support & Assets',
      categoryTab: 'documentation',
      label: t.documentation || 'Documentation',
      icon: BookOpen,
    },
    support: {
      category: 'Support & Assets',
      categoryTab: 'documentation',
      label: t.support || 'Products',
      icon: ShieldAlert,
    },
    sitemap: {
      category: 'Support & Assets',
      categoryTab: 'documentation',
      label: t.sitemap || 'Site Map',
      icon: Globe,
    },
  } as const;

  const currentMetadata = tabMetadata[activeTab];
  const CurrentIcon = currentMetadata?.icon || Home;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm font-extrabold select-none"
    >
      {/* Circular Brand Logo Badge */}
      <div 
        onClick={() => onNavigate('home')}
        className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0 shadow-xs border border-blue-200 dark:border-blue-900/50 cursor-pointer hover:scale-105 active:scale-95 transition-all"
        title="Go to Home Portal"
      >
        <svg className="w-4 h-4 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </svg>
      </div>

      {/* Root Breadcrumb Item */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate('home')}
          className={`flex items-center gap-1 px-1.5 py-1 rounded-md transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#2563EB] bg-[#2563EB]/10'
              : isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Go to Home"
        >
          <Home className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Home</span>
        </button>
      </div>

      {/* Level 1: Category Section */}
      {activeTab !== 'home' && currentMetadata && (
        <>
          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-gray-600' : 'text-slate-300'}`} />
          <div className="flex items-center">
            <button
              onClick={() => onNavigate(currentMetadata.categoryTab)}
              className={`px-1.5 py-1 rounded-md transition-all cursor-pointer text-left ${
                isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={`Go to ${currentMetadata.category}`}
            >
              <span>{currentMetadata.category}</span>
            </button>
          </div>
        </>
      )}

      {/* Level 2: Active Tab Section */}
      {activeTab !== 'home' && currentMetadata && (
        <>
          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-gray-600' : 'text-slate-300'}`} />
          <div className="flex items-center">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/10">
              <CurrentIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{currentMetadata.label}</span>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
