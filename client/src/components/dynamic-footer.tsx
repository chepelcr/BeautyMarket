import { useCmsContent } from "@/hooks/use-cms-content";
import { FaInstagram, FaWhatsapp, FaPhone } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export function DynamicFooter() {
  const { getContent } = useCmsContent();
  
  // Check if user is authenticated (admin)
  const { data: user } = useQuery<{ id: string; username: string; role: string } | null>({
    queryKey: ["/api/user"],
    retry: false,
  });

  const footerBg = getContent('contact', 'footerBackground');
  const companyName = getContent('contact', 'companyName') || 'Strawberry Essentials';
  const footerText = getContent('contact', 'footerText') || 'Tu belleza, nuestra pasión';
  const instagramHandle = getContent('contact', 'instagram') || '@strawberry.essentials';
  const phone = getContent('contact', 'phone') || '73676745';

  const renderBackground = (bgValue: string) => {
    try {
      const bgData = JSON.parse(bgValue);
      const isDark = document.documentElement.classList.contains('dark');
      
      if (bgData.mode === 'light' && isDark) return {};
      if (bgData.mode === 'dark' && !isDark) return {};
      
      if (bgData.type === 'color') {
        return { backgroundColor: bgData.value };
      } else if (bgData.type === 'gradient') {
        const { from, to, direction } = bgData.gradient;
        if (direction === 'radial') {
          return { background: `radial-gradient(circle, ${from}, ${to})` };
        } else {
          return { background: `linear-gradient(${direction}, ${from}, ${to})` };
        }
      } else if (bgData.type === 'image') {
        const { url, opacity } = bgData.image;
        return {
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: opacity
        };
      }
    } catch (e) {
      return { backgroundColor: bgValue };
    }
    return {};
  };

  return (
    <footer 
      className="bg-gray-900 dark:bg-black text-white py-8"
      style={footerBg ? renderBackground(footerBg) : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-4">
          <h3 className="text-xl font-serif font-bold mb-2">{companyName}</h3>
          <p className="text-gray-300 dark:text-gray-400">{footerText}</p>
        </div>
        
        <div className="flex justify-center items-center space-x-6 mb-4">
          <a 
            href={`https://instagram.com/${instagramHandle.replace('@', '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300 transition-colors"
          >
            <i className="fab fa-instagram text-xl mr-2"></i>
            {instagramHandle}
          </a>
          <a 
            href={`tel:${phone}`}
            className="text-pink-400 hover:text-pink-300 transition-colors"
          >
            <i className="fas fa-phone text-xl mr-2"></i>
            {phone}
          </a>
        </div>
        
        <div className="pt-4 border-t border-gray-700 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} {companyName}. Todos los derechos reservados.
            </p>
            
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}