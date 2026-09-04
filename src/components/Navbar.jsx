import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import { getDefaultLanguage, getSupportedLanguages } from '../i18n/translations';

const LANGUAGE_LABELS = { en: 'EN', hu: 'HU' };

const LanguageSwitcher = ({ direction = 'row' }) => {
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const languages = supportedLanguages?.length ? supportedLanguages : getSupportedLanguages();
  const fallback = getDefaultLanguage();
  return (
    <div
      className={`flex items-center gap-1 ${direction === 'column' ? 'flex-col items-stretch' : ''}`}
      role="group"
      aria-label="Language switcher"
    >
      {languages.map((code) => {
        const isActive = (language ?? fallback) === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            aria-pressed={isActive}
            aria-label={`Switch language to ${code.toUpperCase()}`}
            className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 transition-colors border ${
              isActive
                ? 'text-brand-gold border-brand-gold'
                : 'text-white/60 border-white/10 hover:text-white hover:border-white/30'
            } ${direction === 'column' ? 'w-full text-center' : ''}`}
          >
            {LANGUAGE_LABELS[code] ?? code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};

const Navbar = ({ navigation }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = navigation.links.map(({ label, href }) => ({ name: label, href }));

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-brand-black/90 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center gap-4">
        <a href="#hero" className="text-xl sm:text-2xl font-serif tracking-tighter sm:tracking-[0.2em] text-white hover:text-brand-gold transition-colors">
          {navigation.brand}
        </a>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-10 items-center">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="text-[10px] font-sans tracking-[0.2em] uppercase text-white/70 hover:text-white transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
          <li>
            <LanguageSwitcher />
          </li>
        </ul>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-3">
          <LanguageSwitcher />
          <button
            className="text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-brand-black border-b border-white/10 md:hidden overflow-hidden"
          >
            <ul className="flex flex-col py-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="block px-8 py-4 text-xs tracking-[0.2em] uppercase text-white/70 hover:text-white hover:bg-white/5 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
