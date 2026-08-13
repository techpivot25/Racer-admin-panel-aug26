import React, { useState, useRef, useMemo } from 'react';
import { 
  Database, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Key, 
  Link2, 
  Table as TableIcon, 
  Code2, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Sparkles, 
  Move,
  Layers,
  FileCode,
  ShieldCheck,
  Maximize2,
  HelpCircle
} from 'lucide-react';

interface ColumnDef {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: string; // e.g. "account.id"
  nullable?: boolean;
  comment?: string;
}

interface TableDef {
  id: string;
  name: string;
  category: 'Core Auth' | 'Enterprise Tenancy' | 'Software Licensing' | 'Support & Docs' | 'Audit & System';
  headerColor: string; // Tailwind color hex or class
  headerBg: string;
  borderColor: string;
  x: number;
  y: number;
  columns: ColumnDef[];
  description: string;
}

// Full Schema Definitions for RACER Admin Panel
const INITIAL_TABLES: TableDef[] = [
  {
    id: 'invite',
    name: 'invite',
    category: 'Core Auth',
    headerColor: '#8B5CF6',
    headerBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-500/40',
    x: 420,
    y: 40,
    description: 'Holds admin panel workspace invitation tokens and verification timestamps.',
    columns: [
      { name: 'id', type: 'int', isPk: true, comment: 'Primary key auto-increment integer' },
      { name: 'invite_id', type: 'varchar?', nullable: true, comment: 'Unique UUID invitation hash' },
      { name: 'email', type: 'varchar?', nullable: true, comment: 'Target recipient email address' },
      { name: 'account_id', type: 'varchar?', isFk: true, fkTarget: 'account.id', nullable: true, comment: 'FK pointing to parent account' },
      { name: 'date_sent', type: 'timestamp?', nullable: true, comment: 'Timestamp when invite email dispatched' },
      { name: 'used', type: 'tinyint?', nullable: true, comment: '1 if invitation claimed, 0 otherwise' }
    ]
  },
  {
    id: 'account',
    name: 'account',
    category: 'Core Auth',
    headerColor: '#F43F5E',
    headerBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500/40',
    x: 50,
    y: 180,
    description: 'Core billing and tenant account registry for enterprise organizations.',
    columns: [
      { name: 'id', type: 'varchar', isPk: true, comment: 'Primary string key (e.g. acc_01)' },
      { name: 'email', type: 'varchar', comment: 'Primary owner billing email' },
      { name: 'date_created', type: 'timestamp', comment: 'Registration date' },
      { name: 'stripe_customer_id', type: 'varchar?', nullable: true, comment: 'Stripe gateway customer token' },
      { name: 'stripe_subscription_id', type: 'varchar?', nullable: true, comment: 'Active recurring Stripe subscription ID' },
      { name: 'plan', type: 'varchar?', nullable: true, comment: 'Enterprise SLA Tier (Enterprise, Professional, Starter)' },
      { name: 'referrer', type: 'varchar?', nullable: true, comment: 'Acquisition channel / referral code' },
      { name: 'active', type: 'tinyint?', nullable: true, comment: 'Account active status (1 = Active, 0 = Suspended)' }
    ]
  },
  {
    id: 'user',
    name: 'user',
    category: 'Core Auth',
    headerColor: '#4F46E5',
    headerBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-500/40',
    x: 420,
    y: 280,
    description: 'Individual operator accounts, passwords, and permissions linked to an account.',
    columns: [
      { name: 'id', type: 'varchar', isPk: true, comment: 'User UUID identifier' },
      { name: 'name', type: 'varchar?', nullable: true, comment: 'Full display name' },
      { name: 'email', type: 'varchar', comment: 'Login credential email' },
      { name: 'password', type: 'varchar', comment: 'Bcrypt hashed authorization secret' },
      { name: 'date_created', type: 'timestamp', comment: 'Account creation date' },
      { name: 'last_login', type: 'timestamp?', nullable: true, comment: 'Last active session timestamp' },
      { name: 'permission', type: 'varchar?', nullable: true, comment: 'Role privilege (Super Admin, Manager, User)' },
      { name: 'push_token', type: 'varchar?', nullable: true, comment: 'FCM push notification token' },
      { name: 'account_id', type: 'varchar', isFk: true, fkTarget: 'account.id', comment: 'Foreign Key to account table' }
    ]
  },
  {
    id: 'customer',
    name: 'customer',
    category: 'Enterprise Tenancy',
    headerColor: '#10B981',
    headerBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/40',
    x: 50,
    y: 530,
    description: 'Enterprise corporate clients onboarded into RACER ecosystem.',
    columns: [
      { name: 'id', type: 'varchar', isPk: true, comment: 'Customer ID (e.g. CUST-01)' },
      { name: 'account_id', type: 'varchar?', isFk: true, fkTarget: 'account.id', nullable: true, comment: 'Optional link to billing account' },
      { name: 'name', type: 'varchar', comment: 'Legal company title' },
      { name: 'address', type: 'text?', nullable: true, comment: 'Physical headquarters address' },
      { name: 'primary_contact_name', type: 'varchar?', nullable: true, comment: 'Main executive contact' },
      { name: 'primary_contact_email', type: 'varchar?', nullable: true, comment: 'Executive email' },
      { name: 'phone', type: 'varchar?', nullable: true, comment: 'Telephone contact' },
      { name: 'country', type: 'varchar', comment: 'Jurisdiction ISO code' },
      { name: 'support_tier_id', type: 'varchar', isFk: true, fkTarget: 'support_tier.id', comment: 'SLA Support Tier link' },
      { name: 'sso_enabled', type: 'tinyint', comment: '1 if Single Sign-On enabled' },
      { name: 'sso_provider', type: 'varchar?', nullable: true, comment: 'OIDC / SAML 2.0 provider (Okta, Azure AD, Google)' },
      { name: 'status', type: 'varchar', comment: 'Active, Onboarding, Inactive' },
      { name: 'created_date', type: 'timestamp', comment: 'Onboarding date' }
    ]
  },
  {
    id: 'product',
    name: 'product',
    category: 'Software Licensing',
    headerColor: '#0E9191',
    headerBg: 'bg-purple-600/10 text-purple-600 dark:text-teal-400',
    borderColor: 'border-purple-600/40',
    x: 820,
    y: 180,
    description: 'Software modules, packages, and SKUs catalog.',
    columns: [
      { name: 'id', type: 'varchar', isPk: true, comment: 'Product ID (e.g. prod-1)' },
      { name: 'name', type: 'varchar', comment: 'Commercial product name' },
      { name: 'sku', type: 'varchar', comment: 'Unique Stock Keeping Unit (e.g. RACER-AI-01)' },
      { name: 'unit_price', type: 'numeric', comment: 'Standard list price per license seat ($)' },
      { name: 'tier', type: 'varchar', comment: 'Tier level (Standard, Enterprise, Ultimate)' },
      { name: 'family', type: 'varchar', comment: 'Product family line' },
      { name: 'description', type: 'text?', nullable: true, comment: 'Technical overview' },
      { name: 'status', type: 'varchar', comment: 'Active, Deprecated, Beta' },
      { name: 'features', type: 'json?', nullable: true, comment: 'Array of enabled feature flags' }
    ]
  },
  {
    id: 'contract',
    name: 'contract',
    category: 'Software Licensing',
    headerColor: '#F59E0B',
    headerBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/40',
    x: 420,
    y: 600,
    description: 'SLA contracts binding customers to product seats and terms.',
    columns: [
      { name: 'id', type: 'varchar', isPk: true, comment: 'Contract ID (e.g. CON-2026-01)' },
      { name: 'customer_id', type: 'varchar', isFk: true, fkTarget: 'customer.id', comment: 'Corporate client link' },
      { name: 'product_id', type: 'varchar', isFk: true, fkTarget: 'product.id', comment: 'Product module link' },
      { name: 'product_sku', type: 'varchar', comment: 'Contracted SKU code' },
      { name: 'unit_price', type: 'numeric', comment: 'Contracted unit price ($)' },
      { name: 'purchased_units', type: 'int', comment: 'Total licensed seat quota' },
      { name: 'active_units', type: 'int', comment: 'Currently deployed seats' },
      { name: 'term_months', type: 'int', comment: 'Contract duration in months' },
      { name: 'start_date', type: 'date', comment: 'Contract activation date' },
      { name: 'end_date', type: 'date', comment: 'Contract expiration date' },
      { name: 'is_deleted', type: 'tinyint', comment: 'Soft delete flag' }
    ]
  },
  {
    id: 'license',
    name: 'license',
    category: 'Software Licensing',
    headerColor: '#D946EF',
    headerBg: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
    borderColor: 'border-fuchsia-500/40',
    x: 820,
    y: 540,
    description: 'Cryptographic license keys issued to customer hosts and seats.',
    columns: [
      { name: 'id', type: 'varchar', isPk: true, comment: 'License UUID' },
      { name: 'license_key', type: 'varchar', comment: 'Formatted license string (e.g. RCR-8942-X9)' },
      { name: 'customer_id', type: 'varchar', isFk: true, fkTarget: 'customer.id', comment: 'Tenant owner' },
      { name: 'product_id', type: 'varchar', isFk: true, fkTarget: 'product.id', comment: 'Licensed product module' },
      { name: 'contract_id', type: 'varchar?', isFk: true, fkTarget: 'contract.id', nullable: true, comment: 'Parent SLA contract' },
      { name: 'active_units', type: 'int', comment: 'Seats consumed' },
      { name: 'purchased_units', type: 'int', comment: 'Seats allocated' },
      { name: 'list_price', type: 'numeric?', nullable: true, comment: 'Standard list unit price' },
      { name: 'customer_unit_price', type: 'numeric?', nullable: true, comment: 'Negotiated rate ($)' },
      { name: 'term_start_date', type: 'date?', nullable: true, comment: 'Valid from date' },
      { name: 'term_end_date', type: 'date?', nullable: true, comment: 'Valid until date' },
      { name: 'is_active', type: 'tinyint', comment: 'Active status (1/0)' }
    ]
  },
  {
    id: 'customer_product_mapping',
    name: 'customer_product_mapping',
    category: 'Software Licensing',
    headerColor: '#06B6D4',
    headerBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-500/40',
    x: 1200,
    y: 220,
    description: 'Negotiated pricing matrix associating customers to customized product rates.',
    columns: [
      { name: 'id', type: 'varchar', isPk: true, comment: 'Mapping record ID' },
      { name: 'customer_id', type: 'varchar', isFk: true, fkTarget: 'customer.id', comment: 'Target customer ID' },
      { name: 'product_id', type: 'varchar', isFk: true, fkTarget: 'product.id', comment: 'Target product ID' },
      { name: 'product_sku', type: 'varchar', comment: 'Product SKU' },
      { name: 'product_unit_price', type: 'numeric', comment: 'Default list price' },
      { name: 'customer_unit_price', type: 'numeric', comment: 'Custom contracted price' }
    ]
  },
  {
    id: 'host_activation',
    name: 'host_activation',
    category: 'Software Licensing',
    headerColor: '#3B82F6',
    headerBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/40',
    x: 1200,
    y: 520,
    description: 'Hardware node and server host activations registered under license allocations.',
    columns: [
      { name: 'id', type: 'varchar', isPk: true, comment: 'Activation record ID' },
      { name: 'customer_host_id', type: 'varchar', comment: 'Server hostname / Node identifier' },
      { name: 'customer_id', type: 'varchar', isFk: true, fkTarget: 'customer.id', comment: 'Customer owner' },
      { name: 'contract_id', type: 'varchar', isFk: true, fkTarget: 'contract.id', comment: 'Contract reference' },
      { name: 'license_key', type: 'varchar', comment: 'Activated key hash' },
      { name: 'mac_address', type: 'varchar?', nullable: true, comment: 'Hardware MAC address' },
      { name: 'ip_address', type: 'varchar?', nullable: true, comment: 'Host IP address' },
      { name: 'activation_date', type: 'timestamp', comment: 'Node binding timestamp' },
      { name: 'license_active', type: 'tinyint', comment: '1 = Active Node, 0 = Revoked' },
      { name: 'hardware_fingerprint', type: 'varchar?', nullable: true, comment: 'CPU/BIOS hardware hash' }
    ]
  },
  {
    id: 'support_tier',
    name: 'support_tier',
    category: 'Support & Docs',
    headerColor: '#84CC16',
    headerBg: 'bg-lime-500/10 text-lime-600 dark:text-lime-400',
    borderColor: 'border-lime-500/40',
    x: 50,
    y: 980,
    description: 'SLA Support Tiers defining response guarantees and coverage hours.',
    columns: [
      { name: 'id', type: 'varchar', isPk: true, comment: 'Tier ID (e.g. tier-premium)' },
      { name: 'name', type: 'varchar', comment: 'Tier name (Platinum, Gold, Silver)' },
      { name: 'response_time', type: 'varchar', comment: 'Guaranteed SLA response time (e.g. 15 mins)' },
      { name: 'coverage_hours', type: 'varchar', comment: 'Coverage window (24/7/365, 8x5)' },
      { name: 'channels', type: 'json', comment: 'Communication channels (Phone, Slack, Ticket)' },
      { name: 'max_tickets', type: 'varchar', comment: 'Monthly ticket quota' },
      { name: 'direct_phone_access', type: 'tinyint', comment: '1 if hotline enabled' },
      { name: 'dedicated_liaison', type: 'tinyint', comment: '1 if dedicated TAM assigned' }
    ]
  },
  {
    id: 'doc_item',
    name: 'doc_item',
    category: 'Support & Docs',
    headerColor: '#14B8A6',
    headerBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-500/40',
    x: 420,
    y: 980,
    description: 'Technical documentation assets, API manuals, and integration runbooks.',
    columns: [
      { name: 'id', type: 'varchar', isPk: true, comment: 'Doc asset ID' },
      { name: 'title', type: 'varchar', comment: 'Document title' },
      { name: 'category', type: 'varchar', comment: 'Product Documentation, Support Documentation' },
      { name: 'product_id', type: 'varchar?', isFk: true, fkTarget: 'product.id', nullable: true, comment: 'Target product module link' },
      { name: 'customer_id', type: 'varchar?', isFk: true, fkTarget: 'customer.id', nullable: true, comment: 'Audience restriction customer link' },
      { name: 'associated_products', type: 'json?', nullable: true, comment: 'Target SKUs JSON array' },
      { name: 'is_published', type: 'tinyint', comment: '1 = Published, 0 = Draft' },
      { name: 'notes', type: 'text?', nullable: true, comment: 'Abstract / markdown overview' },
      { name: 'upload_date', type: 'date', comment: 'Release date' },
      { name: 'file_size', type: 'varchar', comment: 'File payload size' }
    ]
  },
  {
    id: 'audit_record',
    name: 'audit_record',
    category: 'Audit & System',
    headerColor: '#64748B',
    headerBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-500/40',
    x: 820,
    y: 840,
    description: 'System-wide compliance audit trail tracking operator actions and timestamps.',
    columns: [
      { name: 'id', type: 'varchar', isPk: true, comment: 'Audit log UUID' },
      { name: 'user_id', type: 'varchar?', isFk: true, fkTarget: 'user.id', nullable: true, comment: 'Operator user ID link' },
      { name: 'timestamp', type: 'timestamp', comment: 'UTC execution timestamp' },
      { name: 'action', type: 'varchar', comment: 'Action event (Create User, Modify Pricing, etc.)' },
      { name: 'user', type: 'varchar', comment: 'Operator email / identity' },
      { name: 'details', type: 'text', comment: 'Detailed payload diff' },
      { name: 'screen', type: 'varchar', comment: 'Target module (Users, Licenses, Customers)' }
    ]
  }
];

