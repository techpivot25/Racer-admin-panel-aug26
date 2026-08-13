import React, { useState, useMemo, useRef } from 'react';
import { CustomSelect } from './CustomSelect';
import InteractiveSchemaERD from './InteractiveSchemaERD';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  Download,
  X,
  Shield,
  Database,
  Eye,
  EyeOff,
  Layers,
  BookOpen
} from 'lucide-react';
import { DocItem, Product, Customer, AdminUser, SupportTierInfo } from '../types';

interface DocsTabProps {
  documents: DocItem[];
  products: Product[];
  customers: Customer[];
  users?: AdminUser[];
  supportTiers?: SupportTierInfo[];
  onAddDoc: (doc: DocItem) => void;
  onEditDoc: (doc: DocItem) => void;
  onDeleteDoc: (id: string) => void;
  t: Record<string, string>;
  isDark: boolean;
}

export default function DocsTab({
  documents,
  products,
  customers,
  users = [],
  supportTiers = [],
  onAddDoc,
  onEditDoc,
  onDeleteDoc,
  t,
  isDark
}: DocsTabProps) {
  // Navigation Sub-tab within Documentation
  const [docSubTab, setDocSubTab] = useState<'schema' | 'assets'>('schema');

  // Repository search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCustomerScope, setSelectedCustomerScope] = useState<string>('all'); 
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal states for CRUD operations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocItem | null>(null);

  // Form states for adding/editing a document
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Product Documentation' | 'Support Documentation'>('Product Documentation');
  const [associatedProducts, setAssociatedProducts] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [notes, setNotes] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [targetCustomerIds, setTargetCustomerIds] = useState<string[]>([]); 

  // Drag and drop file handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleUploadedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleUploadedFile(file);
    }
  };

  const handleUploadedFile = (file: File) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setTitle(file.name.replace(/\.[^/.]+$/, "")); 
    setFileSize(`${sizeInMB} MB`);
    setCategory(file.name.toLowerCase().includes('support') ? 'Support Documentation' : 'Product Documentation');
    setIsPublished(true);
    setNotes(`Uploaded document: ${file.name}`);
    setIsModalOpen(true);
  };

  const triggerFileClick = () => {
    fileInputRef.current?.click();
  };

  // Filtered documents list based on search query, category, and audience filters
  const filteredDocs = useMemo(() => {
    let result = documents;

    if (selectedCategory !== 'all') {
      result = result.filter(d => d.category === selectedCategory);
    }

    if (selectedCustomerScope !== 'all') {
      result = result.filter(d => 
        d.targetCustomerIds && d.targetCustomerIds.includes(selectedCustomerScope)
      );
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        d => 
          d.title.toLowerCase().includes(q) ||
          d.notes.toLowerCase().includes(q) ||
          d.associatedProducts.some(p => p.toLowerCase().includes(q))
      );
    }

    return result;
  }, [documents, selectedCategory, selectedCustomerScope, searchQuery]);

  function openAddModal() {
    setEditingDoc(null);
    setTitle('');
    setCategory('Product Documentation');
    setAssociatedProducts([]);
    setIsPublished(true);
    setNotes('');
    setFileSize('1.5 MB');
    setTargetCustomerIds([]);
    setIsModalOpen(true);
  }

  function openEditModal(doc: DocItem) {
    setEditingDoc(doc);
    setTitle(doc.title);
    setCategory(doc.category);
    setAssociatedProducts(doc.associatedProducts);
    setIsPublished(doc.isPublished);
    setNotes(doc.notes);
    setFileSize(doc.fileSize);
    setTargetCustomerIds(doc.targetCustomerIds || []);
    setIsModalOpen(true);
  }

  function toggleProductSku(sku: string) {
    if (associatedProducts.includes(sku)) {
      setAssociatedProducts(associatedProducts.filter(s => s !== sku));
    } else {
      setAssociatedProducts([...associatedProducts, sku]);
    }
  }

  function toggleTargetCustomerId(id: string) {
    if (targetCustomerIds.includes(id)) {
      setTargetCustomerIds(targetCustomerIds.filter(cid => cid !== id));
    } else {
      setTargetCustomerIds([...targetCustomerIds, id]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const docData: DocItem = {
      id: editingDoc ? editingDoc.id : `doc-${Date.now()}`,
      title,
      category,
      associatedProducts,
      isPublished,
      notes,
      targetCustomerIds,
      uploadDate: editingDoc ? editingDoc.uploadDate : new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      fileSize
    };

    if (editingDoc) {
      onEditDoc(docData);
    } else {
      onAddDoc(docData);
    }
    setIsModalOpen(false);
  }

  const handleDownloadDoc = (doc: DocItem) => {
    const content = `===========================================================
B&J ENTERPRISE TECHNICAL DOCUMENT REFERENCE
===========================================================
Title: ${doc.title}
Category: ${doc.category}
Date of Release: ${doc.uploadDate}
Last Modified: ${doc.lastModified || doc.uploadDate}
File Size: ${doc.fileSize}
Target Audience Scope: ${!doc.targetCustomerIds || doc.targetCustomerIds.length === 0 ? '🌍 Global (All Customers)' : doc.targetCustomerIds.join(', ')}
Associated Products (SKUs): ${doc.associatedProducts.join(', ') || 'Global Infrastructure'}
-----------------------------------------------------------
DOCUMENT SUMMARY & DESCRIPTION:
${doc.notes || 'No description or technical notes have been appended to this file.'}
-----------------------------------------------------------
Disclaimer: This is a secure, system-generated enterprise technical documentation briefing. Use this document only under the authorized licensing agreements of your corporate SLA contract.
===========================================================
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const sanitizedTitle = doc.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.href = url;
    link.download = `${sanitizedTitle}_document_export.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* MAIN DOCUMENTATION HEADER & PRIMARY SUB-TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 dark:border-[rgb(30, 41, 59)] border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
            <Database className="w-5.5 h-5.5 text-purple-600 dark:text-purple-400" />
            <span>{t.documentation}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
            Interactive system architecture, master database schema spec, ERD diagrams, and technical manual runbooks.
          </p>
        </div>
        
        {/* PRIMARY SUB-TAB NAVIGATION */}
        <div className={`flex rounded-xl p-1 border shrink-0 ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setDocSubTab('schema')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              docSubTab === 'schema' 
                ? 'bg-purple-600/60 text-white shadow-xs' 
                : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Master Database Schema Spec & ERD</span>
          </button>
          <button
            onClick={() => setDocSubTab('assets')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              docSubTab === 'assets' 
                ? 'bg-purple-600/60 text-white shadow-xs' 
                : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Technical Manuals & Asset Library</span>
          </button>
        </div>
      </div>

      {/* RENDER SCHEMA & ERD TAB */}
      {docSubTab === 'schema' && (
        <InteractiveSchemaERD isDark={isDark} />
      )}

      {/* RENDER ASSETS REPOSITORY TAB */}
      {docSubTab === 'assets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Technical Manuals & Document Asset Library</span>
            </h3>
            <button
              onClick={openAddModal}
              className="px-3 py-1.5 bg-purple-600/60 hover:bg-purple-600/80 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish New Doc Asset</span>
            </button>
          </div>

          {/* VERIFICATION BANNER */}
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all bg-transparent ${isDark ? 'border-gray-700 text-white' : 'border-gray-300 text-slate-800'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'}`}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-extrabold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-mono ${isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-200 text-slate-700 border border-slate-300'}`}>
                    Verified Operator Session
                  </span>
                  <span className={`text-xs font-mono ${isDark ? 'text-gray-300' : 'text-slate-500'}`}>• Active Secure Domain</span>
                </div>
                <p className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Authenticated Workspace
                </p>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  Manage public or access-restricted product catalogs, system schemas, and SLA integration guidelines.
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 shrink-0 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md ${isDark ? 'bg-black/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-slate-400' : 'bg-slate-600'}`}></span>
              <span>ROLE: ADMIN_DOCS_ROOT</span>
            </div>
          </div>
      
      {/* DATABASE SCHEMA ATTACHMENT EXPORTS */}
      <div className={`p-4 rounded-xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all bg-transparent ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg shrink-0 ${isDark ? 'bg-slate-800 text-purple-400' : 'bg-slate-100 text-purple-600'}`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-xs font-extrabold uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Master Database Schema Spec & ERD
            </h3>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Download and view the comprehensive system schema representing all relational tables, types, OIDC security guidelines, and primary relationships.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0 font-sans">
          <a
            href="/admin_panel_schema.md"
            download="racer_admin_panel_schema.md"
            className="flex-1 lg:flex-none px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Markdown Spec (.md)</span>
          </a>
          <a
            href="/admin_panel_schema.json"
            download="racer_admin_panel_schema.json"
            className="flex-1 lg:flex-none px-3 py-1 bg-purple-600/60 hover:bg-purple-600/80 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON Mapping (.json)</span>
          </a>
        </div>
      </div>

      {/* DRAG AND DROP ZONE */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileClick}
        className={`p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-gray-500 bg-slate-100 dark:bg-slate-800/50 scale-99' 
            : (isDark ? 'border-gray-700 bg-gray-900/30 hover:border-gray-500 hover:bg-gray-900/50' : 'border-slate-300 bg-slate-50/50 hover:border-slate-500 hover:bg-white hover:shadow-xs')
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden" 
          accept=".pdf,.doc,.docx,.txt,.zip,.json"
        />
        <div className="max-w-md mx-auto flex flex-col items-center gap-3">
          <div className={`p-3 rounded-full ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
            <UploadCloud className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h4 className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Drag & Drop Technical Documents Here
            </h4>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              Or click to select a file from your machine. Supports PDF, DOCX, TXT, or JSON formats.
            </p>
          </div>
        </div>
      </div>

      {/* FILTER BAR & SEARCH FIELD */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex rounded-xl p-1 border ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)]' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedCategory === 'all' ? 'bg-purple-600/60 text-white shadow-xs' : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
            >
              All Docs
            </button>
            <button
              onClick={() => setSelectedCategory('Product Documentation')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedCategory === 'Product Documentation' ? 'bg-purple-600/60 text-white shadow-xs' : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
            >
              Product Handbooks
            </button>
            <button
              onClick={() => setSelectedCategory('Support Documentation')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedCategory === 'Support Documentation' ? 'bg-purple-600/60 text-white shadow-xs' : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
            >
              Support Manuals
            </button>
          </div>

          {/* AUDIENCE SELECT */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-bold">Audience:</span>
            <CustomSelect
              value={selectedCustomerScope}
              onChange={val => setSelectedCustomerScope(val)}
              options={[
                { value: 'all', label: 'Global (All Customers)' },
                ...customers.map(c => ({ value: c.id, label: c.name }))
              ]}
              className="w-56"
              isDark={isDark}
            />
          </div>
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-full lg:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-hidden transition-all ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white focus:border-purple-600' : 'bg-slate-50 border-slate-250 text-slate-800 focus:border-purple-600'}`}
            placeholder="Search documents or SKU codes..."
          />
        </div>
      </div>

      {/* DOCUMENTS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDocs.map(doc => (
          <div 
            key={doc.id}
            className={`group p-5 rounded-xl border flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
              isDark 
                ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] hover:border-purple-600/40' 
                : 'bg-white border-slate-200 shadow-3xs hover:border-purple-600'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg transition-colors ${
                    doc.isPublished 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{doc.title}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">{doc.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const updatedDoc: DocItem = {
                        ...doc,
                        isPublished: !doc.isPublished,
                        lastModified: new Date().toISOString().split('T')[0]
                      };
                      onEditDoc(updatedDoc);
                    }}
                    title={doc.isPublished ? "Unpublish Document" : "Publish Document"}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      doc.isPublished 
                        ? 'hover:bg-amber-500/15 text-amber-500' 
                        : 'hover:bg-emerald-500/15 text-emerald-500'
                    }`}
                  >
                    {doc.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => openEditModal(doc)}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-300 transition-colors cursor-pointer"
                    title="Edit Metadata"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteDoc(doc.id)}
                    className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{doc.notes}</p>

              {/* PRODUCT SKUs */}
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[9px] font-bold text-gray-500 mr-1 flex items-center gap-0.5"><Tag className="w-3 h-3" /> SKU Links:</span>
                {(!doc.associatedProducts || doc.associatedProducts.length === 0) ? (
                  <span className="text-[9px] text-gray-500 italic">Global Infrastructure</span>
                ) : (
                  doc.associatedProducts.map(sku => (
                    <span key={sku} className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono ${isDark ? 'bg-slate-850 text-slate-300 border border-slate-850' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      {sku}
                    </span>
                  ))
                )}
              </div>

              {/* AUDIENCE TARGET */}
              <div className="flex flex-wrap gap-1 items-center border-t dark:border-gray-800 border-slate-100 pt-2.5">
                <span className="text-[9px] font-extrabold text-gray-500 mr-1">Audience Scope:</span>
                {(!doc.targetCustomerIds || doc.targetCustomerIds.length === 0) ? (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-600">
                    🌍 Global (All Tenants)
                  </span>
                ) : (
                  doc.targetCustomerIds.map(cid => {
                    const cName = customers.find(c => c.id === cid)?.name || cid;
                    return (
                      <span key={cid} className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-700'}`}>
                        🏢 {cName}
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t dark:border-gray-800 border-slate-100 flex justify-between items-center text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1">
                {doc.isPublished ? (
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold"><CheckCircle2 className="w-3 h-3" /> {t.published}</span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-500 font-semibold"><AlertCircle className="w-3 h-3" /> {t.unpublished}</span>
                )}
              </span>
              <span>Size: {doc.fileSize}</span>
              <button 
                className="text-black dark:text-white font-bold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                onClick={() => handleDownloadDoc(doc)}
              >
                <Download className="w-3.5 h-3.5" /> Export TXT
              </button>
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 text-xs">
            No secure technical documents matching selected filters found.
          </div>
        )}
      </div>
      </div>
      )}

      {/* DOCUMENT EDIT/ADD DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          <div className={`relative w-full max-w-lg rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base">
                {editingDoc ? 'Edit Technical Snapshot' : 'Register New Document Asset'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-black/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-bold">Document Title</label>
                <input 
                  type="text" 
                  required
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold">Category</label>
                  <CustomSelect
                    value={category}
                    onChange={val => setCategory(val as any)}
                    options={[
                      { value: "Product Documentation", label: "Product Documentation" },
                      { value: "Support Documentation", label: "Support Documentation" }
                    ]}
                    isDark={isDark}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Status</label>
                  <CustomSelect
                    value={isPublished ? 'true' : 'false'}
                    onChange={val => setIsPublished(val === 'true')}
                    options={[
                      { value: "true", label: "Published (Visible to scoped users)" },
                      { value: "false", label: "Unpublished (Draft snapshot)" }
                    ]}
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* Tag SKUs */}
              <div className="space-y-1">
                <label className="font-bold block mb-1">Tag Product SKUs</label>
                <div className={`p-3 rounded-lg border max-h-32 overflow-y-auto space-y-2 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}>
                  {products.map(p => {
                    const isTagged = associatedProducts.includes(p.sku);
                    return (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isTagged}
                          onChange={() => toggleProductSku(p.sku)}
                          className="rounded-sm border-slate-300 text-purple-600 focus:ring-purple-600 cursor-pointer"
                        />
                        <span>{p.name} ({p.sku})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Tag Customers */}
              <div className="space-y-1">
                <label className="font-bold block mb-1">Restrict Audience Scope</label>
                <div className={`p-3 rounded-lg border max-h-32 overflow-y-auto space-y-2 ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}>
                  {customers.map(c => {
                    const isTargeted = targetCustomerIds.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isTargeted}
                          onChange={() => toggleTargetCustomerId(c.id)}
                          className="rounded-sm border-slate-300 text-purple-600 focus:ring-purple-600 cursor-pointer"
                        />
                        <span>{c.name} ({c.id})</span>
                      </label>
                    );
                  })}
                  {customers.length === 0 && (
                    <span className="text-[10px] text-gray-500 italic">No onboarded corporate customers found.</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400">
                  Select corporate clients to restrict this document asset to. If none are selected, the document remains Globally scoped.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Document Abstract & Technical Notes</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  rows={2.5}
                  required
                  placeholder="Append technical summaries, integration hashes, or runbook guidelines here..."
                  className={`w-full p-2 rounded-lg border outline-hidden ${isDark ? 'bg-[#020617] border-[rgb(30, 41, 59)]' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 text-xs font-bold">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className={`px-3 py-1.5 rounded-lg border cursor-pointer ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-slate-300 hover:bg-slate-100'}`}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-purple-600/60 hover:bg-purple-600/80 text-white rounded-lg cursor-pointer font-bold shadow-xs transition-all"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
