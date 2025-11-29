import { useState } from 'react';
import { Trash2, User, RefreshCw, Check, Bell, X } from 'lucide-react';
import logoImage from 'figma:asset/47983e4f2244acd2659cb948cc4e3431517267ad.png';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import AccountMenu from './account-menu';

interface Notification {
  id: string;
  dustbinName: string;
  dustbinLocation: string;
  fillLevel: number;
  timestamp: string;
  timeAgo: string;
}

interface HeaderProps {
  onLogoClick?: () => void;
  onRefresh?: () => Promise<void>;
  notifications?: Notification[];
  onClearAllNotifications?: () => void;
  onRemoveNotification?: (notificationId: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
}

export default function Header({ 
  onLogoClick, 
  onRefresh, 
  notifications = [], 
  onClearAllNotifications, 
  onRemoveNotification,
  isDarkMode = false,
  onToggleDarkMode = () => {},
  onLogout = () => {},
  userName,
  userEmail,
}: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing || !onRefresh) return;
    
    setIsRefreshing(true);
    setShowSuccess(false);
    
    try {
      await onRefresh();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const unreadCount = notifications.length;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className={`flex items-center gap-3 ${onLogoClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={onLogoClick}
          >
            <img src={logoImage} alt="BinThere Logo" className="h-12" />
          </div>
          
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  showSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-green-600 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Refresh data"
              >
                {showSuccess ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <RefreshCw 
                    className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                    style={isRefreshing ? {} : { transition: 'transform 0.5s ease-in-out' }}
                  />
                )}
              </button>
            )}

            {/* Notification Bell */}
            <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <PopoverTrigger asChild>
                <button
                  className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 bg-gray-100 text-gray-600 hover:bg-green-600 hover:text-white"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 p-0 flex items-center justify-center text-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <h3 className="text-gray-900 dark:text-gray-100">Notifications</h3>
                    {unreadCount > 0 && (
                      <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && onClearAllNotifications && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAllNotifications}
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="group relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-600 mt-2"></div>
                            <div className="flex-1 min-w-0 pr-6">
                              <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
                                <span className="font-medium">{notification.dustbinName}</span> is critically full
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                                {notification.dustbinLocation} • {notification.fillLevel}% capacity
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{notification.timeAgo}</p>
                            </div>
                            {onRemoveNotification && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveNotification(notification.id);
                                }}
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                aria-label="Remove notification"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <AccountMenu
              userName={userName}
              userEmail={userEmail}
              isDarkMode={isDarkMode}
              onToggleDarkMode={onToggleDarkMode}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
