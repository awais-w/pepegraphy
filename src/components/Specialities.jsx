import { motion } from 'framer-motion';

const Specialities = ({ specialities }) => {
  return (
    <section id="specialities" className="py-20 md:py-40 bg-brand-surface">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-12 sm:mb-16">
          <span className="text-brand-gold text-[9px] sm:text-[10px] tracking-[0.3em] uppercase block mb-4">{specialities.eyebrow}</span>
          <h2 className="text-white text-[20px] sm:text-5xl md:text-6xl font-serif">{specialities.title}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
          {specialities.items.map((spec, i) => (
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
                {spec.description}
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
