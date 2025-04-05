import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageSwitcherProps {
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = () => {
  const { currentLanguage, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'sw' ? 'en' : 'sw';
    setLanguage(newLang);
  };

  // Show the opposite language name
  const buttonText = currentLanguage === 'en' ? 'Swahili' : 'English';

  return (
    <div className="fixed bottom-10 right-6 z-50">
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
      >
        <Globe size={20} />
        <span>{buttonText}</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
