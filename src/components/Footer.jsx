const Footer = ({ footer }) => {
  return (
    <footer className="py-12 bg-brand-surface border-t border-white/5">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-xl font-serif tracking-[0.3em] text-white mb-6">{footer.brand}</h2>
        <p className="text-white/20 text-[10px] tracking-[0.1em] uppercase mb-8">{footer.tagline}</p>
        
        <div className="flex justify-center gap-8 mb-12">
          {footer.links.map((link) => (
            <a key={link.href} href={link.href} className="text-[9px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <p className="text-white/10 text-[9px] tracking-wider">{footer.copyright}</p>
      </div>
    </footer>
  );
};

export default Footer;
