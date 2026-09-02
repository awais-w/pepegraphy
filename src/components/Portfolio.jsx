import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 350 : direction < 0 ? -350 : 0,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 350 : direction > 0 ? -350 : 0,
    opacity: 0,
    scale: 0.96,
  }),
};

const Portfolio = ({ portfolio }) => {
  const { images, categories } = portfolio;
  const categorySlugs = categories.map((category) => category.slug);
  const categoryNames = new Map(categories.map((category) => [category.slug, category.name]));
  const [filter, setFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const filteredImages = images.filter(img => filter === 'all' || img.category === filter);
  const currentCatIdx = categorySlugs.indexOf(filter);
  const prevCategory = categorySlugs[(currentCatIdx - 1 + categorySlugs.length) % categorySlugs.length];
  const nextCategory = categorySlugs[(currentCatIdx + 1) % categorySlugs.length];

  const handlePrevImage = useCallback((e) => {
    if (e) e.stopPropagation();
    if (filteredImages.length <= 1) return;
    setDirection(-1);
    setSelectedIndex((prev) => (prev === null ? 0 : (prev - 1 + filteredImages.length) % filteredImages.length));
  }, [filteredImages.length, setDirection, setSelectedIndex]);

  const handleNextImage = useCallback((e) => {
    if (e) e.stopPropagation();
    if (filteredImages.length <= 1) return;
    setDirection(1);
    setSelectedIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredImages.length));
  }, [filteredImages.length, setDirection, setSelectedIndex]);

  const handlePrevCategory = useCallback((e) => {
    if (e) e.stopPropagation();
    setDirection(-1);
    setFilter(prevCategory);
    setSelectedIndex(0);
  }, [prevCategory, setDirection, setFilter, setSelectedIndex]);

  const handleNextCategory = useCallback((e) => {
    if (e) e.stopPropagation();
    setDirection(1);
    setFilter(nextCategory);
    setSelectedIndex(0);
  }, [nextCategory, setDirection, setFilter, setSelectedIndex]);

  const handleClose = useCallback((e) => {
    if (e) e.stopPropagation();
    setSelectedIndex(null);
    setDirection(0);
  }, [setDirection, setSelectedIndex]);

  // Touch Swipe Handlers for mobile & tablet devices
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
  };

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevCategory();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextCategory();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handlePrevImage, handleNextImage, handlePrevCategory, handleNextCategory, handleClose]);

  const selectedImage = selectedIndex !== null ? filteredImages[selectedIndex] : null;

  return (
    <section id="portfolio" className="py-20 md:py-40 bg-brand-black">
      <div className="container mx-auto px-4 sm:px-6">

        <div className="mb-12 md:mb-24">
          <span className="text-brand-gold text-[9px] sm:text-[10px] tracking-[0.3em] uppercase block mb-4">{portfolio.eyebrow}</span>
          <h2 className="text-white text-[20px] sm:text-5xl md:text-6xl font-serif mb-6 sm:mb-8">{portfolio.title}</h2>
          <p className="text-white/40 max-w-2xl text-base sm:text-lg leading-relaxed font-light">
            {portfolio.description}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-12 sm:mb-16">
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => {
                setFilter(category.slug);
                setSelectedIndex(null);
                setDirection(0);
              }}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 text-[8px] sm:text-[9px] tracking-[0.2em] uppercase rounded-full transition-all duration-300 border cursor-pointer ${
                filter === category.slug
                  ? 'bg-brand-gold border-brand-gold text-black font-medium'
                  : 'bg-transparent border-white/10 text-white/50 hover:border-white/30 hover:text-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img, idx) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="relative group cursor-pointer overflow-hidden bg-brand-surface break-inside-avoid"
                onClick={() => {
                  setDirection(0);
                  setSelectedIndex(idx);
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-110 brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 sm:p-6">
                  <span className="text-white text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-light">
                    {categoryNames.get(img.category) || img.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Interactive Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-between px-0 py-3 sm:p-8 select-none"
            onClick={handleClose}
          >
            {/* Top Bar: Category Shortcuts & Close Button */}
            <div className="w-full flex items-center justify-between z-30 px-3 sm:px-0 pb-2 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
              {/* Category Quick Nav */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 max-w-[80vw] sm:max-w-none scrollbar-none">
                <span className="text-white/30 text-[9px] uppercase tracking-widest hidden md:inline mr-2">Category:</span>
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => {
                      setDirection(0);
                      setFilter(category.slug);
                      setSelectedIndex(0);
                    }}
                    className={`px-2.5 sm:px-3 py-1 text-[8px] sm:text-[9px] tracking-[0.15em] uppercase rounded-full transition-all duration-300 cursor-pointer ${
                      filter === category.slug
                        ? 'bg-brand-gold text-black font-semibold'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Close Button */}
              <button
                className="text-white/50 hover:text-brand-gold transition-colors p-2 shrink-0 ml-2 cursor-pointer"
                onClick={handleClose}
                aria-label="Close modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Middle Section: Image with Horizontal Slide Transition */}
            <div className="relative w-full flex-1 flex items-center justify-between my-2 px-0 sm:px-2 overflow-hidden">
              {/* Desktop Left Image Arrow */}
              {filteredImages.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  className="hidden sm:flex z-30 p-3 text-white/40 hover:text-brand-gold hover:bg-white/5 rounded-full transition-all duration-300 cursor-pointer shrink-0"
                  aria-label="Previous image"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Main Image View - Sliding Transition Container */}
              <div
                className="relative w-full sm:max-w-5xl h-full flex flex-col items-center justify-center px-0 touch-pan-y overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.img
                    key={selectedImage.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                    drag={filteredImages.length > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipeThreshold = 40;
                      if (offset.x < -swipeThreshold || velocity.x < -250) {
                        handleNextImage();
                      } else if (offset.x > swipeThreshold || velocity.x > 250) {
                        handlePrevImage();
                      }
                    }}
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    className="w-full sm:w-auto max-w-full max-h-[74vh] sm:max-h-[70vh] object-contain shadow-2xl cursor-grab active:cursor-grabbing"
                  />
                </AnimatePresence>
              </div>

              {/* Desktop Right Image Arrow */}
              {filteredImages.length > 1 && (
                <button
                  onClick={handleNextImage}
                  className="hidden sm:flex z-30 p-3 text-white/40 hover:text-brand-gold hover:bg-white/5 rounded-full transition-all duration-300 cursor-pointer shrink-0"
                  aria-label="Next image"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Bottom Bar: Mobile Controls + Image Details & Category Jump */}
            <div className="w-full flex flex-col items-center pt-2 px-3 sm:px-0 border-t border-white/10 text-center gap-2 z-30" onClick={(e) => e.stopPropagation()}>

              {/* Mobile Image Navigation Bar */}
              <div className="w-full flex items-center justify-between sm:justify-center gap-4">
                {/* Mobile Prev Arrow */}
                {filteredImages.length > 1 ? (
                  <button
                    onClick={handlePrevImage}
                    className="sm:hidden p-2 text-white/60 hover:text-brand-gold hover:bg-white/10 rounded-full transition-all cursor-pointer"
                    aria-label="Previous image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                ) : <div className="sm:hidden w-8" />}

                {/* Counter & Caption */}
                <div className="space-y-0.5 max-w-[70vw] sm:max-w-none">
                  <p className="text-white/80 text-xs sm:text-sm font-light tracking-wide truncate">
                    {selectedImage.alt}
                  </p>
                  <div className="flex items-center justify-center gap-3 text-white/40 text-[9px] tracking-[0.2em] uppercase font-mono">
                    <span>{String(selectedIndex + 1).padStart(2, '0')}</span>
                    <span className="w-4 h-[1px] bg-white/20 inline-block" />
                    <span>{String(filteredImages.length).padStart(2, '0')}</span>
                    <span className="text-white/20">|</span>
                    <span className="text-brand-gold capitalize">{categoryNames.get(selectedImage.category) || selectedImage.category}</span>
                  </div>
                </div>

                {/* Mobile Next Arrow */}
                {filteredImages.length > 1 ? (
                  <button
                    onClick={handleNextImage}
                    className="sm:hidden p-2 text-white/60 hover:text-brand-gold hover:bg-white/10 rounded-full transition-all cursor-pointer"
                    aria-label="Next image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : <div className="sm:hidden w-8" />}
              </div>

              {/* Category Jump Buttons */}
              <div className="w-full flex items-center justify-between text-[9px] tracking-[0.2em] uppercase text-white/40 pt-1">
                <button
                  onClick={handlePrevCategory}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>↑ Prev Cat:</span>
                  <span className="text-white/70 capitalize">{categoryNames.get(prevCategory) || prevCategory}</span>
                </button>

                <button
                  onClick={handleNextCategory}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Next Cat:</span>
                  <span className="text-white/70 capitalize">{categoryNames.get(nextCategory) || nextCategory}</span>
                  <span>↓</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Portfolio;
