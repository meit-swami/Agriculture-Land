import { useLanguage } from '@/contexts/LanguageContext';
import AppLayout from '@/components/layout/AppLayout';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockProperties, formatPrice, formatPriceEn } from '@/data/mockProperties';
import { Search, ShieldCheck, Users, MapPin, Sprout, TrendingUp, UserCheck, Handshake, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { t, lang } = useLanguage();
  const featured = mockProperties.filter((p) => p.verified).slice(0, 4);
  const priceFmt = lang === 'hi' ? formatPrice : formatPriceEn;

  return (
    <AppLayout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-2xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sprout className="h-4 w-4" />
              {t('भारत का #1 कृषि भूमि मार्केटप्लेस', "India's #1 Agri Land Marketplace")}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              {t('अपनी सपनों की कृषि भूमि खोजें', 'Find Your Dream Agricultural Land')}
            </h1>
            <p className="text-lg opacity-90 mb-8">
              {t(
                'सत्यापित भूमि, विश्वसनीय विक्रेता — सीधे मालिक से खरीदें',
                'Verified lands, trusted sellers — buy directly from owners'
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('राज्य या जिला खोजें...', 'Search state or district...')}
                  className="pl-10 bg-card text-foreground h-12 rounded-xl"
                />
              </div>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-12 px-6 font-semibold">
                {t('खोजें', 'Search')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto">
          {[
            { icon: MapPin, value: '1,200+', hi: 'भूमि लिस्टिंग', en: 'Land Listings' },
            { icon: ShieldCheck, value: '850+', hi: 'सत्यापित भूमि', en: 'Verified Lands' },
            { icon: Users, value: '5,000+', hi: 'सक्रिय उपयोगकर्ता', en: 'Active Users' },
          ].map((stat) => (
            <Card key={stat.en} className="text-center shadow-lg border-0 bg-card">
              <CardContent className="p-4 md:p-6">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{t(stat.hi, stat.en)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            {t('सत्यापित भूमि', 'Verified Properties')}
          </h2>
          <Link to="/browse" className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
            {t('सभी देखें', 'View All')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer border-0 shadow-md">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={lang === 'hi' ? property.title : property.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t('सत्यापित', 'Verified')}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                  {lang === 'hi' ? property.title : property.titleEn}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3" />
                  {property.district}, {property.state}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{priceFmt(property.askingPrice)}</span>
                  <span className="text-xs text-muted-foreground">
                    {property.area} {property.areaUnit === 'bigha' ? t('बीघा', 'Bigha') : t('एकड़', 'Acre')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            {t('कैसे काम करता है?', 'How It Works?')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Search,
                hi: 'खोजें',
                en: 'Search',
                descHi: 'राज्य, जिला और बजट के अनुसार कृषि भूमि खोजें',
                descEn: 'Search agricultural land by state, district, and budget',
              },
              {
                icon: ShieldCheck,
                hi: 'सत्यापन करें',
                en: 'Verify',
                descHi: 'टीम द्वारा सत्यापित भूमि ही चुनें — कोई धोखा नहीं',
                descEn: 'Choose team-verified land only — no fraud',
              },
              {
                icon: Handshake,
                hi: 'सौदा करें',
                en: 'Deal',
                descHi: 'सीधे मालिक या एजेंट से मिलें और सौदा पक्का करें',
                descEn: 'Meet the owner or agent directly and close the deal',
              },
            ].map((step, i) => (
              <Card key={step.en} className="text-center border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-xs font-bold text-accent mb-1">
                    {t(`चरण ${i + 1}`, `Step ${i + 1}`)}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t(step.hi, step.en)}</h3>
                  <p className="text-sm text-muted-foreground">{t(step.descHi, step.descEn)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          {t('आपकी भूमिका?', 'Your Role?')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: TrendingUp,
              hi: 'खरीदार',
              en: 'Buyer',
              descHi: 'सत्यापित भूमि खोजें, मालिक से सीधे बात करें',
              descEn: 'Find verified land, talk directly to owners',
              color: 'bg-primary',
            },
            {
              icon: UserCheck,
              hi: 'विक्रेता',
              en: 'Seller',
              descHi: 'अपनी भूमि लिस्ट करें, खरीदार ढूंढें',
              descEn: 'List your land, find buyers',
              color: 'bg-secondary',
            },
            {
              icon: Users,
              hi: 'एजेंट',
              en: 'Agent',
              descHi: 'एक से अधिक भूमि लिस्ट करें, सत्यापित एजेंट बनें',
              descEn: 'List multiple lands, become a verified agent',
              color: 'bg-accent',
            },
          ].map((role) => (
            <Card key={role.en} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow cursor-pointer">
              <div className={`${role.color} p-4 flex items-center gap-3`}>
                <role.icon className="h-8 w-8 text-primary-foreground" />
                <h3 className="text-xl font-bold text-primary-foreground">{t(role.hi, role.en)}</h3>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{t(role.descHi, role.descEn)}</p>
                <Button variant="link" className="mt-2 p-0 text-primary font-semibold">
                  {t('शुरू करें →', 'Get Started →')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t('क्यों चुनें कृषिभूमि भारत?', 'Why Choose KrishiBhumi India?')}
          </h2>
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {[
              { hi: '100% सत्यापित भूमि', en: '100% Verified Lands' },
              { hi: 'सीधे मालिक से संपर्क', en: 'Direct Owner Contact' },
              { hi: 'पटवारी रिपोर्ट उपलब्ध', en: 'Patwari Report Available' },
              { hi: 'सुरक्षित लेनदेन', en: 'Secure Transactions' },
            ].map((badge) => (
              <div key={badge.en} className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full text-sm">
                <ShieldCheck className="h-4 w-4 text-accent" />
                {t(badge.hi, badge.en)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </AppLayout>
  );
};

export default Index;
