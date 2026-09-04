import { motion } from 'framer-motion';

const About = ({ about }) => {
  return (
    <section id="about" className="py-20 md:py-40 bg-brand-surface overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
              <img
                src={about.imageUrl}
                alt={about.imageAlt}
                className="w-full h-full object-cover object-bottom scale-115 transition-transform duration-700"
              />
            </div>
            <div className="absolute -top-4 -left-4 w-full h-full border border-brand-gold/20 -z-0 hidden sm:block" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 sm:space-y-8"
          >
            <div>
              <span className="text-brand-gold text-[9px] sm:text-[10px] tracking-[0.3em] uppercase block mb-4">{about.eyebrow}</span>
              <h2 className="text-white text-[20px] sm:text-5xl md:text-6xl font-serif leading-tight">
                {about.titleLines.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {line}
                    {index < about.titleLines.length - 1 && <><br className="hidden sm:block" /> </>}
                  </span>
                ))}
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6 text-white/60 text-base sm:text-lg leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: about.bodyHtml }} />

            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-white/10">
              {about.stats.map((stat) => (
                <div key={stat.label}>
                  <span className="text-brand-gold text-2xl sm:text-3xl font-serif block mb-1">{stat.value}</span>
                  <span className="text-white/40 text-[8px] sm:text-[9px] tracking-[0.1em] uppercase block">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
