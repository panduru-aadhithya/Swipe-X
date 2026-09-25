import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Sparkles, 
  Rocket, 
  Flame, 
  FileText, 
  X, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { notificationApi } from '../api';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = async (item: AppNotification) => {
    try {
      await notificationApi.markAsRead(item.id);
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.warn('Error marking as read:', err);
    }

    onClose();
    if (item.link) {
      navigate(item.link);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'HIGH_MATCH':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case 'STARTUP_ALERT':
        return <Rocket className="w-4 h-4 text-purple-500" />;
      case 'LOW_COMPETITION':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'APPLICATION_UPDATE':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-violet-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-4 sm:p-6 bg-slate-900/40 backdrop-blur-2xs">
      <div className="w-full max-w-md bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden mt-14 sm:mr-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                Job & Match Alerts
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Real-time updates, match recommendations & status changes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                title="Mark all as read"
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Read all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading live alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No new alerts right now</p>
              <p className="text-[11px] text-slate-400">Interact with jobs or upload a resume to receive AI match alerts.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-start gap-3 group ${
                  item.isRead
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    : 'bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50/80 text-slate-900 dark:text-slate-200'
                }`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-bold ${!item.isRead ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                  {item.matchScore && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                        {item.matchScore}% Match Score
                      </span>
                    </div>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0 self-center" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-medium">Swipe X Career Assistant</span>
          <button
            type="button"
            onClick={() => { onClose(); navigate('/candidate/explore'); }}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Explore Jobs →
          </button>
        </div>

      </div>
    </div>
  );
};
