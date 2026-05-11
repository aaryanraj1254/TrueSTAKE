import React, { useState } from 'react';
import { Bell, CheckCircle, TrendingUp, Twitter, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'resolution' | 'trade' | 'tweet';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'resolution',
      title: 'Market Resolved',
      message: 'MI scored 180+ - Your bet won! 🎉',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: '2',
      type: 'trade',
      title: 'New Trade Activity',
      message: 'Someone bet ₹1000 on BTC crossing ₹70L',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: '3',
      type: 'tweet',
      title: 'New Tweet Market',
      message: '@elonmusk just tweeted about Mars mission',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: '4',
      type: 'resolution',
      title: 'Market Resolved',
      message: 'Nifty closed green today',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: '5',
      type: 'trade',
      title: 'High Volume Alert',
      message: '₹50K traded on IPL match market',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now.getTime() - past.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'resolution':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'trade':
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'tweet':
        return <Twitter className="h-4 w-4 text-blue-400" />;
      default:
        return <Bell className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-emerald-200/60 hover:bg-emerald-900/30 hover:text-emerald-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown Content */}
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-emerald-800/20 p-4">
              <h3 className="font-semibold text-emerald-100">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-emerald-200/30 mx-auto mb-2" />
                  <p className="text-emerald-200/60">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 border-b border-emerald-800/20 transition-colors ${
                      !notification.read ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-emerald-100">
                            {notification.title}
                          </p>
                          <p className="text-xs text-emerald-200/60 mt-1">{notification.message}</p>
                          <p className="text-xs text-emerald-200/40 mt-2">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="flex-shrink-0 p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-emerald-800/20 p-3">
              <button className="w-full rounded-lg border border-emerald-700/50 bg-emerald-900/30 px-3 py-2 text-center text-sm text-emerald-200 hover:bg-emerald-900/50 transition-colors">
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
