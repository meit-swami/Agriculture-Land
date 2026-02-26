import { useLanguage } from '@/contexts/LanguageContext';
import { Sprout, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground hidden md:block">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="h-6 w-6 text-accent" />
              <span className="text-lg font-bold">{t('कृषिभूमि भारत', 'KrishiBhumi India')}</span>
            </div>
            <p className="text-sm opacity-80">
              {t(
                'भारत का सबसे विश्वसनीय कृषि भूमि मार्केटप्लेस',
                "India's most trusted agriculture land marketplace"
              )}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-accent">{t('लिंक', 'Links')}</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>{t('भूमि खोजें', 'Browse Lands')}</li>
              <li>{t('भूमि बेचें', 'Sell Land')}</li>
              <li>{t('सदस्यता', 'Subscription')}</li>
              <li>{t('हमारे बारे में', 'About Us')}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-accent">{t('सहायता', 'Support')}</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>{t('अक्सर पूछे जाने वाले प्रश्न', 'FAQ')}</li>
              <li>{t('गोपनीयता नीति', 'Privacy Policy')}</li>
              <li>{t('नियम व शर्तें', 'Terms & Conditions')}</li>
              <li>{t('संपर्क करें', 'Contact Us')}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-accent">{t('संपर्क', 'Contact')}</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@krishibhumi.in</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {t('नई दिल्ली, भारत', 'New Delhi, India')}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-60">
          © 2026 {t('कृषिभूमि भारत', 'KrishiBhumi India')}. {t('सर्वाधिकार सुरक्षित', 'All rights reserved')}.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
