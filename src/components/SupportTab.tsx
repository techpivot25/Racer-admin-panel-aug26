import React, { useState, useMemo } from 'react';
import { CustomSelect } from './CustomSelect';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Headphones, 
  MessageSquare, 
  HelpCircle,
  FileCheck2,
  Edit3,
  X,
  Plus,
  Trash2,
  Search,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  ShieldAlert,
  Activity,
  Check,
  Briefcase,
  ListFilter,
  Settings,
  Info,
  Sliders,
  Send,
  Zap,
  PhoneCall,
  Bot
} from 'lucide-react';
import { SupportTierInfo, Customer, Product, ProductSupportRecord, AuditRecord } from '../types';

interface SupportTabProps {
  tiers: SupportTierInfo[];
  customers: Customer[];
  products: Product[];
  onEditTier: (tier: SupportTierInfo) => void;
  t: Record<string, string>;
  isDark: boolean;
  auditLogs?: AuditRecord[];
  addAuditLog?: (action: string, details: string, screen: 'Users' | 'Customers' | 'Products' | 'General' | 'Licenses' | 'Support') => void;
}

export default function SupportTab({
  tiers,
  customers,
  products,
  onEditTier,
  t,
  isDark,
  auditLogs = [],
  addAuditLog
}: SupportTabProps) {
  // Support Tab navigation state
  const [activeSupportTab, setActiveSupportTab] = useState<'profiles' | 'admin'>('profiles');

  // Local state for support tiers (SLO Profiles) to allow complete local CRUD
  const [localTiers, setLocalTiers] = useState<SupportTierInfo[]>(tiers);

  // Local state for product support agreements (SLO Admin Console)
  const [supportRecords, setSupportRecords] = useState<ProductSupportRecord[]>([
    {
      id: 'psr-01',
      productId: 'prod-01',
      productSku: 'BJ-COMPUTE-ENT-001',
      productName: 'BJ Cloud-Compute Engine',
      sloDetails: '99.95% virtual instance network reachability, backed by localized physical cluster failovers and hardware hot-swap pools.',
      responseTime: '15 mins (P1), 2 hours (P2), 8 hours (P3)',
      supportContactName: 'Sarah Connor (Ops Lead)',
      supportContactPhone: '+1 (555) 492-9103',
      supportContactEmail: 's.connor@bj-cloud-systems.net',
      supportWorkflow: ['Alert Intake & Automated Triage', 'NOC Engineer Assessment', 'On-Call Escalation & Live Patching', 'Verification & Post-Mortem Log'],
      customerIds: ['c-1', 'c-2'],
      notes: 'Monitored continuously via Prometheus & Grafana alerting queues.',
      severityLevel: 'P1 - Critical',
      coverageHours: '24/7/365 Continuous'
    },
    {
      id: 'psr-02',
      productId: 'prod-02',
      productSku: 'BJ-STORAGE-VAL-002',
      productName: 'BJ Object-Storage Vault',
      sloDetails: '99.999% cryptographic data durability, with encrypted active API connection paths and hot-swap parity arrays.',
      responseTime: '30 mins (P1), 4 hours (P2), 24 hours (P3)',
      supportContactName: 'Miles Dyson (Lead SRE)',
      supportContactPhone: '+1 (555) 781-3092',
      supportContactEmail: 'm.dyson@bj-vault-systems.net',
      supportWorkflow: ['API Failure Vector Scanned', 'Active Parity Swap Triggered', 'Encrypted Node Replication Verify', 'Customer Handshake OK Sign'],
      customerIds: ['c-1', 'c-3', 'c-4'],
      notes: 'Provides zero-knowledge backup options with automated key rotation checks.',
      severityLevel: 'P2 - High',
      coverageHours: '24/7/365 Continuous'
    }
  ]);

  // Support record modal state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProductSupportRecord | null>(null);

  // Core Support Tier Modal state
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<SupportTierInfo | null>(null);

  // Form State for Support Tiers (SLO Profiles)
  const [tierName, setTierName] = useState('');
  const [tierResponseTime, setTierResponseTime] = useState('');
  const [tierCoverageHours, setTierCoverageHours] = useState('');
  const [tierChannels, setTierChannels] = useState<string[]>([]);
  const [tierNotes, setTierNotes] = useState('');
  const [tierMaxTickets, setTierMaxTickets] = useState(10);
  const [tierDirectPhoneAccess, setTierDirectPhoneAccess] = useState(false);
  const [tierDedicatedLiaison, setTierDedicatedLiaison] = useState(false);

  // Form State for Product Support Record (SLO Admin Console)
  const [recordProductId, setRecordProductId] = useState('');
  const [recordSloDetails, setRecordSloDetails] = useState('');
  const [recordResponseTime, setRecordResponseTime] = useState('');
  const [recordContactName, setRecordContactName] = useState('');
  const [recordContactPhone, setRecordContactPhone] = useState('');
  const [recordContactEmail, setRecordContactEmail] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [recordSeverity, setRecordSeverity] = useState<'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low'>('P1 - Critical');
  const [recordCoverage, setRecordCoverage] = useState('24/7/365 Continuous');
  const [recordWorkflowInput, setRecordWorkflowInput] = useState('');
  const [recordWorkflowSteps, setRecordWorkflowSteps] = useState<string[]>([]);

  // Detailed view modals
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<SupportTierInfo | null>(null);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<ProductSupportRecord | null>(null);

  // Portfolio mapping modal state
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolioRecordId, setPortfolioRecordId] = useState<string | null>(null);
  const [portfolioCustomerIds, setPortfolioCustomerIds] = useState<string[]>([]);

  // Local search / filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSku, setFilterSku] = useState('ALL');
  const [filterCustomer, setFilterCustomer] = useState('ALL');

  // Local Toast system
  const [localToast, setLocalToast] = useState('');

  // Interactive Reference Section states
  const [activeVocabComparison, setActiveVocabComparison] = useState<'slo' | 'sla'>('slo');
  const [activeToolTab, setActiveToolTab] = useState<'portal' | 'voice' | 'escalation' | 'direct'>('portal');
  const [toolsActiveState, setToolsActiveState] = useState({
    portal: true,
    voice: false,
    escalation: true,
    direct: false
  });

  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [simulationSeverity, setSimulationSeverity] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P1');

  const triggerLocalToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(''), 4500);
  };

  const handleAudit = (action: string, details: string) => {
    if (addAuditLog) {
      addAuditLog(action, details, 'Support');
    } else {
      console.log(`[AUDIT] ${action}: ${details}`);
    }
  };

  // ----------------------------------------------------
  // SLO PROFILES (TIERS) ACTIONS
  // ----------------------------------------------------
  function openAddTierModal() {
    setEditingTier(null);
    setTierName('');
    setTierResponseTime('2-4 Hours');
    setTierCoverageHours('24/7/365');
    setTierChannels(['Priority Support Portal']);
    setTierNotes('');
    setTierMaxTickets(50);
    setTierDirectPhoneAccess(false);
    setTierDedicatedLiaison(false);
    setIsTierModalOpen(true);
  }

  function openEditTierModal(tier: SupportTierInfo) {
    setEditingTier(tier);
    setTierName(tier.name);
    setTierResponseTime(tier.responseTime);
    setTierCoverageHours(tier.coverageHours);
    setTierChannels(tier.channels);
    setTierNotes(tier.notes);
    setTierMaxTickets(tier.maxTickets);
    setTierDirectPhoneAccess(tier.directPhoneAccess);
    setTierDedicatedLiaison(tier.dedicatedLiaison);
    setIsTierModalOpen(true);
  }

  function handleTierChannelToggle(channel: string) {
    if (tierChannels.includes(channel)) {
      setTierChannels(tierChannels.filter(c => c !== channel));
    } else {
      setTierChannels([...tierChannels, channel]);
    }
  }

  function handleTierSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingTier) {
      // Modify
      const updatedTier: SupportTierInfo = {
        ...editingTier,
        name: tierName,
        responseTime: tierResponseTime,
        coverageHours: tierCoverageHours,
        channels: tierChannels,
        notes: tierNotes,
        maxTickets: tierMaxTickets,
        directPhoneAccess: tierDirectPhoneAccess,
        dedicatedLiaison: tierDedicatedLiaison
      };
      setLocalTiers(localTiers.map(t => t.id === editingTier.id ? updatedTier : t));
      onEditTier(updatedTier); // notify App.tsx if any state is synchronized
      handleAudit(
        'Modify SLO Profile',
        `Updated SLO Profile "${tierName}" (${editingTier.id}). Response SLO: ${tierResponseTime}. Channels: ${tierChannels.join(', ')}. Max tickets: ${tierMaxTickets}.`
      );
      triggerLocalToast(`SLO Profile "${tierName}" successfully updated.`);
    } else {
      // Create
      const newTier: SupportTierInfo = {
        id: `tier-${Date.now()}`,
        name: tierName,
        responseTime: tierResponseTime,
        coverageHours: tierCoverageHours,
        channels: tierChannels,
        notes: tierNotes,
        maxTickets: tierMaxTickets,
        directPhoneAccess: tierDirectPhoneAccess,
        dedicatedLiaison: tierDedicatedLiaison
      };
      setLocalTiers([...localTiers, newTier]);
      handleAudit(
        'Create SLO Profile',
        `Created new custom SLO Profile "${tierName}". Response SLO: ${tierResponseTime}. Max tickets: ${tierMaxTickets}.`
      );
      triggerLocalToast(`New SLO Profile "${tierName}" successfully created.`);
    }
    setIsTierModalOpen(false);
  }

  function handleDeleteTier(id: string, name: string) {
    if (window.confirm(`Are you sure you want to permanently delete the "${name}" SLO profile? This action will invalidate related contracts.`)) {
      setLocalTiers(localTiers.filter(t => t.id !== id));
      handleAudit(
        'Delete SLO Profile',
        `Permanently removed support SLO profile "${name}" (${id}) from active configurations.`
      );
      triggerLocalToast(`SLO Profile "${name}" was permanently removed.`);
    }
  }

  function handleResetToSimpleTiers() {
    if (window.confirm('Would you like to reset the SLO Profiles to the standard 2x Tiers (Gold Support Model and Standard Support Model)? This will override active modifications.')) {
      const defaultSimple: SupportTierInfo[] = [
        {
          id: 'tier-gold',
          name: 'Gold Support Model',
          responseTime: '2-4 Hours (P1-P2)',
          coverageHours: '24/7/365 Continuous',
          channels: ['Direct VIP Hotline', 'Priority Support Portal', 'Slack Dedicated Channel'],
          notes: '24/7 support with shorter response time',
          maxTickets: 999,
          directPhoneAccess: true,
          dedicatedLiaison: true
        },
        {
          id: 'tier-standard',
          name: 'Standard Support Model',
          responseTime: '2-4 Hours (P1), 8 Hours (P2)',
          coverageHours: 'Business Hours Only (M-F 9AM-5PM)',
          channels: ['Priority Support Portal', 'Email Ticketing Queue'],
          notes: 'Business Hours Only support with standard response time',
          maxTickets: 25,
          directPhoneAccess: false,
          dedicatedLiaison: false
        }
      ];
      setLocalTiers(defaultSimple);
      handleAudit(
        'Reset SLO Profiles',
        'Reconfigured system to support the simplified 2x Tiers (Gold and Standard Support Models).'
      );
      triggerLocalToast('Successfully reset to the streamlined 2x Support Tier Model.');
    }
  }

  // ----------------------------------------------------
  // SLO ADMIN CONSOLE (RECORDS) ACTIONS
  // ----------------------------------------------------
  function openAddRecordModal() {
    setEditingRecord(null);
    if (products.length > 0) {
      setRecordProductId(products[0].id);
    } else {
      setRecordProductId('');
    }
    setRecordSloDetails('Committed 99.9% uptime target, with hot-swap parity arrays and continuous node cluster synchronization.');
    setRecordResponseTime('30 mins (P1), 4 hours (P2)');
    setRecordContactName('Dev Support Team');
    setRecordContactPhone('+1 (555) 123-4567');
    setRecordContactEmail('support@bj-cloud-architecture.net');
    setRecordNotes('Auto-scaled fallback systems verified weekly.');
    setRecordSeverity('P1 - Critical');
    setRecordCoverage('24/7/365 Continuous');
    setRecordWorkflowSteps(['Ticket Receipt & Incident Scan', 'Engineer Paged', 'Resolution Deployment', 'Post-Mortem Signoff']);
    setRecordWorkflowInput('');
    setIsRecordModalOpen(true);
  }

  function openEditRecordModal(record: ProductSupportRecord) {
    setEditingRecord(record);
    setRecordProductId(record.productId);
    setRecordSloDetails(record.sloDetails);
    setRecordResponseTime(record.responseTime);
    setRecordContactName(record.supportContactName);
    setRecordContactPhone(record.supportContactPhone);
    setRecordContactEmail(record.supportContactEmail);
    setRecordNotes(record.notes);
    setRecordSeverity(record.severityLevel);
    setRecordCoverage(record.coverageHours);
    setRecordWorkflowSteps(record.supportWorkflow);
    setRecordWorkflowInput('');
    setIsRecordModalOpen(true);
  }

  function handleProductSelect(prodId: string) {
    setRecordProductId(prodId);
  }

  function handleAddWorkflowStep() {
    if (!recordWorkflowInput.trim()) return;
    setRecordWorkflowSteps([...recordWorkflowSteps, recordWorkflowInput.trim()]);
    setRecordWorkflowInput('');
  }

  function handleRemoveWorkflowStep(idx: number) {
    setRecordWorkflowSteps(recordWorkflowSteps.filter((_, i) => i !== idx));
  }

  function handleRecordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selectedProd = products.find(p => p.id === recordProductId);
    if (!selectedProd) {
      triggerLocalToast('Please select a valid associated product catalog reference.');
      return;
    }

    if (editingRecord) {
      // Edit
      const updatedRecord: ProductSupportRecord = {
        ...editingRecord,
        productId: recordProductId,
        productSku: selectedProd.sku,
        productName: selectedProd.name,
        sloDetails: recordSloDetails,
        responseTime: recordResponseTime,
        supportContactName: recordContactName,
        supportContactPhone: recordContactPhone,
        supportContactEmail: recordContactEmail,
        notes: recordNotes,
        severityLevel: recordSeverity,
        coverageHours: recordCoverage,
        supportWorkflow: recordWorkflowSteps
      };
      setSupportRecords(supportRecords.map(r => r.id === editingRecord.id ? updatedRecord : r));
      handleAudit(
        'Modify Support Agreement',
        `Updated Product Support SLA/SLO parameters for ${selectedProd.name} (${selectedProd.sku}). Lead Engineer: ${recordContactName}. Severity Target: ${recordSeverity}.`
      );
      triggerLocalToast(`Support agreement parameters for "${selectedProd.name}" saved.`);
    } else {
      // Create
      const newRecord: ProductSupportRecord = {
        id: `psr-${Date.now()}`,
        productId: recordProductId,
        productSku: selectedProd.sku,
        productName: selectedProd.name,
        sloDetails: recordSloDetails,
        responseTime: recordResponseTime,
        supportContactName: recordContactName,
        supportContactPhone: recordContactPhone,
        supportContactEmail: recordContactEmail,
        notes: recordNotes,
        severityLevel: recordSeverity,
        coverageHours: recordCoverage,
        supportWorkflow: recordWorkflowSteps,
        customerIds: []
      };
      setSupportRecords([newRecord, ...supportRecords]);
      handleAudit(
        'Create Support Agreement',
        `Registered new Product Support SLA/SLO agreement for ${selectedProd.name} (${selectedProd.sku}). Response target: ${recordResponseTime}.`
      );
      triggerLocalToast(`Registered new support agreement for "${selectedProd.name}".`);
    }
    setIsRecordModalOpen(false);
  }

  function handleDeleteRecord(id: string) {
    const record = supportRecords.find(r => r.id === id);
    if (window.confirm(`Are you sure you want to permanently delete the support agreement for "${record?.productName || 'selected item'}"?`)) {
      setSupportRecords(supportRecords.filter(r => r.id !== id));
      handleAudit(
        'Delete Support Agreement',
        `Removed support parameters and contacts mapped to ${record?.productName || 'N/A'} (${record?.productSku || 'N/A'}).`
      );
      triggerLocalToast('Product Support SLA Agreement successfully removed.');
    }
  }

  // ----------------------------------------------------
  // PORTFOLIO CLIENT ASSIGNMENTS
  // ----------------------------------------------------
  function openPortfolioEditor(record: ProductSupportRecord) {
    setPortfolioRecordId(record.id);
    setPortfolioCustomerIds(record.customerIds);
    setIsPortfolioModalOpen(true);
  }

  function togglePortfolioCustomer(customerId: string) {
    if (portfolioCustomerIds.includes(customerId)) {
      setPortfolioCustomerIds(portfolioCustomerIds.filter(id => id !== customerId));
    } else {
      setPortfolioCustomerIds([...portfolioCustomerIds, customerId]);
    }
  }

  function savePortfolioMapping() {
    if (!portfolioRecordId) return;
    const targetRecord = supportRecords.find(r => r.id === portfolioRecordId);
    setSupportRecords(supportRecords.map(record => {
      if (record.id === portfolioRecordId) {
        return {
          ...record,
          customerIds: portfolioCustomerIds
        };
      }
      return record;
    }));
    
    const clientNames = portfolioCustomerIds.map(id => customers.find(c => c.id === id)?.name || id).join(', ');
    handleAudit(
      'Update Support Portfolio',
      `Modified client portfolio mapping for "${targetRecord?.productName}" agreement. New mapped enterprise tenants: [${clientNames || 'None'}].`
    );

    setIsPortfolioModalOpen(false);
    triggerLocalToast('Customer SLA support portfolio successfully updated with zero metadata side-effects.');
  }

  // ----------------------------------------------------
  // INTERACTIVE TESTING SIMULATIONS
  // ----------------------------------------------------
  function runSloSimulation(profile: SupportTierInfo) {
    let result = '';
    const nowStr = new Date().toLocaleTimeString();
    
    if (simulationSeverity === 'P1') {
      result = `🔴 [P1 INCIDENT PAGING TRIGGERED] - Incident reported at ${nowStr}. Under the "${profile.name}" SLO, the response deadline is ${profile.responseTime}. ${profile.directPhoneAccess ? '📲 Active automated call route triggered to primary on-call SRE.' : '📧 Critical ticket route queued.'} ${profile.dedicatedLiaison ? '⭐ Dedicated Tech Liaison notified to initiate active war-room bridge.' : ''}`;
    } else if (simulationSeverity === 'P2') {
      result = `🟡 [P2 HIGH VALUE INCIDENT REPORT] - Logged at ${nowStr}. Target response SLO is ${profile.responseTime}. Coverage Window: ${profile.coverageHours}. Tickets currently active: 1 of ${profile.maxTickets} SLA allowance. Standard routing active.`;
    } else if (simulationSeverity === 'P3') {
      result = `🔵 [P3 STANDARD TICKET ROUTE] - Logged at ${nowStr}. Target response SLO: Next business queue. Standard ticket tracking initialized. Support channels verified: ${profile.channels.slice(0, 2).join(', ')}.`;
    } else {
      result = `🟢 [P4 COSMETIC TICKET ROUTE] - Logged at ${nowStr}. Self-service options advised. Client may access help forums or standard emails.`;
    }
    
    setSimulationResult(result);
    handleAudit(
      'Run SLO Simulation',
      `Executed SLA coverage test simulation for "${profile.name}" at Severity ${simulationSeverity}.`
    );
  }

  function toggleSupportTool(tool: 'portal' | 'voice' | 'escalation' | 'direct') {
    const nextState = !toolsActiveState[tool];
    setToolsActiveState(prev => ({ ...prev, [tool]: nextState }));
    
    const toolLabels = {
      portal: 'AI Agent in Customer Portal',
      voice: 'Inbound Voice AI Agent Support',
      escalation: 'Escalation Tooling (Opsgenie Integration)',
      direct: 'Direct Support Contact Options'
    };
    
    handleAudit(
      'Configure Support Tool',
      `${nextState ? 'Activated' : 'Deactivated'} support feature: "${toolLabels[tool]}".`
    );
    
    triggerLocalToast(`"${toolLabels[tool]}" configuration updated.`);
  }

  // Filtered support records computation
  const filteredRecords = useMemo(() => {
    return supportRecords.filter(rec => {
      const matchesSearch = rec.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            rec.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            rec.sloDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            rec.supportContactName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSku = filterSku === 'ALL' || rec.productSku === filterSku;
      
      const matchesCustomer = filterCustomer === 'ALL' || rec.customerIds.includes(filterCustomer);

      return matchesSearch && matchesSku && matchesCustomer;
    });
  }, [supportRecords, searchQuery, filterSku, filterCustomer]);

  return (
    <div className="space-y-8">
      
      {/* TOAST ALERT DISPLAY */}
      {localToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-purple-600/40 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Activity className="w-5 h-5 text-purple-600 animate-pulse" />
          <span className="text-xs font-bold">{localToast}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Product Support Console</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Configure Service Level Objectives (SLOs), manage support profiles, and assign portfolios.
          </p>
        </div>
        <div className="flex gap-2">
          {activeSupportTab === 'profiles' && (
            <button
              onClick={handleResetToSimpleTiers}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                isDark 
                  ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800 text-gray-300' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs'
              }`}
            >
              Reset to Simple 2-Tiers
            </button>
          )}
          <button
            onClick={activeSupportTab === 'profiles' ? openAddTierModal : openAddRecordModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{activeSupportTab === 'profiles' ? 'Create SLO Profile' : 'Add Support Record'}</span>
          </button>
        </div>
      </div>

      {/* CORE TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 dark:border-gray-800">
        <button
          onClick={() => setActiveSupportTab('profiles')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSupportTab === 'profiles'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>SLO Profiles</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 rounded-full font-mono font-bold">
            {localTiers.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSupportTab('admin')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSupportTab === 'admin'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>SLO Admin Console</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 rounded-full font-mono font-bold">
            {supportRecords.length}
          </span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB #1 CONTENT: SLO PROFILES GRID/TABLE VIEW         */}
      {/* ---------------------------------------------------- */}
      {activeSupportTab === 'profiles' && (
        <div className="space-y-6">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/30 border-gray-800/60' : 'bg-slate-50/50 border-slate-100'} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Active Committed SLO Profiles</h4>
                <p className="text-[11px] text-gray-500">Core service level definitions and routing configurations accessible by enterprise contracts.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Gold Program: Active</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Standard Program: Active</span>
            </div>
          </div>

          {/* SLO PROFILES TABLE GRID */}
          <div className={`border rounded-2xl overflow-hidden ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200 shadow-2xs'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-[10px] font-mono uppercase tracking-wider border-b ${isDark ? 'bg-gray-900/60 border-gray-800 text-gray-400' : 'bg-slate-50/70 border-slate-100 text-slate-500'}`}>
                    <th className="px-5 py-4 font-extrabold">SLO Profile / ID</th>
                    <th className="px-5 py-4 font-extrabold">Response Target</th>
                    <th className="px-5 py-4 font-extrabold">Coverage Window</th>
                    <th className="px-5 py-4 font-extrabold">Monthly Limits</th>
                    <th className="px-5 py-4 font-extrabold">Delivery Channels</th>
                    <th className="px-5 py-4 font-extrabold text-center">VIP Escalation</th>
                    <th className="px-5 py-4 font-extrabold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-xs">
                  {localTiers.map(tier => (
                    <tr key={tier.id} className={`transition-colors ${isDark ? 'hover:bg-gray-800/40' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className={`font-black text-sm block ${isDark ? 'text-white' : 'text-slate-800'}`}>{tier.name}</span>
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border inline-block ${
                            isDark 
                              ? 'bg-slate-800 text-teal-400 border-slate-700/60' 
                              : 'bg-slate-100 text-purple-600 border-slate-200'
                          }`}>{tier.id}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-purple-600">
                        {tier.responseTime}
                      </td>
                      <td className="px-5 py-4 font-mono text-gray-500 dark:text-gray-400">
                        {tier.coverageHours}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-600 dark:text-gray-400">
                        {tier.maxTickets === 999 ? '∞ Unlimited Tickets' : `${tier.maxTickets} tickets / mo`}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {tier.channels.slice(0, 3).map((chan, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              isDark 
                                ? 'bg-slate-800 text-teal-300 border-slate-700/60' 
                                : 'bg-slate-100 text-[rgb(10,115,115)] border-slate-200'
                            }`}>
                              {chan}
                            </span>
                          ))}
                          {tier.channels.length > 3 && (
                            <span className="text-[10px] text-gray-400 font-bold font-mono">+{tier.channels.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            tier.directPhoneAccess 
                              ? (isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200')
                              : (isDark ? 'bg-slate-800/40 text-slate-500 border-slate-700/40' : 'bg-slate-50 text-slate-400 border-slate-200/60')
                          }`}>
                            {tier.directPhoneAccess ? '📞 Phone' : '🚫 No Phone'}
                          </span>
                          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            tier.dedicatedLiaison 
                              ? (isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200')
                              : (isDark ? 'bg-slate-800/40 text-slate-500 border-slate-700/40' : 'bg-slate-50 text-slate-400 border-slate-200/60')
                          }`}>
                            {tier.dedicatedLiaison ? '👤 SRE Liaison' : '🚫 No Liaison'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedProfileDetail(tier)}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isDark 
                                ? 'border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white bg-slate-900/40' 
                                : 'border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-700 bg-white shadow-2xs'
                            }`}
                            title="View comprehensive details and run simulations"
                          >
                            <Info className="w-3.5 h-3.5" />
                            <span>Test / View</span>
                          </button>
                          <button
                            onClick={() => openEditTierModal(tier)}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isDark 
                                ? 'border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white bg-slate-900/40' 
                                : 'border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-700 bg-white shadow-2xs'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTier(tier.id, tier.name)}
                            className="p-1.5 rounded-lg border border-transparent hover:bg-rose-500/10 text-rose-400 hover:text-rose-500 transition-all cursor-pointer"
                            title="Remove SLO Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB #2 CONTENT: SLO ADMIN CONSOLE (RECORDS)          */}
      {/* ---------------------------------------------------- */}
      {activeSupportTab === 'admin' && (
        <div className="space-y-6">
          
          {/* SEARCH & FILTER CONTROLS IN THE SAME ROW */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200 shadow-3xs'} space-y-4`}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Search query (6/12 columns) */}
              <div className="md:col-span-6 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agreements by product name, SKU, contact, SLO details..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-hidden transition-all ${
                    isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white focus:border-purple-600' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-600'
                  }`}
                />
              </div>

              {/* Filter by Product SKU (3/12 columns) */}
              <div className="md:col-span-3 flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-gray-400 shrink-0" />
                <CustomSelect
                  value={filterSku}
                  onChange={val => setFilterSku(val)}
                  options={[
                    { value: "ALL", label: "All Product SKUs" },
                    ...products.map(p => ({ value: p.sku, label: `${p.sku} (${p.name})` }))
                  ]}
                  isDark={isDark}
                />
              </div>

              {/* Filter by B&J Customer (3/12 columns) */}
              <div className="md:col-span-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                <CustomSelect
                  value={filterCustomer}
                  onChange={val => setFilterCustomer(val)}
                  options={[
                    { value: "ALL", label: "All Clients (Portfolio)" },
                    ...customers.map(c => ({ value: c.id, label: c.name }))
                  ]}
                  isDark={isDark}
                />
              </div>

            </div>
          </div>

          {/* SUPPORT AGREEMENTS GRID DATA-TABLE */}
          {filteredRecords.length === 0 ? (
            <div className={`p-12 text-center rounded-xl border ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200 shadow-2xs'}`}>
              <ShieldAlert className="w-10 h-10 mx-auto text-purple-600/80 mb-3" />
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                No Product Support Agreements Found
              </h4>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                No support parameters match the search queries. Try resetting the SKU or client portfolio filters or add a new support agreement profile.
              </p>
            </div>
          ) : (
            <div className={`border rounded-2xl overflow-hidden ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200 shadow-2xs'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[10px] font-mono uppercase tracking-wider border-b ${isDark ? 'bg-gray-900/60 border-gray-800 text-gray-400' : 'bg-slate-50/70 border-slate-100 text-slate-500'}`}>
                      <th className="px-5 py-4 font-extrabold">Product Details</th>
                      <th className="px-5 py-4 font-extrabold">Severity Commit</th>
                      <th className="px-5 py-4 font-extrabold">Response SLO Target</th>
                      <th className="px-5 py-4 font-extrabold">Coverage Hours</th>
                      <th className="px-5 py-4 font-extrabold">Lead Tech Contact</th>
                      <th className="px-5 py-4 font-extrabold text-center">Portfolio Clients</th>
                      <th className="px-5 py-4 font-extrabold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-xs">
                    {filteredRecords.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-900/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <span className={`font-black text-sm block ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {record.productName}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 bg-purple-600/10 px-2 py-0.2 rounded-sm inline-block">
                              SKU: {record.productSku}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            record.severityLevel.startsWith('P1') 
                              ? 'bg-rose-500/15 text-rose-500' 
                              : record.severityLevel.startsWith('P2') 
                              ? 'bg-amber-500/15 text-amber-500' 
                              : 'bg-purple-600/15 text-[rgb(10,115,115)]'
                          }`}>
                            {record.severityLevel}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-purple-600">
                          {record.responseTime}
                        </td>
                        <td className="px-5 py-4 font-mono text-gray-500">
                          {record.coverageHours}
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <span className={`font-bold block ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{record.supportContactName}</span>
                            <span className="text-[10px] text-gray-400 font-mono block">{record.supportContactEmail}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => openPortfolioEditor(record)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold border transition-all cursor-pointer ${
                              isDark 
                                ? 'bg-slate-800 hover:bg-slate-700/80 text-teal-400 border-slate-700/60' 
                                : 'bg-slate-100 hover:bg-slate-200/80 text-purple-600 border-slate-200'
                            }`}
                          >
                            <span>👤 {record.customerIds.length} Clients</span>
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedRecordDetail(record)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                isDark 
                                  ? 'border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white bg-slate-900/40' 
                                  : 'border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-700 bg-white shadow-2xs'
                              }`}
                            >
                              <Info className="w-3.5 h-3.5 text-blue-500" />
                              <span>Details</span>
                            </button>
                            <button
                              onClick={() => openEditRecordModal(record)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                isDark 
                                  ? 'border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white bg-slate-900/40' 
                                  : 'border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-700 bg-white shadow-2xs'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-1.5 rounded-lg border border-transparent hover:bg-rose-500/10 text-rose-400 hover:text-rose-500 transition-all cursor-pointer"
                              title="Delete Support Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SECTION: SLO STRATEGY & TOOLING DISCUSSION PANEL     */}
      {/* ---------------------------------------------------- */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200 shadow-2xs'} space-y-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800 border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
              <Settings className="w-5 h-5 text-purple-600" />
              <span>SLO Strategy & Tooling Reference</span>
            </h3>
            <p className="text-xs text-gray-400">
              Interactive sandbox representing discussion points regarding Service Level Objectives vs Agreements, simple support tiers, and system escalations.
            </p>
          </div>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-600/15 text-[rgb(10,115,115)]">Interactive Discussion Tool</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* VOCABULARY AND MODEL COMPARISON (6 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[10px] font-extrabold uppercase font-mono text-gray-500 tracking-wider block">Vocabulary & Core Support Models</span>
            
            {/* Vocabulary Toggles */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setActiveVocabComparison('slo')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeVocabComparison === 'slo' 
                    ? 'bg-purple-600 text-white shadow-xs' 
                    : 'text-gray-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Service Level Objective (SLO)
              </button>
              <button
                onClick={() => setActiveVocabComparison('sla')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeVocabComparison === 'sla' 
                    ? 'bg-purple-600 text-white shadow-xs' 
                    : 'text-gray-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Service Level Agreement (SLA)
              </button>
            </div>

            {/* Explanation box */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-black/20 border-gray-800' : 'bg-slate-50/50 border-slate-100'}`}>
              {activeVocabComparison === 'slo' ? (
                <div className="space-y-2">
                  <h5 className="font-extrabold text-purple-600 uppercase tracking-wider text-[10px]">💡 Less Strict Internal Metric Target</h5>
                  <p className="text-gray-500 dark:text-gray-300">
                    An <strong>SLO</strong> is a target metric that support teams aim to achieve to maintain customer satisfaction (e.g., responding to high-priority issues within 2 hours). It serves as a performance metric without immediate legal penalties, keeping response tracking flexible and team-driven.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
                    <Check className="w-4 h-4" /> Recommended for baseline support operations and standard software.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h5 className="font-extrabold text-indigo-500 uppercase tracking-wider text-[10px]">⚖️ More Strict External Legal Commitment</h5>
                  <p className="text-gray-500 dark:text-gray-300">
                    An <strong>SLA</strong> is the legally binding contract between the provider and customer outlining services provided, priority tiers, and crucially, <strong>financial or contractual penalties</strong> (e.g., service credits) if commitments are breached.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400">
                    <Check className="w-4 h-4" /> Imposed on custom enterprise agreements for high-risk core cloud compute modules.
                  </div>
                </div>
              )}
            </div>

            {/* The 2-Tiers Support description */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-100'} space-y-2.5`}>
              <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider block">Streamlined 2x Tier Model Standard</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-black text-slate-800 dark:text-white block">🥇 Gold Model</span>
                  <p className="text-gray-400 text-[11px] leading-tight">24/7/365 coverage with 2-4 hours response commitments and direct phone access.</p>
                </div>
                <div className="space-y-1">
                  <span className="font-black text-slate-800 dark:text-white block">🥈 Standard Model</span>
                  <p className="text-gray-400 text-[11px] leading-tight">Business-hours only coverage (M-F 9AM-5PM) with similar 4-8 hour response windows.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SUPPORT TOOLINGS SPECIFICATION (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[10px] font-extrabold uppercase font-mono text-gray-500 tracking-wider block">Modern AI & Support Tooling Stack Options</span>

            {/* Tool selectors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'portal', label: 'Customer Portal AI', icon: Bot },
                { id: 'voice', label: 'Voice AI Agent', icon: PhoneCall },
                { id: 'escalation', label: 'Escalation Alerting', icon: Zap },
                { id: 'direct', label: 'Direct Slack Line', icon: MessageSquare }
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveToolTab(tool.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                    activeToolTab === tool.id 
                      ? 'border-purple-600 bg-purple-600/5 text-purple-600' 
                      : 'border-slate-100 dark:border-gray-800 text-gray-500 hover:border-slate-300 dark:hover:border-gray-700'
                  }`}
                >
                  <tool.icon className={`w-4 h-4 ${activeToolTab === tool.id ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className="font-bold text-[10px] leading-none">{tool.label}</span>
                  <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${toolsActiveState[tool.id as keyof typeof toolsActiveState] ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                </button>
              ))}
            </div>

            {/* Interactive Tool Configuration Settings */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-black/20 border-gray-800' : 'bg-slate-50/50 border-slate-100'} space-y-4 text-xs`}>
              {activeToolTab === 'portal' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-extrabold text-slate-900 dark:text-white">Generative AI Agent in Customer Portal</h5>
                      <p className="text-[10px] text-gray-500">Automated triage, zero-touch ticket routing & resolution drafting</p>
                    </div>
                    <button
                      onClick={() => toggleSupportTool('portal')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        toolsActiveState.portal 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {toolsActiveState.portal ? '● ENABLED' : '○ DEACTIVATED'}
                    </button>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl space-y-2 border dark:border-gray-800">
                    <p className="text-[11px] text-gray-400">
                      Integrates Gemini API pipelines with incoming Jira / Zendesk service queues. If enabled, the AI acts as Tier-0 responder instantly.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono">
                      <div>
                        <span className="text-gray-400 block">AI Confidence Treshold:</span>
                        <span className="font-bold text-slate-800 dark:text-white">85% Match</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Auto-Response SLA limit:</span>
                        <span className="font-bold text-purple-600">&lt; 2 Minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeToolTab === 'voice' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-extrabold text-slate-900 dark:text-white">Inbound Voice AI Agent Support Option</h5>
                      <p className="text-[10px] text-gray-500">Telephony voice-agent answering hotline instantly for P1 queues</p>
                    </div>
                    <button
                      onClick={() => toggleSupportTool('voice')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        toolsActiveState.voice 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {toolsActiveState.voice ? '● ENABLED' : '○ DEACTIVATED'}
                    </button>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl space-y-2 border dark:border-gray-800">
                    <p className="text-[11px] text-gray-400">
                      Dedicated VOIP SIP trunks connected to active AI transcription and text-to-speech pipelines. Automatically alerts SRE on call if confidence checks pass.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono">
                      <div>
                        <span className="text-gray-400 block">Voice AI Phone Hotline:</span>
                        <span className="font-bold text-purple-600">+1 (800) 555-RCER (7237)</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Backup Escalation Path:</span>
                        <span className="font-bold text-slate-800 dark:text-white">On-Call Duty SRE</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeToolTab === 'escalation' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-extrabold text-slate-900 dark:text-white">Escalation Tooling Integration (Opsgenie / PagerDuty)</h5>
                      <p className="text-[10px] text-gray-500">Automated scheduling, on-call rotation routing and SMS/phone paging</p>
                    </div>
                    <button
                      onClick={() => toggleSupportTool('escalation')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        toolsActiveState.escalation 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {toolsActiveState.escalation ? '● ENABLED' : '○ DEACTIVATED'}
                    </button>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl space-y-2 border dark:border-gray-800">
                    <p className="text-[11px] text-gray-400">
                      Dispatches telemetry logs, ping exceptions and manual alerts directly to rotating engineers on-call via automated PagerDuty/Opsgenie API webhooks.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono">
                      <div>
                        <span className="text-gray-400 block">Opsgenie Webhook Target:</span>
                        <span className="font-bold text-slate-800 dark:text-white">api.opsgenie.com/v1/racer-incidents</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Auto-Escalation Interval:</span>
                        <span className="font-bold text-purple-600">10 Minutes to SRE Director</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeToolTab === 'direct' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-extrabold text-slate-900 dark:text-white">Direct Enterprise Slack Connect Support</h5>
                      <p className="text-[10px] text-gray-500">Dedicated shared Slack channels for Gold/VIP contracts</p>
                    </div>
                    <button
                      onClick={() => toggleSupportTool('direct')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        toolsActiveState.direct 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {toolsActiveState.direct ? '● ENABLED' : '○ DEACTIVATED'}
                    </button>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl space-y-2 border dark:border-gray-800">
                    <p className="text-[11px] text-gray-400">
                      Creates dedicated Slack/MS Teams shared channels directly mapping customer support groups to B&J cloud solutions engineers.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono">
                      <div>
                        <span className="text-gray-400 block">Slack Integration Hook:</span>
                        <span className="font-bold text-purple-600">slack.com/services/racer-direct</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Active VIP Channels count:</span>
                        <span className="font-bold text-slate-800 dark:text-white">4 Shared Channels</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION: AUDIT LOG DISPLAY                           */}
      {/* ---------------------------------------------------- */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200 shadow-2xs'} space-y-4`}>
        <div className="flex justify-between items-center border-b dark:border-gray-800 border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-extrabold flex items-center gap-2">
              <FileCheck2 className="w-4.5 h-4.5 text-purple-600" />
              <span>Product Support Screen Audit Trail</span>
            </h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Real-time record tracking changes made to SLO Profiles, Support Agreements and mapped client portfolios.</p>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">Status: Connected to Log Store</span>
        </div>
        <div className="space-y-3.5 max-h-48 overflow-y-auto pr-2">
          {auditLogs.filter(log => log.screen === 'Support').length === 0 ? (
            <p className="text-xs text-gray-500 italic">No support-related audit logs registered in this session. Modifying configurations will produce logging metadata instantly.</p>
          ) : (
            auditLogs.filter(log => log.screen === 'Support').map(log => (
              <div key={log.id} className="flex gap-4 text-[11px] leading-relaxed pb-3 border-b border-slate-100 dark:border-gray-800 last:border-0 last:pb-0">
                <span className="text-gray-400 font-mono shrink-0 select-none">[{log.timestamp}]</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-extrabold text-purple-600">{log.action}</span>
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

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT SLO PROFILE (TIERS)             */}
      {/* ---------------------------------------------------- */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsTierModalOpen(false)}></div>
          <div className={`relative w-full max-w-lg rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4 border-b dark:border-gray-800 border-slate-100 pb-3">
              <h3 className="font-extrabold text-base">
                {editingTier ? `Modify Mapped ${editingTier.name} SLO Parameters` : 'Create New Custom Support SLO Profile'}
              </h3>
              <button onClick={() => setIsTierModalOpen(false)} className="p-1 rounded-lg hover:bg-black/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTierSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold">SLO Profile / Support Model Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Gold Support Model, Silver Priority Model..."
                  value={tierName} 
                  onChange={e => setTierName(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Response SLO Commitment</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 2-4 Hours (P1-P2)"
                    value={tierResponseTime} 
                    onChange={e => setTierResponseTime(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Coverage Hours Target</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 24/7/365 Continuous, Business Hours Only..."
                    value={tierCoverageHours} 
                    onChange={e => setTierCoverageHours(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold block mb-1">Allowed Access Delivery Channels</label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border dark:border-gray-800 border-slate-100">
                  {['Direct VIP Hotline', 'Priority Support Portal', 'Slack Dedicated Channel', 'Email Ticketing Queue', 'Help Center Forums'].map(chan => {
                    const isSelected = tierChannels.includes(chan);
                    return (
                      <label key={chan} className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleTierChannelToggle(chan)}
                          className="rounded-sm border-slate-300 text-black focus:ring-purple-600 cursor-pointer"
                        />
                        <span className="text-[11px]">{chan}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-3 dark:border-gray-800 border-slate-100 space-y-3">
                <h4 className="font-extrabold text-purple-600 uppercase tracking-wider text-[10px]">Premium Specifications</h4>
                
                <div className="space-y-1">
                  <label className="font-bold">Max Concurrent Monthly Allowed Tickets</label>
                  <input 
                    type="number" 
                    required
                    value={tierMaxTickets} 
                    onChange={e => setTierMaxTickets(parseInt(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md">
                    <input 
                      type="checkbox" 
                      checked={tierDirectPhoneAccess}
                      onChange={e => setTierDirectPhoneAccess(e.target.checked)}
                      className="rounded-sm border-slate-300 text-black focus:ring-purple-600 cursor-pointer"
                    />
                    <span className="font-bold">Direct Phone Hotline Option</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md">
                    <input 
                      type="checkbox" 
                      checked={tierDedicatedLiaison}
                      onChange={e => setTierDedicatedLiaison(e.target.checked)}
                      className="rounded-sm border-slate-300 text-black focus:ring-purple-600 cursor-pointer"
                    />
                    <span className="font-bold">Dedicated On-Call SRE</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Additional Notes & Definitions</label>
                <textarea 
                  value={tierNotes} 
                  onChange={e => setTierNotes(e.target.value)}
                  placeholder="Enter support program details, on-call alert rotations, SRE escalations..."
                  rows={3}
                  className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 text-xs border-t dark:border-gray-800 border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsTierModalOpen(false)}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT PRODUCT SUPPORT AGREEMENT       */}
      {/* ---------------------------------------------------- */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsRecordModalOpen(false)}></div>
          <div className={`relative w-full max-w-2xl rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4 border-b dark:border-gray-800 border-slate-100 pb-3">
              <h3 className="font-extrabold text-base">
                {editingRecord ? `Modify Support Agreement: ${editingRecord.productName}` : 'Add Product Support SLO Configuration'}
              </h3>
              <button onClick={() => setIsRecordModalOpen(false)} className="p-1 rounded-lg hover:bg-black/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs overflow-y-auto max-h-[75vh] pr-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Select Mapped Product Model</label>
                  <CustomSelect
                    value={recordProductId}
                    onChange={handleProductSelect}
                    options={products.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                    isDark={isDark}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Severity Commit Target</label>
                  <CustomSelect
                    value={recordSeverity}
                    onChange={(val) => setRecordSeverity(val as any)}
                    options={[
                      { value: 'P1 - Critical', label: 'P1 - Critical Uptime Failures' },
                      { value: 'P2 - High', label: 'P2 - High Degradation Alerts' },
                      { value: 'P3 - Medium', label: 'P3 - Moderate Ticket SLA' },
                      { value: 'P4 - Low', label: 'P4 - Cosmetic / Low Urgency' }
                    ]}
                    isDark={isDark}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Response SLO Target</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 15 mins (P1), 2 hours (P2)"
                    value={recordResponseTime} 
                    onChange={e => setRecordResponseTime(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Coverage Window Hours</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 24/7/365 Continuous, Business Hours Only"
                    value={recordCoverage} 
                    onChange={e => setRecordCoverage(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Service Level Objectives Details</label>
                <textarea 
                  value={recordSloDetails} 
                  onChange={e => setRecordSloDetails(e.target.value)}
                  required
                  rows={2}
                  placeholder="Specify system performance targets, uptime guarantees, database parities..."
                  className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="p-4 rounded-xl border dark:border-gray-800 border-slate-100 space-y-3 bg-slate-50/40 dark:bg-black/10">
                <h4 className="font-extrabold text-purple-600 uppercase tracking-wider text-[10px]">Technical SRE Lead Contact Details</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Miles Dyson"
                      value={recordContactName} 
                      onChange={e => setRecordContactName(e.target.value)}
                      className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="+1 (555) 000-0000"
                      value={recordContactPhone} 
                      onChange={e => setRecordContactPhone(e.target.value)}
                      className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. m.dyson@cyberdyne.io"
                      value={recordContactEmail} 
                      onChange={e => setRecordContactEmail(e.target.value)}
                      className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Workflow Escalation Steps Builder */}
              <div className="space-y-2">
                <label className="font-bold block">Incident Escalation Workflow Steps</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={recordWorkflowInput}
                    onChange={e => setRecordWorkflowInput(e.target.value)}
                    placeholder="Enter process step e.g., 'Page On-Call SRE in PagerDuty'"
                    className={`flex-1 p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                  />
                  <button
                    type="button"
                    onClick={handleAddWorkflowStep}
                    className="px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                  >
                    Add Step
                  </button>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pt-2">
                  {recordWorkflowSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-100 dark:bg-gray-800">
                      <span className="font-mono text-[10px] text-gray-500">
                        Step {idx + 1}: <strong className="ml-1 text-slate-800 dark:text-gray-200">{step}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWorkflowStep(idx)}
                        className="text-rose-500 hover:text-rose-400 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {recordWorkflowSteps.length === 0 && (
                    <p className="text-[11px] text-gray-400 italic">No custom escalation workflow steps registered. Standard ticketing queue applies.</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Additional Operational Notes</label>
                <textarea 
                  value={recordNotes} 
                  onChange={e => setRecordNotes(e.target.value)}
                  rows={2}
                  placeholder="Automated monitoring, backup routines, key rotations..."
                  className={`w-full p-2.5 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 text-xs border-t dark:border-gray-800 border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsRecordModalOpen(false)}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold animate-pulse"
                >
                  Save Agreement Console
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: DETAIL VIEW & SLO SIMULATION PANEL (PROFILE)   */}
      {/* ---------------------------------------------------- */}
      {selectedProfileDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedProfileDetail(null)}></div>
          <div className={`relative w-full max-w-2xl rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4 border-b dark:border-gray-800 border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <span>SLO Profile details: {selectedProfileDetail.name}</span>
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Comprehensive commitment specifications and SLA incident simulations.</p>
              </div>
              <button onClick={() => setSelectedProfileDetail(null)} className="p-1 rounded-lg hover:bg-black/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 text-xs overflow-y-auto max-h-[75vh] pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#020617] border-gray-800' : 'bg-slate-50 border-slate-100'} space-y-2`}>
                  <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Committed Performance Target</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-gray-400 block">Response Target:</span>
                      <strong className="text-slate-800 dark:text-white">{selectedProfileDetail.responseTime}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Coverage Window:</span>
                      <strong className="text-slate-800 dark:text-white">{selectedProfileDetail.coverageHours}</strong>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#020617] border-gray-800' : 'bg-slate-50 border-slate-100'} space-y-2`}>
                  <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Premium Access Allocations</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-gray-400 block">Max Monthly Tickets:</span>
                      <strong className="text-slate-800 dark:text-white">{selectedProfileDetail.maxTickets === 999 ? '∞ Unlimited' : selectedProfileDetail.maxTickets}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">VIP Hotline access:</span>
                      <strong className="text-slate-800 dark:text-white">{selectedProfileDetail.directPhoneAccess ? '✅ Enabled' : '❌ Disabled'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Delivery Channels list */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Active Authorized Delivery Channels</span>
                <div className="flex flex-wrap gap-2">
                  {selectedProfileDetail.channels.map((chan, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-md font-bold font-mono">
                      🌐 {chan}
                    </span>
                  ))}
                </div>
              </div>

              {selectedProfileDetail.notes && (
                <div className={`p-3 rounded-lg border ${isDark ? 'bg-black/10 border-gray-800 text-gray-300' : 'bg-slate-50 border-slate-100 text-slate-600'} italic`}>
                  Notes: {selectedProfileDetail.notes}
                </div>
              )}

              {/* ACTIVE SLO incident simulator widget */}
              <div className="p-4 rounded-xl border border-purple-600/20 bg-purple-600/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Simulate SLA Incident response routing</span>
                  <span className="text-[9px] text-gray-400 font-mono">Select incident severity tier</span>
                </div>
                
                <div className="flex gap-2">
                  {['P1', 'P2', 'P3', 'P4'].map(sev => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSimulationSeverity(sev as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        simulationSeverity === sev 
                          ? 'bg-purple-600 text-white shadow-xs' 
                          : 'bg-white dark:bg-gray-900 border dark:border-gray-800 text-gray-500 hover:text-slate-700'
                      }`}
                    >
                      {sev === 'P1' ? '🔴 P1 Critical' : sev === 'P2' ? '🟡 P2 High' : sev === 'P3' ? '🔵 P3 Medium' : '🟢 P4 Low'}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => runSloSimulation(selectedProfileDetail)}
                    className="ml-auto px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Run Test</span>
                  </button>
                </div>

                {simulationResult && (
                  <div className="p-3 bg-white dark:bg-gray-950 rounded-lg border border-purple-600/20 font-mono text-[11px] leading-relaxed animate-fade-in text-slate-800 dark:text-gray-200">
                    {simulationResult}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end border-t dark:border-gray-800 border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProfileDetail(null);
                    setSimulationResult(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-bold ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}
                >
                  Close Reference Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: DETAIL VIEW (PRODUCT AGREEMENT RECORD)       */}
      {/* ---------------------------------------------------- */}
      {selectedRecordDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedRecordDetail(null)}></div>
          <div className={`relative w-full max-w-2xl rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4 border-b dark:border-gray-800 border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base">
                  Agreement Details: {selectedRecordDetail.productName} Support SLO
                </h3>
                <span className="text-[10px] font-mono text-gray-400 bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-sm">SKU: {selectedRecordDetail.productSku}</span>
              </div>
              <button onClick={() => setSelectedRecordDetail(null)} className="p-1 rounded-lg hover:bg-black/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 text-xs overflow-y-auto max-h-[75vh] pr-1">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Committed details & workflows (8 cols) */}
                <div className="md:col-span-8 space-y-4">
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#020617] border-gray-800' : 'bg-slate-50 border-slate-100'} space-y-2`}>
                    <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider block">Service Level Objectives & Agreements</span>
                    <p className={`text-xs font-bold leading-relaxed ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedRecordDetail.sloDetails}</p>
                    <div className="pt-2 flex items-center gap-3 font-mono text-[10px]">
                      <span className="text-gray-400">Response Target:</span>
                      <strong className="text-purple-600">{selectedRecordDetail.responseTime}</strong>
                    </div>
                  </div>

                  {/* Operational workflow escalation steps */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Committed incident workflow escalation path</span>
                    <div className="flex flex-col gap-2">
                      {selectedRecordDetail.supportWorkflow.map((step, idx) => (
                        <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-xl border ${isDark ? 'bg-black/10 border-gray-800' : 'bg-slate-50/50 border-slate-100'}`}>
                          <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-slate-700 dark:text-gray-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SRE contact and mapped accounts (4 cols) */}
                <div className="md:col-span-4 space-y-4">
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#020617] border-gray-800' : 'bg-slate-50 border-slate-100'} space-y-3`}>
                    <span className="text-[10px] uppercase font-bold text-indigo-500 block tracking-wider">Primary technical SRE Lead</span>
                    <div className="space-y-2 font-mono text-[11px]">
                      <strong className="text-slate-800 dark:text-white font-sans text-xs">👤 {selectedRecordDetail.supportContactName}</strong>
                      <a href={`tel:${selectedRecordDetail.supportContactPhone}`} className="flex items-center gap-1.5 text-gray-400 hover:text-purple-600">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{selectedRecordDetail.supportContactPhone}</span>
                      </a>
                      <a href={`mailto:${selectedRecordDetail.supportContactEmail}`} className="flex items-center gap-1.5 text-gray-400 hover:text-purple-600 truncate">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{selectedRecordDetail.supportContactEmail}</span>
                      </a>
                    </div>
                  </div>

                  {/* Portfolio client mapping */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Mapped Client Accounts ({selectedRecordDetail.customerIds.length})</span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedRecordDetail.customerIds.map(id => {
                        const cust = customers.find(c => c.id === id);
                        return (
                          <div key={id} className="flex items-center gap-2 p-1.5 rounded bg-slate-100 dark:bg-gray-800/60 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="truncate">{cust ? cust.name : id}</span>
                          </div>
                        );
                      })}
                      {selectedRecordDetail.customerIds.length === 0 && (
                        <p className="text-[10px] text-gray-400 italic">No enterprise tenants mapped to this support program portfolio.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedRecordDetail.notes && (
                <div className={`p-3 rounded-lg border ${isDark ? 'bg-black/10 border-gray-800 text-gray-300' : 'bg-slate-50 border-slate-100 text-slate-600'} italic`}>
                  Additional Notes: {selectedRecordDetail.notes}
                </div>
              )}

              <div className="pt-4 flex justify-end border-t dark:border-gray-800 border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRecordDetail(null)}
                  className={`px-4 py-2 rounded-lg font-bold ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}
                >
                  Close Agreement Info
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: PORTFOLIO CLIENT ASSOCIATOR                    */}
      {/* ---------------------------------------------------- */}
      {isPortfolioModalOpen && portfolioRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsPortfolioModalOpen(false)}></div>
          <div className={`relative w-full max-w-lg rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-3 border-b dark:border-gray-800 border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base">
                  Manage Support Portfolio Clients
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Map Enterprise Tenants authorized to claim service level coverage targets.</p>
              </div>
              <button onClick={() => setIsPortfolioModalOpen(false)} className="p-1 rounded-lg hover:bg-black/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs pt-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Select Authorized Clients Portfolio</span>
              
              <div className="space-y-2 border dark:border-gray-800 border-slate-100 rounded-xl p-3 max-h-60 overflow-y-auto">
                {customers.map(cust => {
                  const isChecked = portfolioCustomerIds.includes(cust.id);
                  return (
                    <label 
                      key={cust.id} 
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-purple-600/10 text-purple-600 font-bold' 
                          : 'hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => togglePortfolioCustomer(cust.id)}
                          className="rounded-sm border-slate-300 text-black focus:ring-purple-600 cursor-pointer"
                        />
                        <span>{cust.name}</span>
                      </div>
                      <span className="font-mono text-[9px] uppercase bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">
                        {cust.supportTier}
                      </span>
                    </label>
                  );
                })}
                {customers.length === 0 && (
                  <p className="text-center py-4 text-gray-500 italic">No enterprise customer profiles exist. Register customers first.</p>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 text-xs border-t dark:border-gray-800 border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsPortfolioModalOpen(false)}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={savePortfolioMapping}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  Save Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
