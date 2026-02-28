import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Sprout, User, LogOut, Settings, CreditCard } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TopNav = () => {
  const { lang, toggle, t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="hidden md:flex items-center justify-between px-6 py-3 bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <Sprout className="h-7 w-7 text-accent" />
        <span className="text-xl font-bold tracking-tight">
          {t('कृषिभूमि भारत', 'KrishiBhumi India')}
        </span>
      </Link>

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground gap-1">
              <User className="h-4 w-4" />
              <span className="max-w-[100px] truncate">{profile?.full_name || t('प्रोफाइल', 'Profile')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              {t('मेरी प्रोफाइल', 'My Profile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/my-properties')}>
              <Settings className="h-4 w-4 mr-2" />
              {t('मेरी संपत्तियाँ', 'My Properties')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/subscriptions')}>
              <CreditCard className="h-4 w-4 mr-2" />
              {t('सदस्यता', 'Subscriptions')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user ? (
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                {t('लॉग आउट', 'Logout')}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => navigate('/login')}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('लॉग इन', 'Login')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopNav;
