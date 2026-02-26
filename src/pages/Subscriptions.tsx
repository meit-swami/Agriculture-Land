import { useLanguage } from '@/contexts/LanguageContext';
import AppLayout from '@/components/layout/AppLayout';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner';

const Subscriptions = () => {
  const { t } = useLanguage();

  const plans = [
    {
      title: { hi: 'खरीदार', en: 'Buyer' },
      tiers: [
        { name: { hi: 'मुफ़्त', en: 'Free' }, price: '₹0', features: [{ hi: 'भूमि ब्राउज़ करें', en: 'Browse lands' }, { hi: '5 संपर्क/माह', en: '5 contacts/month' }] },
        { name: { hi: 'प्रीमियम', en: 'Premium' }, price: '₹99/mo', features: [{ hi: 'असीमित संपर्क', en: 'Unlimited contacts' }, { hi: 'प्राथमिकता सहायता', en: 'Priority support' }], popular: true },
      ],
    },
    {
      title: { hi: 'विक्रेता', en: 'Seller' },
      tiers: [
        { name: { hi: 'बेसिक', en: 'Basic' }, price: '₹299', sub: { hi: '3 महीने, 3 लिस्टिंग', en: '3 months, 3 listings' }, features: [{ hi: '3 भूमि लिस्ट करें', en: '3 property listings' }, { hi: 'बेसिक सत्यापन', en: 'Basic verification' }] },
        { name: { hi: 'स्टैंडर्ड', en: 'Standard' }, price: '₹699', sub: { hi: '6 महीने, 10 लिस्टिंग', en: '6 months, 10 listings' }, features: [{ hi: '10 भूमि लिस्ट करें', en: '10 property listings' }, { hi: 'तेज़ सत्यापन', en: 'Faster verification' }], popular: true },
        { name: { hi: 'प्रीमियम', en: 'Premium' }, price: '₹1,499', sub: { hi: '1 साल, असीमित', en: '1 year, unlimited' }, features: [{ hi: 'असीमित लिस्टिंग', en: 'Unlimited listings' }, { hi: 'सबसे तेज़ सत्यापन', en: 'Fastest verification' }] },
      ],
    },
    {
      title: { hi: 'एजेंट', en: 'Agent' },
      tiers: [
        { name: { hi: 'बेसिक', en: 'Basic' }, price: '₹999', sub: { hi: '6 महीने', en: '6 months' }, features: [{ hi: 'एकाधिक लिस्टिंग', en: 'Multiple listings' }, { hi: 'एजेंट बैज', en: 'Agent badge' }] },
        { name: { hi: 'प्रो', en: 'Pro' }, price: '₹2,499', sub: { hi: '1 साल', en: '1 year' }, features: [{ hi: 'असीमित लिस्टिंग', en: 'Unlimited listings' }, { hi: 'सत्यापित एजेंट बैज', en: 'Verified agent badge' }], popular: true },
      ],
    },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">{t('सदस्यता प्लान', 'Subscription Plans')}</h1>
          <p className="text-muted-foreground">{t('अपनी ज़रूरत के अनुसार प्लान चुनें', 'Choose a plan that fits your needs')}</p>
        </div>

        {plans.map((plan) => (
          <div key={plan.title.en} className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-accent" />
              {t(plan.title.hi, plan.title.en)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.tiers.map((tier) => (
                <Card key={tier.name.en} className={`border-0 shadow-md relative ${tier.popular ? 'ring-2 ring-primary' : ''}`}>
                  {tier.popular && <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground text-xs">{t('लोकप्रिय', 'Popular')}</Badge>}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{t(tier.name.hi, tier.name.en)}</CardTitle>
                    <div className="text-2xl font-bold text-primary">{tier.price}</div>
                    {tier.sub && <p className="text-xs text-muted-foreground">{t(tier.sub.hi, tier.sub.en)}</p>}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {tier.features.map((f) => (
                        <li key={f.en} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {t(f.hi, f.en)}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full bg-primary text-primary-foreground" onClick={() => toast.info(t('भुगतान जल्द उपलब्ध होगा', 'Payment coming soon'))}>
                      {t('अभी खरीदें', 'Buy Now')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Fast verification */}
        <Card className="border-0 shadow-xl bg-accent/10 max-w-lg mx-auto">
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-1">{t('तेज़ सत्यापन सेवा', 'Fast Verification Service')}</h3>
            <p className="text-2xl font-bold text-primary mb-2">₹1,000 / {t('प्रति भूमि', 'per property')}</p>
            <p className="text-sm text-muted-foreground mb-4">{t('24 घंटे में सत्यापन', 'Verification within 24 hours')}</p>
            <Button className="bg-accent text-accent-foreground" onClick={() => toast.info(t('जल्द उपलब्ध', 'Coming soon'))}>
              {t('अभी आवेदन करें', 'Apply Now')}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </AppLayout>
  );
};

export default Subscriptions;
