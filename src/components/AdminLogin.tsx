import { useState, FormEvent } from 'react';
import { User, Lock, Mail, Sun, Moon, Info, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../types';

interface AdminLoginProps {
  onLoginSuccess: (adminName: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  currentLang: Language;
  onChangeLang: (lang: Language) => void;
  t: Record<string, string>;
}

export default function AdminLogin({
  onLoginSuccess,
  isDark,
  onToggleTheme,
  currentLang,
  onChangeLang,
  t
}: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Normalize inputs for validation (allowing literal 'admin' or email-like entries starting with 'admin')
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password;

    if (trimmedUser === 'admin' && trimmedPass === 'admin') {
      // Success! Log the user in
      onLoginSuccess('Super Admin');
    } else {
      setErrorMsg('Invalid login ID or password. Tip: use admin / admin');
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${
      isDark 
        ? 'bg-radial from-[#1e293b] via-[#0f172a] to-[#020617] text-white' 
        : 'bg-radial from-[#eff6ff] via-[#dbeafe] to-[#93c5fd] text-slate-800'
    }`}>
      
      {/* Decorative Blur Background Spheres mimicking the image's smooth blue gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -60, 40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl"
        />
        <motion.div 
          animate={{
            x: [0, -40, 60, 0],
            y: [0, 80, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/15 dark:bg-indigo-900/15 blur-3xl"
        />
        <div className="absolute top-[30%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-cyan-400/10 dark:bg-cyan-800/10 blur-3xl" />
      </div>

      {/* TOP BAR controls for Theme & Language selector */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {/* Language selector */}
        <div className="flex rounded-lg p-0.5 border border-slate-300/40 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-md">
          {(['EN', 'FR', 'SP'] as Language[]).map((langOption) => (
            <button
              key={langOption}
              onClick={() => onChangeLang(langOption)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                currentLang === langOption 
                  ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {langOption}
            </button>
          ))}
        </div>

        {/* Theme button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg border border-slate-300/40 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-md text-slate-700 dark:text-white hover:bg-white/30 dark:hover:bg-black/30 transition-all cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* LOGIN CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-8 py-12 flex flex-col items-center"
      >
        
        {/* Profile circular badge as shown in image */}
        <div className="w-24 h-24 rounded-full bg-[#0a3a75] dark:bg-[#0c4a93] flex items-center justify-center shadow-lg border border-white/20 mb-6">
          <User className="w-12 h-12 text-white stroke-[1.5]" />
        </div>

        {/* Custom Header from prompt: "Admin Login" in thin elegant typography matching image style */}
        <h2 className="text-2xl font-light tracking-[0.2em] text-center uppercase mb-10 text-slate-800 dark:text-white/90">
          Admin Login
        </h2>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="w-full space-y-7">
          
          {/* USERNAME / EMAIL ID */}
          <div className="relative group">
            <div className="absolute left-0 bottom-2 text-slate-500 dark:text-white/60">
              <Mail className="w-5 h-5 stroke-[1.5]" />
            </div>
            <input
              type="text"
              id="admin_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Email ID / Username"
              required
              autoFocus
              className="w-full pl-8 pr-2 py-2 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 border-b border-slate-300 dark:border-white/30 focus:border-slate-800 dark:focus:border-white outline-hidden font-light text-sm transition-colors"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative group">
            <div className="absolute left-0 bottom-2 text-slate-500 dark:text-white/60">
              <Lock className="w-5 h-5 stroke-[1.5]" />
            </div>
            <input
              type="password"
              id="admin_password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-8 pr-2 py-2 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 border-b border-slate-300 dark:border-white/30 focus:border-slate-800 dark:focus:border-white outline-hidden font-light text-sm transition-colors"
            />
          </div>

          {/* Options: Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs font-light text-slate-500 dark:text-white/60">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className="relative w-4 h-4 rounded border border-slate-400 dark:border-white/30 flex items-center justify-center bg-white/5 backdrop-blur-xs">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only" 
                />
                {rememberMe && (
                  <Check className="w-3 h-3 text-slate-800 dark:text-white stroke-[3]" />
                )}
              </div>
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => setIsForgotPasswordOpen(true)}
              className="hover:underline transition-all text-slate-500 dark:text-white/70 italic"
            >
              Forgot Password?
            </button>
          </div>

          {/* ERROR MESSAGE DISPLAY */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2"
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* SOLID BUTTON - Centered text, flat rectangular block matching visual image */}
          <button
            type="submit"
            id="admin_login_btn"
            className="w-full py-4 bg-[#0a3a75] hover:bg-[#082e5e] text-white text-xs font-bold tracking-[0.2em] rounded-none shadow-lg cursor-pointer transition-all uppercase duration-300 hover:scale-[1.01] active:scale-[0.99]"
          >
            LOGIN
          </button>

        </form>



      </motion.div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsForgotPasswordOpen(false)}></div>
          <div className={`relative w-full max-w-sm rounded-2xl p-6 border shadow-2xl transition-all ${
            isDark ? 'bg-[#1A1D23] border-[#2D333D] text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="font-extrabold text-sm mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-500" />
              <span>Forgot Password Info</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed mb-4">
              To enter this local application demo control center, standard hardcoded credentials are used. 
              Please enter <strong className="font-mono text-slate-800 dark:text-white">admin</strong> for both Username and Password on the main screen. No external email sync is required.
            </p>
            <button
              onClick={() => setIsForgotPasswordOpen(false)}
              className="w-full py-2 bg-[rgb(14,145,145)] hover:bg-[rgb(12,125,125)] text-white text-xs font-bold rounded-lg"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
