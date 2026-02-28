import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageCircle, User, Globe } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

const navItems = [
  { path: '/', hi: 'होम', en: 'Home', icon: Home },
  { path: '/browse', hi: 'खोजें', en: 'Browse', icon: Search },
  { path: '/post', hi: 'पोस्ट करें', en: 'Post', icon: PlusCircle },
  { path: '/messages', hi: 'संदेश', en: 'Messages', icon: MessageCircle },
];

const BottomNav = () => {
  const { lang, toggle, t } = useLanguage();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around py-1.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[48px] ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium leading-tight">
                {t(item.hi, item.en)}
              </span>
            </Link>
          );
        })}
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[48px] ${
            location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <User className={`h-5 w-5 ${location.pathname === '/profile' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-medium leading-tight">
            {t('प्रोफाइल', 'Profile')}
          </span>
        </Link>
        <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[48px]">
          <NotificationBell />
          <span className="text-[10px] font-medium leading-tight text-muted-foreground">
            {t('सूचना', 'Alerts')}
          </span>
        </div>
        <button
          onClick={toggle}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[48px] text-muted-foreground"
        >
          <Globe className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-tight">
            {lang === 'hi' ? 'EN' : 'हिं'}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
