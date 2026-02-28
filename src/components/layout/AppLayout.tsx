import React from 'react';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import WhatsAppWidget from '../WhatsAppWidget';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <BottomNav />
      <WhatsAppWidget />
    </div>
  );
};

export default AppLayout;
