import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import lightGallery from 'lightgallery';
import lgThumbnail from 'lightgallery/plugins/thumbnail/lg-thumbnail.es5.js';
import lgZoom from 'lightgallery/plugins/zoom/lg-zoom.es5.js';
import lgAutoplay from 'lightgallery/plugins/autoplay/lg-autoplay.es5.js';
import lgFullscreen from 'lightgallery/plugins/fullscreen/lg-fullscreen.es5.js';
import lgHash from 'lightgallery/plugins/hash/lg-hash.es5.js';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-autoplay.css';
import 'lightgallery/css/lg-fullscreen.css';
import 'lightgallery/css/lg-hash.css';

const Portfolio = ({ portfolio }) => {
  const { images, categories } = portfolio;
  const categoryNames = new Map(categories.map((category) => [category.slug, category.name]));
  const [filter, setFilter] = useState('all');
  const lgContainerRef = useRef(null);
  const lgInstance = useRef(null);

  const filteredImages = images.filter(img => filter === 'all' || img.category === filter);

  const displayImages = useMemo(() => {
    return [...filteredImages].sort((a, b) => a.id - b.id).slice(0, 8);
  }, [filteredImages]);

  const openLightGallery = useCallback((img) => {
    if (!lgContainerRef.current) return;

    if (lgInstance.current) {
      try {
        lgInstance.current.destroy();
      } catch (error) {
        console.error('Failed to destroy lightGallery:', error);
      }
      lgInstance.current = null;
      document.querySelectorAll('.lg-container').forEach((el) => el.remove());
    }

    const index = filteredImages.findIndex((item) => item.id === img.id);
    const slides = filteredImages.map((image) => ({
      src: image.src,
      thumb: image.src,
      subHtml: `<h4>${image.alt}</h4>`,
    }));

    try {
      lgInstance.current = lightGallery(lgContainerRef.current, {
        licenseKey: '0000-0000-000-0000',
        plugins: [lgThumbnail, lgZoom, lgAutoplay, lgFullscreen],
        dynamic: true,
        dynamicEl: slides,
        speed: 500,
        closable: true,
        download: false,
        hideBarsDelay: 3000,
        controls: true,
        counter: true,
        fullScreen: true,
        autoplay: true,
        slideShowAutoplay: false,
        slideShowInterval: 3000,
        progressBar: true,
        forceSlideShowAutoplay: false,
        autoplayControls: true,
      });
      lgInstance.current.openGallery(index >= 0 ? index : 0);
    } catch (error) {
      console.error('Failed to open lightGallery:', error);
    }
  }, [filteredImages]);

  useEffect(() => {
    return () => {
      if (lgInstance.current) {
        try {
          lgInstance.current.destroy();
        } catch (error) {
          console.error('Failed to destroy lightGallery:', error);
        }
        lgInstance.current = null;
      }
      document.querySelectorAll('.lg-container').forEach((el) => el.remove());
    };
  }, []);

  return (
    <section id="portfolio" className="py-20 md:py-40 bg-brand-black">
      <div className="container mx-auto px-4 sm:px-6">

        <div className="mb-12 md:mb-24">
          <span className="text-brand-gold text-[9px] sm:text-[10px] tracking-[0.3em] uppercase block mb-4">{portfolio.eyebrow}</span>
          <h2 className="text-white text-[20px] sm:text-5xl md:text-6xl font-serif mb-6 sm:mb-8">{portfolio.title}</h2>
          <p className="text-white/40 max-w-2xl text-base sm:text-lg leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: portfolio.descriptionHtml }} />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-12 sm:mb-16">
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => setFilter(category.slug)}
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
            {displayImages.map((img) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="relative group cursor-pointer overflow-hidden bg-brand-surface break-inside-avoid"
                onClick={() => openLightGallery(img)}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-110 brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 sm:p-6 pointer-events-none">
                  <span className="text-white text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-light">
                    {categoryNames.get(img.category) || img.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* LightGallery container */}
      <div ref={lgContainerRef} className="lg-react-element" />
    </section>
  );
};

export default Portfolio;
