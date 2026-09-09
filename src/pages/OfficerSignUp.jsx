import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function OfficerSignUp({ onBack, onSignUpSuccess, theme, toggleTheme }) {
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    if (!/^OFFICER\d{3}$/i.test(officerId.trim())) {
      setErrorMessage('Officer ID must match OFFICER001 through OFFICER999.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await onSignUpSuccess({ name, officerId, password, confirmPassword });
    setLoading(false);
    if (!result?.success) setErrorMessage(result?.error || 'Unable to create officer account.');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="w-full flex justify-between items-center pt-2">
        <button onClick={onBack} className={`p-2 rounded-full border ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-zinc-100'}`}><ArrowLeft className="w-5 h-5" /></button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm mx-auto my-auto space-y-6">
        <div className="space-y-1"><h1 className="text-3xl font-extrabold">Create Officer Account</h1><p className="text-xs font-mono text-zinc-500">Officer ID access for authorized personnel</p></div>
        {errorMessage && <p className="text-xs text-red-400 font-semibold">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full rounded-xl border bg-transparent px-3 py-3.5 text-sm" />
          <div className="relative"><BadgeCheck className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" /><input required value={officerId} onChange={(e) => setOfficerId(e.target.value.toUpperCase())} placeholder="OFFICER001" className="w-full rounded-xl border bg-transparent pl-10 pr-3 py-3.5 text-sm font-mono" /></div>
          <div className="relative"><Lock className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" /><input required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border bg-transparent pl-10 pr-10 py-3.5 text-sm" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-zinc-500">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
          <input required type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full rounded-xl border bg-transparent px-3 py-3.5 text-sm" />
          <button disabled={loading} className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm flex justify-center gap-2"><ShieldCheck className="w-4 h-4" />{loading ? 'CREATING ACCOUNT...' : 'CREATE OFFICER ACCOUNT'}</button>
        </form>
      </motion.div>
      <div className="text-center pb-4 text-[10px] font-mono text-zinc-500 uppercase">Government of India Legal Metrology Dept</div>
    </div>
  );
}
