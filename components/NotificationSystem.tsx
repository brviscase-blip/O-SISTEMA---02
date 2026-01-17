
import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Zap } from 'lucide-react';

export type NotificationType = 'success' | 'warning' | 'info' | 'error' | 'alert';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationSystemProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, removeNotification }) => {
  return (
    /* Ajuste de Posicionamento: Centralizado no mobile, à direita no desktop */
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[9999] flex flex-col gap-3 w-[calc(100%-2rem)] md:w-full md:max-w-md pointer-events-none">
      {notifications.map((notif) => (
        <NotificationItem 
          key={notif.id} 
          notification={notif} 
          onClose={() => removeNotification(notif.id)} 
        />
      ))}
    </div>
  );
};

const NotificationItem: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: <CheckCircle2 size={16} />, color: 'border-emerald-500/50 text-emerald-400', bg: 'bg-emerald-800/20', glow: 'shadow-emerald-500/10' },
    warning: { icon: <AlertTriangle size={16} />, color: 'border-amber-500/50 text-amber-400', bg: 'bg-amber-800/20', glow: 'shadow-amber-500/10' },
    info: { icon: <Info size={16} />, color: 'border-blue-500/50 text-blue-400', bg: 'bg-blue-800/20', glow: 'shadow-blue-500/10' },
    error: { icon: <X size={16} />, color: 'border-rose-500/50 text-rose-400', bg: 'bg-rose-800/20', glow: 'shadow-rose-500/10' },
    alert: { icon: <Zap size={16} />, color: 'border-purple-500/50 text-purple-400', bg: 'bg-purple-800/20', glow: 'shadow-purple-500/10' },
  }[notification.type];

  return (
    <div className={`pointer-events-auto flex items-center gap-3 p-4 rounded-sm border backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-right-10 duration-300 w-full ${config.bg} ${config.color} ${config.glow}`}>
      <div className="flex-shrink-0 bg-black/40 p-1.5 rounded-sm">{config.icon}</div>
      <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest flex-1 leading-tight">{notification.message}</p>
      <button 
        onClick={onClose} 
        className="flex-shrink-0 p-1 opacity-50 hover:opacity-100 transition-opacity ml-2"
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationSystem;
