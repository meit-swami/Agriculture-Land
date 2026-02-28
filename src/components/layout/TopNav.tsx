import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Sprout } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

const navItems = [
  { path: '/', hi: 'होम', en: 'Home' },
  { path: '/browse', hi: 'खोजें', en: 'Browse' },
  { path: '/post', hi: 'पोस्ट करें', en: 'Post' },
  { path: '/messages', hi: 'संदेश', en: 'Messages' },
  { path: '/profile', hi: 'प्रोफाइल', en: 'Profile' },
];

const TopNav = () => {
  const { lang, toggle, t } = useLanguage();
  const location = useLocation();

  return (
    <header className="hidden md:flex items-center justify-between px-6 py-3 bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <Sprout className="h-7 w-7 text-accent" />
        <span className="text-xl font-bold tracking-tight">
          {t('कृषिभूमि भारत', 'KrishiBhumi India')}
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === item.path
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-primary-foreground/10'
            }`}
          >
            {t(item.hi, item.en)}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <Button
          variant="outline"
          size="sm"
          onClick={toggle}
          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          <Globe className="h-4 w-4 mr-1" />
          {lang === 'hi' ? 'EN' : 'हिं'}
        </Button>
      </div>
    </header>
  );
};

export default TopNav;
