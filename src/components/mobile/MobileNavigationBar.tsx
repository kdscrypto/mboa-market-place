
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

const MobileNavigationBar: React.FC = () => {
  const location = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { data, error } = await supabase
        .from('conversations')
        .select('unread_count')
        .eq('user_id', user.id)
        .single();
      
      if (error) return 0;
      return data?.unread_count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
      href: '/'
    },
    {
      id: 'search',
      label: 'Recherche',
      icon: Search,
      href: '/recherche'
    },
    {
      id: 'create',
      label: 'Publier',
      icon: Plus,
      href: user ? '/publier-annonce' : '/connexion'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      href: user ? '/messages' : '/connexion',
      badge: unreadCount
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      href: user ? '/dashboard' : '/connexion'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[60px] py-2 px-1 rounded-lg transition-all duration-200",
                "touch-manipulation relative",
                active 
                  ? "text-mboa-orange bg-orange-50" 
                  : "text-gray-600 hover:text-mboa-orange hover:bg-gray-50"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-1" />
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigationBar;
