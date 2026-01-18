
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, User, Mail, ShieldAlert, Zap, Loader2, Sparkles, Fingerprint } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (session: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanUsername = username.trim();

    try {
      if (isLogin) {
        // --- FLUXO DE LOGIN INTELIGENTE (RIGOR BINÁRIO) ---
        let targetEmail = cleanUsername;
        
        if (!targetEmail.includes('@')) {
          // Busca exata (Case-Sensitive) para evitar interferência de DNA
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', cleanUsername) // Uso de .eq (Igualdade Estrita)
            .maybeSingle();

          if (profileError) throw new Error('NEXUS_SYNC_ERROR');
          
          if (!profileData) {
            throw new Error('DNA_MISMATCH');
          }
          
          targetEmail = profileData.email;
        }

        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password,
        });

        if (authError) throw authError;
        if (data.session) onAuthSuccess(data.session);

      } else {
        // --- FLUXO DE CADASTRO (DESPERTAR) ---
        if (cleanUsername.includes('@')) {
          setError('[ERRO: CODINOME NÃO PODE CONTER "@"]');
          setLoading(false);
          return;
        }

        // Verificação de unicidade estrita
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (existingUser) {
          setError('[ERRO: ESTE DNA JÁ ESTÁ EM USO NO NEXUS]');
          setLoading(false);
          return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: cleanUsername,
              full_name: cleanUsername
            }
          }
        });

        if (authError) throw authError;
        alert("DESPERTAR INICIADO: Verifique seu e-mail.");
        setIsLogin(true);
      }
    } catch (err: any) {
      if (err.message === 'DNA_MISMATCH') {
        setError('[ERRO: DNA NÃO CORRESPONDE AO REGISTRO]');
      } else if (err.message?.toLowerCase().includes('invalid login credentials')) {
        setError('[ERRO: CHAVE DE ACESSO INCORRETA]');
      } else {
        setError(`[ERRO: ${err.message || 'SISTEMA INSTÁVEL'}]`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#010307] flex items-center justify-center p-4 font-sans overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="w-full max-w-[440px] bg-[#030712] border border-slate-800 p-8 md:p-12 rounded-sm shadow-2xl relative animate-in fade-in zoom-in duration-500">
        <div className="absolute -top-px left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-900/10 border border-blue-500/40 rounded-full flex items-center justify-center text-blue-500 mb-6 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative group">
            <Zap size={40} className="group-hover:scale-110 transition-transform" />
            <Sparkles size={16} className="absolute -top-1 -right-1 text-blue-400 animate-bounce" />
          </div>
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">O SISTEMA</h1>
          <p className="text-[10px] text-blue-500 font-bold uppercase mt-2 tracking-[0.4em] opacity-80">Portal de Acesso Dimensional</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Mail size={10} /> Registro de E-mail
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="hunter@nexus.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-900" 
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Fingerprint size={10} className="text-blue-500" /> {isLogin ? 'Codinome ou E-mail' : 'Codinome (Case-Sensitive)'}
              </label>
              <input 
                type="text" 
                required
                placeholder={isLogin ? "Codinome ou E-mail" : "Ex: Sung Jin-Woo"} 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-900" 
              />
              {!isLogin && (
                <p className="text-[8px] text-amber-500/60 font-bold uppercase tracking-widest ml-1 mt-1 italic">
                  * Maiúsculas e minúsculas são tratadas como diferentes.
                </p>
              )}
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
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-900" 
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/40 p-3 rounded-sm flex items-center gap-3">
              <ShieldAlert size={16} className="text-rose-500 shrink-0" />
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-black uppercase tracking-[0.4em] transition-all rounded-sm shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isLogin ? 'SINCRONIZAR DNA' : 'INICIAR DESPERTAR'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col items-center gap-4">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setUsername('');
            }}
            className="text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-widest transition-colors italic"
          >
            {isLogin ? 'Sem autoridade? Iniciar Despertar' : 'Já é um Despertado? Acessar Sistema'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
