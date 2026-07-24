import React, { useState, useMemo } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  Laptop, 
  Building2, 
  CircleDollarSign, 
  BookOpen, 
  ShieldAlert, 
  Globe, 
  ArrowRight, 
  CornerDownRight, 
  Layers, 
  GitFork, 
  Zap, 
  Info, 
  FileText,
  Key,
  Printer,
  Share2,
  Search,
  CheckCircle2,
  Database,
  Cpu,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  Download,
  Copy,
  Check,
  Terminal,
  Play
} from 'lucide-react';
import { AdminUser, Product, Customer, Contract, DocItem, SupportTierInfo, License } from '../types';

interface SiteMapTabProps {
  isDark: boolean;
  t: Record<string, string>;
  onNavigate: (tab: 'home' | 'dashboard' | 'users' | 'products' | 'licenses' | 'customers' | 'billing' | 'documentation' | 'support' | 'sitemap') => void;
  // Optional dynamic database states for live auto-updating documentation
  users?: AdminUser[];
  products?: Product[];
  customers?: Customer[];
  contracts?: Contract[];
  documents?: DocItem[];
  supportTiers?: SupportTierInfo[];
  licenses?: License[];
}

export default function SiteMapTab({ 
  isDark, 
  t, 
  onNavigate,
  users = [],
  products = [],
  customers = [],
  contracts = [],
  documents = [],
  supportTiers = [],
  licenses = []
}: SiteMapTabProps) {
  // Sub-tabs for Site Map view
  const [activeSubTab, setActiveSubTab] = useState<'sitemap' | 'document'>('sitemap');
  
  // Document portal active section
  const [activeDocSection, setActiveDocSection] = useState<string>('intro');
  // Search query within documentation
  const [docSearchQuery, setDocSearchQuery] = useState<string>('');

  // Interactive copy state
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  // Smooth scroll and highlighted state
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  // Live Query Tester Playground states
  const [activeQuery, setActiveQuery] = useState<string>('SELECT_PRODUCTS');
  const [queryExecuting, setQueryExecuting] = useState<boolean>(false);

  // Function to execute copy to clipboard
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  // Section click with smooth scrolling and no bookmark highlighting
  const handleSectionClick = (secId: string) => {
    setDocSearchQuery(''); // clear query to show all elements
    setActiveDocSection(secId);
    
    setTimeout(() => {
      const element = document.getElementById(`sec-${secId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Helper to get custom class names for the interactive document cards
  const getSectionClassName = (secId: string) => {
    return `p-6 md:p-8 rounded-2xl border transition-all duration-300 mb-8 relative scroll-mt-28 ${
      isDark 
        ? 'bg-[#1A1D23] border-[#2D333D]' 
        : 'bg-white border-slate-200 shadow-xs'
    }`;
  };

  // Active section scroll spy tracking
  React.useEffect(() => {
    if (activeSubTab !== 'document') return;

    const handleScroll = () => {
      const sectionIds = ['intro', 'design', 'theme', 'modules', 'workflows', 'schema', 'registry'];
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      
      let activeSec = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(`sec-${id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const topOfElement = rect.top + window.scrollY;
          // Offset threshold of 150px aligns nicely with the sticky header
          if (scrollPosition >= topOfElement - 150) {
            activeSec = id;
          }
        }
      }
      setActiveDocSection(activeSec);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSubTab]);

  // Define sitemap map nodes representing each tab and its primary workflows
  const navigationNodes = [
    {
      id: 'home' as const,
      title: t.home || 'Home',
      category: 'Overview & Monitoring',
      icon: Home,
      iconColor: 'text-amber-500 bg-amber-500/10',
      description: 'The administrative command center and default landing board.',
      workflows: [
        'Displays high-level operational statistics (Active Products, Total Customers, Projected Contract Revenue)',
        'Embeds "Quick Links" to instantly spawn creation modas on other tabs (Add User, Customer, Product, Contract)',
        'Shows recent system activity and monthly/annual financial projections'
      ]
    },
    {
      id: 'dashboard' as const,
      title: t.dashboard || 'Dashboard',
      category: 'Overview & Monitoring',
      icon: LayoutDashboard,
      iconColor: 'text-[rgb(14,145,145)] bg-[rgb(14,145,145)]/10',
      description: 'Analytics, registration trends, and dual-mode data subtabs.',
      workflows: [
        'Hosts interactive "Total Users Trend Analysis" using dynamic date filter boundaries',
        'Includes a dual-mode Admin Console (switchable between Users Admin table and Customers List)',
        'Tracks platform licenses and provides direct revenue audit trails'
      ]
    },
    {
      id: 'users' as const,
      title: t.users || 'Users',
      category: 'Enterprise Admin',
      icon: Users,
      iconColor: 'text-purple-500 bg-purple-500/10',
      description: 'Granular user credential and authentication directory.',
      workflows: [
        'Differentiates between internal Admin Users and client-facing Customer Users',
        'Enables CRUD actions (Add, Edit, Delete) and active/blocked status toggles',
        'Configures custom authentication types (SSO provider setup vs Local credentials)'
      ]
    },
    {
      id: 'products' as const,
      title: t.products || 'Product Admin',
      category: 'Enterprise Admin',
      icon: Laptop,
      iconColor: 'text-emerald-500 bg-emerald-500/10',
      description: 'Software catalog, binaries, and version configuration.',
      workflows: [
        'Registers product units with unique SKUs, price tiers, and families',
        'Uploads and maps product binary files (executable packages) to specific product versions',
        'Filters products by target customer companies for tailored distribution'
      ]
    },
    {
      id: 'licenses' as const,
      title: t.contracts || 'Licensing',
      category: 'Enterprise Admin',
      icon: Key,
      iconColor: 'text-blue-500 bg-blue-500/10',
      description: 'Issue, edit, block, unlock, and manage enterprise cryptographic license keys and SLA renewal correspondence.',
      workflows: [
        'Issues new high-fidelity license keys mapped to specific tenant corporate organizations and product family SKUs',
        'Blocks or unlocks existing license keys immediately to revoke or grant platform access rights',
        'Generates automated, pre-populated SLA renewal email correspondence sent directly to authorized company contacts'
      ]
    },
    {
      id: 'customers' as const,
      title: t.customers || 'Customer Admin',
      category: 'Enterprise Admin',
      icon: Building2,
      iconColor: 'text-cyan-500 bg-cyan-500/10',
      description: 'Enterprise company portfolio and direct parent-child sub-entities.',
      workflows: [
        'Manages company meta-information (Billing, Technical support contacts, active statuses)',
        'Builds hierarchical sub-entity relationships (parent organizations for sub-entities)',
        'Links directly to Billing & Usage with pre-selected customer state filtering'
      ]
    },
    {
      id: 'billing' as const,
      title: t.billing || 'Audits',
      category: 'Enterprise Admin',
      icon: CircleDollarSign,
      iconColor: 'text-rose-500 bg-rose-500/10',
      description: 'License allocation terms, active instances, and audit graphs.',
      workflows: [
        'Tracks contract durations (Start and End Dates) with automatic term month math',
        'Monitors active vs purchased hardware/license units per customer',
        'Displays "Financial Cost Analysis" charting monthly license fees against contract totals'
      ]
    },
    {
      id: 'documentation' as const,
      title: t.documentation || 'Documentation',
      category: 'Support & Assets',
      icon: BookOpen,
      iconColor: 'text-[rgb(14,145,145)] bg-[rgb(14,145,145)]/10',
      description: 'Product manuals, help desks, and targeted guide publishing.',
      workflows: [
        'Categories documentation items (Product Documentation vs Support Documentation)',
        'Restricts manual access to specific target customers or specific associated products',
        'Supports file publishing state toggles (Draft vs Published)'
      ]
    },
    {
      id: 'support' as const,
      title: t.support || 'Product Support',
      category: 'Support & Assets',
      icon: ShieldAlert,
      iconColor: 'text-red-500 bg-red-500/10',
      description: 'Service level agreements, coverage hours, and support channels.',
      workflows: [
        'Configures support SLAs (Racer TM Copper, Silver, and Gold tiers)',
        'Maintains direct-line help numbers and dedicated client relations',
        'Toggles maximum allowed monthly tickets and coverage hours limits'
      ]
    }
  ];

  const adminCrossCuttingWorkflows = [
    {
      title: 'License Tenant Cross-Redirection Handshake',
      description: 'From the Product Licenses catalog table, clicking any corporate tenant name or authorized contact details instantly redirects you to the main Customer Admin workspace with that customer card auto-expanded.',
      steps: ['Product Licenses' , 'Customer Admin (Auto-Selected / Expanded)']
    },
    {
      title: 'Customer to Billing Integration Shortcut',
      description: 'From the Customer Admin tab, clicking the "Billing" link automatically routes to the Billing & Usage view while pre-populating and filtering the workspace for that exact client name.',
      steps: ['Customer Admin' , 'Billing & Usage (Filtered)']
    },
    {
      title: 'Home "Quick Links" Actions Hub',
      description: 'The Home tab serves as an interactive actions board. Clicking "Add New" triggers for users, customers, products, or contracts automatically navigates the admin to the target tab and pre-opens the respective creation modal dialog.',
      steps: ['Home Panel' , 'Target Tab' , 'Auto-Open Creation Modal']
    },
    {
      title: 'Omnipresent Real-time AI Assistant',
      description: 'The floating AI Assistant reads the entire memory database in real-time. Any changes or additions made to Users, Customers, Products, Contracts, or SLAs are instantly synced and queryable through natural language chat.',
      steps: ['Any Admin CRUD Action' , 'State Synced' , 'AI Chatbot Assistant Query']
    },
    {
      title: 'Dynamic Address Autofill & Validation',
      description: 'The Admin Profile Editor includes live address searches. Typing in the address field makes live secure lookups via OpenStreetMap Nominatim, displaying suggestions to autofill location data.',
      steps: ['Open Profile Modal' , 'Type Address' , 'Autofill From Live Nominatim']
    }
  ];

  // Standalone HTML documentation sharing package generator
  const handleShareHTML = () => {
    const formattedSKUs = products.map(p => `"${p.sku}"`).join(', ') || '"SKU-RACER-01", "SKU-RACER-02"';
    const formattedCustomers = customers.map(c => `"${c.name}"`).join(', ') || '"B&J Industries", "Expanse Global"';
    
    const docHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B&J RACER Admin Panel - Digital Documentation Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    h1, h2, h3, h4, h5 {
      font-family: 'Space Grotesk', sans-serif;
    }
    code, pre {
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body class="bg-[#0F1115] text-gray-100 min-h-screen flex flex-col selection:bg-[rgb(14,145,145)]/30 selection:text-white">

  <!-- TOP DECK BAR -->
  <header class="border-b border-[#2D333D] bg-[#1A1D23] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-[rgb(14,145,145)] flex items-center justify-center shadow-md">
        <span class="text-white font-extrabold text-sm">R</span>
      </div>
      <div>
        <h1 class="text-sm font-black tracking-tight text-white leading-none">RACER PANEL DOCS</h1>
        <p class="text-[10px] font-mono text-[rgb(14,145,145)] mt-1 font-bold">docs.expanse.sh • Standalone System Spec</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <span class="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        OFFLINE DOCUMENT RUNBOOK
      </span>
      <button onclick="window.print()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5">
        Export Print / PDF
      </button>
    </div>
  </header>

  <div class="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 p-6 md:p-8">
    
    <!-- LEFT NAVIGATION GUIDE -->
    <aside class="space-y-6 md:sticky md:top-24 h-fit">
      <div class="bg-[#1A1D23] p-4 rounded-xl border border-[#2D333D]">
        <h3 class="text-xs font-bold uppercase tracking-wider text-[rgb(14,145,145)] mb-3">Contents Overview</h3>
        <nav class="space-y-1">
          <a href="#intro" class="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all">1.0 Introduction & Domain</a>
          <a href="#design" class="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all">2.0 Design System Specification</a>
          <a href="#theme" class="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all">3.0 Theme & Locale Swappers</a>
          <a href="#modules" class="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all">4.0 Core Workstation Modules</a>
          <a href="#workflows" class="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all">5.0 Cross-Cutting Workflows</a>
          <a href="#schema" class="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all">6.0 Master DB Schema</a>
          <a href="#registry" class="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all">7.0 Dynamic System Snapshot</a>
        </nav>
      </div>

      <div class="bg-[#1A1D23]/50 p-4 rounded-xl border border-[#2D333D]/60 text-[11px] text-gray-400 space-y-2">
        <p class="font-bold text-white">Dynamic Snapshot Context:</p>
        <div>• Operators Registered: <strong>${users.length}</strong></div>
        <div>• Product Families: <strong>${products.length}</strong></div>
        <div>• Tenant Portfolios: <strong>${customers.length}</strong></div>
        <div>• Cryptographic Keys: <strong>${licenses.length}</strong></div>
      </div>
    </aside>

    <!-- RIGHT MAIN READING PANE -->
    <main class="md:col-span-3 space-y-12">
      
      <!-- INTRO SECTION -->
      <section id="intro" class="scroll-mt-24 space-y-4">
        <h2 class="text-2xl font-black tracking-tight text-white border-b border-[#2D333D] pb-2 flex items-center gap-2">
          <span class="text-[rgb(14,145,145)]">1.0</span> Introduction & Architecture Scope
        </h2>
        <p class="text-sm text-gray-300 leading-relaxed">
          Welcome to the official <strong>RACER Admin Digital Documentation Portal</strong>. Inspired by the strict content management principles and aesthetic spacing of <strong>docs.expanse.sh</strong>, this portal serves as the single source of truth for administrative systems, cryptographic license management, product versioning, multi-tenant databases, and integrated customer SLAs.
        </p>
        <p class="text-sm text-gray-300 leading-relaxed">
          The Racer Admin Panel is built on a modular, lightning-fast architecture. This document details the visual layouts, design pairings, routing structures, database architectures, and cross-cutting workflow matrix used inside the operator dashboard.
        </p>
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl flex gap-3 text-xs leading-relaxed text-slate-400">
          <span class="text-[rgb(14,145,145)] font-bold shrink-0">SYSTEM INFO</span>
          <span>This file is a fully compiled, self-contained HTML snapshot exported directly from the active administrative panel workspace. It contains embedded styling, state tables, and real-time registry measurements.</span>
        </div>
      </section>

      <!-- DESIGN SYSTEM -->
      <section id="design" class="scroll-mt-24 space-y-4">
        <h2 class="text-2xl font-black tracking-tight text-white border-b border-[#2D333D] pb-2 flex items-center gap-2">
          <span class="text-[rgb(14,145,145)]">2.0</span> Design System Specification
        </h2>
        <p class="text-sm text-gray-300 leading-relaxed">
          The visual interface follows a high-fidelity Swiss-modern structure, avoiding standard generic colors in favor of customized high-contrast themes.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 bg-[#1A1D23] rounded-xl border border-[#2D333D] space-y-2">
            <h4 class="text-xs font-black uppercase text-[rgb(14,145,145)]">Typography Specs</h4>
            <ul class="text-xs text-slate-400 space-y-1.5">
              <li>• <strong>Display Headings:</strong> Space Grotesk (Tech-forward, tracking-tight, bold weight)</li>
              <li>• <strong>Body Typography:</strong> Inter (Legible, neutral sans-serif optimized for administrative grids)</li>
              <li>• <strong>Metadata & Code:</strong> JetBrains Mono (Technical data outputs, SKU identifiers, hashes, and schemas)</li>
            </ul>
          </div>
          <div class="p-4 bg-[#1A1D23] rounded-xl border border-[#2D333D] space-y-2">
            <h4 class="text-xs font-black uppercase text-[rgb(14,145,145)]">Layout Standards</h4>
            <ul class="text-xs text-slate-400 space-y-1.5">
              <li>• <strong>Base Grid:</strong> Fluid layout limits with a container width cap of <code>max-w-7xl</code></li>
              <li>• <strong>Borders & Padding:</strong> Double-layered container framing, with rounded corners of <code>rounded-xl</code> (12px) and <code>rounded-2xl</code> (16px)</li>
              <li>• <strong>Interactive Highlights:</strong> Dynamic CSS transitions with micro-scaling actions and hover feedback</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- THEME ENGINE -->
      <section id="theme" class="scroll-mt-24 space-y-4">
        <h2 class="text-2xl font-black tracking-tight text-white border-b border-[#2D333D] pb-2 flex items-center gap-2">
          <span class="text-[rgb(14,145,145)]">3.0</span> Theme Engine & Locale Synchronization
        </h2>
        <p class="text-sm text-gray-300 leading-relaxed">
          The Admin Panel contains a centralized, reactive light/dark theme system and dual translation layers syncing localized assets across languages:
        </p>
        <div class="bg-slate-900/60 border border-[#2D333D] rounded-xl p-4 space-y-3 text-xs text-slate-300">
          <div>
            <span class="font-bold text-white block">A. Dual theme states:</span>
            <p class="text-slate-400 mt-1">
              - <strong>Eye-Safe Dark Canvas:</strong> Low-luminance charcoal base values (<code>#0F1115</code> body, <code>#1A1D23</code> cards, <code>#2D333D</code> lines) with sharp high-contrast slate borders.<br/>
              - <strong>Clean Light Canvas:</strong> Slate-gray base values (<code>#F8FAFC</code> body, <code>#FFFFFF</code> cards, <code>#E2E8F0</code> lines) providing crisp publication-grade interfaces.
            </p>
          </div>
          <div>
            <span class="font-bold text-white block">B. Translation Dictionary:</span>
            <p class="text-slate-400 mt-1">
              Supports dynamic in-memory dictionary swaps across three primary locales: English (EN), French (FR), and Spanish (ES), translating headers, sidebar links, status badges, and action tooltips.
            </p>
          </div>
        </div>
      </section>

      <!-- MODULES -->
      <section id="modules" class="scroll-mt-24 space-y-4">
        <h2 class="text-2xl font-black tracking-tight text-white border-b border-[#2D333D] pb-2 flex items-center gap-2">
          <span class="text-[rgb(14,145,145)]">4.0</span> Core Workstation Modules
        </h2>
        <p class="text-sm text-gray-300 leading-relaxed">
          Racer Admin's operational surface is organized into separate, self-contained functional modules:
        </p>
        <div class="space-y-4 text-xs text-slate-300">
          <div class="p-4 bg-[#1A1D23] rounded-xl border border-[#2D333D]">
            <span class="font-bold text-white block">1. Home Command Center</span>
            <p class="text-slate-400 mt-1">Aggregates global stats, processes active operator logs, calculates monthly/annualized projections, and provides short-path links to create entities immediately.</p>
          </div>
          <div class="p-4 bg-[#1A1D23] rounded-xl border border-[#2D333D]">
            <span class="font-bold text-white block">2. Analytics & Trend Dashboard</span>
            <p class="text-slate-400 mt-1">Integrates dynamic date-range selector filters to update SVG trend charts dynamically. Features dual-mode subtabs to toggle display panels.</p>
          </div>
          <div class="p-4 bg-[#1A1D23] rounded-xl border border-[#2D333D]">
            <span class="font-bold text-white block">3. User & Operator Directory</span>
            <p class="text-slate-400 mt-1">Separates workspace Operators from client-level accounts. Supports SSO credentials configuration versus standard local password mappings.</p>
          </div>
          <div class="p-4 bg-[#1A1D23] rounded-xl border border-[#2D333D]">
            <span class="font-bold text-white block">4. Product & Binary catalog</span>
            <p class="text-slate-400 mt-1">Maintains structural product lines (SKUs, standard pricing tiers) and maps uploaded binary files with computed md5 integrity hashes.</p>
          </div>
          <div class="p-4 bg-[#1A1D23] rounded-xl border border-[#2D333D]">
            <span class="font-bold text-white block">5. Product Licenses Hub</span>
            <p class="text-slate-400 mt-1">Controls the generation, issuance, blocking, or reactivation of cryptographic key strings. Auto-generates SLA renewal email templates.</p>
          </div>
          <div class="p-4 bg-[#1A1D23] rounded-xl border border-[#2D333D]">
            <span class="font-bold text-white block">6. Customer Tenants & Support Contracts</span>
            <p class="text-slate-400 mt-1">Models company accounts, corporate primary contacts, and OIDC domains. Customizes SLA support parameters (Copper, Silver, Gold support models).</p>
          </div>
        </div>
      </section>

      <!-- WORKFLOWS -->
      <section id="workflows" class="scroll-mt-24 space-y-4">
        <h2 class="text-2xl font-black tracking-tight text-white border-b border-[#2D333D] pb-2 flex items-center gap-2">
          <span class="text-[rgb(14,145,145)]">5.0</span> Cross-Cutting Workflow Matrix
        </h2>
        <p class="text-sm text-gray-300 leading-relaxed">
          The panel contains deep-linking handshakes and real-time syncing pipelines to coordinate action across modules:
        </p>
        <div class="space-y-4">
          <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <h5 class="text-xs font-bold text-white">Workflow A: License-to-Tenant Redirection Handshake</h5>
            <p class="text-xs text-slate-400">Clicking any organization name in the Cryptographic License ledger immediately redirects the administrative operator to the main Customer view, pre-expanding and spotlighting that company's contact card.</p>
          </div>
          <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <h5 class="text-xs font-bold text-white">Workflow B: Customer-to-Billing Workspace Mapping</h5>
            <p class="text-xs text-slate-400">Clicking the "Billing" link inside any customer row on the Customer tab pre-fills the Billing module's active filter and redirects the viewport instantly, presenting filtered financial metrics.</p>
          </div>
          <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <h5 class="text-xs font-bold text-white">Workflow C: OSM Nominatim Address Autofill</h5>
            <p class="text-xs text-slate-400">The Profile Settings modal incorporates OpenStreetMap's live reverse-geocoding API. As the admin types an address, secure AJAX lookups pull suggestions to auto-complete physical location fields.</p>
          </div>
        </div>
      </section>

      <!-- DATABASE SCHEMA -->
      <section id="schema" class="scroll-mt-24 space-y-4">
        <h2 class="text-2xl font-black tracking-tight text-white border-b border-[#2D333D] pb-2 flex items-center gap-2">
          <span class="text-[rgb(14,145,145)]">6.0</span> Master Relational Database Schema
        </h2>
        <p class="text-sm text-gray-300 leading-relaxed">
          The following standard SQL statements represent the database tables, OIDC security attributes, and constraints running on the Cloud SQL backend:
        </p>
        <pre class="bg-black/80 text-emerald-400 p-4 rounded-xl border border-slate-800 text-xs overflow-x-auto font-mono">
-- 1. ADMIN USERS DIRECTORY
CREATE TABLE admin_users (
  uuid VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  admin_role VARCHAR(50) DEFAULT 'Customer Operator',
  auth_method VARCHAR(20) DEFAULT 'local', -- local | sso
  sso_provider VARCHAR(50),
  is_admin_user BOOLEAN DEFAULT TRUE,
  create_date DATE NOT NULL
);

-- 2. PRODUCTS REGISTRY
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  family VARCHAR(100) NOT NULL,
  create_date DATE NOT NULL
);

-- 3. CORPORATE CUSTOMER ORGANIZATIONS
CREATE TABLE customers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  address TEXT,
  primary_contact_email VARCHAR(150),
  support_tier VARCHAR(100) DEFAULT 'Standard Support Model',
  parent_id VARCHAR(36) REFERENCES customers(id), -- Hierarchical mapping
  status VARCHAR(20) DEFAULT 'Active' -- Active | Blocked
);

-- 4. CRYPTOGRAPHIC LICENSE LEDGER
CREATE TABLE licenses (
  id VARCHAR(36) PRIMARY KEY,
  license_key VARCHAR(100) UNIQUE NOT NULL,
  customer_id VARCHAR(36) REFERENCES customers(id),
  product_sku VARCHAR(50) REFERENCES products(sku),
  status VARCHAR(20) DEFAULT 'Active', -- Active | Blocked
  expires_at TIMESTAMP NOT NULL
);
</pre>
      </section>

      <!-- DYNAMIC REGISTRY -->
      <section id="registry" class="scroll-mt-24 space-y-4">
        <h2 class="text-2xl font-black tracking-tight text-white border-b border-[#2D333D] pb-2 flex items-center gap-2">
          <span class="text-[rgb(14,145,145)]">7.0</span> Live System Registry Feed
        </h2>
        <p class="text-sm text-gray-300 leading-relaxed">
          This registry pulls measurements and lists variables actively from the B&J Admin database session. Adding or editing items on other panels will cause these rows to update immediately.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 bg-[#1A1D23] rounded-xl border border-[#2D333D]">
            <h4 class="text-xs font-bold text-[rgb(14,145,145)] uppercase mb-3 font-mono">Active Product SKUs</h4>
            <div class="flex flex-wrap gap-2">
              <span class="px-2.5 py-1 bg-slate-800 text-slate-300 font-mono text-[11px] rounded border border-slate-700">SKU-RACER-CORE</span>
              <span class="px-2.5 py-1 bg-slate-800 text-slate-300 font-mono text-[11px] rounded border border-slate-700">SKU-RACER-NET</span>
              <span class="px-2.5 py-1 bg-slate-800 text-slate-300 font-mono text-[11px] rounded border border-slate-700">SKU-RACER-AI</span>
              <span class="px-2.5 py-1 bg-slate-800 text-slate-300 font-mono text-[11px] rounded border border-slate-700">SKU-RACER-DB</span>
            </div>
          </div>
          <div class="p-4 bg-[#1A1D23] rounded-xl border border-[#2D333D]">
            <h4 class="text-xs font-bold text-[rgb(14,145,145)] uppercase mb-3 font-mono">Active Customer Orgs</h4>
            <div class="flex flex-wrap gap-2">
              <span class="px-2.5 py-1 bg-slate-800 text-slate-300 font-mono text-[11px] rounded border border-slate-700">B&J Corp</span>
              <span class="px-2.5 py-1 bg-slate-800 text-slate-300 font-mono text-[11px] rounded border border-slate-700">Expanse Tech</span>
              <span class="px-2.5 py-1 bg-slate-800 text-slate-300 font-mono text-[11px] rounded border border-slate-700">SLA Giants</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <footer class="border-t border-[#2D333D] bg-[#1A1D23] text-center py-6 text-xs text-gray-500 mt-12">
    B&J RACER Administration Panel • Standalone Portal Export. Copyright &copy; ${new Date().getFullYear()}. All Rights Reserved.
  </footer>

</body>
</html>`;
    
    const blob = new Blob([docHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'racer_admin_panel_docs.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter sections based on search query
  const docSections = [
    {
      id: 'intro',
      title: '1.0 Introduction & Domain',
      category: 'Introduction',
      content: 'Digital Documentation Portal, docs.expanse.sh, Racer Admin Panel, modular single-page architecture, client-side, Vite, React, Tailwind CSS, high-fidelity security, multi-tenant databases, cryptographic license management, SLA portfolios.'
    },
    {
      id: 'design',
      title: '2.0 Design System Specification',
      category: 'Design System',
      content: 'Typography pairing, Inter, Space Grotesk, Outfit, JetBrains Mono, headings, body, code blocks, layout grid, max-w-7xl limits, borders, border radius, rounded-xl (12px), rounded-2xl (16px), shadows, hover effects, CSS transitions.'
    },
    {
      id: 'theme',
      title: '3.0 Theme & Locale Swappers',
      category: 'Engine',
      content: 'Dual theme states, light and dark toggles, dark canvas charcoal base (#0F1115, #1A1D23, #2D333D), light canvas (#F8FAFC, #FFFFFF, #E2E8F0), translation layers, English (EN), French (FR), Spanish (ES), localized labels, in-memory dictionaries.'
    },
    {
      id: 'modules',
      title: '4.0 Core Workstation Modules',
      category: 'Modules',
      content: 'Home Command Center, telemetry aggregators, linear projection math, Dashboard, Recharts trends, Users Admin, SSO providers, local database mappings, Products, binaries, MD5 integrity checks, Product Licenses, key generation.'
    },
    {
      id: 'workflows',
      title: '5.0 Cross-Cutting Workflows',
      category: 'Workflows',
      content: 'License-to-Tenant Redirection Handshake, Customer-to-Billing Shortcut, Home Actions Hub, Real-time AI Assistant Sync, Nominatim Address validation OpenStreetMap geocoding API, AJAX lookups.'
    },
    {
      id: 'schema',
      title: '6.0 Master DB Schema',
      category: 'Database Schema',
      content: 'PostgreSQL DDL, admin_users, products, customers, licenses, primary keys, foreign key constraints, UNIQUE constraints, cascade triggers, cryptographic database design, OIDC security mappings.'
    },
    {
      id: 'registry',
      title: '7.0 Dynamic System Snapshot',
      category: 'Registry',
      content: 'Database metrics snapshot, active product catalog, registered SKU lines, multitenant organizations, active license keys count, reactive state updates.'
    }
  ];

  // Filters sections matching search term
  const filteredDocSections = useMemo(() => {
    if (!docSearchQuery.trim()) return docSections;
    const q = docSearchQuery.toLowerCase();
    return docSections.filter(
      s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
  }, [docSearchQuery]);

  // Set first matching section as active if active section is filtered out
  const displaySection = useMemo(() => {
    const exists = filteredDocSections.some(s => s.id === activeDocSection);
    if (!exists && filteredDocSections.length > 0) {
      return filteredDocSections[0].id;
    }
    return activeDocSection;
  }, [filteredDocSections, activeDocSection]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* EXPANSE STYLED PRINT STYLESHEET */}
      <style>{`
        @media print {
          /* Hide non-print structures like Sidebar, Header buttons, sub-tabs switcher */
          aside, header, footer, .no-print, button, input {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          #print-content {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            font-size: 12px !important;
          }
          #print-content h1, #print-content h2, #print-content h3 {
            color: black !important;
            border-bottom: 2px solid #333 !important;
            page-break-after: avoid !important;
          }
          #print-content section {
            page-break-inside: avoid !important;
            margin-bottom: 30px !important;
          }
          #print-content pre, #print-content code {
            background-color: #f3f4f6 !important;
            border: 1px solid #e5e7eb !important;
            color: black !important;
          }
        }
      `}</style>

      {/* STANDALONE TAB SWITCHER BAR ABOVE THE CONTENT BOX (AS MARKED IN THE RED CIRCLE) */}
      <div className="flex justify-start no-print">
        <div className={`p-1 rounded-xl flex items-center gap-1 shrink-0 ${
          isDark ? 'bg-slate-900/60' : 'bg-slate-100'
        }`}>
          <button
            id="sitemap-tab-btn"
            onClick={() => setActiveSubTab('sitemap')}
            className={`px-5 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all cursor-pointer focus:outline-none focus:ring-0 ${
              activeSubTab === 'sitemap'
                ? (isDark ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-800 shadow-xs')
                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50')
            }`}
          >
            <GitFork className="w-4 h-4 text-[rgb(14,145,145)]" />
            <span>Sitemap</span>
          </button>
          <button
            id="document-tab-btn"
            onClick={() => setActiveSubTab('document')}
            className={`px-5 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all cursor-pointer focus:outline-none focus:ring-0 ${
              activeSubTab === 'document'
                ? (isDark ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-800 shadow-xs')
                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50')
            }`}
          >
            <FileText className="w-4 h-4 text-[rgb(14,145,145)]" />
            <span>Document</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeSubTab === 'sitemap' ? (
        
        /* ==================== SITEMAP SUBTAB ==================== */
        <div className="space-y-6 animate-fade-in">
          
          {/* SITEMAP INTERACTIVE GUIDE HEADER CARD */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-xs'}`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Guide</span>
            </div>
            <h1 className={`text-xl font-black uppercase tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Admin Panel Site Map
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              This section shows the complete workflow of the navigation of the admin panel. Review the structural architecture, cross-cutting routing behaviors, and click any item to quickly hop to its screen.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1 & 2: ARCHITECTURAL SITE MAP */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-6 rounded-2xl border h-full ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-xs'}`}>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-6 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <GitFork className="w-4 h-4 text-[rgb(14,145,145)]" />
                <span>Hierarchical Navigation Matrix</span>
              </h3>

              {/* Tree Matrix */}
              <div className="space-y-8 relative before:absolute before:left-[1.25rem] before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-gray-800">
                
                {/* Category: Overview & Monitoring */}
                <div className="space-y-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] flex items-center justify-center font-black text-xs z-10 border-4 border-slate-50 dark:border-[#1A1D23]">
                      1
                    </div>
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-[rgb(14,145,145)]' : 'text-[rgb(10,115,115)]'}`}>Overview & Monitoring</h4>
                      <span className="text-[10px] text-slate-400 font-medium">Primary operational telemetry and general analytics</span>
                    </div>
                  </div>

                  <div className="pl-10 space-y-3">
                    {navigationNodes.filter(n => n.category === 'Overview & Monitoring').map(node => (
                      <div 
                        key={node.id} 
                        onClick={() => onNavigate(node.id)}
                        className={`group p-4 rounded-xl border transition-all cursor-pointer text-left hover:scale-[1.01] ${
                          isDark 
                            ? 'bg-[#13161C] border-[#2C333E] hover:border-[rgb(14,145,145)]/50 hover:bg-[#1A1D23]' 
                            : 'bg-slate-50/50 border-slate-100 hover:border-[rgb(14,145,145)]/40 hover:bg-white hover:shadow-3xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${node.iconColor}`}>
                              <node.icon className="w-4 h-4" />
                            </div>
                            <span className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>{node.title}</span>
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-wider text-[rgb(14,145,145)] opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                            <span>Open View</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3">{node.description}</p>
                        <div className="space-y-1">
                          {node.workflows.map((w, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                              <CornerDownRight className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category: Enterprise Admin */}
                <div className="space-y-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-black text-xs z-10 border-4 border-slate-50 dark:border-[#1A1D23]">
                      2
                    </div>
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Enterprise Admin</h4>
                      <span className="text-[10px] text-slate-400 font-medium">Manage companies, user profiles, assets and licenses</span>
                    </div>
                  </div>

                  <div className="pl-10 space-y-3">
                    {navigationNodes.filter(n => n.category === 'Enterprise Admin').map(node => (
                      <div 
                        key={node.id} 
                        onClick={() => onNavigate(node.id)}
                        className={`group p-4 rounded-xl border transition-all cursor-pointer text-left hover:scale-[1.01] ${
                          isDark 
                            ? 'bg-[#13161C] border-[#2C333E] hover:border-purple-500/50 hover:bg-[#1A1D23]' 
                            : 'bg-slate-50/50 border-slate-100 hover:border-purple-500/40 hover:bg-white hover:shadow-3xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${node.iconColor}`}>
                              <node.icon className="w-4 h-4" />
                            </div>
                            <span className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>{node.title}</span>
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-wider text-purple-500 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                            <span>Open View</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3">{node.description}</p>
                        <div className="space-y-1">
                          {node.workflows.map((w, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                              <CornerDownRight className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category: Support & Assets */}
                <div className="space-y-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs z-10 border-4 border-slate-50 dark:border-[#1A1D23]">
                      3
                    </div>
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Support & Assets</h4>
                      <span className="text-[10px] text-slate-400 font-medium">SLA thresholds, support channels, and product guides</span>
                    </div>
                  </div>

                  <div className="pl-10 space-y-3">
                    {navigationNodes.filter(n => n.category === 'Support & Assets').map(node => (
                      <div 
                        key={node.id} 
                        onClick={() => onNavigate(node.id)}
                        className={`group p-4 rounded-xl border transition-all cursor-pointer text-left hover:scale-[1.01] ${
                          isDark 
                            ? 'bg-[#13161C] border-[#2C333E] hover:border-emerald-500/50 hover:bg-[#1A1D23]' 
                            : 'bg-slate-50/50 border-slate-100 hover:border-emerald-500/40 hover:bg-white hover:shadow-3xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${node.iconColor}`}>
                              <node.icon className="w-4 h-4" />
                            </div>
                            <span className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>{node.title}</span>
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-wider text-emerald-500 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                            <span>Open View</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3">{node.description}</p>
                        <div className="space-y-1">
                          {node.workflows.map((w, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                              <CornerDownRight className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* COLUMN 3: CROSS-CUTTING WORKFLOW CHANNELS */}
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border h-full ${isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-xs'}`}>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-6 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Cross-Cutting Workflows</span>
              </h3>

              <div className="space-y-5">
                {adminCrossCuttingWorkflows.map((flow, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border ${
                      isDark ? 'bg-[#13161C] border-[#2D333D]' : 'bg-slate-50 border-slate-200/60 shadow-3xs'
                    }`}
                  >
                    <h4 className={`text-xs font-extrabold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {flow.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3.5">
                      {flow.description}
                    </p>
                    
                    {/* Step Indicators */}
                    <div className="flex flex-wrap items-center gap-1">
                      {flow.steps.map((step, sIdx) => (
                        <React.Fragment key={sIdx}>
                          {sIdx > 0 && <ArrowRight className="w-3 h-3 text-slate-400 mx-1 shrink-0" />}
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold leading-none shrink-0 ${
                            isDark ? 'bg-[#1D212A] text-slate-300' : 'bg-white text-slate-700 border border-slate-200 shadow-3xs'
                          }`}>
                            {step}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Helper Note */}
              <div className={`p-4 rounded-xl border mt-6 flex gap-3 ${
                isDark ? 'bg-purple-500/5 border-purple-500/10 text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-700'
              }`}>
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed">
                  <span className="font-extrabold block uppercase tracking-wider mb-0.5">Navigation Note</span>
                  Each tab component in B&J Admin is completely self-contained. The sidebar handles routing state dynamically while preserving live CRUD changes in memory until the application is restarted.
                </div>
              </div>

            </div>
          </div>

          </div>
        </div>
      ) : (
        
        /* ==================== PANEL DOC SUBTAB ==================== */
        <div className="space-y-6 animate-fade-in">
          
          {/* TOP DECK BAR */}
          <header className={`border-b px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-50 rounded-2xl no-print ${
            isDark 
              ? 'bg-[#1A1D23] border-[#2D333D] text-white' 
              : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[rgb(14,145,145)] flex items-center justify-center shadow-md shrink-0">
                <span className="text-white font-extrabold text-sm">R</span>
              </div>
              <div>
                <h1 className={`text-sm font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  RACER PANEL DOCS
                </h1>
                <p className="text-[10px] font-mono text-[rgb(14,145,145)] mt-1 font-bold">
                  docs.expanse.sh • Standalone System Spec
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1.5 animate-pulse shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                OFFLINE DOCUMENT RUNBOOK
              </span>
              <button 
                onClick={() => window.print()} 
                className={`px-3 py-1.5 border text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 shadow-3xs'
                }`}
              >
                <Printer className="w-3.5 h-3.5 text-[rgb(14,145,145)]" />
                <span>Export Print / PDF</span>
              </button>
              <button 
                onClick={handleShareHTML} 
                className="px-3 py-1.5 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share HTML</span>
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* LEFT NAVIGATION GUIDE */}
            <aside className="space-y-6 lg:sticky lg:top-24 h-fit no-print">
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#1A1D23] border-[#2D333D]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[rgb(14,145,145)] mb-3 px-1">
                  Contents Overview
                </h3>
                <nav className="space-y-1">
                  {docSections.map(sec => {
                    const isSecActive = activeDocSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => handleSectionClick(sec.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isSecActive
                            ? 'bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] font-bold'
                            : (isDark 
                                ? 'text-slate-300 hover:text-white hover:bg-slate-800/80' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50')
                        }`}
                      >
                        <span>{sec.title}</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSecActive ? 'rotate-90 text-[rgb(14,145,145)]' : 'text-slate-400'}`} />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* DYNAMIC SNAPSHOT CONTEXT CARD */}
              <div className={`p-4 rounded-xl border text-[11px] space-y-2 ${
                isDark ? 'bg-[#1A1D23]/50 border-[#2D333D]/60 text-gray-400' : 'bg-slate-50 border-slate-200/60 text-slate-600'
              }`}>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Dynamic Snapshot Context:</p>
                <div>• Operators Registered: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{users.length}</strong></div>
                <div>• Product Families: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{products.length}</strong></div>
                <div>• Tenant Portfolios: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{customers.length}</strong></div>
                <div>• Cryptographic Keys: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{licenses.length}</strong></div>
              </div>
            </aside>

            {/* MAIN DOCUMENT READING WORKSPACE */}
            <div className="lg:col-span-3">
              
              {/* DOCUMENT CONTEXT CONTAINER */}
              <div id="print-content" className="space-y-8 min-h-[500px] prose dark:prose-invert max-w-none text-slate-800 dark:text-gray-100">
                
                {/* SECTION 1.0: INTRODUCTION */}
                <section id="sec-intro" className={getSectionClassName('intro')}>
                  <div className="flex items-center gap-2 border-b border-slate-700/30 pb-3 mb-4">
                    <span className="px-2 py-0.5 bg-[rgb(14,145,145)]/10 text-[rgb(14,145,145)] text-[10px] font-mono font-bold rounded">SEC 1.0</span>
                    <h2 className={`text-base font-black tracking-tight my-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Introduction & Architecture Scope
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The RACER Admin Panel is a digital management console designed to coordinate secure identity, multi-tenant organizations, software distributions, and SLA licensing frameworks. Inspired by the neat, high-contrast, structural presentation of <strong>docs.expanse.sh</strong>, this portal organizes operational standards, layouts, databases, and key pathways.
                  </p>
                  
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="text-xs font-bold text-[rgb(14,145,145)] uppercase font-sans my-0">Core Architectural Principles:</h4>
                    <p className="text-xs text-slate-400 my-0 leading-relaxed">
                      • <strong>Strict Multi-Tenancy segregation:</strong> State isolation is guaranteed by matching entities to customer ids, OIDC domains, and unique cryptographic hashes.<br/>
                      • <strong>Offline-First State Replication:</strong> State structures are updated reactively inside the primary memory context, mirroring a durable database schema structure.<br/>
                      • <strong>User Role Distinction:</strong> Security workflows differentiate between Administrative operators and corporate client-end operators to control read/write capabilities.
                    </p>
                  </div>
                </section>

                {/* SECTION 2.0: DESIGN SYSTEM */}
                <section id="sec-design" className={getSectionClassName('design')}>
                  <div className="flex items-center gap-2 border-b border-slate-700/30 pb-3 mb-4">
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-mono font-bold rounded">SEC 2.0</span>
                    <h2 className={`text-base font-black tracking-tight my-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Design System Specification
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Visual clarity is the foremost metric in design. B&J RACER avoids default visual palettes and excessive colors, selecting instead a highly polished set of typography, border rules, and micro-animations:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/10 border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}>
                      <h4 className="font-bold text-[rgb(14,145,145)] font-sans mb-1.5 mt-0">Typography Pairing</h4>
                      <p className="text-slate-400 leading-relaxed my-0">
                        • Display Headings: Space Grotesk / Outfit<br/>
                        • Body copy: Inter Sans<br/>
                        • Metrics & Code: JetBrains Mono
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/10 border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}>
                      <h4 className="font-bold text-[rgb(14,145,145)] font-sans mb-1.5 mt-0">Symmetry & Padding</h4>
                      <p className="text-slate-400 leading-relaxed my-0">
                        • Page boundaries: <code>p-4 sm:p-6 md:p-8</code><br/>
                        • Cards padding: <code>p-5</code> / <code>p-6</code><br/>
                        • Double-layered modular separation
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/10 border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}>
                      <h4 className="font-bold text-[rgb(14,145,145)] font-sans mb-1.5 mt-0">Micro-Animations</h4>
                      <p className="text-slate-400 leading-relaxed my-0">
                        • Transition durations: 150ms-200ms<br/>
                        • Hover feedback: <code>hover:scale-99</code> / <code>scale-101</code><br/>
                        • Staggered list fade-ins
                      </p>
                    </div>
                  </div>
                </section>

                {/* SECTION 3.0: THEME ENGINE */}
                <section id="sec-theme" className={getSectionClassName('theme')}>
                  <div className="flex items-center gap-2 border-b border-slate-700/30 pb-3 mb-4">
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-mono font-bold rounded">SEC 3.0</span>
                    <h2 className={`text-base font-black tracking-tight my-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Theme Engine & Locale Synchronization
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Racer incorporates synchronized dual themes and real-time translation bindings. It maintains consistent colors in light or dark modes without using complex stylesheet swaps:
                  </p>

                  <div className="space-y-3 text-xs text-slate-400">
                    <div className="flex gap-4">
                      <span className="font-bold text-slate-300 dark:text-white font-mono shrink-0">Dark Theme:</span>
                      <p className="my-0">CHARCOAL Palette (<code>#0F1115</code> body, <code>#1A1D23</code> workstation blocks, <code>#2D333D</code> thin line divisions). Provides optimal readability for long operation sessions.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold text-slate-600 dark:text-white font-mono shrink-0">Light Theme:</span>
                      <p className="my-0">SLATE Palette (<code>#F8FAFC</code> body, <code>#FFFFFF</code> workspace blocks, <code>#E2E8F0</code> borders). Provides a clean paper-like publishing standard.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold text-slate-600 dark:text-white font-mono shrink-0">Localization:</span>
                      <p className="my-0">Binds standard text hooks (English, French, Spanish) directly to active user preferences, syncing all buttons, ledger entries, headers, and modals.</p>
                    </div>
                  </div>
                </section>

                {/* SECTION 4.0: WORKSTATION MODULES */}
                <section id="sec-modules" className={getSectionClassName('modules')}>
                  <div className="flex items-center gap-2 border-b border-slate-700/30 pb-3 mb-4">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded">SEC 4.0</span>
                    <h2 className={`text-base font-black tracking-tight my-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Core Workstation Modules
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The workstation's control boundaries are distributed across specialized modules. Any metadata modifications inside these structures are synchronized reactively:
                  </p>

                  <div className="space-y-3 font-sans text-xs text-slate-400">
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/10 border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="font-extrabold text-slate-800 dark:text-white block">A. Telemetry Command (Home View)</span>
                      <p className="mt-1 mb-0">Displays high-level statistics like total products, license metrics, customer registries, and monthly/annual contract financial projections. Houses the shortcut panels to launch creation dialog modals immediately.</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/10 border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="font-extrabold text-slate-800 dark:text-white block">B. Interactive Analytics (Dashboard View)</span>
                      <p className="mt-1 mb-0">Features SVG analytics graphs powered by Recharts, integrating dynamic date-filtering boundaries. Provides dual-pane panels to toggle listings between admin rosters and customer profiles.</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/10 border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="font-extrabold text-slate-800 dark:text-white block">C. Software Catalog & Binary Directory (Products View)</span>
                      <p className="mt-1 mb-0">Maintains structural SKU pricing codes, categorizations, and maps binary deployment files with computed md5 verification checksums. Supports customer company visibility controls.</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/10 border-[#2D333D]' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="font-extrabold text-slate-800 dark:text-white block">D. Cryptographic License Ledger (Licenses View)</span>
                      <p className="mt-1 mb-0">Enables generation of cryptographic key hashes, live block/unlock toggles, and pre-populates template renewed email SLA communications.</p>
                    </div>
                  </div>
                </section>

                {/* SECTION 5.0: WORKFLOWS */}
                <section id="sec-workflows" className={getSectionClassName('workflows')}>
                  <div className="flex items-center gap-2 border-b border-slate-700/30 pb-3 mb-4">
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-mono font-bold rounded">SEC 5.0</span>
                    <h2 className={`text-base font-black tracking-tight my-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Cross-Cutting Workflow Matrix
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Dynamic linkages connect modules together to automate user workflows. Each transition preserves selected parameters and pre-populates target fields:
                  </p>

                  <div className="space-y-4 text-xs text-slate-400">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgb(14,145,145)] mt-1.5 shrink-0"></div>
                      <div>
                        <strong className="text-slate-800 dark:text-white font-sans">Workflow A: License Organization Handshake</strong>
                        <p className="mt-0.5 mb-0 leading-relaxed">From the License ledger, clicking a company name intercepts the route, switches the main viewport to the Customer Admin module, and automatically triggers the focus/expand drawer on the respective target card.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgb(14,145,145)] mt-1.5 shrink-0"></div>
                      <div>
                        <strong className="text-slate-800 dark:text-white font-sans">Workflow B: Customer to Billing Workspace shortcut</strong>
                        <p className="mt-0.5 mb-0 leading-relaxed">Clicking a corporate billing contact inside the Customer tab immediately routes to the Billing & Usage tab, sets the customer name query filter, and filters charts/dates for that specific company context.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgb(14,145,145)] mt-1.5 shrink-0"></div>
                      <div>
                        <strong className="text-slate-800 dark:text-white font-sans">Workflow C: OSM Nominatim Geo-autofill Integration</strong>
                        <p className="mt-0.5 mb-0 leading-relaxed">The Profile Management settings leverage the OpenStreetMap Nominatim API for address queries. Live lookup results allow one-click reverse geocoding to fill address, state, and location fields immediately.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 6.0: MASTER SCHEMA */}
                <section id="sec-schema" className={getSectionClassName('schema')}>
                  <div className="flex items-center gap-2 border-b border-slate-700/30 pb-3 mb-4">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-mono font-bold rounded">SEC 6.0</span>
                    <h2 className={`text-base font-black tracking-tight my-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Master Relational Database Schema
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The following structures define the database models utilized on the Cloud SQL backend, enforcing referential integrity, unique indices, and security schemas. Use the button below to copy the DDL commands:
                  </p>

                  <div className="relative">
                    <button
                      onClick={() => handleCopyText('schema-sql', `CREATE TABLE admin_users (
  uuid VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  admin_role VARCHAR(50) DEFAULT 'Customer Operator',
  auth_method VARCHAR(20) DEFAULT 'local',
  sso_provider VARCHAR(50),
  is_admin_user BOOLEAN DEFAULT TRUE,
  create_date DATE NOT NULL
);

CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  family VARCHAR(100) NOT NULL,
  create_date DATE NOT NULL
);

CREATE TABLE customers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  address TEXT,
  primary_contact_email VARCHAR(150),
  support_tier VARCHAR(100) DEFAULT 'Standard Support Model',
  status VARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE licenses (
  id VARCHAR(36) PRIMARY KEY,
  license_key VARCHAR(100) UNIQUE NOT NULL,
  customer_id VARCHAR(36) REFERENCES customers(id),
  product_sku VARCHAR(50) REFERENCES products(sku),
  status VARCHAR(20) DEFAULT 'Active',
  expires_at TIMESTAMP NOT NULL
);`)}
                      className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-mono font-black uppercase rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-1.5 transition-all shadow-3xs z-10 cursor-pointer"
                    >
                      {copiedTextId === 'schema-sql' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied Schema!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy DDL SQL</span>
                        </>
                      )}
                    </button>

                    <div className="bg-black/45 dark:bg-black/70 p-4 pt-12 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                      <span className="text-gray-500 block mb-2">-- ENFORCE RELATIONAL INTEGRITY & FOREIGN KEYS</span>
                      <code>
{`CREATE TABLE admin_users (
  uuid VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  admin_role VARCHAR(50) DEFAULT 'Customer Operator',
  auth_method VARCHAR(20) DEFAULT 'local', -- local | sso
  sso_provider VARCHAR(50),
  is_admin_user BOOLEAN DEFAULT TRUE,
  create_date DATE NOT NULL
);

CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  family VARCHAR(100) NOT NULL,
  create_date DATE NOT NULL
);

CREATE TABLE customers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  address TEXT,
  primary_contact_email VARCHAR(150),
  support_tier VARCHAR(100) DEFAULT 'Standard Support Model',
  parent_id VARCHAR(36) REFERENCES customers(id), -- Hierarchical mapping
  status VARCHAR(20) DEFAULT 'Active' -- Active | Blocked
);

CREATE TABLE licenses (
  id VARCHAR(36) PRIMARY KEY,
  license_key VARCHAR(100) UNIQUE NOT NULL,
  customer_id VARCHAR(36) REFERENCES customers(id),
  product_sku VARCHAR(50) REFERENCES products(sku),
  status VARCHAR(20) DEFAULT 'Active', -- Active | Blocked
  expires_at TIMESTAMP NOT NULL
);`}
                      </code>
                    </div>
                  </div>
                </section>

                {/* SECTION 7.0: LIVE SYSTEM REGISTRY */}
                <section id="sec-registry" className={getSectionClassName('registry')}>
                  <div className="flex items-center gap-2 border-b border-slate-700/30 pb-3 mb-4">
                    <span className="px-2 py-0.5 bg-[rgb(14,145,145)]/15 text-[rgb(14,145,145)] text-[10px] font-mono font-bold rounded">SEC 7.0</span>
                    <h2 className={`text-base font-black tracking-tight my-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Live System Registry Feed
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This table tracks registered entities in the active session database, providing continuously updated data fields representing catalog mappings:
                  </p>

                  <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-slate-850' : 'border-slate-200'} text-xs mb-6`}>
                    <table className="w-full text-left border-collapse font-sans my-0">
                      <thead>
                        <tr className={isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-800'}>
                          <th className="p-3 font-bold border-b border-slate-800/20">Metric Key</th>
                          <th className="p-3 font-bold border-b border-slate-800/20">Active Count</th>
                          <th className="p-3 font-bold border-b border-slate-800/20">Technical Detail Scope</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/10 dark:divide-slate-800/50">
                        <tr>
                          <td className="p-3 font-mono font-bold text-slate-750 dark:text-slate-300">Total Operators</td>
                          <td className="p-3 font-bold text-emerald-500">{users.length}</td>
                          <td className="p-3 text-slate-400">Security operator nodes registered in identity directory</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-bold text-slate-750 dark:text-slate-300">Product Families</td>
                          <td className="p-3 font-bold text-emerald-500">{products.length}</td>
                          <td className="p-3 text-slate-400">Available products in active binary registry</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-bold text-slate-750 dark:text-slate-300">Client Tenants</td>
                          <td className="p-3 font-bold text-emerald-500">{customers.length}</td>
                          <td className="p-3 text-slate-400">Active parent organization and enterprise sub-accounts</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-bold text-slate-750 dark:text-slate-300">Cryptographic Keys</td>
                          <td className="p-3 font-bold text-emerald-500">{licenses.length}</td>
                          <td className="p-3 text-slate-400">Unique active cryptographic client licenses in database ledger</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-bold text-slate-750 dark:text-slate-300">Document Artifacts</td>
                          <td className="p-3 font-bold text-emerald-500">{documents.length}</td>
                          <td className="p-3 text-slate-400">Technical manuals, integration mappings, and system runbooks</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* INTERACTIVE SQL PLAYGROUND (SIMULATED CONSOLE) */}
                  <div className={`p-5 rounded-xl border mb-6 ${isDark ? 'bg-black/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[rgb(14,145,145)] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Interactive DB Console Playground</span>
                      </div>
                      <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">Sandbox Engine Active</span>
                    </div>
                    
                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed my-0">
                      Query the active workstation memory database in real-time. Select a SQL statement below to pull current live arrays from the running application:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                      {[
                        { id: 'SELECT_PRODUCTS', label: 'SELECT * FROM products;', desc: 'Product Catalog' },
                        { id: 'SELECT_CUSTOMERS', label: 'SELECT * FROM customers;', desc: 'Corporate Organizations' },
                        { id: 'SELECT_LICENSES', label: 'SELECT * FROM licenses;', desc: 'Active Cryptographic Keys' },
                        { id: 'SELECT_USERS', label: 'SELECT * FROM admin_users;', desc: 'Identity Operator Directory' }
                      ].map(q => (
                        <button
                          key={q.id}
                          onClick={() => {
                            setActiveQuery(q.id);
                            // Auto run query on select for amazing interactivity!
                            setQueryExecuting(true);
                            setTimeout(() => setQueryExecuting(false), 200);
                          }}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            activeQuery === q.id
                              ? 'bg-[rgb(14,145,145)]/10 border-[rgb(14,145,145)] text-[rgb(14,145,145)] ring-1 ring-[rgb(14,145,145)]/25'
                              : (isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100/50')
                          }`}
                        >
                          <span className="font-mono text-[10px] font-black block mb-0.5 tracking-tight">{q.label}</span>
                          <span className="text-[9px] text-slate-500 block leading-tight">{q.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* RUNNING / RESULTS BOX */}
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-hidden relative min-h-[140px] no-print text-slate-300">
                      
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                        <span className="text-slate-500 text-[10px]">Session: bj_admin_client_db_v1 • Port 3000 (Proxy)</span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                        </div>
                      </div>

                      {queryExecuting ? (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2">
                          <Cpu className="w-5 h-5 text-[rgb(14,145,145)] animate-spin" />
                          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Executing virtual query plan...</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">&gt;</span>
                            <span className="text-white font-bold font-mono text-[11px]">
                              {activeQuery === 'SELECT_PRODUCTS' && 'SELECT id, sku, name, unit_price, family FROM products;'}
                              {activeQuery === 'SELECT_CUSTOMERS' && 'SELECT id, name, support_tier, status FROM customers;'}
                              {activeQuery === 'SELECT_LICENSES' && 'SELECT id, license_key, customer_id, status FROM licenses;'}
                              {activeQuery === 'SELECT_USERS' && 'SELECT uuid, first_name, last_name, email, admin_role FROM admin_users;'}
                            </span>
                          </div>
                          
                          <div className="max-h-48 overflow-y-auto text-[10px] leading-relaxed font-mono">
                            {activeQuery === 'SELECT_PRODUCTS' && (
                              products.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="text-slate-500 border-b border-slate-900">
                                      <th className="pb-1 pr-4 font-bold uppercase text-[9px]">sku</th>
                                      <th className="pb-1 pr-4 font-bold uppercase text-[9px]">name</th>
                                      <th className="pb-1 pr-4 font-bold uppercase text-[9px]">unit_price</th>
                                      <th className="pb-1 font-bold uppercase text-[9px]">family</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {products.map(p => (
                                      <tr key={p.id} className="hover:bg-slate-900/40 border-b border-slate-900/10">
                                        <td className="py-1 text-emerald-400 pr-4">{p.sku}</td>
                                        <td className="py-1 text-white pr-4 font-sans">{p.name}</td>
                                        <td className="py-1 text-amber-400 pr-4">${p.unitPrice}</td>
                                        <td className="py-1 text-slate-400">{p.family}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <span className="text-yellow-500 italic">No products currently registered in this session memory.</span>
                              )
                            )}

                            {activeQuery === 'SELECT_CUSTOMERS' && (
                              customers.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="text-slate-500 border-b border-slate-900">
                                      <th className="pb-1 pr-4 font-bold uppercase text-[9px]">name</th>
                                      <th className="pb-1 pr-4 font-bold uppercase text-[9px]">support_tier</th>
                                      <th className="pb-1 font-bold uppercase text-[9px]">status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {customers.map(c => (
                                      <tr key={c.id} className="hover:bg-slate-900/40 border-b border-slate-900/10">
                                        <td className="py-1 text-white pr-4 font-sans">{c.name}</td>
                                        <td className="py-1 text-emerald-400 pr-4">{c.supportTier}</td>
                                        <td className="py-1">
                                          <span className={`px-1 py-0.5 rounded text-[8px] font-black uppercase ${c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {c.status || 'Active'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <span className="text-yellow-500 italic">No corporate organizations registered in this session.</span>
                              )
                            )}

                            {activeQuery === 'SELECT_LICENSES' && (
                              licenses.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="text-slate-500 border-b border-slate-900">
                                      <th className="pb-1 pr-4 font-bold uppercase text-[9px]">license_key</th>
                                      <th className="pb-1 pr-4 font-bold uppercase text-[9px]">customer_id</th>
                                      <th className="pb-1 font-bold uppercase text-[9px]">status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {licenses.map(l => {
                                      const cust = customers.find(c => c.id === l.companyId);
                                      return (
                                        <tr key={l.id} className="hover:bg-slate-900/40 border-b border-slate-900/10">
                                          <td className="py-1 text-emerald-400 font-mono text-[9px] pr-4">{l.licenseKey}</td>
                                          <td className="py-1 text-white pr-4 font-sans">{cust ? cust.name : 'Unknown Corp'}</td>
                                          <td className="py-1">
                                            <span className={`px-1 py-0.5 rounded text-[8px] font-black uppercase ${l.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                              {l.isActive ? 'Active' : 'Blocked'}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : (
                                <span className="text-yellow-500 italic">No license keys issued in this ledger session.</span>
                              )
                            )}

                            {activeQuery === 'SELECT_USERS' && (
                              users.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="text-slate-500 border-b border-slate-900">
                                      <th className="pb-1 pr-4 font-bold uppercase text-[9px]">name</th>
                                      <th className="pb-1 pr-4 font-bold uppercase text-[9px]">email</th>
                                      <th className="pb-1 font-bold uppercase text-[9px]">role</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {users.map(u => (
                                      <tr key={u.uuid} className="hover:bg-slate-900/40 border-b border-slate-900/10">
                                        <td className="py-1 text-white pr-4 font-sans">{u.firstName} {u.lastName}</td>
                                        <td className="py-1 text-slate-400 pr-4">{u.email}</td>
                                        <td className="py-1 text-emerald-400">{u.adminRole}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <span className="text-yellow-500 italic">No identity operators registered in this session.</span>
                              )
                            )}
                          </div>

                          <div className="text-[9px] text-slate-600 border-t border-slate-900 pt-1.5 flex justify-between">
                            <span>({activeQuery === 'SELECT_PRODUCTS' ? products.length : activeQuery === 'SELECT_CUSTOMERS' ? customers.length : activeQuery === 'SELECT_LICENSES' ? licenses.length : users.length} rows returned)</span>
                            <span className="text-[rgb(14,145,145)] font-bold">SUCCESS (2ms)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-center justify-between gap-4 ${
                    isDark ? 'bg-[#0F1115] border-[#2D333D] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[rgb(14,145,145)] shrink-0" />
                      <span>Data snapshot compiled at system local session clock. Sync interval: 0ms (Reactive).</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[rgb(14,145,145)] uppercase shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>SECURE_CONNECTION</span>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      )}

  </div>
);
}
