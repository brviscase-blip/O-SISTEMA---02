
import React, { useState } from 'react';
import { X, User, Lock, LogOut, Loader2, ShieldCheck, Fingerprint, ChevronLeft, Settings2, KeyRound } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onUpdateProfile: (newProfile: any) => void;
  onSignOut: () => void;
  addNotification: (msg: string, type: any) => void;
}

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ 
  isOpen, onClose, profile, onUpdateProfile, onSignOut, addNotification 
}) => {
  const [view, setView] = useState<'MENU' | 'EDIT'>('MENU');
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdateUsername = async () => {
    const cleanUsername = newUsername.trim();
    if (!cleanUsername || cleanUsername === profile.username) return;
    
    if (cleanUsername.includes('@')) {
      addNotification("[ERRO: CODINOME NÃO PODE CONTER '@']", "error");
      return;
    }

    setLoading(true);
    
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .neq('id', profile.id)
        .maybeSingle();

      if (existingUser) {
        addNotification("[ERRO: ESTE DNA JÁ PERTENCE A OUTRO CAÇADOR]", "error");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: cleanUsername })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      onUpdateProfile({ ...profile, username: cleanUsername });
      addNotification("[SISTEMA: DNA ATUALIZADO COM SUCESSO]", "success");
    } catch (err) {
      console.error(err);
      addNotification("[ERRO: FALHA NA SINCRONIA DE IDENTIDADE]", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      addNotification("[ERRO: CHAVE DE ACESSO MUITO CURTA]", "warning");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      addNotification("[SISTEMA: CHAVE DE ACESSO RECALIBRADA]", "success");
      setNewPassword('');
    } catch (err) {
      addNotification("[ERRO: FALHA AO ATUALIZAR CHAVE]", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setView('MENU');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#030712] border border-slate-800 rounded-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
        
        <div className="p-6 flex items-center justify-between border-b border-slate-800/50 bg-black/20">
          <div className="flex items-center gap-3">
            {view === 'EDIT' ? (
              <button 
                onClick={() => setView('MENU')}
                className="p-1 hover:bg-slate-800 rounded-sm text-blue-500 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
            ) : (
              <Fingerprint className="text-blue-500" size={20} />
            )}
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">
              {view === 'MENU' ? 'Gestão de Identidade' : 'Ajustar Credenciais'}
            </h2>
          </div>
          <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {view === 'MENU' ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              <button 
                onClick={() => setView('EDIT')}
                className="w-full group flex items-center gap-4 p-5 bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all rounded-sm"
              >
                <div className="w-12 h-12 bg-blue-900/20 border border-blue-500/30 rounded-sm flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <Settings2 size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black text-white uppercase tracking-widest">Alterar Credenciais</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Recalibrar Codinome e Chave</p>
                </div>
              </button>

              <button 
                onClick={onSignOut}
                className="w-full group flex items-center gap-4 p-5 bg-rose-950/5 border border-rose-900/20 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all rounded-sm"
              >
                <div className="w-12 h-12 bg-rose-900/20 border border-rose-500/30 rounded-sm flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                  <LogOut size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black text-white uppercase tracking-widest">Encerrar Sincronia</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Realizar Logoff do Sistema</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} className="text-blue-500" /> Nome de Despertado (DNA)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-sm px-4 py-3 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                    placeholder="Ex: Sung Jin-Woo"
                  />
                  <button 
                    onClick={handleUpdateUsername}
                    disabled={loading || newUsername.trim() === profile?.username}
                    className="px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-sm transition-all shadow-lg shadow-blue-600/10"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  </button>
                </div>
                <p className="text-[8px] text-amber-500/60 font-bold uppercase tracking-widest ml-1 italic">Atenção: A grafia deve ser exata no login.</p>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <KeyRound size={12} className="text-purple-500" /> Recalibrar Chave de Acesso
                </label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-sm px-4 py-3 text-xs font-bold text-white outline-none focus:border-purple-500 transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={loading || !newPassword}
                    className="px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white rounded-sm transition-all shadow-lg shadow-purple-600/10"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => setView('MENU')}
                  className="w-full py-3 bg-slate-900 border border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white hover:border-slate-600 transition-all rounded-sm"
                >
                  Voltar ao Menu
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/40 text-center border-t border-slate-800/30">
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest italic">
            ID de Caçador: {profile?.id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
