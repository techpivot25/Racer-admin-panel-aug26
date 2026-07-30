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
      className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold select-none"
    >
      {/* Circular Brand Logo Badge */}
      <div 
        onClick={() => onNavigate('home')}
        className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 shadow-xs border border-white/20 cursor-pointer hover:scale-105 active:scale-95 transition-all"
        title="Go to Home Portal"
      >
        <svg className="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </svg>
      </div>

      {/* Root Breadcrumb Item */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate('home')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-white bg-white/20 font-extrabold'
              : 'text-purple-100 dark:text-slate-300 hover:text-white hover:bg-white/10'
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
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-white/50" />
          <div className="flex items-center">
            <button
              onClick={() => onNavigate(currentMetadata.categoryTab)}
              className="px-2 py-1 rounded-lg transition-all cursor-pointer text-left text-purple-100 dark:text-slate-300 hover:text-white hover:bg-white/10"
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
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-white/50" />
          <div className="flex items-center">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 text-white font-extrabold border border-white/20 shadow-xs">
              <CurrentIcon className="w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span>{currentMetadata.label}</span>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
