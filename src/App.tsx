import { useState, useEffect, useMemo, useRef, ChangeEvent } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Users as UsersIcon, 
  Laptop, 
  Building2, 
  CircleDollarSign, 
  BookOpen, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Globe, 
  ChevronDown, 
  ChevronRight,
  Menu, 
  X,
  Bell,
  Settings as SettingsIcon,
  CheckCircle2,
  Trash2,
  LogOut,
  UserCheck,
  User,
  Bot,
  Sparkles,
  Camera,
  Upload,
  Phone,
  Mail,
  MapPin,
  Shield,
  ChevronsUpDown,
  Key,
  FileText
} from 'lucide-react';

import { Language, AdminUser, Product, Customer, Contract, DocItem, SupportTierInfo, AuditRecord, License, CustomerProductMapping, HostActivation } from './types';
import { 
  translations, 
  initialUsers, 
  initialProducts, 
  initialCustomers, 
  initialContracts, 
  initialDocs, 
  initialSupportTiers,
  initialLicenses,
  initialHostActivations
} from './data';

// Component Imports
import HomeTab from './components/HomeTab';
import Breadcrumb from './components/Breadcrumb';
import LanguageSelector from './components/LanguageSelector';
import AdminChatbot from './components/AdminChatbot';
import DashboardTab from './components/DashboardTab';
import UsersTab from './components/UsersTab';
import ProductsTab from './components/ProductsTab';
import CustomersTab from './components/CustomersTab';
import BillingTab from './components/BillingTab';
import DocsTab from './components/DocsTab';
import SupportTab from './components/SupportTab';
import SiteMapTab from './components/SiteMapTab';
import LicensesTab from './components/LicensesTab';
import AdminLogin from './components/AdminLogin';

