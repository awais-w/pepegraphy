import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';

const Contact = () => {
  const [formState, setFormState] = useState({ name: '', email: '', type: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email) {
      setStatus('Please fill in your name and email.');
      return;
    }
    
    const subject = encodeURIComponent(`Pepegraphy enquiry — ${formState.type || 'General'}`);
    const body = encodeURIComponent(
      `Hi Petra,\n\nMy name is ${formState.name}.\n\n${formState.message}\n\nBest,\n${formState.name}\n${formState.email}`
    );
    window.location.href = `mailto:petrastyasztny@gmail.com?subject=${subject}&body=${body}`;
    setStatus('Opening your email client…');
  };

  return (
    <section id="contact" className="py-20 md:py-40 bg-brand-black">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 lg:gap-32">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-brand-gold text-[9px] sm:text-[10px] tracking-[0.3em] uppercase block mb-4">Contact</span>
            <h2 className="text-white text-[20px] sm:text-5xl md:text-6xl font-serif mb-6 sm:mb-8 leading-tight">
              Let's create<br />something beautiful.
            </h2>
            <p className="text-white/40 text-base sm:text-lg font-light leading-relaxed mb-10 sm:mb-12 max-w-md">
              Reach out to discuss your shoot. Whether you have a clear vision or are starting from scratch, I'm here to guide you through every step.
            </p>

            <div className="space-y-4 sm:space-y-6">
              <a href="mailto:petrastyasztny@gmail.com" className="flex items-center gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-brand-gold/50 group-hover:bg-brand-gold/5 transition-all">
                  <Mail size={16} className="text-brand-gold" />
                </div>
                <span className="text-white/60 group-hover:text-white transition-colors font-light text-sm sm:text-base">petrastyasztny@gmail.com</span>
              </a>
              <a href="tel:+447975605120" className="flex items-center gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-brand-gold/50 group-hover:bg-brand-gold/5 transition-all">
                  <Phone size={16} className="text-brand-gold" />
                </div>
                <span className="text-white/60 group-hover:text-white transition-colors font-light text-sm sm:text-base">+44 7975 605 120</span>
              </a>
            </div>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 sm:space-y-8 bg-brand-surface p-6 sm:p-12 border border-white/5"
          >
            <div className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 block">Your name</label>
                <input 
                  type="text" 
                  placeholder="Jane Smith"
                  className="w-full bg-transparent border-b border-white/10 py-3 sm:py-4 focus:border-brand-gold outline-none transition-colors text-white placeholder:text-white/10 text-sm sm:text-base"
                  onChange={(e) => setFormState({...formState, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 block">Email address</label>
                <input 
                  type="email" 
                  placeholder="jane@example.com"
                  className="w-full bg-transparent border-b border-white/10 py-3 sm:py-4 focus:border-brand-gold outline-none transition-colors text-white placeholder:text-white/10 text-sm sm:text-base"
                  onChange={(e) => setFormState({...formState, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 block">Type of shoot</label>
                <select 
                  className="w-full bg-transparent border-b border-white/10 py-3 sm:py-4 focus:border-brand-gold outline-none transition-colors text-white/50 focus:text-white appearance-none text-sm sm:text-base"
                  onChange={(e) => setFormState({...formState, type: e.target.value})}
                >
                  <option value="">Select a category...</option>
                  <option value="male">Male Portraiture</option>
                  <option value="female">Female Portraiture</option>
                  <option value="children">Children</option>
                  <option value="events">Parties & Events</option>
                  <option value="reportage">Reportage</option>
                  <option value="nature">Nature</option>
                  <option value="pet">Pets</option>
                  <option value="boudoir">Boudoir</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 block">Message</label>
                <textarea 
                  rows="4"
                  placeholder="Tell me about your vision..."
                  className="w-full bg-transparent border-b border-white/10 py-3 sm:py-4 focus:border-brand-gold outline-none transition-colors text-white placeholder:text-white/10 resize-none text-sm sm:text-base"
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-brand-gold text-black py-4 sm:py-5 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-brand-gold-light transition-all duration-500"
            >
              Send Message
            </button>
            {status && <p className="text-[9px] text-brand-gold text-center tracking-wider">{status}</p>}
          </motion.form>

        </div>
      </div>
    </section>
  );
};

export default Contact;
