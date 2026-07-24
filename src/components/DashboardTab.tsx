import { useState, useMemo, FormEvent } from 'react';
import { CustomSelect } from './CustomSelect';
import { 
  Users, 
  Laptop, 
  FileText, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Search, 
  Mail, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  X, 
  Download, 
  Info, 
  Plus, 
  Upload, 
  CheckCircle2,
  Sparkles,
  Percent,
  ChevronRight,
  Circle,
  DollarSign,
  TrendingUp,
  Globe,
  Share2,
  ShieldCheck,
  User,
  Database
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface DashboardTabProps {
  isDark: boolean;
  t: Record<string, string>;
}

export default function DashboardTab({ isDark, t }: DashboardTabProps) {
  // Main Tab selection: 'insights' | 'users' | 'products' | 'license' | 'revenue'
  const [activeMetric, setActiveMetric] = useState<'insights' | 'users' | 'products' | 'license' | 'revenue'>('insights');
  
  // Users sub-tab selection: 'users' | 'customers'
  const [usersSubTab, setUsersSubTab] = useState<'users' | 'customers'>('users');

  // Search and Filters
  const [searchText, setSearchText] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Revenue / Orders Filters
  const [orderStatus, setOrderStatus] = useState('All');
  const [orderPayment, setOrderPayment] = useState('All');
  const [orderPaymentStatus, setOrderPaymentStatus] = useState('All');
  const [showDeleted, setShowDeleted] = useState(false);

  // Date picker states for Trend Analysis (Point 6)
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-07-01');

  // Success Toast state
  const [toast, setToast] = useState<string | null>(null);

  // Live Audited backend logs (to satisfy Point 2 & 4: "user log to b captured in back end")
  const [backendLogs, setBackendLogs] = useState<string[]>([
    `[2026-07-01 09:12:00] BJ Core Engine connection established.`,
    `[2026-07-01 09:15:30] License validation agent listening on Port 3000.`
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setBackendLogs(prev => [`[${timestamp}] BACKEND_LOG: ${msg}`, ...prev]);
  };

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // State-driven Seed Data
  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Alfredo Bustinza', userType: 'God Access', email: 'abustinza@gasitup.com', mobile: '+1 (555) 019-2834', lastLogin: 'Jan 23, 2021 12:45 PM', isBlocked: false },
    { id: 2, name: 'David Grigsby', userType: 'Super Admin', email: 'kbates@gasitup.com', mobile: '+1 (555) 014-9821', lastLogin: 'Mar 13, 2021 02:30 PM', isBlocked: false },
    { id: 3, name: 'Anne Hathaway', userType: 'Sub Admin', email: 'dpgrigsby@gasitup.com', mobile: '+1 (555) 017-3812', lastLogin: 'Aug 10, 2021 09:15 AM', isBlocked: false },
    { id: 4, name: 'Donald Glover', userType: 'Sub Admin', email: 'hjg@gasitup.com', mobile: '+1 (555) 012-7744', lastLogin: 'Sep 13, 2021 11:20 AM', isBlocked: false },
    { id: 5, name: 'Elizabeth Olsen', userType: 'Sub Admin', email: 'wmota@gasitup.com', mobile: '+1 (555) 015-8832', lastLogin: 'Dec 16, 2021 04:55 PM', isBlocked: false },
    { id: 6, name: 'Angelina Jolie', userType: 'Super Admin', email: 'angelina@gasitup.com', mobile: '+1 (555) 011-2233', lastLogin: 'Dec 31, 2021 06:10 PM', isBlocked: true },
  ]);

  const [customersList, setCustomersList] = useState([
    { id: 1, name: 'Amal Clooney', category: 'Business', company: 'Clooney Corp', product: 'BJ Cloud Enterprise', email: 'AmalClooney@yopmail.com', mobile: '+1 (555) 012-3456', isActive: true, isBlocked: false },
    { id: 2, name: 'Angelina Jolie', category: 'Individual', company: 'Jolie Labs', product: 'BJ Secure Node core', email: 'AngelinaJolie@yopmail.com', mobile: '+1 (555) 012-7890', isActive: false, isBlocked: false },
    { id: 3, name: 'Anne Hathaway', category: 'Business', company: 'Hathaway Inc', product: 'BJ ZeroTrust Client', email: 'AnneHathaway@yopmail.com', mobile: '+1 (555) 012-4455', isActive: true, isBlocked: false },
    { id: 4, name: 'Donald Glover', category: 'Individual', company: 'Glover Studios', product: 'BJ Compliance Suite', email: 'DonaldGlover@yopmail.com', mobile: '+1 (555) 012-1122', isActive: false, isBlocked: false },
    { id: 5, name: 'Elizabeth Olsen', category: 'Business', company: 'Olsen Media', product: 'BJ Perimeter Guard', email: 'ElizabethOlsen@yopmail.com', mobile: '+1 (555) 012-8899', isActive: true, isBlocked: false },
    { id: 6, name: 'Idina Menzel', category: 'Individual', company: 'Broadway Prod', product: 'BJ Cloud Enterprise', email: 'IdinaMenzel@gmail.com', mobile: '+1 (555) 012-3344', isActive: true, isBlocked: false },
    { id: 7, name: 'Jack Thompson', category: 'Business', company: 'Thompson Ltd', product: 'BJ Secure Node core', email: 'jack2@yopmail.com', mobile: '+1 (555) 012-5566', isActive: true, isBlocked: false },
  ]);

  const [productsList, setProductsList] = useState([
    { id: 1, product: 'BJ Cloud Enterprise', license: 'LIC-88201-BJ', dateOfAllocation: '2025-01-10', validUpTo: '2026-01-10' },
    { id: 2, product: 'BJ Secure Node core', license: 'LIC-99104-ND', dateOfAllocation: '2025-02-15', validUpTo: '2026-02-15' },
    { id: 3, product: 'BJ ZeroTrust Client', license: 'LIC-44281-ZT', dateOfAllocation: '2024-11-01', validUpTo: '2025-11-01' },
    { id: 4, product: 'BJ Compliance Suite', license: 'LIC-77302-CS', dateOfAllocation: '2025-03-20', validUpTo: '2026-03-20' },
    { id: 5, product: 'BJ Perimeter Guard', license: 'LIC-11559-PG', dateOfAllocation: '2025-05-12', validUpTo: '2026-05-12' },
  ]);

  const [licensesList, setLicensesList] = useState([
    { id: 1, product: 'BJ Cloud Enterprise', license: 'LIC-88201-BJ', dateOfAllocation: '2025-01-10', validUpTo: '2026-01-10', renewalDate: '2026-01-15', isActive: true, isBlocked: false, email: 'AmalClooney@yopmail.com' },
    { id: 2, product: 'BJ Secure Node core', license: 'LIC-99104-ND', dateOfAllocation: '2025-02-15', validUpTo: '2026-02-15', renewalDate: '2026-02-20', isActive: true, isBlocked: false, email: 'AngelinaJolie@yopmail.com' },
    { id: 3, product: 'BJ ZeroTrust Client', license: 'LIC-44281-ZT', dateOfAllocation: '2024-11-01', validUpTo: '2025-11-01', renewalDate: '2025-11-05', isActive: false, isBlocked: false, email: 'AnneHathaway@yopmail.com' },
    { id: 4, product: 'BJ Compliance Suite', license: 'LIC-77302-CS', dateOfAllocation: '2025-03-20', validUpTo: '2026-03-20', renewalDate: '2026-03-25', isActive: true, isBlocked: false, email: 'DonaldGlover@yopmail.com' },
    { id: 5, product: 'BJ Perimeter Guard', license: 'LIC-11559-PG', dateOfAllocation: '2025-05-12', validUpTo: '2026-05-12', renewalDate: '2026-05-17', isActive: false, isBlocked: false, email: 'ElizabethOlsen@yopmail.com' },
  ]);

  const [ordersList, setOrdersList] = useState([
    { id: 1, user: 'Amal Clooney', email: 'AmalClooney@yopmail.com', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=60', driver: 'Alex Carter', driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=60', orderNo: 'GIU606170', orderDate: '2026-06-05', orderTime: '09:00 PM', orderType: 'Active', amount: 218.25, reason: 'Was not able to locate exact gate code.', street: '3860 El Camino Real', status: 'Completed', paymentMethod: 'Credit Card', paymentStatus: 'Paid', isDeleted: false },
    { id: 2, user: 'Angelina Jolie', email: 'AngelinaJolie@yopmail.com', userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&q=60', driver: 'John Doe', driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=60', orderNo: 'GIU606171', orderDate: '2026-06-12', orderTime: '03:00 PM', orderType: 'Inactive', amount: 21.09, reason: 'N/A', street: '3860 El Camino Real', status: 'Completed', paymentMethod: 'PayPal', paymentStatus: 'Paid', isDeleted: false },
    { id: 3, user: 'Anne Hathaway', email: 'AnneHathaway@yopmail.com', userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&fit=crop&q=60', driver: 'Jane Smith', driverAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=60', orderNo: 'GIU606172', orderDate: '2026-06-20', orderTime: '09:00 AM', orderType: 'Active', amount: 45.62, reason: 'Customer requested front door delivery.', street: '3860 El Camino Real', status: 'Completed', paymentMethod: 'Credit Card', paymentStatus: 'Paid', isDeleted: false },
    { id: 4, user: 'Donald Glover', email: 'DonaldGlover@yopmail.com', userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&fit=crop&q=60', driver: 'Alex Carter', driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=60', orderNo: 'GIU606173', orderDate: '2026-06-25', orderTime: '10:15 AM', orderType: 'Inactive', amount: 88.50, reason: 'N/A', street: '123 Stanford Ave', status: 'Pending', paymentMethod: 'Wire Transfer', paymentStatus: 'Pending', isDeleted: false },
    { id: 5, user: 'Elizabeth Olsen', email: 'ElizabethOlsen@yopmail.com', userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&fit=crop&q=60', driver: 'John Doe', driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=60', orderNo: 'GIU606174', orderDate: '2026-06-28', orderTime: '04:30 PM', orderType: 'Active', amount: 154.20, reason: 'N/A', street: '456 University Ave', status: 'Cancelled', paymentMethod: 'Credit Card', paymentStatus: 'Failed', isDeleted: true },
  ]);

  // Modal interaction states
  const [activeModal, setActiveModal] = useState<'block' | 'delete' | 'email' | 'edit' | null>(null);
  const [modalTargetType, setModalTargetType] = useState<'user' | 'customer' | 'license' | null>(null);
  const [modalTargetId, setModalTargetId] = useState<number | null>(null);
  
  // Specific object refs for modals
  const [editingObj, setEditingObj] = useState<any>(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailFile, setEmailFile] = useState<string | null>(null);

  // Close modals helper
  const closeModal = () => {
    setActiveModal(null);
    setModalTargetType(null);
    setModalTargetId(null);
    setEditingObj(null);
  };

  // Open Block Dialog
  const triggerBlockModal = (type: 'user' | 'customer' | 'license', id: number) => {
    setModalTargetType(type);
    setModalTargetId(id);
    setActiveModal('block');
  };

  // Confirm Block Action
  const confirmBlock = () => {
    if (!modalTargetType || modalTargetId === null) return;
    
    if (modalTargetType === 'user') {
      setUsersList(prev => prev.map(u => u.id === modalTargetId ? { ...u, isBlocked: !u.isBlocked } : u));
      const target = usersList.find(u => u.id === modalTargetId);
      addLog(`Toggled Block Status on User '${target?.name}' (${target?.email})`);
      triggerToast(`User '${target?.name}' block status updated.`);
    } else if (modalTargetType === 'customer') {
      setCustomersList(prev => prev.map(c => c.id === modalTargetId ? { ...c, isBlocked: !c.isBlocked } : c));
      const target = customersList.find(c => c.id === modalTargetId);
      addLog(`Toggled Block Status on Customer '${target?.name}' (${target?.email})`);
      triggerToast(`Customer '${target?.name}' block status updated.`);
    } else if (modalTargetType === 'license') {
      setLicensesList(prev => prev.map(l => l.id === modalTargetId ? { ...l, isBlocked: !l.isBlocked } : l));
      const target = licensesList.find(l => l.id === modalTargetId);
      addLog(`Toggled Block Status on License SKU '${target?.license}'`);
      triggerToast(`License '${target?.license}' status updated.`);
    }
    closeModal();
  };

  // Open Delete Dialog
  const triggerDeleteModal = (type: 'user' | 'customer' | 'license', id: number) => {
    setModalTargetType(type);
    setModalTargetId(id);
    setActiveModal('delete');
  };

  // Confirm Delete Action (captured in back-end user log)
  const confirmDelete = () => {
    if (!modalTargetType || modalTargetId === null) return;

    if (modalTargetType === 'user') {
      const target = usersList.find(u => u.id === modalTargetId);
      setUsersList(prev => prev.filter(u => u.id !== modalTargetId));
      addLog(`Deleted User '${target?.name}' (${target?.email}) successfully. Account records purged.`);
      triggerToast(`User '${target?.name}' deleted.`);
    } else if (modalTargetType === 'customer') {
      const target = customersList.find(c => c.id === modalTargetId);
      setCustomersList(prev => prev.filter(c => c.id !== modalTargetId));
      addLog(`Do you want to delete the customer? -> YES. Captured Action: Customer '${target?.name}' (${target?.email}) was fully deleted from database by Admin.`);
      triggerToast(`Customer '${target?.name}' deleted.`);
    } else if (modalTargetType === 'license') {
      const target = licensesList.find(l => l.id === modalTargetId);
      setLicensesList(prev => prev.filter(l => l.id !== modalTargetId));
      addLog(`Do you want to delete the customer? -> YES. Captured Action: License and allocation for product '${target?.product}' (${target?.license}) deleted from records.`);
      triggerToast(`License '${target?.license}' deleted.`);
    }
    closeModal();
  };

  // Open Email dialog with captured primary email (Point 2 & 4)
  const triggerEmailModal = (email: string) => {
    setEmailTo(email);
    setEmailSubject('Important Security Notification regarding your BJ Account');
    setEmailMessage('Hello,\n\nPlease find attached the allocation details and license agreement for your BJ platform services. Let us know if you have any questions.\n\nBest Regards,\nEnterprise Admin Team');
    setEmailFile(null);
    setActiveModal('email');
  };

  // Confirm Email Send
  const handleSendEmail = (e: FormEvent) => {
    e.preventDefault();
    addLog(`Sent Direct Email to '${emailTo}' | Subject: "${emailSubject}" | Attached: ${emailFile ? emailFile : 'None'}`);
    triggerToast(`Email sent successfully to ${emailTo}!`);
    closeModal();
  };

  // Open Edit dialog
  const triggerEditModal = (type: 'user' | 'customer' | 'license', obj: any) => {
    setModalTargetType(type);
    setModalTargetId(obj.id);
    setEditingObj({ ...obj });
    setActiveModal('edit');
  };

  // Save Edit Action
  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!modalTargetType || !editingObj) return;

    if (modalTargetType === 'user') {
      setUsersList(prev => prev.map(u => u.id === editingObj.id ? editingObj : u));
      addLog(`Edited User details for '${editingObj.name}' (${editingObj.email})`);
      triggerToast(`User '${editingObj.name}' details saved.`);
    } else if (modalTargetType === 'customer') {
      setCustomersList(prev => prev.map(c => c.id === editingObj.id ? editingObj : c));
      addLog(`Edited Customer details for '${editingObj.name}' (${editingObj.email})`);
      triggerToast(`Customer '${editingObj.name}' details saved.`);
    } else if (modalTargetType === 'license') {
      setLicensesList(prev => prev.map(l => l.id === editingObj.id ? editingObj : l));
      addLog(`Edited License Details for License '${editingObj.license}'`);
      triggerToast(`License details saved.`);
    }
    closeModal();
  };

  // Dynamic calculations for Users Trend Analysis based on picker dates (Point 6)
  const chartData = useMemo(() => {
    // We create realistic variation based on the chosen dates
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const diffTime = Math.abs(endObj.getTime() - startObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 30;
    
    // Generate up to 10 nice data points
    const pointsCount = Math.min(Math.max(diffDays, 5), 10);
    const data = [];
    
    for (let i = 0; i < pointsCount; i++) {
      const d = new Date(startObj.getTime() + (diffTime / (pointsCount - 1)) * i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Calculate realistic user baseline values that scale with time delta
      const multiplier = 1 + (i * 0.05);
      const currentVal = Math.round(12400 * multiplier + Math.sin(i) * 1200);
      const previousVal = Math.round(10800 * multiplier + Math.cos(i) * 900);
      
      data.push({
        name: dateStr,
        Current: currentVal,
        Previous: previousVal
      });
    }
    return data;
  }, [startDate, endDate]);

  // Aggregate stats
  const totalUsersCount = useMemo(() => usersList.length + customersList.length * 4, [usersList, customersList]);
  const activeProductsCount = useMemo(() => productsList.length, [productsList]);
  const activeLicensesCount = useMemo(() => licensesList.filter(l => l.isActive).length, [licensesList]);
  const totalRevenueSum = useMemo(() => {
    return ordersList
      .filter(o => !o.isDeleted)
      .reduce((sum, o) => sum + o.amount, 0)
      .toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }, [ordersList]);

  // Filter lists based on Search & Select state
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchText.toLowerCase());
      const matchType = userTypeFilter === 'All' || u.userType === userTypeFilter;
      return matchSearch && matchType;
    });
  }, [usersList, searchText, userTypeFilter]);

  const filteredCustomers = useMemo(() => {
    return customersList.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          c.company.toLowerCase().includes(searchText.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchText.toLowerCase()) ||
                          c.product.toLowerCase().includes(searchText.toLowerCase());
      const matchCat = categoryFilter === 'All' || c.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [customersList, searchText, categoryFilter]);

  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      return p.product.toLowerCase().includes(searchText.toLowerCase()) ||
             p.license.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [productsList, searchText]);

  const filteredLicenses = useMemo(() => {
    return licensesList.filter(l => {
      return l.product.toLowerCase().includes(searchText.toLowerCase()) ||
             l.license.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [licensesList, searchText]);

  const filteredOrders = useMemo(() => {
    return ordersList.filter(o => {
      const matchSearch = o.user.toLowerCase().includes(searchText.toLowerCase()) ||
                          o.orderNo.toLowerCase().includes(searchText.toLowerCase()) ||
                          o.driver.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = orderStatus === 'All' || o.orderType === orderStatus;
      const matchPayment = orderPayment === 'All' || o.paymentMethod === orderPayment;
      
      let matchPaymentStatus = true;
      if (orderPaymentStatus !== 'All') {
        if (orderPaymentStatus === 'Success') {
          matchPaymentStatus = o.paymentStatus === 'Paid' || o.paymentStatus === 'Success';
        } else if (orderPaymentStatus === 'Failed') {
          matchPaymentStatus = o.paymentStatus === 'Failed';
        } else if (orderPaymentStatus === 'In Progress') {
          matchPaymentStatus = o.paymentStatus === 'Pending' || o.paymentStatus === 'In Progress';
        }
      }

      const matchDeleted = showDeleted ? true : !o.isDeleted;
      
      // Filter by custom Date Range
      const orderD = new Date(o.orderDate);
      const startD = new Date(startDate);
      const endD = new Date(endDate);
      const matchDate = orderD >= startD && orderD <= endD;

      return matchSearch && matchStatus && matchPayment && matchPaymentStatus && matchDeleted && matchDate;
    });
  }, [ordersList, searchText, orderStatus, orderPayment, orderPaymentStatus, showDeleted, startDate, endDate]);

  return (
    <div className="space-y-6">
      
      {/* TOAST FEEDBACK */}
      {toast && (
        <div id="toast-message" className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-[rgb(14,145,145)] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-[rgb(14,145,145)]">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation for Executive vs System Database */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800/40 pb-4">
        <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border w-fit ${isDark ? 'bg-[#13161C] border-[#2D333D]' : 'bg-[#f1f5f9] border-[#e2e8f0]'}`}>
          <button 
            onClick={() => setActiveMetric('insights')}
            className={`flex items-center gap-2.5 py-2 px-5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeMetric === 'insights' 
                ? (isDark ? 'bg-[rgb(14,145,145)] text-white shadow-xs' : 'bg-white text-[rgb(14,145,145)] shadow-xs border border-slate-200/40') 
                : (isDark ? 'text-gray-400 hover:text-white' : 'text-[#475569] hover:text-slate-900')
            }`}
          >
            <TrendingUp className={`w-4 h-4 shrink-0 transition-colors ${activeMetric === 'insights' ? (isDark ? 'text-white' : 'text-[rgb(14,145,145)]') : 'text-slate-400 dark:text-gray-500'}`} />
            <span>Executive Insights</span>
          </button>
          <button 
            onClick={() => setActiveMetric('users')}
            className={`flex items-center gap-2.5 py-2 px-5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeMetric !== 'insights' 
                ? (isDark ? 'bg-[rgb(14,145,145)] text-white shadow-xs' : 'bg-white text-[rgb(14,145,145)] shadow-xs border border-slate-200/40') 
                : (isDark ? 'text-gray-400 hover:text-white' : 'text-[#475569] hover:text-slate-900')
            }`}
          >
            <Database className={`w-4 h-4 shrink-0 transition-colors ${activeMetric !== 'insights' ? (isDark ? 'text-white' : 'text-[rgb(14,145,145)]') : 'text-slate-400 dark:text-gray-500'}`} />
            <span>System Database Records</span>
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-gray-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Cloud Sync Active</span>
        </div>
      </div>

      {activeMetric === 'insights' ? (
        <div className="space-y-6">
          {/* GREETING HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#13161C] p-5 rounded-2xl border border-slate-100 dark:border-[#1E2330]">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Hey, Angelina</h2>
              <p className="text-xs text-slate-400 dark:text-gray-500 font-medium mt-0.5">Here's your business analytics summary for today.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-gray-800/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-gray-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Comparison:</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-gray-600 peer-checked:bg-[rgb(14,145,145)]"></div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-gray-800/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-gray-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Time Range: This Month</span>
              </div>
            </div>
          </div>

          {/* 4 EXECUTIVE CARDS FROM SCREENSHOT */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Conversion Rate */}
            <div className="bg-white dark:bg-[#13161C] p-5 rounded-2xl border border-slate-100 dark:border-[#1E2330] hover:shadow-xs transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Conversion Rate</span>
                <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-gray-800/40 flex items-center justify-center border border-slate-100 dark:border-gray-800">
                  <Percent className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">15.89%</h3>
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  <span className="text-emerald-500 font-bold flex items-center bg-emerald-500/10 px-1 rounded">
                    <ArrowUpRight className="w-3 h-3" /> +8.5%
                  </span>
                  <span className="text-slate-400 dark:text-gray-500">vs last period</span>
                </div>
              </div>
            </div>

            {/* Card 2: Acquisition Cost */}
            <div className="bg-white dark:bg-[#13161C] p-5 rounded-2xl border border-slate-100 dark:border-[#1E2330] hover:shadow-xs transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Acquisition Cost</span>
                <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-gray-800/40 flex items-center justify-center border border-slate-100 dark:border-gray-800">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">$58</h3>
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  <span className="text-rose-500 font-bold flex items-center bg-rose-500/10 px-1 rounded">
                    <ArrowDownRight className="w-3 h-3" /> -12.3%
                  </span>
                  <span className="text-slate-400 dark:text-gray-500">vs last period</span>
                </div>
              </div>
            </div>

            {/* Card 3: Average Revenue */}
            <div className="bg-white dark:bg-[#13161C] p-5 rounded-2xl border border-slate-100 dark:border-[#1E2330] hover:shadow-xs transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Average Revenue</span>
                <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-gray-800/40 flex items-center justify-center border border-slate-100 dark:border-gray-800">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">$4,175</h3>
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  <span className="text-rose-500 font-bold flex items-center bg-rose-500/10 px-1 rounded">
                    <ArrowDownRight className="w-3 h-3" /> -3.2%
                  </span>
                  <span className="text-slate-400 dark:text-gray-500">vs last period</span>
                </div>
              </div>
            </div>

            {/* Card 4: Expense Total */}
            <div className="bg-white dark:bg-[#13161C] p-5 rounded-2xl border border-slate-100 dark:border-[#1E2330] hover:shadow-xs transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Expense Total</span>
                <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-gray-800/40 flex items-center justify-center border border-slate-100 dark:border-gray-800">
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">$24,500</h3>
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  <span className="text-emerald-500 font-bold flex items-center bg-emerald-500/10 px-1 rounded">
                    <ArrowUpRight className="w-3 h-3" /> +5.8%
                  </span>
                  <span className="text-slate-400 dark:text-gray-500">vs last period</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CHARTS GRID ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* REVENUE & ORDERS DUAL LINE CHART */}
            <div className="lg:col-span-2 bg-white dark:bg-[#13161C] p-6 rounded-2xl border border-slate-100 dark:border-[#1E2330] flex flex-col md:flex-row gap-6">
              {/* Left Statistics Panel inside card */}
              <div className="md:w-56 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 dark:border-gray-800 pb-4 md:pb-0 md:pr-6 shrink-0">
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
                    <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">$129,440</h4>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded inline-flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" /> +47.6%
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
                    <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">1,812</h4>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded inline-flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" /> +47.0%
                    </span>
                  </div>
                </div>
                
                <div className="text-[11px] text-slate-400 dark:text-gray-500 pt-4 md:pt-0 font-medium">
                  Reporting period covers July 1 to July 31 dynamic transaction streams.
                </div>
              </div>

              {/* Chart Plot on Right */}
              <div className="flex-1 h-72">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Revenue & Orders Trend</span>
                  <div className="flex items-center gap-3 text-[10px] font-bold">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[rgb(14,145,145)]"></span>Revenue</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>Orders</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={[
                    { date: 'Jul 01', Revenue: 3000, Orders: 120 },
                    { date: 'Jul 05', Revenue: 4500, Orders: 180 },
                    { date: 'Jul 10', Revenue: 3800, Orders: 140 },
                    { date: 'Jul 15', Revenue: 5100, Orders: 210 },
                    { date: 'Jul 20', Revenue: 4800, Orders: 190 },
                    { date: 'Jul 25', Revenue: 6200, Orders: 250 },
                    { date: 'Jul 31', Revenue: 5800, Orders: 230 },
                  ]}>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={false}
                      contentStyle={{ 
                        borderRadius: 8, 
                        fontSize: 11,
                        backgroundColor: isDark ? '#1A1D23' : '#FFFFFF',
                        borderColor: isDark ? '#2D333D' : '#E2E8F0',
                        color: isDark ? '#FFFFFF' : '#0F172A'
                      }}
                      itemStyle={{
                        color: isDark ? '#F3F4F6' : '#1F2937'
                      }}
                      labelStyle={{
                        color: isDark ? '#9CA3AF' : '#4B5563'
                      }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="Orders" stroke="#818CF8" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TOP SELLING CATEGORIES DONUT */}
            <div className="bg-white dark:bg-[#13161C] p-6 rounded-2xl border border-slate-100 dark:border-[#1E2330] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Top Selling Categories</h4>
                  <button className="p-1 rounded-md hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-400">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Donut Container with Center Label */}
                <div className="relative h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Watches', value: 1225 },
                          { name: 'Clothing', value: 965 },
                          { name: 'Gadgets', value: 830 },
                          { name: 'Others', value: 532 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="#2563EB" />
                        <Cell fill="#06B6D4" />
                        <Cell fill="#10B981" />
                        <Cell fill="#8B5CF6" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center leading-none text-center">
                    <span className="text-2xl font-black text-slate-950 dark:text-white">3,552</span>
                    <span className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold uppercase mt-1">Total items</span>
                  </div>
                </div>
              </div>

              {/* Legend List matching Screenshot shares */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-gray-800/45 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[rgb(14,145,145)] shrink-0"></span>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate leading-none">Watches</p>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">1,225 (34.5%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0"></span>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate leading-none">Clothing</p>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">965 (27.1%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate leading-none">Gadgets</p>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">830 (23.3%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate leading-none">Others</p>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">532 (15.1%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* SECOND CHARTS GRID ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* AVERAGE ORDER VALUE BAR CHART */}
            <div className="bg-white dark:bg-[#13161C] p-6 rounded-2xl border border-slate-100 dark:border-[#1E2330]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Order Value</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">$1,000</span>
                    <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" /> +142.9%
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold bg-slate-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-gray-800">
                  Avg. 2.4 items/txn
                </span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { date: 'Jul 01', Value: 420 },
                    { date: 'Jul 05', Value: 580 },
                    { date: 'Jul 10', Value: 510 },
                    { date: 'Jul 15', Value: 690 },
                    { date: 'Jul 20', Value: 620 },
                    { date: 'Jul 25', Value: 850 },
                    { date: 'Jul 31', Value: 780 },
                  ]}>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={false}
                      contentStyle={{ 
                        borderRadius: 8, 
                        fontSize: 11,
                        backgroundColor: isDark ? '#1A1D23' : '#FFFFFF',
                        borderColor: isDark ? '#2D333D' : '#E2E8F0',
                        color: isDark ? '#FFFFFF' : '#0F172A'
                      }}
                      itemStyle={{
                        color: isDark ? '#F3F4F6' : '#1F2937'
                      }}
                      labelStyle={{
                        color: isDark ? '#9CA3AF' : '#4B5563'
                      }}
                    />
                    <Bar dataKey="Value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CUSTOMER SEGMENTATION DUAL LINE CHART */}
            <div className="bg-white dark:bg-[#13161C] p-6 rounded-2xl border border-slate-100 dark:border-[#1E2330]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Segmentation</h4>
                  <div className="flex items-center gap-4 mt-1 text-xs">
                    <span className="text-slate-800 dark:text-slate-200 font-extrabold flex items-center gap-1">
                      New: <span className="text-cyan-500">1,920</span> (+15.2%)
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-extrabold flex items-center gap-1">
                      Returning: <span className="text-pink-500">1,818</span> (-5.3%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span>New</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500"></span>Returning</span>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { date: 'Jul 01', New: 150, Returning: 130 },
                    { date: 'Jul 05', New: 220, Returning: 160 },
                    { date: 'Jul 10', New: 190, Returning: 180 },
                    { date: 'Jul 15', New: 280, Returning: 210 },
                    { date: 'Jul 20', New: 240, Returning: 230 },
                    { date: 'Jul 25', New: 350, Returning: 290 },
                    { date: 'Jul 31', New: 310, Returning: 270 },
                  ]}>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={false}
                      contentStyle={{ 
                        borderRadius: 8, 
                        fontSize: 11,
                        backgroundColor: isDark ? '#1A1D23' : '#FFFFFF',
                        borderColor: isDark ? '#2D333D' : '#E2E8F0',
                        color: isDark ? '#FFFFFF' : '#0F172A'
                      }}
                      itemStyle={{
                        color: isDark ? '#F3F4F6' : '#1F2937'
                      }}
                      labelStyle={{
                        color: isDark ? '#9CA3AF' : '#4B5563'
                      }}
                    />
                    <Line type="monotone" dataKey="New" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Returning" stroke="#F43F5E" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* THIRD ROW: TRAFFIC ANALYSIS & CAMPAIGNS REMOVED */}

        </div>
      ) : (
        <>
          {/* 4 INTERACTIVE METRIC CARDS / REPLACES EXISTING ONE (Point 1) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Users */}
        <div 
          id="tab-users-card"
          onClick={() => { setActiveMetric('users'); setSearchText(''); }}
          className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-102 group relative overflow-hidden ${
            activeMetric === 'users' 
              ? 'bg-[rgb(14,145,145)]/10 border-[rgb(14,145,145)] ring-2 ring-[rgb(14,145,145)]/30' 
              : (isDark ? 'bg-[#1A1D23] border-[#2D333D] hover:border-[rgb(14,145,145)]/50' : 'bg-white border-slate-200 hover:border-[rgb(14,145,145)] shadow-2xs')
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Users Console
            </span>
            <div className={`p-1.5 rounded-md transition-colors duration-300 ${
              isDark 
                ? 'bg-[rgb(14,145,145)]/20 text-[rgb(14,145,145)] group-hover:bg-[rgb(14,145,145)] group-hover:text-white' 
                : 'bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] group-hover:bg-[rgb(14,145,145)] group-hover:text-white'
            }`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalUsersCount} Registered
            </h3>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[rgb(14,145,145)] font-extrabold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>active this cycle</span>
            </div>
          </div>
        </div>

        {/* Card 2: Products */}
        <div 
          id="tab-products-card"
          onClick={() => { setActiveMetric('products'); setSearchText(''); }}
          className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-102 group relative overflow-hidden ${
            activeMetric === 'products' 
              ? 'bg-slate-100 dark:bg-slate-800/50 border-[rgb(14,145,145)] ring-2 ring-[rgb(14,145,145)]/30' 
              : (isDark ? 'bg-[#1A1D23] border-[#2D333D] hover:border-[rgb(14,145,145)]/50' : 'bg-white border-slate-200 hover:border-[rgb(14,145,145)] shadow-2xs')
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Products Portfolio
            </span>
            <div className={`p-1.5 rounded-md transition-colors duration-300 ${
              isDark 
                ? 'bg-slate-900/40 text-slate-800 dark:text-slate-200 group-hover:bg-slate-50 dark:bg-slate-900/300 group-hover:text-white' 
                : 'bg-slate-100 dark:bg-slate-800/50 text-black group-hover:bg-[rgb(14,145,145)] group-hover:text-white'
            }`}>
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeProductsCount} Configured
            </h3>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-emerald-500 font-extrabold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +8.3%
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>vs last quarter</span>
            </div>
          </div>
        </div>

        {/* Card 3: License */}
        <div 
          id="tab-license-card"
          onClick={() => { setActiveMetric('license'); setSearchText(''); }}
          className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-102 group relative overflow-hidden ${
            activeMetric === 'license' 
              ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/30' 
              : (isDark ? 'bg-[#1A1D23] border-[#2D333D] hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500 shadow-2xs')
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Platform Licenses
            </span>
            <div className={`p-1.5 rounded-md transition-colors duration-300 ${
              isDark 
                ? 'bg-indigo-950/40 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white' 
                : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeLicensesCount} Active License
            </h3>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-emerald-500 font-extrabold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +15.1%
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>renewals up-to-date</span>
            </div>
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div 
          id="tab-revenue-card"
          onClick={() => { setActiveMetric('revenue'); setSearchText(''); }}
          className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-102 group relative overflow-hidden ${
            activeMetric === 'revenue' 
              ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30' 
              : (isDark ? 'bg-[#1A1D23] border-[#2D333D] hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500 shadow-2xs')
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Direct Revenue
            </span>
            <div className={`p-1.5 rounded-md transition-colors duration-300 ${
              isDark 
                ? 'bg-emerald-950/40 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white' 
                : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalRevenueSum} Total
            </h3>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-emerald-500 font-extrabold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>monthly audit trail</span>
            </div>
          </div>
        </div>

      </div>

      {/* CORE VIEW RENDERED BASED ON SELECTED METRIC TAB */}
      
      {/* 1. USERS METRIC TAB CONTENT (Point 2) */}
      {activeMetric === 'users' && (
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b dark:border-gray-800 border-slate-100 pb-4 mb-5">
            {/* 2 Tabs: Admin Users and Customer Users */}
            <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border w-fit ${isDark ? 'bg-[#13161C] border-[#2D333D]' : 'bg-[#f1f5f9] border-[#e2e8f0]'}`}>
              <button 
                id="subtab-users"
                onClick={() => { setUsersSubTab('users'); setSearchText(''); }}
                className={`flex items-center gap-2.5 py-2 px-5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  usersSubTab === 'users' 
                    ? (isDark ? 'bg-[rgb(14,145,145)] text-white shadow-xs' : 'bg-white text-[rgb(14,145,145)] shadow-xs border border-slate-200/40') 
                    : (isDark ? 'text-gray-400 hover:text-white' : 'text-[#475569] hover:text-slate-900')
                }`}
              >
                <ShieldCheck className={`w-4 h-4 shrink-0 transition-colors ${usersSubTab === 'users' ? (isDark ? 'text-white' : 'text-[rgb(14,145,145)]') : 'text-slate-400 dark:text-gray-500'}`} />
                <span>Admin Users</span>
              </button>
              <button 
                id="subtab-customers"
                onClick={() => { setUsersSubTab('customers'); setSearchText(''); }}
                className={`flex items-center gap-2.5 py-2 px-5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  usersSubTab === 'customers' 
                    ? (isDark ? 'bg-[rgb(14,145,145)] text-white shadow-xs' : 'bg-white text-[rgb(14,145,145)] shadow-xs border border-slate-200/40') 
                    : (isDark ? 'text-gray-400 hover:text-white' : 'text-[#475569] hover:text-slate-900')
                }`}
              >
                <User className={`w-4 h-4 shrink-0 transition-colors ${usersSubTab === 'customers' ? (isDark ? 'text-white' : 'text-[rgb(14,145,145)]') : 'text-slate-400 dark:text-gray-500'}`} />
                <span>Customer Users</span>
              </button>
            </div>

            {/* Right filter panel */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Search input with purple accent */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(14,145,145)]" />
                <input 
                  type="text" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search here..."
                  className={`pl-9 pr-4 py-2 text-xs rounded-xl border w-56 focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30 focus:border-[rgb(14,145,145)] ${isDark ? 'bg-[#13161C] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>

              {/* Status/Type Selector Dropdown */}
              {usersSubTab === 'users' ? (
                <CustomSelect
                  value={userTypeFilter}
                  onChange={(val) => setUserTypeFilter(val)}
                  options={[
                    { value: 'All', label: 'All Types' },
                    { value: 'God Access', label: 'God Access' },
                    { value: 'Super Admin', label: 'Super Admin' },
                    { value: 'Sub Admin', label: 'Sub Admin' }
                  ]}
                  className="w-40"
                  isDark={isDark}
                />
              ) : (
                <CustomSelect
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val)}
                  options={[
                    { value: 'All', label: 'All Categories' },
                    { value: 'Business', label: 'Business' },
                    { value: 'Individual', label: 'Individual' }
                  ]}
                  className="w-40"
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          {/* Sub Tab: Users table */}
          {usersSubTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b border-slate-100 dark:border-gray-800 ${isDark ? 'text-gray-300' : 'text-slate-500'}`}>
                    <th className="py-3 px-4 font-extrabold uppercase">S/no</th>
                    <th className="py-3 px-4 font-extrabold uppercase">Name</th>
                    <th className="py-3 px-4 font-extrabold uppercase">User Type</th>
                    <th className="py-3 px-4 font-extrabold uppercase">email</th>
                    <th className="py-3 px-4 font-extrabold uppercase">mobile</th>
                    <th className="py-3 px-4 font-extrabold uppercase">Last Login</th>
                    <th className="py-3 px-4 font-extrabold uppercase text-center">Status</th>
                    <th className="py-3 px-4 font-extrabold uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400 font-mono">No matching Users found.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((item, index) => (
                      <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-gray-800/40' : 'hover:bg-slate-50/50'}`}>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                            isDark 
                              ? 'bg-slate-800 text-teal-400 border border-slate-700/60' 
                              : 'bg-slate-100 text-[rgb(14,145,145)] border border-slate-200'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</td>
                        <td className={`py-3.5 px-4 font-mono font-medium ${isDark ? 'text-[rgb(14,145,145)]' : 'text-[rgb(10,115,115)]'}`}>{item.userType}</td>
                        <td className={`py-3.5 px-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.email}</td>
                        <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.mobile}</td>
                        <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.lastLogin}</td>
                        <td className="py-3.5 px-4 text-center">
                          {item.isBlocked ? (
                            <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>Blocked</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Active</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => triggerEditModal('user', item)}
                              className={`p-1 rounded transition-colors cursor-pointer ${isDark ? 'bg-transparent text-[rgb(14,145,145)] hover:bg-[rgb(14,145,145)]/15' : 'bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] hover:bg-[rgb(14,145,145)]/20'}`}
                              title="Edit Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => triggerBlockModal('user', item.id)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isDark 
                                  ? (item.isBlocked ? 'bg-transparent text-emerald-400 hover:bg-emerald-500/15' : 'bg-transparent text-amber-400 hover:bg-amber-500/15') 
                                  : (item.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100')
                              }`}
                              title={item.isBlocked ? "Unblock user" : "Block user"}
                            >
                              {item.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                            <button 
                              onClick={() => triggerDeleteModal('user', item.id)}
                              className={`p-1 rounded transition-colors cursor-pointer ${isDark ? 'bg-transparent text-rose-400 hover:bg-rose-500/15' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => triggerEmailModal(item.email)}
                              className={`p-1 rounded transition-colors cursor-pointer ${isDark ? 'bg-transparent text-[rgb(14,145,145)] hover:bg-[rgb(14,145,145)]/15' : 'bg-[rgb(14,145,145)]/10 text-[rgb(10,115,115)] hover:bg-[rgb(14,145,145)]/20'}`}
                              title="Send direct email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Sub Tab: Customers table (Point 2) */}
          {usersSubTab === 'customers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b border-slate-100 dark:border-gray-800 ${isDark ? 'text-gray-300' : 'text-slate-500'}`}>
                    <th className="py-3 px-4 font-extrabold uppercase">S/no</th>
                    <th className="py-3 px-4 font-extrabold uppercase">Name</th>
                    <th className="py-3 px-4 font-extrabold uppercase">Category</th>
                    <th className="py-3 px-4 font-extrabold uppercase">Company</th>
                    <th className="py-3 px-4 font-extrabold uppercase">Product</th>
                    <th className="py-3 px-4 font-extrabold uppercase">email</th>
                    <th className="py-3 px-4 font-extrabold uppercase">mobile</th>
                    <th className="py-3 px-4 font-extrabold uppercase text-center">License</th>
                    <th className="py-3 px-4 font-extrabold uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-400 font-mono">No matching Customers found.</td>
                    </tr>
                  ) : (
                    filteredCustomers.map((item, index) => (
                      <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-gray-800/40' : 'hover:bg-slate-50/50'}`}>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                            isDark 
                              ? 'bg-slate-800 text-teal-400 border border-slate-700/60' 
                              : 'bg-slate-100 text-[rgb(14,145,145)] border border-slate-200'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</td>
                        <td className={`py-3.5 px-4 font-semibold ${isDark ? 'text-[rgb(14,145,145)]' : 'text-[rgb(10,115,115)]'}`}>{item.category}</td>
                        <td className={`py-3.5 px-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.company}</td>
                        <td className={`py-3.5 px-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.product}</td>
                        <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.email}</td>
                        <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.mobile}</td>
                        <td className="py-3.5 px-4 text-center">
                          {/* Green circle for active, Red circle for inactive */}
                          <div className="flex justify-center items-center">
                            <span 
                              className={`w-3.5 h-3.5 rounded-full inline-block border ${item.isActive ? 'bg-emerald-500 border-emerald-600 shadow-sm' : 'bg-rose-500 border-rose-600 shadow-sm'}`} 
                              title={item.isActive ? "License Active" : "License Inactive"}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => triggerEditModal('customer', item)}
                              className={`p-1 rounded transition-colors cursor-pointer ${isDark ? 'bg-transparent text-[rgb(14,145,145)] hover:bg-[rgb(14,145,145)]/15' : 'bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] hover:bg-[rgb(14,145,145)]/20'}`}
                              title="Edit Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => triggerBlockModal('customer', item.id)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isDark 
                                  ? (item.isBlocked ? 'bg-transparent text-emerald-400 hover:bg-emerald-500/15' : 'bg-transparent text-amber-400 hover:bg-amber-500/15') 
                                  : (item.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100')
                              }`}
                              title={item.isBlocked ? "Unblock customer" : "Block customer"}
                            >
                              {item.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                            <button 
                              onClick={() => triggerDeleteModal('customer', item.id)}
                              className={`p-1 rounded transition-colors cursor-pointer ${isDark ? 'bg-transparent text-rose-400 hover:bg-rose-500/15' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => triggerEmailModal(item.email)}
                              className={`p-1 rounded transition-colors cursor-pointer ${isDark ? 'bg-transparent text-[rgb(14,145,145)] hover:bg-[rgb(14,145,145)]/15' : 'bg-[rgb(14,145,145)]/10 text-[rgb(10,115,115)] hover:bg-[rgb(14,145,145)]/20'}`}
                              title="Email Customer"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. PRODUCTS METRIC TAB CONTENT (Point 3) */}
      {activeMetric === 'products' && (
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-gray-800 border-slate-100 pb-4 mb-5">
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Products Overview</h3>
              <p className="text-xs text-slate-400 mt-1">Configure and manage active enterprise binary modules</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(14,145,145)]" />
              <input 
                type="text" 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search products..."
                className={`pl-9 pr-4 py-2 text-xs rounded-xl border w-56 focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30 focus:border-[rgb(14,145,145)] ${isDark ? 'bg-[#13161C] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b border-slate-100 dark:border-gray-800 ${isDark ? 'text-gray-300' : 'text-slate-500'}`}>
                  <th className="py-3 px-4 font-extrabold uppercase">S/no</th>
                  <th className="py-3 px-4 font-extrabold uppercase">Product</th>
                  <th className="py-3 px-4 font-extrabold uppercase">License</th>
                  <th className="py-3 px-4 font-extrabold uppercase">date of allocation</th>
                  <th className="py-3 px-4 font-extrabold uppercase">Valid Up to</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-gray-800 font-mono">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">No matching Products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map((item, index) => (
                    <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-gray-800/40' : 'hover:bg-slate-50/50'} font-sans`}>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          isDark 
                            ? 'bg-slate-800 text-teal-400 border border-slate-700/60' 
                            : 'bg-slate-100 text-[rgb(14,145,145)] border border-slate-200'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.product}</td>
                      <td className={`py-3.5 px-4 font-mono font-medium ${isDark ? 'text-[rgb(14,145,145)]' : 'text-[rgb(10,115,115)]'}`}>{item.license}</td>
                      <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.dateOfAllocation}</td>
                      <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.validUpTo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. LICENSE METRIC TAB CONTENT (Point 4) */}
      {activeMetric === 'license' && (
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-gray-800 border-slate-100 pb-4 mb-5">
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Licenses Registry</h3>
              <p className="text-xs text-slate-400 mt-1">Platform validation certificates, renewals, and actions</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(14,145,145)]" />
              <input 
                type="text" 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search licenses..."
                className={`pl-9 pr-4 py-2 text-xs rounded-xl border w-56 focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30 focus:border-[rgb(14,145,145)] ${isDark ? 'bg-[#13161C] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b border-slate-100 dark:border-gray-800 ${isDark ? 'text-gray-300' : 'text-slate-500'}`}>
                  <th className="py-3 px-4 font-extrabold uppercase">S/no</th>
                  <th className="py-3 px-4 font-extrabold uppercase">Product</th>
                  <th className="py-3 px-4 font-extrabold uppercase">License</th>
                  <th className="py-3 px-4 font-extrabold uppercase">date of allocation</th>
                  <th className="py-3 px-4 font-extrabold uppercase">Valid Up to</th>
                  <th className="py-3 px-4 font-extrabold uppercase">renewal date</th>
                  <th className="py-3 px-4 font-extrabold uppercase text-center">Status</th>
                  <th className="py-3 px-4 font-extrabold uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                {filteredLicenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400 font-mono">No matching Licenses found.</td>
                  </tr>
                ) : (
                  filteredLicenses.map((item, index) => (
                    <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-gray-800/40' : 'hover:bg-slate-50/50'}`}>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          isDark 
                            ? 'bg-slate-800 text-teal-400 border border-slate-700/60' 
                            : 'bg-slate-100 text-[rgb(14,145,145)] border border-slate-200'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.product}</td>
                      <td className={`py-3.5 px-4 font-mono font-medium ${isDark ? 'text-[rgb(14,145,145)]' : 'text-[rgb(10,115,115)]'}`}>{item.license}</td>
                      <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.dateOfAllocation}</td>
                      <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.validUpTo}</td>
                      <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.renewalDate}</td>
                      <td className="py-3.5 px-4 text-center">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => triggerEditModal('license', item)}
                            className={`p-1 rounded transition-colors cursor-pointer ${isDark ? 'bg-transparent text-[rgb(14,145,145)] hover:bg-[rgb(14,145,145)]/15' : 'bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] hover:bg-[rgb(14,145,145)]/20'}`}
                            title="Edit Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => triggerBlockModal('license', item.id)}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isDark 
                                ? (item.isBlocked ? 'bg-transparent text-emerald-400 hover:bg-emerald-500/15' : 'bg-transparent text-amber-400 hover:bg-amber-500/15') 
                                : (item.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100')
                            }`}
                            title={item.isBlocked ? "Unblock license" : "Block license"}
                          >
                            {item.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                          <button 
                            onClick={() => triggerDeleteModal('license', item.id)}
                            className={`p-1 rounded transition-colors cursor-pointer ${isDark ? 'bg-transparent text-rose-400 hover:bg-rose-500/15' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                            title="Delete License"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => triggerEmailModal(item.email)}
                            className={`p-1 rounded transition-colors cursor-pointer ${isDark ? 'bg-transparent text-[rgb(14,145,145)] hover:bg-[rgb(14,145,145)]/15' : 'bg-[rgb(14,145,145)]/10 text-[rgb(10,115,115)] hover:bg-[rgb(14,145,145)]/20'}`}
                            title="Email License Holder"
                          >
                            <Mail className="w-3.5 h-3.5" />
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
      )}

      {/* 4. REVENUE METRIC TAB CONTENT / CUSTOMER ORDERS SCREENSHOT (Point 5) */}
      {activeMetric === 'revenue' && (
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-xs'}`}>
          
          {/* Header row exactly as per Image 4 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800 border-slate-100 pb-4 mb-5">
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-[rgb(14,145,145)]' : 'text-[rgb(10,115,115)]'}`}>
                <span>📋 Customers</span>
                <span className={`${isDark ? 'text-slate-300' : 'text-slate-400'} font-light`}>Orders</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Billing flow, driver logs and invoice auditing</p>
            </div>

            {/* Date picking filter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-slate-400">Start Date</span>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30 ${isDark ? 'bg-[#13161C] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-slate-400">End Date</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30 ${isDark ? 'bg-[#13161C] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
              
              <button 
                onClick={() => triggerToast("Customer Orders CSV initiated. Downloading...")}
                className="flex items-center gap-1.5 px-4 py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-[rgb(14,145,145)]/10 hover:scale-102"
              >
                <Download className="w-3.5 h-3.5" /> Download CSV
              </button>
            </div>
          </div>

          {/* Screenshot filters layout (Row 2 in Image 4) */}
          <div className={`p-4 rounded-xl border mb-5 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4 ${isDark ? 'bg-[#13161C] border-[#2D333D]' : 'bg-slate-50/50 border-slate-200'}`}>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Order Type</label>
              <CustomSelect 
                value={orderStatus}
                onChange={(val) => setOrderStatus(val)}
                options={[
                  { value: 'All', label: 'All Types' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' }
                ]}
                isDark={isDark}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Payment Method</label>
              <CustomSelect 
                value={orderPayment}
                onChange={(val) => setOrderPayment(val)}
                options={[
                  { value: 'All', label: 'All Methods' },
                  { value: 'Credit Card', label: 'Credit Card' },
                  { value: 'PayPal', label: 'PayPal' },
                  { value: 'Wire Transfer', label: 'Wire Transfer' }
                ]}
                isDark={isDark}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Payment Status</label>
              <CustomSelect
                value={orderPaymentStatus}
                onChange={(val) => setOrderPaymentStatus(val)}
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Success', label: 'Success' },
                  { value: 'Failed', label: 'Failed' },
                  { value: 'In Progress', label: 'In Progress' }
                ]}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Row 3 layout: search & Show deleted toggle */}
          <div className="flex flex-row flex-wrap items-center justify-between gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(14,145,145)]" />
              <input 
                type="text" 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search orders, clients, order numbers..."
                className={`pl-9 pr-4 py-2 text-xs rounded-xl border w-full focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30 focus:border-[rgb(14,145,145)] ${isDark ? 'bg-[#13161C] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'}`}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-400 cursor-pointer" htmlFor="toggle-deleted">Show Deleted</label>
              <input 
                id="toggle-deleted"
                type="checkbox" 
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="w-4 h-4 rounded text-[rgb(14,145,145)] focus:ring-[rgb(14,145,145)]"
              />
            </div>
          </div>

          {/* Tabular data corresponding exactly to customer order layout (Image 4) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b border-slate-100 dark:border-gray-800 ${isDark ? 'text-gray-300' : 'text-slate-500'}`}>
                  <th className="py-3 px-4 font-extrabold uppercase">Sr No.</th>
                  <th className="py-3 px-4 font-extrabold uppercase"> Company</th>
                  <th className="py-3 px-4 font-extrabold uppercase"> Authorized</th>
                  <th className="py-3 px-4 font-extrabold uppercase">Order No.</th>
                  <th className="py-3 px-4 font-extrabold uppercase">Order Date</th>
                  <th className="py-3 px-4 font-extrabold uppercase">Order Time</th>
                  <th className="py-3 px-4 font-extrabold uppercase text-center">Order Type</th>
                  <th className="py-3 px-4 font-extrabold uppercase text-right">Total Amount</th>
                  <th className="py-3 px-4 font-extrabold uppercase">Reason</th>
                  <th className="py-3 px-4 font-extrabold uppercase">Street</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-400 font-mono">No customer orders match search parameters or date range.</td>
                  </tr>
                ) : (
                  filteredOrders.map((item, index) => (
                    <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-gray-800/40' : 'hover:bg-slate-50/50'} ${item.isDeleted ? 'opacity-50 line-through bg-rose-50/20' : ''}`}>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          isDark 
                            ? 'bg-slate-800 text-teal-400 border border-slate-700/60' 
                            : 'bg-slate-100 text-[rgb(14,145,145)] border border-slate-200'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      
                      {/* User Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src={item.userAvatar} 
                            alt={item.user} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="leading-tight text-left">
                            <div className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.user}</div>
                            <button 
                              onClick={() => triggerToast(`Navigating to profile detail for user: ${item.user}`)}
                              className={`text-[10px] font-bold hover:underline block ${isDark ? 'text-[rgb(14,145,145)]' : 'text-[rgb(10,115,115)]'}`}
                            >
                              More Details
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Driver Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src={item.driverAvatar} 
                            alt={item.driver} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="leading-tight text-left">
                            <div className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.driver}</div>
                            <button 
                              onClick={() => triggerToast(`Navigating to logs for driver: ${item.driver}`)}
                              className={`text-[10px] font-bold hover:underline block ${isDark ? 'text-[rgb(14,145,145)]' : 'text-[rgb(10,115,115)]'}`}
                            >
                              More Details
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Order No in bold coral */}
                      <td className={`py-4 px-4 font-black font-mono ${isDark ? 'text-[rgb(14,145,145)]' : 'text-[rgb(10,115,115)]'}`}>{item.orderNo}</td>
                      
                      <td className={`py-4 px-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.orderDate}</td>
                      <td className={`py-4 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.orderTime}</td>
                      
                      {/* Order Type */}
                      <td className="py-4 px-4 text-center">
                        {item.orderType === 'Active' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Total Amount with info circle */}
                      <td className={`py-4 px-4 text-right font-black font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        <span className="inline-flex items-center gap-1">
                          {item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          <Info className="w-3 h-3 text-slate-400 cursor-help" title="Standard license allocation" />
                        </span>
                      </td>

                      <td className={`py-4 px-4 font-medium max-w-[150px] truncate ${isDark ? 'text-slate-300' : 'text-slate-400'}`} title={item.reason}>{item.reason}</td>
                      <td className={`py-4 px-4 font-medium font-mono ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.street}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOTAL USERS TREND ANALYSIS - Point 6 */}
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-2xs'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-sm bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)]">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Total Users Trend Analysis
              </h3>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-400'} mt-1`}>
              Comparing user registrations and allocated licenses using interactive date thresholds.
            </p>
          </div>

          {/* DATE RANGE FILTER / REPLACE 7, 30, 90 DAYS (Point 6) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">From</span>
              <div className={`relative flex items-center border rounded-xl px-3 py-1.5 ${isDark ? 'bg-[#13161C] border-[#2D333D]' : 'bg-white border-slate-200 shadow-3xs'}`}>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`bg-transparent text-xs font-semibold focus:outline-none focus:ring-0 ${isDark ? 'text-white' : 'text-slate-800'}`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">To</span>
              <div className={`relative flex items-center border rounded-xl px-3 py-1.5 ${isDark ? 'bg-[#13161C] border-[#2D333D]' : 'bg-white border-slate-200 shadow-3xs'}`}>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`bg-transparent text-xs font-semibold focus:outline-none focus:ring-0 ${isDark ? 'text-white' : 'text-slate-800'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RECHARTS AREA CHART */}
        <div className="h-64 text-xs font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333EA" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#9333EA" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                labelStyle={{
                  color: isDark ? '#9CA3AF' : '#4B5563'
                }}
              />
              <Area type="monotone" dataKey="Current" stroke="#9333EA" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCurrent)" name="Active Period" />
              <Area type="monotone" dataKey="Previous" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPrevious)" name="Prior Cycle" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AUDIT LOGS / BACKEND DEVELOPER CONSOLE (Points 2 & 4) */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0F1115] border-[#2D333D]' : 'bg-slate-900 border-slate-950 text-slate-300'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-slate-800 dark:text-slate-200 font-mono">
            🔌 Secure Back-end Server Audit Console
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase animate-pulse">
            CAPTURE_LIVE
          </span>
        </div>
        <div className="max-h-24 overflow-y-auto font-mono text-[10px] space-y-1 text-left custom-scrollbar">
          {backendLogs.map((log, idx) => (
            <div key={idx} className="hover:text-white transition-all select-all selection:bg-slate-50 dark:bg-slate-900/300/30">
              {log}
            </div>
          ))}
        </div>
      </div>

    </>)}

      {/* MODAL OVERLAYS */}

      {/* 1. BLOCK DIALOG POP-UP (Image 3) */}
      {activeModal === 'block' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-[rgb(14,145,145)]/20 animate-in fade-in zoom-in-95 duration-200">
            {/* Dark/Solid Coral Header exactly as per Image 3 adapted */}
            <div className="bg-[rgb(14,145,145)] text-white px-5 py-4 flex items-center justify-between">
              <span className="font-extrabold tracking-wide uppercase text-sm">Block</span>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-white/20 transition-all cursor-pointer">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Pop-up Message */}
            <div className="p-8 text-center">
              <h4 className="text-xl font-bold text-slate-800 leading-normal">
                Are you sure you want to Block this user?
              </h4>
            </div>

            {/* Buttons Row */}
            <div className="px-6 pb-6 pt-2 flex gap-3">
              <button 
                onClick={closeModal}
                className="flex-1 py-2.5 px-4 border border-[rgb(14,145,145)] text-[rgb(14,145,145)] font-bold rounded-xl text-xs hover:bg-[rgb(14,145,145)]/5 transition-all cursor-pointer"
              >
                No, Keep it
              </button>
              <button 
                onClick={confirmBlock}
                className="flex-1 py-2.5 px-4 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DELETE DIALOG POP-UP (Image 3 + Points 2/4) */}
      {activeModal === 'delete' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-[rgb(14,145,145)]/20 animate-in fade-in zoom-in-95 duration-200">
            {/* Dark/Solid Coral Header exactly as per Image 3 adapted */}
            <div className="bg-[rgb(14,145,145)] text-white px-5 py-4 flex items-center justify-between">
              <span className="font-extrabold tracking-wide uppercase text-sm">Delete</span>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-white/20 transition-all cursor-pointer">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Pop-up Message */}
            <div className="p-8 text-center">
              <h4 className="text-lg font-bold text-slate-800 leading-normal">
                Do you want to delete the customer?
              </h4>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">This action will be logged on the backend.</p>
            </div>

            {/* Buttons Row */}
            <div className="px-6 pb-6 pt-2 flex gap-3">
              <button 
                onClick={closeModal}
                className="flex-1 py-2.5 px-4 border border-[rgb(14,145,145)] text-[rgb(14,145,145)] font-bold rounded-xl text-xs hover:bg-[rgb(14,145,145)]/5 transition-all cursor-pointer"
              >
                No, Keep it
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. EMAIL POP-UP DIALOG (Points 2 & 4) */}
      {activeModal === 'email' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSendEmail} className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[rgb(14,145,145)]/20 animate-in fade-in zoom-in-95 duration-200 text-left">
            {/* Coral Header */}
            <div className="bg-[rgb(14,145,145)] text-white px-5 py-4 flex items-center justify-between">
              <span className="font-extrabold tracking-wide uppercase text-sm flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Email Customer
              </span>
              <button type="button" onClick={closeModal} className="p-1 rounded-full hover:bg-white/20 transition-all cursor-pointer">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Captured Email Input */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">To (Auto Captured Primary Email)</label>
                <input 
                  type="text" 
                  value={emailTo} 
                  readOnly 
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-mono text-[rgb(14,145,145)] focus:outline-none"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Subject</label>
                <input 
                  type="text" 
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Message Body</label>
                <textarea 
                  rows={4}
                  required
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30"
                />
              </div>

              {/* Document upload capability */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Upload License Documents</label>
                <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-all relative">
                  <input 
                    type="file" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEmailFile(e.target.files[0].name);
                        triggerToast(`File '${e.target.files[0].name}' successfully staged for upload.`);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 text-[rgb(14,145,145)] mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-slate-600">Drag or Click to attach document</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Staged file: <span className="font-mono text-[rgb(14,145,145)]">{emailFile ? emailFile : 'None'}</span></p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
              <button 
                type="button" 
                onClick={closeModal}
                className="py-2 px-4 border border-slate-200 text-slate-500 hover:text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="py-2 px-5 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-[rgb(14,145,145)]/10"
              >
                Send Email
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. EDIT POP-UP DIALOG (Points 2 & 4) */}
      {activeModal === 'edit' && editingObj && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveEdit} className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[rgb(14,145,145)]/20 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="bg-[rgb(14,145,145)] text-white px-5 py-4 flex items-center justify-between">
              <span className="font-extrabold tracking-wide uppercase text-sm flex items-center gap-1.5">
                <Edit className="w-4 h-4" /> Edit Details
              </span>
              <button type="button" onClick={closeModal} className="p-1 rounded-full hover:bg-white/20 transition-all cursor-pointer">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={editingObj.name || editingObj.product || ''} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingObj((prev: any) => prev.product !== undefined ? { ...prev, product: val } : { ...prev, name: val });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30 font-semibold"
                />
              </div>

              {editingObj.email !== undefined && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={editingObj.email} 
                    onChange={(e) => setEditingObj((prev: any) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30 font-mono"
                  />
                </div>
              )}

              {editingObj.mobile !== undefined && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Mobile</label>
                  <input 
                    type="text" 
                    required
                    value={editingObj.mobile} 
                    onChange={(e) => setEditingObj((prev: any) => ({ ...prev, mobile: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30 font-mono"
                  />
                </div>
              )}

              {editingObj.company !== undefined && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Company</label>
                  <input 
                    type="text" 
                    required
                    value={editingObj.company} 
                    onChange={(e) => setEditingObj((prev: any) => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30"
                  />
                </div>
              )}

              {editingObj.license !== undefined && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">License Code</label>
                  <input 
                    type="text" 
                    required
                    value={editingObj.license} 
                    onChange={(e) => setEditingObj((prev: any) => ({ ...prev, license: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(14,145,145)]/30 font-mono"
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
              <button 
                type="button" 
                onClick={closeModal}
                className="py-2 px-4 border border-slate-200 text-slate-500 hover:text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="py-2 px-5 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-[rgb(14,145,145)]/10"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
