
import React, { useState } from 'react';
import { X, User, Lock, LogOut, Loader2, ShieldCheck, ShieldAlert, Fingerprint } from 'lucide-react';
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
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername === profile.username) return;
    setLoading(true);
    
    try {
      // 1. UNIQUE CHECK - Verificando se o DNA (username) já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', newUsername.trim())
        .maybeSingle();

      if (existingUser) {
        addNotification("[ERRO: DNA JÁ REGISTRADO NO NEXUS]", "error");
        setLoading(false);
        return;
      }

      // 2. UPDATE - Sincronizando nova identidade
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      onUpdateProfile({ ...profile, username: newUsername.trim() });
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

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#030712] border border-slate-800 rounded-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
        
        <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <Fingerprint className="text-blue-500" size={20} />
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Gestão de Identidade</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Seção Nome */}
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
                disabled={loading || newUsername === profile?.username}
                className="px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-sm transition-all"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              </button>
            </div>
          </div>

          {/* Seção Senha */}
          <div className="space-y-4">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Lock size={12} className="text-purple-500" /> Recalibrar Chave de Acesso
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
                className="px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white rounded-sm transition-all"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              </button>
            </div>
          </div>

          {/* Seção Logout */}
          <div className="pt-4 border-t border-slate-800/50">
            <button 
              onClick={onSignOut}
              className="w-full py-4 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900/30 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-sm flex items-center justify-center gap-3 group"
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              Encerrar Sincronia (Logoff)
            </button>
          </div>
        </div>

        <div className="p-4 bg-black/40 text-center">
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest italic">
            ID de Caçador: {profile?.id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
