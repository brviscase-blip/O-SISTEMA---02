
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, User, Mail, ShieldAlert, Zap, Loader2, Sparkles } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (session: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation for minimum password length
    if (!isLogin && password.length < 6) {
      setError('[ERRO: Chave de Acesso deve ter no mínimo 6 caracteres]');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        if (data.session) onAuthSuccess(data.session);
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;
        alert("DESPERTAR INICIADO: Verifique seu e-mail para validar sua autoridade.");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      // More specific error handling if possible, else generic message
      if (err.message && err.message.toLowerCase().includes('at least 6 characters')) {
        setError(`[ERRO: Chave de Acesso deve ter no mínimo 6 caracteres]`);
      } else {
        setError(`[ERRO: Credenciais de Caçador Inválidas]`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#010307] flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* Efeitos de Fundo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="w-full max-w-[440px] bg-[#030712] border border-slate-800 p-8 md:p-12 rounded-sm shadow-2xl relative animate-in fade-in zoom-in duration-500">
        {/* Banner de Aviso */}
        <div className="absolute -top-px left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-900/10 border border-blue-500/40 rounded-full flex items-center justify-center text-blue-500 mb-6 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative group">
            <Zap size={40} className="group-hover:scale-110 transition-transform" />
            <Sparkles size={16} className="absolute -top-1 -right-1 text-blue-400 animate-bounce" />
          </div>
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">O SISTEMA</h1>
          <p className="text-[10px] text-blue-500 font-bold uppercase mt-2 tracking-[0.4em] opacity-80">Interface de Sincronia de DNA</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail size={10} /> Identificação Digital (E-mail)
              </label>
              <input 
                type="email" 
                required
                placeholder="hunter@nexus.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-900" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={10} /> Chave de Acesso
              </label>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-900" 
              />
              {!isLogin && <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest ml-1">Mínimo: 6 caracteres</p>}
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/40 p-3 rounded-sm flex items-center gap-3 animate-shake">
              <ShieldAlert size={16} className="text-rose-500 shrink-0" />
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-black uppercase tracking-[0.4em] transition-all rounded-sm shadow-xl shadow-blue-600/10 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isLogin ? 'ACESSAR SISTEMA' : 'INICIAR DESPERTAR'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col items-center gap-4">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-widest transition-colors italic"
          >
            {isLogin ? 'Não possui registro? Iniciar Despertar' : 'Já possui autoridade? Acessar Sistema'}
          </button>
          
          <p className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.2em] text-center leading-relaxed">
            AVISO: O SISTEMA MONITORA TODA TENTATIVA DE ACESSO NÃO AUTORIZADA. <br/>
            FALHAS CRÍTICAS PODEM RESULTAR EM PENALIDADES FÍSICAS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