interface InteractiveSchemaERDProps {
  isDark: boolean;
}

export default function InteractiveSchemaERD({ isDark }: InteractiveSchemaERDProps) {
  const [activeTab, setActiveTab] = useState<'erd' | 'dictionary' | 'ddl'>('erd');
  const [tables, setTables] = useState<TableDef[]>(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<string | null>('account');
  const [hoveredRelId, setHoveredRelId] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<{ tableId: string; colName: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Dragging individual tables on canvas
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [tableDragOffset, setTableDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Code Copy state
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedSqlDialect, setSelectedSqlDialect] = useState<'postgres' | 'mysql' | 'drizzle'>('postgres');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-arrange tables in a clean, non-overlapping grid layout
  const handleAutoArrange = () => {
    const colXMap: Record<string, number> = {
      'Core Auth': 40,
      'Enterprise Tenancy': 380,
      'Software Licensing': 720,
      'Support & Docs': 1060,
      'Audit & System': 1060
    };

    const counters: Record<string, number> = {};

    setTables(prev => prev.map(table => {
      const x = colXMap[table.category] ?? 40;
      const index = counters[table.category] || 0;
      counters[table.category] = index + 1;

      let y = 40 + index * 340;
      if (table.category === 'Audit & System') {
        y = 520 + (index - 1) * 320;
      }

      return { ...table, x, y };
    }));
    setZoomLevel(0.85);
    setPanOffset({ x: 20, y: 20 });
  };

  // Filtered tables list
  const filteredTables = useMemo(() => {
    return tables.filter(t => {
      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.columns.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [tables, selectedCategory, searchQuery]);

  // Compute foreign key relationship connections
  const relationships = useMemo(() => {
    const rels: Array<{
      id: string;
      sourceTableId: string;
      sourceColName: string;
      targetTableId: string;
      targetColName: string;
      color: string;
    }> = [];

    tables.forEach(table => {
      table.columns.forEach(col => {
        if (col.isFk && col.fkTarget) {
          const [targetTable, targetCol] = col.fkTarget.split('.');
          const targetTableObj = tables.find(t => t.name === targetTable || t.id === targetTable);
          if (targetTableObj) {
            rels.push({
              id: `${table.id}.${col.name}->${targetTableObj.id}.${targetCol}`,
              sourceTableId: table.id,
              sourceColName: col.name,
              targetTableId: targetTableObj.id,
              targetColName: targetCol,
              color: table.headerColor
            });
          }
        }
      });
    });

    return rels;
  }, [tables]);

  // Handle Canvas Zoom Controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(1.5, prev + 0.15));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.4, prev - 0.15));
  const handleResetView = () => {
    setZoomLevel(0.85);
    setPanOffset({ x: 20, y: 20 });
  };

  // Canvas Mouse Events for Panning & Table Dragging
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.table-card-container')) return; // handled by table drag
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (draggingTableId) {
      const newX = Math.max(10, Math.round((e.clientX - tableDragOffset.x) / zoomLevel));
      const newY = Math.max(10, Math.round((e.clientY - tableDragOffset.y) / zoomLevel));
      setTables(prev => prev.map(t => t.id === draggingTableId ? { ...t, x: newX, y: newY } : t));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingTableId(null);
  };

  // Start dragging a table
  const handleTableMouseDown = (e: React.MouseEvent, table: TableDef) => {
    e.stopPropagation();
    setSelectedTableId(table.id);
    setDraggingTableId(table.id);
    setTableDragOffset({
      x: e.clientX - table.x * zoomLevel,
      y: e.clientY - table.y * zoomLevel
    });
  };

  // Generate DDL SQL Script
  const generateSqlScript = useMemo(() => {
    if (selectedSqlDialect === 'drizzle') {
      return `import { pgTable, varchar, timestamp, tinyint, integer, numeric, text, json, date } from 'drizzle-orm/pg-core';

${tables.map(table => `export const ${table.name} = pgTable('${table.name}', {
${table.columns.map(col => {
  let typeStr = 'varchar';
  if (col.type.startsWith('int')) typeStr = 'integer';
  if (col.type.startsWith('timestamp')) typeStr = 'timestamp';
  if (col.type.startsWith('numeric')) typeStr = 'numeric';
  if (col.type.startsWith('text')) typeStr = 'text';
  if (col.type.startsWith('json')) typeStr = 'json';
  if (col.type.startsWith('date')) typeStr = 'date';
  if (col.type.startsWith('tinyint')) typeStr = 'tinyint';

  let chain = `  ${col.name}: ${typeStr}('${col.name}')`;
  if (col.isPk) chain += `.primaryKey()`;
  if (!col.nullable && !col.isPk) chain += `.notNull()`;
  if (col.isFk && col.fkTarget) {
    const [t, c] = col.fkTarget.split('.');
    chain += `.references(() => ${t}.${c})`;
  }
  return chain;
}).join(',\n')}
});`).join('\n\n')}`;
    }

    if (selectedSqlDialect === 'mysql') {
      return `-- RACER ADMIN PANEL MASTER MYSQL DDL SPECIFICATION
-- Generated at: ${new Date().toISOString()}

CREATE DATABASE IF NOT EXISTS racer_admin_db;
USE racer_admin_db;

${tables.map(table => `CREATE TABLE IF NOT EXISTS \`${table.name}\` (
${table.columns.map(col => {
  let mysqlType = 'VARCHAR(255)';
  if (col.type.startsWith('int')) mysqlType = 'INT';
  if (col.type.startsWith('timestamp')) mysqlType = 'DATETIME';
  if (col.type.startsWith('numeric')) mysqlType = 'DECIMAL(12,2)';
  if (col.type.startsWith('text')) mysqlType = 'TEXT';
  if (col.type.startsWith('json')) mysqlType = 'JSON';
  if (col.type.startsWith('date')) mysqlType = 'DATE';
  if (col.type.startsWith('tinyint')) mysqlType = 'TINYINT(1)';

  let line = `  \`${col.name}\` ${mysqlType}`;
  if (col.isPk) line += ` PRIMARY KEY`;
  if (!col.nullable && !col.isPk) line += ` NOT NULL`;
  if (col.comment) line += ` COMMENT '${col.comment.replace(/'/g, "''")}'`;
  return line;
}).join(',\n')}${
  table.columns.some(c => c.isFk) 
    ? ',\n' + table.columns.filter(c => c.isFk && c.fkTarget).map(c => {
        const [t, colName] = c.fkTarget!.split('.');
        return `  CONSTRAINT \`fk_${table.name}_${c.name}\` FOREIGN KEY (\`${c.name}\`) REFERENCES \`${t}\` (\`${colName}\`) ON DELETE CASCADE`;
      }).join(',\n')
    : ''
}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='${table.description}';`).join('\n\n')}`;
    }

    // Default: PostgreSQL
    return `-- RACER ADMIN PANEL MASTER POSTGRESQL DDL SPECIFICATION
-- Generated at: ${new Date().toISOString()}

CREATE SCHEMA IF NOT EXISTS racer_admin;
SET search_path TO racer_admin, public;

${tables.map(table => `CREATE TABLE IF NOT EXISTS "${table.name}" (
${table.columns.map(col => {
  let pgType = 'VARCHAR(255)';
  if (col.type.startsWith('int')) pgType = 'INTEGER';
  if (col.type.startsWith('timestamp')) pgType = 'TIMESTAMPTZ';
  if (col.type.startsWith('numeric')) pgType = 'NUMERIC(12,2)';
  if (col.type.startsWith('text')) pgType = 'TEXT';
  if (col.type.startsWith('json')) pgType = 'JSONB';
  if (col.type.startsWith('date')) pgType = 'DATE';
  if (col.type.startsWith('tinyint')) pgType = 'SMALLINT';

  let line = `  "${col.name}" ${pgType}`;
  if (col.isPk) line += ` PRIMARY KEY`;
  if (!col.nullable && !col.isPk) line += ` NOT NULL`;
  return line;
}).join(',\n')}${
  table.columns.some(c => c.isFk) 
    ? ',\n' + table.columns.filter(c => c.isFk && c.fkTarget).map(c => {
        const [t, colName] = c.fkTarget!.split('.');
        return `  CONSTRAINT "fk_${table.name}_${c.name}" FOREIGN KEY ("${c.name}") REFERENCES "${t}" ("${colName}") ON DELETE CASCADE`;
      }).join(',\n')
    : ''
}
);

COMMENT ON TABLE "${table.name}" IS '${table.description.replace(/'/g, "''")}';`).join('\n\n')}`;
  }, [tables, selectedSqlDialect]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadSchemaJson = () => {
    const payload = JSON.stringify({
      schema_version: '2.4.0',
      system: 'RACER Enterprise Admin Panel',
      generated_at: new Date().toISOString(),
      tables: tables
    }, null, 2);

    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'racer_master_database_schema_spec.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* NAVIGATION TABS FOR SCHEMA VIEW */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 dark:border-[rgb(30, 41, 59)] border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
            <Database className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Master Database Schema Spec & ERD</span>
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-purple-600/60 text-white">
                v2.4
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
              Interactive entity relationship diagram, relational model schemas, foreign key links, and DDL exports.
            </p>
          </div>
        </div>

        {/* SUB-TABS */}
        <div className={`flex rounded-xl p-1 border ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'erd' 
                ? 'bg-purple-600/60 text-white shadow-xs' 
                : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive ERD Diagram</span>
          </button>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'dictionary' 
                ? 'bg-purple-600/60 text-white shadow-xs' 
                : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Data Dictionary</span>
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ddl' 
                ? 'bg-purple-600/60 text-white shadow-xs' 
                : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>SQL / DDL Generator</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE ERD CANVAS VIEW */}
      {activeTab === 'erd' && (
        <div className="space-y-4">
          
          {/* TOOLBAR CONTROLS */}
          <div className={`p-3 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
            isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-white border-slate-200 shadow-3xs'
          }`}>
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-bold text-[11px]">Domain:</span>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold outline-hidden ${
                    isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white' : 'bg-slate-50 border-slate-250 text-slate-800'
                  }`}
                >
                  <option value="all">All Domains (12 Tables)</option>
                  <option value="Core Auth">Core Auth & Accounts</option>
                  <option value="Enterprise Tenancy">Enterprise Tenancy</option>
                  <option value="Software Licensing">Software Licensing</option>
                  <option value="Support & Docs">Support & Manuals</option>
                  <option value="Audit & System">Audit Logs</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative w-48 sm:w-56">
                <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter tables or columns..."
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-hidden ${
                    isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Canvas Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={handleAutoArrange}
                title="Auto-Arrange Layout"
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isDark 
                    ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-slate-300 hover:text-white hover:border-slate-500' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Auto-Arrange Grid</span>
              </button>

              <div className={`flex items-center rounded-lg border p-1 gap-1 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1 min-w-10 text-center text-slate-600 dark:text-slate-300">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetView}
                  title="Reset View"
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleDownloadSchemaJson}
                className="px-2.5 py-1 bg-purple-600/60 hover:bg-purple-600/80 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Schema</span>
              </button>
            </div>
          </div>

          {/* CANVAS STAGE */}
          <div
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className={`relative w-full h-[680px] rounded-2xl border overflow-hidden select-none cursor-grab active:cursor-grabbing transition-colors ${
              isDark 
                ? 'bg-[#0B0D11] border-[rgb(30, 41, 59)]' 
                : 'bg-slate-50 border-slate-200'
            }`}
            style={{
              backgroundImage: isDark 
                ? 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)' 
                : 'radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
              backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
            }}
          >
            {/* SVG CANVAS CONNECTOR LINES FOR RELATIONSHIPS */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
              <defs>
                <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                {relationships.map(rel => {
                  const sourceTable = tables.find(t => t.id === rel.sourceTableId);
                  const targetTable = tables.find(t => t.id === rel.targetTableId);
                  if (!sourceTable || !targetTable) return null;

                  const isTableSelected = selectedTableId === sourceTable.id || selectedTableId === targetTable.id;
                  const isHovered = hoveredRelId === rel.id;
                  
                  const isColumnHovered = 
                    (hoveredColumn?.tableId === sourceTable.id && hoveredColumn?.colName === rel.sourceColName) ||
                    (hoveredColumn?.tableId === targetTable.id && hoveredColumn?.colName === rel.targetColName);

                  const isHighlighted = isTableSelected || isHovered || isColumnHovered;

                  // Compute exact row Y coordinates for column ports
                  const cardWidth = 288;
                  const getColIndex = (tbl: TableDef, colName: string) => {
                    const idx = tbl.columns.findIndex(c => c.name === colName);
                    return idx >= 0 ? idx : 0;
                  };

                  const sourceColIdx = getColIndex(sourceTable, rel.sourceColName);
                  const targetColIdx = getColIndex(targetTable, rel.targetColName);

                  // Table header ~41px + container padding top 8px + idx * 28px + idx * 4px gap + 14px row center
                  const sourceY = sourceTable.y + 41 + 8 + sourceColIdx * 28 + sourceColIdx * 4 + 14;
                  const targetY = targetTable.y + 41 + 8 + targetColIdx * 28 + targetColIdx * 4 + 14;

                  let sourceX = sourceTable.x + cardWidth;
                  let targetX = targetTable.x;
                  let sourceDir = 1;
                  let targetDir = -1;

                  if (targetTable.x < sourceTable.x) {
                    sourceX = sourceTable.x;
                    targetX = targetTable.x + cardWidth;
                    sourceDir = -1;
                    targetDir = 1;
                  }

                  const dx = Math.max(40, Math.abs(targetX - sourceX) * 0.45);
                  const cp1X = sourceX + sourceDir * dx;
                  const cp2X = targetX + targetDir * dx;

                  const pathD = `M ${sourceX} ${sourceY} C ${cp1X} ${sourceY}, ${cp2X} ${targetY}, ${targetX} ${targetY}`;
                  const midX = (sourceX + targetX) / 2;
                  const midY = (sourceY + targetY) / 2;

                  return (
                    <g 
                      key={rel.id} 
                      className="pointer-events-auto cursor-pointer group"
                      onMouseEnter={() => setHoveredRelId(rel.id)}
                      onMouseLeave={() => setHoveredRelId(null)}
                      onClick={() => {
                        setSelectedTableId(sourceTable.id);
                      }}
                    >
                      {/* Invisible wider hit-area path for easy hovering */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={16}
                      />

                      {/* Main Connection Path */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isHighlighted ? rel.color : (isDark ? '#334155' : '#cbd5e1')}
                        strokeWidth={isHighlighted ? 3 : 1.5}
                        strokeDasharray={isHighlighted ? '0' : '4 3'}
                        className="transition-all duration-200"
                        opacity={selectedTableId && !isHighlighted ? 0.2 : 0.85}
                        filter={isHighlighted ? 'url(#glow-line)' : undefined}
                      />

                      {/* Endpoint Port Dots */}
                      <circle
                        cx={sourceX}
                        cy={sourceY}
                        r={isHighlighted ? 4.5 : 3}
                        fill={isHighlighted ? rel.color : (isDark ? '#64748b' : '#94a3b8')}
                      />
                      <circle
                        cx={targetX}
                        cy={targetY}
                        r={isHighlighted ? 4.5 : 3}
                        fill={isHighlighted ? rel.color : (isDark ? '#64748b' : '#94a3b8')}
                      />

                      {/* Midpoint Badge on Hover or Select */}
                      {isHighlighted && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x={-60}
                            y={-11}
                            width={120}
                            height={22}
                            rx={11}
                            fill={isDark ? '#020617' : '#FFFFFF'}
                            stroke={rel.color}
                            strokeWidth={1.5}
                            className="shadow-md"
                          />
                          <text
                            x={0}
                            y={3}
                            textAnchor="middle"
                            fontSize={9}
                            fontWeight="bold"
                            fontFamily="monospace"
                            fill={isDark ? '#E2E8F0' : '#1E293B'}
                          >
                            {rel.sourceColName} → {rel.targetColName}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* DRAWABLE TABLE CARDS */}
            <div
              className="absolute inset-0 transform-origin-top-left transition-transform duration-75"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`
              }}
            >
              {filteredTables.map(table => {
                const isSelected = selectedTableId === table.id;
                const isRelated = relationships.some(
                  r => (r.sourceTableId === selectedTableId && r.targetTableId === table.id) ||
                       (r.targetTableId === selectedTableId && r.sourceTableId === table.id)
                );

                return (
                  <div
                    key={table.id}
                    onMouseDown={e => handleTableMouseDown(e, table)}
                    style={{ left: `${table.x}px`, top: `${table.y}px` }}
                    className={`table-card-container absolute w-72 rounded-xl border shadow-xl transition-all duration-150 z-20 cursor-move ${
                      table.borderColor
                    } ${
                      isSelected 
                        ? 'ring-2 ring-[purple-600] ring-offset-2 dark:ring-offset-[#0B0D11] z-30 scale-102' 
                        : isRelated
                        ? 'ring-1 ring-amber-400 opacity-100 z-25'
                        : selectedTableId && !isSelected
                        ? 'opacity-65 hover:opacity-100'
                        : 'opacity-100'
                    } ${
                      isDark ? 'bg-[#15181E]' : 'bg-white'
                    }`}
                  >
                    {/* TABLE HEADER (DrawSQL Styled) */}
                    <div className={`px-3.5 py-2.5 rounded-t-xl border-b flex items-center justify-between ${
                      table.headerBg
                    } ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <TableIcon className="w-4 h-4 shrink-0" />
                        <span className="font-extrabold text-xs font-mono truncate">{table.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                        isDark ? 'bg-black/30 text-white' : 'bg-white/80 text-slate-800'
                      }`}>
                        {table.columns.length} cols
                      </span>
                    </div>

                    {/* TABLE COLUMNS LIST */}
                    <div className="p-2 space-y-1 text-xs font-mono max-h-80 overflow-y-auto">
                      {table.columns.map((col, idx) => {
                        const isColHovered = hoveredColumn?.tableId === table.id && hoveredColumn?.colName === col.name;
                        const isFkConnected = relationships.some(
                          r => (r.sourceTableId === table.id && r.sourceColName === col.name && (hoveredRelId === r.id || selectedTableId === r.targetTableId)) ||
                               (r.targetTableId === table.id && r.targetColName === col.name && (hoveredRelId === r.id || selectedTableId === r.sourceTableId))
                        );

                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredColumn({ tableId: table.id, colName: col.name })}
                            onMouseLeave={() => setHoveredColumn(null)}
                            className={`flex items-center justify-between px-2 py-1 rounded-md transition-colors ${
                              isColHovered || isFkConnected
                                ? 'bg-purple-600/20 text-purple-600 dark:text-teal-300 font-bold ring-1 ring-[purple-600]/50'
                                : col.isPk 
                                ? (isDark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-900') 
                                : col.isFk 
                                ? (isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-900') 
                                : (isDark ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-50 text-slate-700')
                            }`}
                            title={col.comment || col.name}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              {col.isPk && <Key className="w-3 h-3 text-amber-500 shrink-0" />}
                              {col.isFk && <Link2 className="w-3 h-3 text-indigo-500 shrink-0" />}
                              {!col.isPk && !col.isFk && <span className="w-3 h-3 text-slate-400 text-center shrink-0">•</span>}
                              <span className={`truncate ${col.isPk ? 'font-bold' : ''}`}>
                                {col.name}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                              {col.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* FOOTER DETAIL ON SELECT */}
                    {isSelected && (
                      <div className={`p-2.5 border-t text-[11px] font-sans ${
                        isDark ? 'border-gray-800 text-slate-400 bg-black/20' : 'border-slate-100 text-slate-500 bg-slate-50/80'
                      }`}>
                        <p className="line-clamp-2 leading-tight">{table.description}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* INSPECTOR CARD BELOW CANVAS */}
          {selectedTableId && (() => {
            const selectedTable = tables.find(t => t.id === selectedTableId);
            if (!selectedTable) return null;
            return (
              <div className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-3xs'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 mb-4 dark:border-[rgb(30, 41, 59)] border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${selectedTable.headerBg}`}>
                      <TableIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm font-mono flex items-center gap-2">
                        <span>Table: {selectedTable.name}</span>
                        <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {selectedTable.category}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                        {selectedTable.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    {selectedTable.columns.length} columns defined
                  </div>
                </div>

                {/* COLUMNS TABLE SPEC */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                        isDark ? 'border-[rgb(30, 41, 59)] text-gray-400' : 'border-slate-100 text-slate-500'
                      }`}>
                        <th className="py-2 px-3">Column Name</th>
                        <th className="py-2 px-3">Data Type</th>
                        <th className="py-2 px-3">Constraints / Keys</th>
                        <th className="py-2 px-3">Nullable</th>
                        <th className="py-2 px-3">Description & Usage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-[rgb(30, 41, 59)] divide-slate-100 font-mono">
                      {selectedTable.columns.map((col, idx) => (
                        <tr key={idx} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                          <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                            {col.isPk && <Key className="w-3.5 h-3.5 text-amber-500" />}
                            {col.isFk && <Link2 className="w-3.5 h-3.5 text-indigo-500" />}
                            <span>{col.name}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 dark:text-gray-400">
                            {col.type}
                          </td>
                          <td className="py-2.5 px-3">
                            {col.isPk && (
                              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                PRIMARY KEY
                              </span>
                            )}
                            {col.isFk && (
                              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                                FOREIGN KEY ({col.fkTarget})
                              </span>
                            )}
                            {!col.isPk && !col.isFk && <span className="text-slate-400">-</span>}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {col.nullable ? 'YES (NULL)' : 'NO (NOT NULL)'}
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-gray-300 text-xs">
                            {col.comment || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: DATA DICTIONARY */}
      {activeTab === 'dictionary' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-purple-600" />
                <span>RACER Comprehensive Relational Data Dictionary</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Full column specifications, nullability guidelines, and relationships across all enterprise models.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tables..."
                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-hidden ${
                  isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div className="space-y-6">
            {filteredTables.map(table => (
              <div
                key={table.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-3xs'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${table.headerBg}`}>
                      <TableIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mono font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{table.name}</span>
                        <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {table.category}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400">{table.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{table.columns.length} columns</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                        isDark ? 'border-[rgb(30, 41, 59)] text-gray-400' : 'border-slate-100 text-slate-500'
                      }`}>
                        <th className="py-2 px-3">Column</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Key / Constraint</th>
                        <th className="py-2 px-3">Null?</th>
                        <th className="py-2 px-3">Specification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-[rgb(30, 41, 59)] divide-slate-100 font-mono">
                      {table.columns.map((col, idx) => (
                        <tr key={idx} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                          <td className="py-2 px-3 font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                            {col.isPk && <Key className="w-3.5 h-3.5 text-amber-500" />}
                            {col.isFk && <Link2 className="w-3.5 h-3.5 text-indigo-500" />}
                            <span>{col.name}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 dark:text-gray-400">{col.type}</td>
                          <td className="py-2 px-3">
                            {col.isPk && <span className="text-amber-500 font-bold text-[10px]">PK</span>}
                            {col.isFk && <span className="text-indigo-400 font-bold text-[10px]">FK ({col.fkTarget})</span>}
                            {!col.isPk && !col.isFk && <span className="text-slate-400">-</span>}
                          </td>
                          <td className="py-2 px-3 text-slate-400">{col.nullable ? 'YES' : 'NO'}</td>
                          <td className="py-2 px-3 font-sans text-slate-600 dark:text-gray-300 text-xs">{col.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SQL / DDL CODE GENERATOR */}
      {activeTab === 'ddl' && (
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-3xs'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 mb-4 dark:border-[rgb(30, 41, 59)] border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-600" />
                  <span>DDL & ORM Schema Code Generator</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Copy production-ready SQL scripts for PostgreSQL, MySQL, or Drizzle ORM definitions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex rounded-lg p-1 border ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-100 border-slate-200'}`}>
                  <button
                    onClick={() => setSelectedSqlDialect('postgres')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectedSqlDialect === 'postgres' ? 'bg-purple-600/60 text-white shadow-2xs' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    PostgreSQL
                  </button>
                  <button
                    onClick={() => setSelectedSqlDialect('mysql')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectedSqlDialect === 'mysql' ? 'bg-purple-600/60 text-white shadow-2xs' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    MySQL
                  </button>
                  <button
                    onClick={() => setSelectedSqlDialect('drizzle')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectedSqlDialect === 'drizzle' ? 'bg-purple-600/60 text-white shadow-2xs' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Drizzle ORM
                  </button>
                </div>

                <button
                  onClick={() => copyToClipboard(generateSqlScript)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* CODE DISPLAY */}
            <div className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed ${
              isDark ? 'bg-[#0B0D11] border-[rgb(30, 41, 59)] text-emerald-400' : 'bg-slate-900 border-slate-800 text-emerald-400'
            }`}>
              <pre>{generateSqlScript}</pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
