import { motion } from 'framer-motion';

const Booking = ({ booking }) => {
  return (
    <section id="booking" className="relative py-24 md:py-40 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={booking.backgroundImageUrl}
          className="w-full h-full object-cover brightness-[0.15] saturate-[0.5]"
          alt=""
        />
        <div className="absolute inset-0 bg-brand-black/60 backdrop-blur-[2px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <span className="text-brand-gold text-[10px] tracking-[0.3em] uppercase block mb-4">{booking.eyebrow}</span>
          <h2 className="text-white text-4xl sm:text-5xl md:text-6xl font-serif mb-16">{booking.title}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {booking.features.map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-6"
              >
                <div className="w-6 h-6 rounded-full border border-brand-gold flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                </div>
                <div>
                  <h3 className="text-white text-lg mb-2 font-normal">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-light">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <a 
              href={booking.ctaHref}
              className="inline-block bg-white text-black px-12 py-5 text-[10px] tracking-[0.2em] uppercase hover:bg-brand-gold transition-all duration-500 font-medium"
            >
              {booking.ctaLabel}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Booking;
