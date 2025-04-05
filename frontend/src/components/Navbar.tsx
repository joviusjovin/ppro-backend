import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from '../context/LanguageContext';
import logo from '../pages/images/logo ppro-01.png'
import config from '../config/config';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
      
      // Track page view
      const visitorId = localStorage.getItem('visitorId');
      if (visitorId) {
        fetch(`${config.apiUrl}/api/website/track-view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            visitorId,
            page: id,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error);
      }
    }
  };

  const handleStaffLogin = () => {
    const adminWindow = window.open('/admin/login', '_blank');
    if (adminWindow) {
      adminWindow.document.title = 'PPRO Management System';
    }
  };

  const navItems = [
    { id: 'hero', label: 'home' },
    { id: 'about', label: 'about' },
    { id: 'services', label: 'services' },
    { id: 'projects', label: 'projects' },
    { id: 'gallery', label: 'gallery' },
    { id: 'contact', label: 'contact' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-blue-800/70 backdrop-blur-md shadow-lg dark:bg-[#001c26] dark:backdrop-blur-md dark:shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => scrollToSection('hero')} className="flex items-center space-x-2">
            <img src={logo} className="w-28 h-20 text-blue-600" />
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`font-bold transition-colors ${
                  isScrolled ? 'text-white' : 'text-white'
                } hover:text-blue-600`}
              >
                {t(item.label)}
              </button>
            ))}
            
            {/* Staff Login Button */}
            <button
              onClick={handleStaffLogin}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              Staff Login
            </button>

            {/* Theme Toggle Button (Desktop) */}
            <button
              aria-label="Toggle Dark Mode"
              className={`p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-white' : 'text-white'
              } hover:text-blue-600`}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && (
                theme === 'dark' ? 
                <Sun className="w-5 h-5" /> : 
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="lg:hidden md:hidden flex items-center space-x-4">
            {/* Theme Toggle Button (Mobile) */}
            <button
              aria-label="Toggle Dark Mode"
              className={`p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-white' : 'text-white'
              } hover:text-blue-600`}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && (
                theme === 'dark' ? 
                <Sun className="w-5 h-5" /> : 
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`transition-colors ${
                isScrolled ? 'text-blue-500' : 'text-white'
              } hover:text-blue-600`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left px-4 py-2 font-bold transition-colors ${
                  isScrolled ? 'text-white' : 'text-white'
                } hover:text-blue-600 hover:bg-gray-100`}
              >
                {t(item.label)}
              </button>
            ))}
            {/* Staff Login Button (Mobile) */}
            <button
              onClick={handleStaffLogin}
              className="block w-full text-left px-4 py-2 font-bold text-blue-600 hover:bg-gray-100 transition-colors"
            >
              Staff Login
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;