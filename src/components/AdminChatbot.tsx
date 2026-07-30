import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Download, 
  BarChart3, 
  FileText, 
  X, 
  Trash2, 
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

interface AdminChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  panelData: any;
  isDark: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function AdminChatbot({ isOpen, onClose, panelData, isDark }: AdminChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I am your B&J Enterprise Admin Intelligent Assistant. I have real-time access to your admin records, active contracts, users, and product licenses.\n\nAsk me anything! For example:\n* *'Show a chart of active contracts value'* \n* *'Summarize our products and SLAs'* \n* *'Export a spreadsheet report of all users and roles'*",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    { label: 'SLA Products Summary', prompt: 'Summarize our products and client counts on each.' },
    { label: 'Revenue Chart', prompt: 'Show a bar chart of total contract values by customer name.' },
    { label: 'Users Export', prompt: 'Provide a report spreadsheet of all admin and customer users.' },
    { label: 'Product Price Audit', prompt: 'List all products, their families, and their pricing.' }
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Map history for the model API (excluding welcome message to keep payload tidy, or including all)
      const apiHistory = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: apiHistory,
          panelData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with AI server.');
      }

      const botMessage: Message = {
        id: Math.random().toString(),
        role: 'model',
        text: data.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Server connection issue. Please make sure GEMINI_API_KEY is configured.');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear the chat conversation?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: "Chat cleared! Ask me anything about your users, contracts, licenses, analytics, or products.",
          timestamp: new Date()
        }
      ]);
      setError(null);
    }
  };

  // Parses Markdown text to extract custom Chart or Report blocks
  const parsedMessages = useMemo(() => {
    return messages.map(msg => {
      const regex = /```json\s*([\s\S]*?)\s*```/g;
      const elements: Array<{ type: 'text' | 'chart' | 'report'; content: any }> = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(msg.text)) !== null) {
        const textBefore = msg.text.substring(lastIndex, match.index);
        if (textBefore.trim()) {
          elements.push({ type: 'text', content: textBefore });
        }

        try {
          const parsed = JSON.parse(match[1]);
          if (parsed.type === 'chart') {
            elements.push({ type: 'chart', content: parsed });
          } else if (parsed.type === 'report') {
            elements.push({ type: 'report', content: parsed });
          } else {
            elements.push({ type: 'text', content: match[0] });
          }
        } catch (e) {
          elements.push({ type: 'text', content: match[0] });
        }

        lastIndex = regex.lastIndex;
      }

      const textAfter = msg.text.substring(lastIndex);
      if (textAfter.trim()) {
        elements.push({ type: 'text', content: textAfter });
      }

      if (elements.length === 0 && msg.text) {
        elements.push({ type: 'text', content: msg.text });
      }

      return {
        ...msg,
        elements
      };
    });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] md:w-[540px] shadow-2xl flex flex-col border-l transition-transform duration-300 transform translate-x-0 ${
        isDark 
          ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-gray-100' 
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* CHAT HEADER */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isDark ? 'border-[rgb(30, 41, 59)] bg-[#0f172a]' : 'border-slate-100 bg-slate-50'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-600 animate-pulse">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
              B&J AI Assistant
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-purple-600/10 text-purple-600 dark:text-purple-600 font-black uppercase tracking-wider animate-bounce">
                Live
              </span>
            </h3>
            <span className="text-[10px] text-gray-400 font-semibold block">
              Context-Aware Admin Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={clearHistory}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-rose-500/15 hover:text-rose-500 text-gray-400`}
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-slate-500/15 text-gray-400`}
            title="Close Assistant"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* CHAT THREAD */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {parsedMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender tag */}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">
              {msg.role === 'user' ? 'You' : 'B&J Intelligence'}
            </span>

            {/* Message block */}
            <div className={`max-w-[95%] rounded-2xl px-4 py-3 shadow-xs space-y-3 ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-tr-none'
                : (isDark ? 'bg-[#0f172a] text-gray-200 border border-[rgb(30, 41, 59)]' : 'bg-slate-50 text-slate-800 border border-slate-100') + ' rounded-tl-none'
            }`}>
              {msg.elements.map((el, index) => {
                if (el.type === 'text') {
                  return (
                    <div key={index} className="text-xs leading-relaxed whitespace-pre-wrap break-words font-medium">
                      {el.content}
                    </div>
                  );
                } else if (el.type === 'chart') {
                  return (
                    <div key={index} className="pt-2">
                      <ChartRenderer chartData={el.content} isDark={isDark} />
                    </div>
                  );
                } else if (el.type === 'report') {
                  return (
                    <div key={index} className="pt-2">
                      <ReportRenderer reportData={el.content} isDark={isDark} />
                    </div>
                  );
                }
                return null;
              })}
            </div>
            
            <span className="text-[9px] text-gray-400 font-bold mt-1 px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">
              B&J Intelligence
            </span>
            <div className={`rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3 ${
              isDark ? 'bg-[#0f172a] border border-[rgb(30, 41, 59)]' : 'bg-slate-50 border border-slate-100'
            }`}>
              <RefreshCw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-600 animate-spin" />
              <span className="text-xs font-bold text-purple-600 dark:text-purple-600 animate-pulse">
                Analyzing Live Records & Synthesizing Insights...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK PROMPTS GRID */}
      {messages.length === 1 && (
        <div className={`p-4 border-t ${isDark ? 'border-[rgb(30, 41, 59)] bg-[#12151B]' : 'border-slate-100 bg-slate-50/50'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
            Suggested Administrative Queries
          </span>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp.prompt)}
                className={`text-left p-2.5 rounded-lg border text-[11px] font-bold transition-all hover:scale-[1.01] hover:border-purple-600 cursor-pointer ${
                  isDark 
                    ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-gray-300 hover:bg-[#20252C]' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-3xs'
                }`}
              >
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-600 mb-0.5">
                  <Sparkles className="w-3 h-3" />
                  <span>{qp.label}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium block truncate">
                  {qp.prompt}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CHAT INPUT AREA */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className={`p-3 border-t flex items-center gap-2 ${
          isDark ? 'border-[rgb(30, 41, 59)] bg-[#0f172a]' : 'border-slate-100 bg-white'
        }`}
      >
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Ask about users, licenses, projected revenue..."
          className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold outline-hidden transition-all ${
            isDark 
              ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white focus:border-purple-600' 
              : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-600'
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className={`p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

// Sub-component to render interactive Recharts graphs in chat
function ChartRenderer({ chartData, isDark }: { chartData: any; isDark: boolean }) {
  const chartType = chartData.chartType || 'bar';
  const title = chartData.title || 'Data Analytics Graph';
  const data = chartData.data || [];
  const xKey = chartData.xAxisKey || 'name';
  const yKey = chartData.yAxisKey || 'value';

  // Palette colors for premium graphs
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className={`p-3 rounded-xl border mt-1 space-y-2 w-full ${
      isDark ? 'bg-black/30 border-[rgb(30, 41, 59)]' : 'bg-white border-slate-100 shadow-3xs'
    }`}>
      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-600">
        <BarChart3 className="w-3.5 h-3.5" />
        <span>{title}</span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey={xKey} tick={{ fill: '#888', fontSize: 9 }} />
              <YAxis tick={{ fill: '#888', fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 10, background: isDark ? '#1F2937' : '#FFF', color: isDark ? '#FFF' : '#000' }} />
              <Line type="monotone" dataKey={yKey} stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} />
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey={xKey} tick={{ fill: '#888', fontSize: 9 }} />
              <YAxis tick={{ fill: '#888', fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 10, background: isDark ? '#1F2937' : '#FFF', color: isDark ? '#FFF' : '#000' }} />
              <Area type="monotone" dataKey={yKey} stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
            </AreaChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={3}
                dataKey={yKey}
                nameKey={xKey}
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 10, background: isDark ? '#1F2937' : '#FFF', color: isDark ? '#FFF' : '#000' }} />
            </PieChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey={xKey} tick={{ fill: '#888', fontSize: 9 }} />
              <YAxis tick={{ fill: '#888', fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 10, background: isDark ? '#1F2937' : '#FFF', color: isDark ? '#FFF' : '#000' }} />
              <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Sub-component to render clean tables with multi-format download capabilities
function ReportRenderer({ reportData, isDark }: { reportData: any; isDark: boolean }) {
  const filename = reportData.filename || 'bj_admin_report.csv';
  const columns: string[] = reportData.columns || [];
  const rows: any[][] = reportData.rows || [];

  const handleDownloadCSV = () => {
    // Escaping routine for safe CSV formatting
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csvContent = [
      columns.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    // Maps rows into a JSON array of objects key-mapped by column titles
    const jsonObjects = rows.map(row => {
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    const jsonContent = JSON.stringify(jsonObjects, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.replace('.csv', '.json'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-3 rounded-xl border mt-1 space-y-3 w-full ${
      isDark ? 'bg-black/30 border-[rgb(30, 41, 59)]' : 'bg-white border-slate-100 shadow-3xs'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b dark:border-gray-800 border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-500">
          <FileText className="w-3.5 h-3.5" />
          <span>{filename.replace('.csv', '')} Report</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold transition-all hover:bg-emerald-500/20 cursor-pointer"
            title="Download formatted CSV spreadsheet"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
          <button 
            onClick={handleDownloadJSON}
            className="flex items-center gap-1 px-2 py-1 rounded bg-purple-600/10 text-purple-600 dark:text-purple-600 text-[10px] font-bold transition-all hover:bg-purple-600/20 cursor-pointer"
            title="Download JSON structured data"
          >
            <Download className="w-3 h-3" />
            JSON
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-48 rounded-lg border dark:border-gray-800 border-slate-100">
        <table className="w-full text-left text-[10px] border-collapse">
          <thead className={isDark ? 'bg-gray-850' : 'bg-slate-50'}>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="p-2 border-b dark:border-gray-800 border-slate-100 font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className={isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2 border-b dark:border-gray-800 border-slate-100 font-medium">
                    {String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
