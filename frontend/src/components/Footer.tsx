import React, { useState } from 'react';
import logo from '../pages/images/logo ppro-01.png';
import config from '../config/config';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Send
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${config.apiUrl}${config.publicEndpoints.subscribe}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribeStatus({
          message: 'Successfully subscribed to newsletter!',
          type: 'success'
        });
        setEmail('');
      } else {
        setSubscribeStatus({
          message: data.message || 'Failed to subscribe',
          type: 'error'
        });
      }

      // Clear status after 3 seconds
      setTimeout(() => {
        setSubscribeStatus({ message: '', type: null });
      }, 3000);

    } catch (error) {
      console.error('Subscribe error:', error);
      setSubscribeStatus({
        message: 'Failed to subscribe. Please try again.',
        type: 'error'
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      
      // Track footer link click
      const visitorId = localStorage.getItem('visitorId');
      if (visitorId) {
        fetch(`${config.apiUrl}/api/website/track-click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            visitorId,
            element: `footer_${sectionId}`,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error);
      }
    }
  };

  const socialLinks = [
    { icon: Facebook, url: "#" },
    { icon: Twitter, url: "#" },
    { icon: Instagram, url: "#" },
    { icon: Linkedin, url: "#" }
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex justify-center md:justify-start">
              <a 
                href="#" 
                onClick={() => scrollToSection('hero')} 
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <img 
                  src={logo} 
                  alt="PPRO Logo" 
                  className="w-32 h-auto object-contain" 
                />
              </a>
            </div>
            <p className="text-gray-300 text-center md:text-left">
              {t('partnershipForPovertyReductionOrganisation')}
            </p>
            <div className="flex justify-center md:justify-start space-x-4 pt-2">
              {socialLinks.map((SocialIcon, index) => (
                <a
                  key={index}
                  href={SocialIcon.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label={`Social media link ${index}`}
                >
                  <SocialIcon.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-blue-500 pb-2 inline-block">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-3">
              {[
                { name: t('home'), section: 'hero' },
                { name: t('aboutUs'), section: 'about' },
                { name: t('services'), section: 'services' },
                { name: t('projects'), section: 'projects' },
                { name: t('contact'), section: 'contact' }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={`#${link.section}`}
                    onClick={() => scrollToSection(link.section)}
                    className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-blue-500 pb-2 inline-block">
              {t('contact')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">ppro@pprotz.org</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300">(+255) 785 593 388</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{t('masjidHaqqBuguruniDarEsSalaam')}</span>
              </div>
            </div>
          </div>

          {/* Newsletter Subscribe Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-blue-500 pb-2 inline-block">
              {t('newsletter')}
            </h3>
            <p className="text-gray-300 text-sm">
              {t('subscribeToNewsletter')}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('enterYourEmail')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                    placeholder-gray-400 text-white"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 
                    text-blue-400 hover:text-blue-300 transition-colors"
                  aria-label="Subscribe"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              {subscribeStatus.message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm ${
                    subscribeStatus.type === 'success' 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}
                >
                  {subscribeStatus.message}
                </motion.p>
              )}
            </form>
            <p className="text-gray-400 text-xs">
              {t('privacyNotice')}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} PPRO. {t('allRightsReserved')}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {t('madeWith')} <span className="text-red-500">♥</span> {t('forTanzania')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;