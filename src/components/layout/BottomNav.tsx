import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Globe, LogOut, Settings, CreditCard } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const BottomNav = () => {
  const { lang, toggle, t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around py-1.5">
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
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[48px] text-muted-foreground">
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-tight">
              {t('प्रोफाइल', 'Profile')}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48 mb-2">
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
    </nav>
  );
};

export default BottomNav;
