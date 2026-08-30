import React from 'react';
import { motion } from 'framer-motion';

const specs = [
  { icon: '♂', title: 'Male Portraiture', desc: 'Sessions that celebrate strength, charisma and individuality — from polished professional headshots to relaxed, character-driven portraits.' },
  { icon: '♀', title: 'Female Portraiture', desc: 'Elegant, empowering sessions that celebrate every facet of womanhood — natural beauty, confidence, and personality, captured authentically.' },
  { icon: '✦', title: 'Children', desc: 'Joyful, candid images that freeze childhood in its purest form — all the energy, wonder, and laughter that defines those fleeting years.' },
  { icon: '◆', title: 'Parties & Events', desc: 'From intimate gatherings to milestone celebrations — birthdays, christenings, anniversaries — every moment of joy, preserved.' },
  { icon: '◈', title: 'Reportage', desc: 'Documentary-style photography that captures raw emotion, mood, and the unfiltered truth of a moment — honest and powerful storytelling.' },
  { icon: '❋', title: 'Nature', desc: 'Landscapes, flora, fauna — the natural world in all its serene beauty, from sweeping vistas to intimate close-up details.' },
  { icon: '⬡', title: 'Pet Photography', desc: 'Personality-packed portraits of your furry companions — playful, tender, and always full of the character that makes them uniquely yours.' },
  { icon: '◇', title: 'Boudoir', desc: 'Intimate, empowering sessions designed around confidence and self-celebration. Tasteful, elegant, and entirely on your terms.' },
];

const Specialities = () => {
  return (
    <section id="specialities" className="py-20 md:py-40 bg-brand-surface">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-12 sm:mb-16">
          <span className="text-brand-gold text-[9px] sm:text-[10px] tracking-[0.3em] uppercase block mb-4">What I offer</span>
          <h2 className="text-white text-[20px] sm:text-5xl md:text-6xl font-serif">Specialities</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
          {specs.map((spec, i) => (
            <motion.div
              key={spec.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-brand-surface p-8 sm:p-10 group hover:bg-brand-surface-light transition-all duration-500 relative"
            >
              <div className="text-brand-gold text-2xl mb-6 sm:mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                {spec.icon}
              </div>
              <h3 className="text-white text-lg sm:text-xl font-serif mb-4">{spec.title}</h3>
              <p className="text-white/40 text-xs sm:text-sm leading-relaxed font-light group-hover:text-white/60 transition-colors">
                {spec.desc}
              </p>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-gold group-hover:w-full transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Specialities;
