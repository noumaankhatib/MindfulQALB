import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Calendar, Settings, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserMenuProps {
  onOpenAuth: () => void;
}

const getRandomAvatar = (seed: string): string => {
  const styles = ['avataaars', 'bottts', 'fun-emoji', 'lorelei', 'notionists'];
  const style = styles[Math.abs(seed.charCodeAt(0) || 0) % styles.length];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};

export const UserMenu = ({ onOpenAuth }: UserMenuProps) => {
  const { user, profile, loading, isConfigured, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <button
        onClick={onOpenAuth}
        className="px-4 py-2 bg-lavender-100 text-lavender-600 rounded-full font-medium text-sm animate-pulse"
      >
        Sign In
      </button>
    );
  }

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="px-4 py-2 bg-lavender-600 text-white rounded-lg hover:bg-lavender-700 transition-all font-medium text-sm shadow-sm hover:shadow-md flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || getRandomAvatar(user.email || user.id);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-lavender-50 hover:bg-lavender-100 transition-colors border border-lavender-100"
      >
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-8 h-8 rounded-full object-cover bg-lavender-200"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = getRandomAvatar(user.email || user.id);
          }}
        />
        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden sm:block">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60]"
          >
            {/* User Info Header */}
            <div className="p-4 bg-gradient-to-r from-lavender-50 to-purple-50 border-b border-lavender-100">
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {profile?.role === 'admin' && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/admin';
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-purple-700 hover:bg-purple-50 rounded-xl transition-colors text-left"
                >
                  <Shield className="w-5 h-5 text-purple-500" />
                  <span>Admin Dashboard</span>
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/my-bookings';
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-lavender-50 rounded-xl transition-colors text-left"
              >
                <Calendar className="w-5 h-5 text-lavender-500" />
                <span>My Bookings</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/profile';
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-lavender-50 rounded-xl transition-colors text-left"
              >
                <Settings className="w-5 h-5 text-lavender-500" />
                <span>Settings</span>
              </button>
            </div>

            {/* Sign Out */}
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
