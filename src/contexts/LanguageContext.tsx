import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'hi' | 'en';

interface LanguageContextType {
  lang: Language;
  toggle: () => void;
  t: (hi: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'hi',
  toggle: () => {},
  t: (hi) => hi,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('hi');

  const toggle = useCallback(() => {
    setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  }, []);

  const t = useCallback(
    (hi: string, en: string) => (lang === 'hi' ? hi : en),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
