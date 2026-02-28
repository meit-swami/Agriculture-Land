import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const WHATSAPP_NUMBER = '919460804890';

interface WhatsAppWidgetProps {
  propertyName?: string;
}

const WhatsAppWidget = ({ propertyName }: WhatsAppWidgetProps) => {
  const location = useLocation();
  const isPropertyPage = location.pathname.startsWith('/property/');

  let message: string;
  if (isPropertyPage && propertyName) {
    const propertyLink = `${window.location.origin}${location.pathname}`;
    message = `Namaste!! I am interested in this property: ${propertyName}\n${propertyLink}`;
  } else {
    message = 'Namaste!! Mera name : , looking for a property';
  }

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 fill-white stroke-white" />
    </a>
  );
};

export default WhatsAppWidget;