export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('bj_admin_logged_in') === 'true';
  });

  // Theme & Language states
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [lang, setLang] = useState<Language>('EN');
  
  // Navigation states
  const [activeTab, setActiveTab] = useState<
    'home' | 'dashboard' | 'users' | 'products' | 'licenses' | 'customers' | 'billing' | 'documentation' | 'support' | 'sitemap'
  >('home');

  // Trigger modals on other tabs from Quick Links
  const [addUserTrigger, setAddUserTrigger] = useState(false);
  const [addCustomerTrigger, setAddCustomerTrigger] = useState(false);
  const [addProductTrigger, setAddProductTrigger] = useState(false);
  const [addContractTrigger, setAddContractTrigger] = useState(false);

  // Stateful databases for CRUD operations
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [documents, setDocuments] = useState<DocItem[]>(initialDocs);
  const [supportTiers, setSupportTiers] = useState<SupportTierInfo[]>(initialSupportTiers);
  const [licenses, setLicenses] = useState<License[]>(initialLicenses);
  const [hostActivations, setHostActivations] = useState<HostActivation[]>(initialHostActivations);

  // Custom customer-product mappings state
  const [customerProductMappings, setCustomerProductMappings] = useState<CustomerProductMapping[]>(() => {
    const mappings: CustomerProductMapping[] = [];
    initialProducts.forEach(p => {
      if (p.customerIds && Array.isArray(p.customerIds)) {
        p.customerIds.forEach(cid => {
          const custIntId = parseInt(cid.replace(/\D/g, ''), 10) || 0;
          const prodIntId = parseInt(p.id.replace(/\D/g, ''), 10) || 0;
          mappings.push({
            id: `map-${cid}-${p.id}`,
            customerId: custIntId,
            productId: prodIntId,
            productSku: p.sku,
            productUnitPrice: p.unitPrice,
            customerUnitPrice: p.unitPrice
          });
        });
      }
    });
    return mappings;
  });

  // Filter & Search helper states
  const [billingPreselectedCustomer, setBillingPreselectedCustomer] = useState('');
  const [productPreselectedCustomerId, setProductPreselectedCustomerId] = useState('all');
  const [productPreselectedId, setProductPreselectedId] = useState('');
  const [customerPreselectedId, setCustomerPreselectedId] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Collapsible sidebar menu group states matching screenshot
  const [salesMenuOpen, setSalesMenuOpen] = useState(true);
  const [customersMenuOpen, setCustomersMenuOpen] = useState(true);
  const [projectsMenuOpen, setProjectsMenuOpen] = useState(false);
  const [analyticsMenuOpen, setAnalyticsMenuOpen] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [cryptoMenuOpen, setCryptoMenuOpen] = useState(false);
  const [hrMenuOpen, setHrMenuOpen] = useState(false);
  const [accountsMenuOpen, setAccountsMenuOpen] = useState(false);

  const [commonMenuOpen, setCommonMenuOpen] = useState(false);
  const [displayMenuOpen, setDisplayMenuOpen] = useState(false);
  const [formsMenuOpen, setFormsMenuOpen] = useState(false);
  const [feedbackMenuOpen, setFeedbackMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  
  // User Profile details
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem('bj_profileName') || 'Angelina Gotelli';
  });
  const [profileMobile, setProfileMobile] = useState(() => {
    return localStorage.getItem('bj_profileMobile') || '+1 (555) 019-9842';
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    return localStorage.getItem('bj_profileEmail') || 'admin-01@racer.com';
  });
  const [profileAddress, setProfileAddress] = useState(() => {
    return localStorage.getItem('bj_profileAddress') || '742 Evergreen Terrace, Los Angeles, CA';
  });
  const [profileAdminType, setProfileAdminType] = useState<'Super Admin' | 'Admin' | 'Sub Admin'>(() => {
    const saved = localStorage.getItem('bj_profileAdminType');
    return (saved === 'Super Admin' || saved === 'Admin' || saved === 'Sub Admin') ? saved : 'Super Admin';
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    return localStorage.getItem('bj_profilePhoto') || null;
  });
  
  // Dynamic address search suggestions states
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const memoizedPanelData = useMemo(() => {
    return {
      users: users.map(u => ({ uuid: u.uuid, name: u.name, email: u.email, role: u.role, customerName: u.customerName, status: u.status })),
      products: products.map(p => ({ id: p.id, name: p.name, sku: p.sku, price: p.price, tier: p.tier, family: p.family })),
      customers: customers.map(c => ({ id: c.id, name: c.name, supportTier: c.supportTier, status: c.status, country: c.country })),
      contracts: contracts.filter(con => !con.isDeleted).map(con => ({
        id: con.id,
        name: con.name,
        customerName: con.customerName,
        productSku: con.productSku,
        productName: con.productName,
        unitPrice: con.unitPrice,
        purchasedUnits: con.purchasedUnits,
        activeUnits: con.activeUnits,
        totalContractValue: con.unitPrice * con.purchasedUnits * con.termMonths,
        termMonths: con.termMonths,
        startDate: con.startDate,
        endDate: con.endDate
      })),
      documents: documents.map(d => ({ id: d.id, title: d.title, category: d.category, size: d.fileSize, isPublished: d.isPublished })),
      supportTiers: supportTiers.map(t => ({ id: t.id, name: t.name, responseTime: t.responseTime, coverageHours: t.coverageHours, channels: t.channels, maxTickets: t.maxTickets, directPhoneAccess: t.directPhoneAccess, dedicatedLiaison: t.dedicatedLiaison }))
    };
  }, [users, products, customers, contracts, documents, supportTiers]);

  // Active toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme with body element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Show toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Welcome toast upon successful login
  useEffect(() => {
    if (isLoggedIn && localStorage.getItem('bj_show_welcome_toast') === 'true') {
      triggerToast('Welcome Back, Super Admin!');
      localStorage.removeItem('bj_show_welcome_toast');
    }
  }, [isLoggedIn]);

  // Administrative Log Out
  const handleLogout = () => {
    localStorage.removeItem('bj_admin_logged_in');
    setIsLoggedIn(false);
    triggerToast('Logged out successfully');
  };

  // Profile Photo Upload & Webcam Handlers
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 400 }, height: { ideal: 400 } } 
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      // Allow video element rendering before set
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 80);
    } catch (err) {
      console.error('Camera access failed:', err);
      triggerToast('Camera error: Ensure permissions are granted and camera is available.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = 300;
        canvas.height = 300;
        
        // Mirror effect
        context.translate(300, 0);
        context.scale(-1, 1);
        
        const videoWidth = video.videoWidth || 300;
        const videoHeight = video.videoHeight || 300;
        const size = Math.min(videoWidth, videoHeight);
        const startX = (videoWidth - size) / 2;
        const startY = (videoHeight - size) / 2;
        
        context.drawImage(video, startX, startY, size, size, 0, 0, 300, 300);
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/png');
        setProfilePhoto(dataUrl);
        stopCamera();
        triggerToast('Profile photo captured!');
      }
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        triggerToast('Image is too large. Choose a file under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        triggerToast('Profile photo uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressChange = (value: string) => {
    setProfileAddress(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!value || value.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    setIsSearchingAddress(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setAddressSuggestions(data);
        } else {
          setAddressSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 400);
  };

  // Translations shortcut helper
  const t = useMemo(() => translations[lang], [lang]);

  // Audit Logs Persistent State
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem('bj_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'log-1',
        timestamp: '2026-07-07 09:12:00',
        action: 'System Bootstrapping',
        user: 'System Admin',
        details: 'BJ Core Engine connection established. SSL key authenticated.',
        screen: 'General'
      },
      {
        id: 'log-2',
        timestamp: '2026-07-07 09:15:30',
        action: 'Service Audit Log',
        user: 'System Admin',
        details: 'License validation agent listening on Port 3000.',
        screen: 'General'
      }
    ];
  });

  // Save audit logs to localStorage
  useEffect(() => {
    localStorage.setItem('bj_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = (action: string, details: string, screen: 'Users' | 'Customers' | 'Products' | 'General' | 'Licenses' | 'Support') => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newRecord: AuditRecord = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp,
      action,
      user: profileName || profileEmail || 'System Admin',
      details,
      screen
    };
    setAuditLogs(prev => [newRecord, ...prev]);
  };

  // CRUD state handler methods
  // Users
  const handleAddUser = (u: AdminUser) => {
    setUsers([u, ...users]);
    addAuditLog('Register User', `Created new user account: ${u.firstName} ${u.lastName} (${u.email}) associated with customer ${u.customerName}. Role: ${u.title}. Privilege: ${u.adminRole || (u.isAdminUser ? 'Admin' : 'Customer')}.`, 'Users');
    triggerToast(t.successSaved);
  };
  const handleEditUser = (u: AdminUser) => {
    setUsers(users.map(item => item.uuid === u.uuid ? u : item));
    addAuditLog('Modify User', `Updated user account: ${u.firstName} ${u.lastName} (${u.uuid}). New Title: ${u.title}. Auth Method: ${u.authMethod}. Privilege: ${u.adminRole || (u.isAdminUser ? 'Admin' : 'Customer')}.`, 'Users');
    triggerToast(t.successSaved);
  };
  const handleDeleteUser = (uuid: string) => {
    const user = users.find(item => item.uuid === uuid);
    const name = user ? `${user.firstName} ${user.lastName}` : uuid;
    setUsers(users.filter(item => item.uuid !== uuid));
    addAuditLog('Delete User', `Permanently deleted user account: ${name} (${uuid}).`, 'Users');
    triggerToast(t.successDeleted);
  };

  // Products
  const handleAddProduct = (p: Product) => {
    setProducts([p, ...products]);
    addAuditLog('Create Product', `Added new product to catalog: ${p.name} (SKU: ${p.sku}) with base price $${p.unitPrice}. Family: ${p.family}.`, 'Products');
    triggerToast(t.successSaved);
  };
  const handleEditProduct = (p: Product) => {
    setProducts(products.map(item => item.id === p.id ? p : item));
    addAuditLog('Modify Product', `Modified product details: ${p.name} (${p.id}). Price: $${p.unitPrice}. Family: ${p.family}.`, 'Products');
    triggerToast(t.successSaved);
  };
  const handleDeleteProduct = (id: string) => {
    const prod = products.find(item => item.id === id);
    const name = prod ? prod.name : id;
    setProducts(products.map(item => item.id === id ? { ...item, status: 'Inactive' } : item));
    addAuditLog('Delete Product', `Soft-deleted product (marked status as Inactive) from catalog: ${name} (${id}).`, 'Products');
    triggerToast(t.successDeleted);
  };

  // Customers
  const handleAddCustomer = (c: Customer) => {
    setCustomers([c, ...customers]);
    addAuditLog('Create Customer', `Registered new enterprise tenant: ${c.name} (${c.address || 'US'}). Contact: ${c.primaryContactName}. Support: ${c.supportTier}.`, 'Customers');
    triggerToast(t.successSaved);
  };
  const handleEditCustomer = (c: Customer) => {
    setCustomers(customers.map(item => item.id === c.id ? c : item));
    addAuditLog('Modify Customer', `Updated customer profile/SSO: ${c.name} (${c.id}). Status: ${c.status}. SSO Enabled: ${c.ssoEnabled ? 'Yes (' + c.ssoProvider + ')' : 'No'}.`, 'Customers');
    triggerToast(t.successSaved);
  };
  const handleDeleteCustomer = (id: string) => {
    const cust = customers.find(item => item.id === id);
    const name = cust ? cust.name : id;
    setCustomers(customers.filter(item => item.id !== id));
    addAuditLog('Delete Customer', `Terminated customer tenant account: ${name} (${id}). All associated SSO links deactivated.`, 'Customers');
    triggerToast(t.successDeleted);
  };

  // Contracts
  const handleAddContract = (con: Contract) => {
    setContracts([con, ...contracts]);
    triggerToast(t.successSaved);
  };
  const handleEditContract = (con: Contract) => {
    setContracts(contracts.map(item => item.id === con.id ? con : item));
    triggerToast(t.successSaved);
  };
  const handleDeleteContract = (id: string) => {
    setContracts(contracts.map(item => item.id === id ? { ...item, isDeleted: true } : item));
    triggerToast(t.successDeleted);
  };

  // Documents
  const handleAddDoc = (doc: DocItem) => {
    setDocuments([doc, ...documents]);
    triggerToast(t.successSaved);
  };
  const handleEditDoc = (doc: DocItem) => {
    setDocuments(documents.map(item => item.id === doc.id ? doc : item));
    triggerToast(t.successSaved);
  };
  const handleDeleteDoc = (id: string) => {
    setDocuments(documents.filter(item => item.id !== id));
    triggerToast(t.successDeleted);
  };

  // Support Tiers
  const handleEditTier = (tier: SupportTierInfo) => {
    setSupportTiers(supportTiers.map(item => item.id === tier.id ? tier : item));
    triggerToast(t.successSaved);
  };

  // Handle navigation requests (especially with action triggers)
  const handleNavigation = (tab: typeof activeTab, actionTrigger?: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close mobile menu if open

    if (actionTrigger) {
      if (actionTrigger === 'addNewUser') setAddUserTrigger(true);
      if (actionTrigger === 'addNewCustomer') setAddCustomerTrigger(true);
      if (actionTrigger === 'addNewProduct') setAddProductTrigger(true);
      if (actionTrigger === 'addNewContract') setAddContractTrigger(true);
    }
  };

  const handleGoToBillingFromCustomer = (customerName: string) => {
    setBillingPreselectedCustomer(customerName);
    setActiveTab('billing');
  };

  const handleGoToProductDetailsFromCustomer = (customerId: string, productId: string) => {
    setProductPreselectedCustomerId(customerId);
    setProductPreselectedId(productId);
    setActiveTab('products');
  };

  // Licenses
  const handleAddLicense = (lic: License) => {
    setLicenses([lic, ...licenses]);
    const priceDetails = lic.customerUnitPrice !== undefined ? ` | List Price: $${lic.listPrice?.toFixed(2)} | Customer Price: $${lic.customerUnitPrice?.toFixed(2)}` : '';
    const termDetails = lic.termMonths ? ` | Term: ${lic.termMonths} months (Start: ${lic.termStartDate}, End: ${lic.termEndDate})` : '';
    addAuditLog('Issue License', `Issued product license allocation: ${lic.licenseKey} units (SKU: ${lic.sku}) to company ${lic.companyName}.${priceDetails}${termDetails} | Status: ${lic.initialAuthState || (lic.isActive ? 'Active' : 'Blocked')}.`, 'Licenses');
    triggerToast(t.successSaved);
  };
  const handleEditLicense = (lic: License) => {
    setLicenses(licenses.map(item => item.id === lic.id ? lic : item));
    const priceDetails = lic.customerUnitPrice !== undefined ? ` | List Price: $${lic.listPrice?.toFixed(2)} | Customer Price: $${lic.customerUnitPrice?.toFixed(2)}` : '';
    const termDetails = lic.termMonths ? ` | Term: ${lic.termMonths} months (Start: ${lic.termStartDate}, End: ${lic.termEndDate})` : '';
    addAuditLog('Modify License', `Updated product license allocation to ${lic.licenseKey} units associated with ${lic.companyName}.${priceDetails}${termDetails} | Status Active: ${lic.isActive}.`, 'Licenses');
    triggerToast(t.successSaved);
  };
  const handleDeleteLicense = (id: string) => {
    const lic = licenses.find(item => item.id === id);
    const keyStr = lic ? lic.licenseKey : id;
    const compName = lic ? ` associated with ${lic.companyName}` : '';
    setLicenses(licenses.filter(item => item.id !== id));
    addAuditLog('Delete License', `Permanently deleted license allocation record with ${keyStr} units${compName}.`, 'Licenses');
    triggerToast(t.successDeleted);
  };
  const handleSelectCustomerFromLicense = (customerId: string) => {
    setCustomerPreselectedId(customerId);
    setActiveTab('customers');
  };

  const handleAddHostActivation = (act: HostActivation) => {
    setHostActivations([act, ...hostActivations]);
    addAuditLog('Activate Host Unit', `Registered granular hardware system license: ${act.licenseKey} (Host ID: ${act.customerHostId}) under contract ID: ${act.contractId} for ${act.customerName}.`, 'Licenses');
    triggerToast(t.successSaved);
  };

  const handleEditHostActivation = (act: HostActivation) => {
    setHostActivations(hostActivations.map(item => item.id === act.id ? act : item));
    addAuditLog('Modify Host Register', `Modified system license mapping details for ${act.licenseKey} (Host ID: ${act.customerHostId}). Status: ${act.licenseActive ? 'Active' : 'Deactivated'}.`, 'Licenses');
    triggerToast(t.successSaved);
  };

  const handleDeleteHostActivation = (id: string) => {
    const act = hostActivations.find(item => item.id === id);
    const details = act ? ` ${act.licenseKey} (Host ID: ${act.customerHostId})` : '';
    setHostActivations(hostActivations.filter(item => item.id !== id));
    addAuditLog('Remove Host Register', `Permanently deleted granular host register:${details}.`, 'Licenses');
    triggerToast(t.successDeleted);
  };

  const handleAddMapping = (mapping: CustomerProductMapping) => {
    setCustomerProductMappings([mapping, ...customerProductMappings]);
    addAuditLog('Add Mapping', `Associated product SKU: ${mapping.productSku} (Product ID: ${mapping.productId}) with Customer ID: ${mapping.customerId}. List Price: $${mapping.productUnitPrice.toFixed(2)}, Customer Price: $${mapping.customerUnitPrice.toFixed(2)}.`, 'Licenses');
    triggerToast(t.successSaved);
  };

  const handleEditMapping = (mapping: CustomerProductMapping) => {
    setCustomerProductMappings(customerProductMappings.map(m => m.id === mapping.id ? mapping : m));
    addAuditLog('Modify Mapping', `Updated custom pricing for product SKU: ${mapping.productSku} (Product ID: ${mapping.productId}) with Customer ID: ${mapping.customerId}. List Price: $${mapping.productUnitPrice.toFixed(2)}, New Customer Price: $${mapping.customerUnitPrice.toFixed(2)}.`, 'Licenses');
    triggerToast(t.successSaved);
  };

  const handleDeleteMapping = (id: string) => {
    const mapping = customerProductMappings.find(m => m.id === id);
    const details = mapping ? ` SKU: ${mapping.productSku} associated with Customer ID: ${mapping.customerId}` : ` with mapping ID: ${id}`;
    setCustomerProductMappings(customerProductMappings.filter(m => m.id !== id));
    addAuditLog('Delete Mapping', `Permanently deleted product association mapping${details}.`, 'Licenses');
    triggerToast(t.successDeleted);
  };

  const getSidebarLinkClass = (tab: 'home' | 'dashboard' | 'users' | 'products' | 'licenses' | 'customers' | 'billing' | 'documentation' | 'support' | 'sitemap') => {
    const isActive = activeTab === tab;
    if (isActive) {
      return theme === 'dark'
        ? 'relative text-purple-200 bg-purple-950/70 font-bold border-l-4 border-purple-500 rounded-r-xl shadow-2xs'
        : 'relative text-purple-900 bg-purple-100/70 font-bold border-l-4 border-purple-700 rounded-r-xl shadow-2xs';
    }
    return theme === 'dark' 
      ? 'relative text-slate-300 hover:text-purple-200 hover:bg-purple-950/40 hover:border-l-4 hover:border-purple-600 rounded-r-xl border-l-4 border-transparent' 
      : 'relative text-purple-900 hover:text-purple-950 hover:bg-purple-50 hover:border-l-4 hover:border-purple-600 rounded-r-xl border-l-4 border-transparent';
  };



  if (!isLoggedIn) {
    return (
      <AdminLogin 
        onLoginSuccess={(name) => {
          localStorage.setItem('bj_admin_logged_in', 'true');
          localStorage.setItem('bj_show_welcome_toast', 'true');
          setIsLoggedIn(true);
        }}
        isDark={theme === 'dark'}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        currentLang={lang}
        onChangeLang={setLang}
        t={t}
      />
    );
  }

  return (
    <div className={`min-h-screen flex font-sans ${theme === 'dark' ? 'bg-[#020617] text-gray-100' : 'bg-[#F8FAFC] text-slate-800'} transition-colors duration-200`}>
      
      {/* SIDEBAR NAVIGATION PANEL (RESPONSIVE COMPATIBLE FOR TABLET & MOBILE DRAWER) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform lg:translate-x-0 lg:static lg:h-screen transition-all duration-200 ease-in-out border-r shrink-0 flex flex-col justify-between ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
        
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header / Brand Mark */}
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                  <path d="M12 8v8" />
                </svg>
              </div>
              <div>
                <h1 className="font-extrabold text-[19px] tracking-tight text-slate-900 dark:text-white leading-none">RACER</h1>
              </div>
            </div>
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Sections - Restored original functional navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            
            {/* SECTION: Overview & Monitoring */}
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider block px-3 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                Overview & Monitoring
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNavigation('home')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getSidebarLinkClass('home')}`}
                >
                  <Home className="w-4 h-4 shrink-0 transition-colors text-purple-700 dark:text-purple-400" />
                  <span>{t.home}</span>
                </button>

                <button
                  onClick={() => handleNavigation('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getSidebarLinkClass('dashboard')}`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0 transition-colors text-purple-700 dark:text-purple-400" />
                  <span>{t.dashboard}</span>
                </button>
              </nav>
            </div>

            {/* SECTION: Enterprise Admin */}
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider block px-3 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                {t.management || 'Enterprise Admin'}
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNavigation('users')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getSidebarLinkClass('users')}`}
                >
                  <UsersIcon className="w-4 h-4 shrink-0 transition-colors text-purple-700 dark:text-purple-400" />
                  <span>{t.users}</span>
                </button>

                <button
                  onClick={() => handleNavigation('products')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getSidebarLinkClass('products')}`}
                >
                  <Laptop className="w-4 h-4 shrink-0 transition-colors text-purple-700 dark:text-purple-400" />
                  <span>{t.products}</span>
                </button>

                <button
                  onClick={() => handleNavigation('licenses')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getSidebarLinkClass('licenses')}`}
                >
                  <Key className="w-4 h-4 shrink-0 transition-colors text-purple-700 dark:text-purple-400" />
                  <span>{t.contracts || 'Licensing'}</span>
                </button>

                <button
                  onClick={() => handleNavigation('customers')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getSidebarLinkClass('customers')}`}
                >
                  <Building2 className="w-4 h-4 shrink-0 transition-colors text-purple-700 dark:text-purple-400" />
                  <span>{t.customers}</span>
                </button>

                <button
                  onClick={() => handleNavigation('billing')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getSidebarLinkClass('billing')}`}
                >
                  <CircleDollarSign className="w-4 h-4 shrink-0 transition-colors text-purple-700 dark:text-purple-400" />
                  <span>{t.billing || 'Audits'}</span>
                </button>
              </nav>
            </div>

            {/* SECTION: Support & Assets */}
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider block px-3 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                Support & Assets
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNavigation('documentation')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getSidebarLinkClass('documentation')}`}
                >
                  <BookOpen className="w-4 h-4 shrink-0 transition-colors text-purple-700 dark:text-purple-400" />
                  <span>{t.documentation}</span>
                </button>

                <button
                  onClick={() => handleNavigation('support')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getSidebarLinkClass('support')}`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 transition-colors text-purple-700 dark:text-purple-400" />
                  <span>Product Support</span>
                </button>

                <button
                  onClick={() => handleNavigation('sitemap')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getSidebarLinkClass('sitemap')}`}
                >
                  <Globe className="w-4 h-4 shrink-0 transition-colors text-purple-700 dark:text-purple-400" />
                  <span>{t.sitemap}</span>
                </button>
              </nav>
            </div>

          </div>

          {/* Sidebar Footer with Logged In User Profile */}
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100 bg-slate-50/40'}`}>
            <div className="flex items-center gap-3 p-1 rounded-xl">
              <div className="relative shrink-0">
                <div 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-extrabold text-sm cursor-pointer hover:opacity-90 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700"
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={profileName} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                      {profileName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || 'AG'}
                    </div>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#020617] rounded-full"></span>
              </div>
              <div className="min-w-0 flex-1">
                <div 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-xs font-bold truncate cursor-pointer hover:underline text-slate-800 dark:text-white leading-tight"
                >
                  {profileName}
                </div>
              </div>
              
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                title="Profile Settings"
              >
                <ChevronsUpDown className="w-4 h-4" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-1 rounded-lg hover:bg-rose-500/15 hover:text-rose-500 text-slate-400 transition-colors cursor-pointer shrink-0"
                title={t.logOut || 'Log Out'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN DISPLAY STAGE */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-slate-100 dark:bg-[#020617]">
        
        {/* PERSISTENT PAGE HEADER */}
        <header className={`px-6 py-4 flex items-center justify-between border-b transition-colors shadow-xs ${
          theme === 'dark' ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-[#6b21a8] border-purple-800 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {/* Hamburger Button on Mobile */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className={`lg:hidden p-1.5 rounded-lg transition-colors cursor-pointer ${
                theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-purple-800 text-white'
              }`}
              title="Toggle Sidebar Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Quick Language Toggle */}
            <LanguageSelector currentLang={lang} onChangeLang={setLang} isDark={theme === 'dark'} />

            {/* AI Assistant Button */}
            <button 
              onClick={() => setIsChatbotOpen(!isChatbotOpen)} 
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Open AI Assistant Control Panel"
            >
              <Bot className="w-4.5 h-4.5 animate-pulse" />
            </button>

            {/* Theme switch */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-300" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Circular Bell Notification Button with Badge */}
            <div className="relative">
              <button className="w-9 h-9 rounded-full bg-white text-purple-900 flex items-center justify-center shadow-xs hover:bg-slate-100 cursor-pointer">
                <Bell className="w-4.5 h-4.5" />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-purple-900">
                1
              </span>
            </div>

            {/* User Profile Avatar with White Ring */}
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="w-9 h-9 rounded-full border-2 border-white bg-purple-700 text-white flex items-center justify-center font-black text-xs cursor-pointer shadow-sm hover:opacity-90 overflow-hidden shrink-0"
              title="Open Admin Profile Settings"
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
              ) : (
                profileName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase()
              )}
            </div>
          </div>
        </header>

          {/* CORE VIEW RENDERING */}
          <div className="p-6">
            <div className="lg:hidden mb-4">
              <Breadcrumb 
                activeTab={activeTab} 
                onNavigate={handleNavigation} 
                isDark={theme === 'dark'} 
                t={t} 
              />
            </div>
            
            {activeTab === 'home' && (
              <HomeTab 
                products={products}
                customers={customers}
                contracts={contracts.filter(c => !c.isDeleted)}
                t={t}
                isDark={theme === 'dark'}
                onNavigate={handleNavigation}
                profileName={profileName}
                profileAdminType={profileAdminType}
                profilePhoto={profilePhoto}
                onSelectCustomer={handleSelectCustomerFromLicense}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardTab 
                isDark={theme === 'dark'}
                t={t}
              />
            )}

            {activeTab === 'users' && (
              <UsersTab 
                users={users}
                customers={customers}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                t={t}
                isDark={theme === 'dark'}
                triggerOpenAddModal={addUserTrigger}
                onResetTrigger={() => setAddUserTrigger(false)}
                auditLogs={auditLogs}
                currentUserRole={profileAdminType}
              />
            )}

            {activeTab === 'products' && (
              <ProductsTab 
                products={products}
                customers={customers}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                t={t}
                isDark={theme === 'dark'}
                triggerOpenAddModal={addProductTrigger}
                onResetTrigger={() => setAddProductTrigger(false)}
                auditLogs={auditLogs}
                preselectedCustomerId={productPreselectedCustomerId}
                preselectedProductId={productPreselectedId}
                onClearPreselection={() => {
                  setProductPreselectedCustomerId('all');
                  setProductPreselectedId('');
                }}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersTab 
                customers={customers}
                products={products}
                contracts={contracts.filter(c => !c.isDeleted)}
                documents={documents}
                users={users}
                licenses={licenses}
                onAddCustomer={handleAddCustomer}
                onEditCustomer={handleEditCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onAddContract={handleAddContract}
                onEditContract={handleEditContract}
                onAddDoc={handleAddDoc}
                onEditDoc={handleEditDoc}
                onDeleteDoc={handleDeleteDoc}
                onAddSubUser={handleAddUser}
                onEditSubUser={handleEditUser}
                onDeleteSubUser={handleDeleteUser}
                addAuditLog={addAuditLog}
                onGoToBilling={handleGoToBillingFromCustomer}
                onGoToProductDetails={handleGoToProductDetailsFromCustomer}
                t={t}
                isDark={theme === 'dark'}
                triggerOpenAddModal={addCustomerTrigger}
                onResetTrigger={() => setAddCustomerTrigger(false)}
                auditLogs={auditLogs}
                preselectedCustomerId={customerPreselectedId}
                onClearPreselectedCustomerId={() => setCustomerPreselectedId('')}
              />
            )}

            {activeTab === 'licenses' && (
              <LicensesTab 
                customers={customers}
                products={products}
                contracts={contracts.filter(c => !c.isDeleted)}
                onAddContract={handleAddContract}
                onEditContract={handleEditContract}
                onDeleteContract={handleDeleteContract}
                onSelectCustomer={handleSelectCustomerFromLicense}
                isDark={theme === 'dark'}
                t={t}
                addAuditLog={addAuditLog}
                customerProductMappings={customerProductMappings}
                onAddMapping={handleAddMapping}
                onEditMapping={handleEditMapping}
                onDeleteMapping={handleDeleteMapping}
              />
            )}

            {activeTab === 'billing' && (
              <BillingTab 
                contracts={contracts.filter(c => !c.isDeleted)}
                customers={customers}
                products={products}
                hostActivations={hostActivations}
                onAddContract={handleAddContract}
                onEditContract={handleEditContract}
                onDeleteContract={handleDeleteContract}
                t={t}
                isDark={theme === 'dark'}
                filterCustomerName={billingPreselectedCustomer}
                triggerOpenAddModal={addContractTrigger}
                onResetTrigger={() => {
                  setAddContractTrigger(false);
                  setBillingPreselectedCustomer('');
                }}
                licenses={licenses}
                onAddLicense={handleAddLicense}
                onEditLicense={handleEditLicense}
                onDeleteLicense={handleDeleteLicense}
                onAddHostActivation={handleAddHostActivation}
                onEditHostActivation={handleEditHostActivation}
                onDeleteHostActivation={handleDeleteHostActivation}
                onSelectCustomer={handleSelectCustomerFromLicense}
                addAuditLog={addAuditLog}
              />
            )}

            {activeTab === 'documentation' && (
              <DocsTab 
                documents={documents}
                products={products}
                customers={customers}
                users={users}
                supportTiers={supportTiers}
                onAddDoc={handleAddDoc}
                onEditDoc={handleEditDoc}
                onDeleteDoc={handleDeleteDoc}
                t={t}
                isDark={theme === 'dark'}
              />
            )}

            {activeTab === 'support' && (
              <SupportTab 
                tiers={supportTiers}
                customers={customers}
                products={products}
                onEditTier={handleEditTier}
                t={t}
                isDark={theme === 'dark'}
                auditLogs={auditLogs}
                addAuditLog={addAuditLog}
              />
            )}

            {activeTab === 'sitemap' && (
              <SiteMapTab 
                isDark={theme === 'dark'}
                t={t}
                onNavigate={handleNavigation}
                users={users}
                products={products}
                customers={customers}
                contracts={contracts.filter(c => !c.isDeleted)}
                documents={documents}
                supportTiers={supportTiers}
                licenses={licenses}
              />
            )}

          </div>

        </main>

      {/* FLOATING ACTION TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 animate-bounce">
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-500">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* OMNIPRESENT AI CHATBOT LAUNCHER BUTTON */}
      {!isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-2xl transition-all cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center border border-purple-500 hover:rotate-6 group"
          title="Open AI Assistant"
        >
          <Bot className="w-6 h-6 group-hover:animate-bounce" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[8px] bg-emerald-500 text-white font-black uppercase tracking-wider animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* PERSISTENT SIDEBAR SHEET CHATBOT */}
      <AdminChatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
        panelData={memoizedPanelData} 
        isDark={theme === 'dark'} 
      />

      {/* PROFILE/SETTINGS DIALOG MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={() => { stopCamera(); setIsProfileModalOpen(false); }}></div>
          <div className={`relative w-full max-w-md rounded-2xl p-6 border shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-800 border-slate-100">
              <div className="space-y-0.5">
                <h3 className="font-black text-base uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-black dark:text-white" />
                  <span>Configure Admin Profile</span>
                </h3>
                <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                  Manage login credentials, avatars, and security roles.
                </p>
              </div>
              <button 
                onClick={() => { stopCamera(); setIsProfileModalOpen(false); }} 
                className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 text-xs">
              
              {/* PHOTO UPLOAD & CAMERA SECTION */}
              <div className="flex flex-col items-center justify-center space-y-3 p-4 rounded-xl dark:bg-[#020617] bg-slate-50 border dark:border-gray-800 border-slate-100">
                <div className="relative">
                  {isCameraActive ? (
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-purple-600 bg-black shadow-inner flex items-center justify-center">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover scale-x-[-1]" 
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-purple-600/20 bg-purple-600 text-white flex items-center justify-center text-3xl font-black shadow-md">
                      {profilePhoto ? (
                        <img 
                          src={profilePhoto} 
                          alt="Admin Profile" 
                          className="w-full h-full object-cover rounded-full" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        profileName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase()
                      )}
                    </div>
                  )}

                  {/* Tiny camera indicator */}
                  {!isCameraActive && (
                    <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-600 text-white border-2 border-white dark:border-[#0f172a] shadow-md">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2 w-full">
                  {isCameraActive ? (
                    <div className="flex gap-2 w-full justify-center">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Snap Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 w-full justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 border transition-all cursor-pointer ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white hover:bg-gray-700' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-3xs'}`}
                      >
                        <Upload className="w-3.5 h-3.5 text-black dark:text-white" />
                        <span>Upload File</span>
                      </button>
                      <button
                        type="button"
                        onClick={startCamera}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 border transition-all cursor-pointer ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white hover:bg-gray-700' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-3xs'}`}
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Use Camera</span>
                      </button>
                      {profilePhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePhoto(null);
                            triggerToast('Profile photo removed.');
                          }}
                          className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center justify-center border hover:bg-rose-500/10 hover:text-rose-500 transition-colors cursor-pointer ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-slate-200 text-slate-500 shadow-3xs'}`}
                          title="Reset to Initials"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </div>
              </div>

              {/* INPUT FIELDS BLOCK */}
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="font-extrabold flex items-center gap-1.5 text-slate-700 dark:text-gray-300">
                    <UserCheck className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>Full Name</span>
                  </label>
                  <input 
                    type="text" 
                    value={profileName} 
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Enter admin name"
                    className={`w-full p-2.5 rounded-lg border outline-hidden font-bold transition-all ${theme === 'dark' ? 'bg-[#020617] border-slate-800 focus:border-purple-600 focus:bg-black' : 'bg-slate-50 border-slate-200 focus:border-purple-600 focus:bg-white'}`}
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="font-extrabold flex items-center gap-1.5 text-slate-700 dark:text-gray-300">
                    <Phone className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>Mobile Number</span>
                  </label>
                  <input 
                    type="tel" 
                    value={profileMobile} 
                    onChange={e => setProfileMobile(e.target.value)}
                    placeholder="Enter mobile number"
                    className={`w-full p-2.5 rounded-lg border outline-hidden font-bold transition-all ${theme === 'dark' ? 'bg-[#020617] border-slate-800 focus:border-purple-600 focus:bg-black' : 'bg-slate-50 border-slate-200 focus:border-purple-600 focus:bg-white'}`}
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1 relative">
                  <label className="font-extrabold flex items-center gap-1.5 text-slate-700 dark:text-gray-300">
                    <Mail className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>Email Address</span>
                  </label>
                  <input 
                    type="email" 
                    value={profileEmail} 
                    onChange={e => setProfileEmail(e.target.value)}
                    placeholder="Enter email address"
                    className={`w-full p-2.5 rounded-lg border outline-hidden font-bold transition-all ${theme === 'dark' ? 'bg-[#020617] border-slate-800 focus:border-purple-600 focus:bg-black' : 'bg-slate-50 border-slate-200 focus:border-purple-600 focus:bg-white'}`}
                  />
                </div>

                {/* Address */}
                <div className="space-y-1 relative">
                  <label className="font-extrabold flex items-center gap-1.5 text-slate-700 dark:text-gray-300">
                    <MapPin className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>Physical Address</span>
                    {isSearchingAddress && (
                      <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 ml-1"></span>
                    )}
                  </label>
                  <input 
                    type="text" 
                    value={profileAddress} 
                    onChange={e => handleAddressChange(e.target.value)}
                    placeholder="Search physical address (powered by Maps Search)"
                    className={`w-full p-2.5 rounded-lg border outline-hidden font-bold transition-all ${theme === 'dark' ? 'bg-[#020617] border-slate-800 focus:border-purple-600 focus:bg-black' : 'bg-slate-50 border-slate-200 focus:border-purple-600 focus:bg-white'}`}
                  />
                  
                  {/* Address suggestions autocomplete dropdown */}
                  {addressSuggestions.length > 0 && (
                    <div className={`absolute z-50 left-0 right-0 top-full mt-1 border rounded-lg shadow-xl overflow-hidden text-left ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                      {addressSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setProfileAddress(item.display_name);
                            setAddressSuggestions([]);
                          }}
                          className={`w-full text-left p-2.5 border-b last:border-0 text-[11px] leading-snug flex items-start gap-2 cursor-pointer transition-colors ${theme === 'dark' ? 'border-slate-800 hover:bg-gray-800' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-black dark:text-white shrink-0 mt-0.5" />
                          <span>{item.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Type Select */}
                <div className="space-y-1.5">
                  <label className="font-extrabold flex items-center gap-1.5 text-slate-700 dark:text-gray-300">
                    <Shield className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>Administrative Permission Level</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setProfileAdminType('Super Admin')}
                      className={`py-2 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer border ${profileAdminType === 'Super Admin' ? 'bg-purple-600 border-purple-600 text-white shadow-md' : (theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-gray-400 hover:bg-gray-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100')}`}
                    >
                      Super Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileAdminType('Admin')}
                      className={`py-2 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer border ${profileAdminType === 'Admin' ? 'bg-purple-600 border-purple-600 text-white shadow-md' : (theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-gray-400 hover:bg-gray-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100')}`}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileAdminType('Sub Admin')}
                      className={`py-2 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer border ${profileAdminType === 'Sub Admin' ? 'bg-purple-600 border-purple-600 text-white shadow-md' : (theme === 'dark' ? 'bg-gray-800/40 border-gray-700 text-gray-400 hover:bg-gray-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100')}`}
                    >
                      Sub Admin
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { stopCamera(); setIsProfileModalOpen(false); }}
                  className={`px-4 py-2.5 rounded-lg font-bold w-1/3 transition-colors cursor-pointer text-center ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsProfileModalOpen(false);
                    localStorage.setItem('bj_profileName', profileName);
                    localStorage.setItem('bj_profileMobile', profileMobile);
                    localStorage.setItem('bj_profileEmail', profileEmail);
                    localStorage.setItem('bj_profileAddress', profileAddress);
                    localStorage.setItem('bj_profileAdminType', profileAdminType);
                    if (profilePhoto) {
                      localStorage.setItem('bj_profilePhoto', profilePhoto);
                    } else {
                      localStorage.removeItem('bj_profilePhoto');
                    }
                    triggerToast('Profile configuration saved!');
                  }}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold w-2/3 shadow-md shadow-purple-600/10 transition-all hover:scale-[1.02] cursor-pointer text-center"
                >
                  Save Configuration
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
