import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryImages } from '../data/portfolioData';

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const currentImage = galleryImages[currentIndex];

  return (
    <section id="hero" className="relative h-screen min-h-[650px] flex items-center justify-center overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-brand-black">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImage.id}
            src={currentImage.src}
            alt={currentImage.alt || 'Gallery photo'}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{
              opacity: { duration: 1.8, ease: 'easeInOut' },
              scale: { duration: 7, ease: 'linear' },
            }}
            className="absolute inset-0 w-full h-full object-cover object-top brightness-[0.38] saturate-[0.85]"
          />
        </AnimatePresence>

        {/* Elegant stardust noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        {/* Subtle dark gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/40 via-brand-black/20 to-brand-black" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-brand-gold text-[9px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-6"
        >
          Natural · Authentic · Timeless
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-white text-[24px] sm:text-7xl md:text-9xl font-serif tracking-[0.05em] sm:tracking-[0.1em] font-light mb-8"
        >
          PEPEGRAPHY
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-white/70 font-serif italic text-base sm:text-xl md:text-2xl mb-12"
        >
          Photography by Petra Styasztny
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <a
            href="#portfolio"
            className="inline-block border border-white/30 px-8 sm:px-10 py-3 sm:py-4 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-xs"
          >
            View Portfolio
          </a>
        </motion.div>
      </div>

      {/* Carousel Left/Right Manual Controls */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-4 sm:left-8 z-20 text-white/30 hover:text-brand-gold transition-colors duration-300 p-2 hidden sm:block"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-4 sm:right-8 z-20 text-white/30 hover:text-brand-gold transition-colors duration-300 p-2 hidden sm:block"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Slide Counter & Category indicator */}
      <div className="absolute bottom-10 left-6 sm:left-12 z-20 hidden sm:flex items-center gap-4 text-white/40 text-[9px] tracking-[0.2em] uppercase font-light">
        <span className="text-brand-gold font-mono">
          {String(currentIndex + 1).padStart(2, '0')}
        </span>
        <div className="w-8 h-[1px] bg-white/20" />
        <span>{String(galleryImages.length).padStart(2, '0')}</span>
        <span className="text-white/20 ml-2">|</span>
        <span className="text-white/60 ml-2 capitalize">{currentImage.category}</span>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20"
      >
        <span className="text-white/30 text-[8px] tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/30 to-transparent relative overflow-hidden">
          <motion.div
            animate={{ y: [0, 48, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-0 w-full h-4 bg-brand-gold"
          />
        </div>
      </motion.div>


    </section>
  );
};

export default Hero;
