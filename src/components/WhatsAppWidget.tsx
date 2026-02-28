import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919460804890';
const MESSAGE = 'Namaste!! Mera name : , looking for a property';

const WhatsAppWidget = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

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
