import { LogOut, Moon, Sun, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';

interface AccountMenuProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

export default function AccountMenu({
  userName = 'Admin User',
  userEmail = 'admin@binthere.com',
  userRole = 'Admin',
  isDarkMode,
  onToggleDarkMode,
  onLogout,
}: AccountMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="cursor-pointer hover:ring-2 hover:ring-green-600 transition-all rounded-full"
          aria-label="Account menu"
        >
          <Avatar>
            <AvatarFallback className="bg-green-100 text-green-700">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        {/* User Info Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm text-gray-900 mb-1">{userName}</p>
          <p className="text-xs text-gray-500 mb-1 truncate">{userEmail}</p>
          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
            {userRole}
          </span>
        </div>

        {/* Dark Mode Toggle */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-gray-900 dark:text-gray-100" />
              ) : (
                <Sun className="w-4 h-4 text-gray-900 dark:text-gray-100" />
              )}
              <span className="text-sm text-gray-900 dark:text-gray-100">Dark Mode</span>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={onToggleDarkMode}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
