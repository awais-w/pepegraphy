import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import { useTranslations } from '../i18n/useTranslations';
import { contentRepository } from '../lib/contentRepository';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const Contact = ({ contact, categories }) => {
  const t = useTranslations();
  const [formState, setFormState] = useState({ name: '', email: '', type: '', message: '' });
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' | 'error' | 'submitting'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeOptions = [
    { value: 'male', label: t.contactFormTypes.find((opt) => opt.value === 'male')?.label ?? 'Male Portraiture' },
    { value: 'female', label: t.contactFormTypes.find((opt) => opt.value === 'female')?.label ?? 'Female Portraiture' },
    { value: 'children', label: t.contactFormTypes.find((opt) => opt.value === 'children')?.label ?? 'Children' },
    { value: 'events', label: t.contactFormTypes.find((opt) => opt.value === 'events')?.label ?? 'Parties & Events' },
    { value: 'reportage', label: t.contactFormTypes.find((opt) => opt.value === 'reportage')?.label ?? 'Reportage' },
    { value: 'nature', label: t.contactFormTypes.find((opt) => opt.value === 'nature')?.label ?? 'Nature' },
    { value: 'pet', label: t.contactFormTypes.find((opt) => opt.value === 'pet')?.label ?? 'Pets' },
    { value: 'boudoir', label: t.contactFormTypes.find((opt) => opt.value === 'boudoir')?.label ?? 'Boudoir' },
    { value: 'other', label: t.contactFormTypes.find((opt) => opt.value === 'other')?.label ?? 'Other' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) {
      setStatus(t.contactFormError ?? 'Please fill in your name, email, and message.');
      setStatusType('error');
      return;
    }

    setIsSubmitting(true);
    setStatus(t.contactFormSubmitting ?? 'Sending message...');
    setStatusType('submitting');

    if (isSupabaseConfigured) {
      try {
        await contentRepository.submitContactMessage({
          name: formState.name,
          email: formState.email,
          category: formState.type,
          message: formState.message,
        });
        setStatus(t.contactFormSuccess ?? 'Thank you! Your message has been sent successfully.');
        setStatusType('success');
        setFormState({ name: '', email: '', type: '', message: '' });
        setIsSubmitting(false);
        return;
      } catch (err) {
        console.error('Contact form submission error:', err);
      }
    }

    setIsSubmitting(false);
    // Fallback to mailto if Supabase is unconfigured or submission fails
    const subject = encodeURIComponent(`${t.contactFormSubjectPrefix ?? 'Pepegraphy enquiry'} — ${formState.type || (t.contactFormGeneral ?? 'General')}`);
    const body = encodeURIComponent(
      `${t.contactFormGreeting ?? 'Hi Petra'},\n\n${t.contactFormNameIntro ?? 'My name is'} ${formState.name}.\n\n${formState.message}\n\n${t.contactFormSignOff ?? 'Best'},\n${formState.name}\n${formState.email}`
    );
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    setStatus(t.contactFormFailed ?? 'Unable to send message directly. Opening email client...');
    setStatusType('error');
  };

  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-20 md:py-40 bg-brand-black">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 lg:gap-32">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            itemScope
            itemType="https://schema.org/Photographer"
            itemRef="contact-heading contact-email contact-phone"
          >
            <span className="text-brand-gold text-[9px] sm:text-[10px] tracking-[0.3em] uppercase block mb-4">{contact.eyebrow}</span>
            <h2 id="contact-heading" itemProp="name" className="text-white text-[20px] sm:text-5xl md:text-6xl font-serif mb-6 sm:mb-8 leading-tight">
              {contact.titleLines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < contact.titleLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-white/40 text-base sm:text-lg font-light leading-relaxed mb-10 sm:mb-12 max-w-md" dangerouslySetInnerHTML={{ __html: contact.descriptionHtml }} />

            <div className="space-y-4 sm:space-y-6">
              <a href={`mailto:${contact.email}`} id="contact-email" itemProp="email" className="flex items-center gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-brand-gold/50 group-hover:bg-brand-gold/5 transition-all">
                  <Mail size={16} className="text-brand-gold" />
                </div>
                <span className="text-white/60 group-hover:text-white transition-colors font-light text-sm sm:text-base">{contact.email}</span>
              </a>
              <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} id="contact-phone" itemProp="telephone" className="flex items-center gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-brand-gold/50 group-hover:bg-brand-gold/5 transition-all">
                  <Phone size={16} className="text-brand-gold" />
                </div>
                <span className="text-white/60 group-hover:text-white transition-colors font-light text-sm sm:text-base">{contact.phone}</span>
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
                <label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 block">{t.contactFormName}</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={formState.name}
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b border-white/10 py-3 sm:py-4 focus:border-brand-gold outline-none transition-colors text-white placeholder:text-white/10 text-sm sm:text-base disabled:opacity-50"
                  onChange={(e) => setFormState({...formState, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 block">{t.contactFormEmail}</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={formState.email}
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b border-white/10 py-3 sm:py-4 focus:border-brand-gold outline-none transition-colors text-white placeholder:text-white/10 text-sm sm:text-base disabled:opacity-50"
                  onChange={(e) => setFormState({...formState, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 block">{t.contactFormType}</label>
                <select
                  value={formState.type}
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b border-white/10 py-3 sm:py-4 focus:border-brand-gold outline-none transition-colors text-white/50 focus:text-white appearance-none text-sm sm:text-base disabled:opacity-50"
                  onChange={(e) => setFormState({...formState, type: e.target.value})}
                >
                  <option value="">{t.contactFormTypePlaceholder ?? 'Select a category...'}</option>
                  {categories.filter((category) => category.slug !== 'all').map((category) => {
                    const localized = typeOptions.find((opt) => opt.value === category.slug);
                    return (
                      <option key={category.slug} value={category.slug}>{localized?.label ?? category.name}</option>
                    );
                  })}
                  <option value="other">{t.contactFormTypes.find((opt) => opt.value === 'other')?.label ?? 'Other'}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 block">{t.contactFormMessage}</label>
                <textarea
                  rows="4"
                  placeholder={t.contactFormMessagePlaceholder ?? 'Tell me about your vision...'}
                  value={formState.message}
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b border-white/10 py-3 sm:py-4 focus:border-brand-gold outline-none transition-colors text-white placeholder:text-white/10 resize-none text-sm sm:text-base disabled:opacity-50"
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-gold text-black py-4 sm:py-5 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-brand-gold-light transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (t.contactFormSubmitting ?? 'Sending message...') : t.contactFormSubmit}
            </button>
            {status && (
              <p className={`text-[11px] text-center tracking-wider font-light ${statusType === 'success' ? 'text-emerald-400' : statusType === 'error' ? 'text-amber-400' : 'text-brand-gold'}`}>
                {status}
              </p>
            )}
          </motion.form>

        </div>
      </div>
    </section>
  );
};

export default Contact;
