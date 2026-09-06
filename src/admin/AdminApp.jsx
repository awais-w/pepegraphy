// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Images, Inbox, Layers3, LogOut, Menu, X } from 'lucide-react';
import { AdminAuth } from './AdminAuth';
import { ContentEditor } from './ContentEditor';
import { GalleryManager } from './GalleryManager';
import { HeroManager } from './HeroManager';
import { MessagesManager } from './MessagesManager';
import { ToastProvider } from './Toast';
import { useContent } from '../context/ContentContext';
import { getSupportedLanguages } from '../i18n/translations';
import { contentRepository } from '../lib/contentRepository';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import './admin.css';

const SECTIONS = [
  { id: 'content', label: 'Content', title: 'Site content', description: 'Edit the words, links and calls to action across the public site.', icon: FileText, component: ContentEditor },
  { id: 'hero-carousel', label: 'Hero carousel', title: 'Hero slides', description: 'Curate the photographs and captions visitors see first.', icon: Layers3, component: HeroManager },
  { id: 'gallery', label: 'Gallery', title: 'Gallery', description: 'Organise portfolio categories and their photographs.', icon: Images, component: GalleryManager },
  { id: 'messages', label: 'Messages', title: 'Inbox', description: 'Review and manage inquiries sent through the public contact form.', icon: Inbox, component: MessagesManager },
];

const LANGUAGE_LABELS = { en: '🇬🇧 For EN', hu: '🇭🇺 For HU' };

const getInitialSection = () => {
  const hash = window.location.hash.replace('#', '');
  return SECTIONS.some((section) => section.id === hash) ? hash : SECTIONS[0].id;
};

function LanguageSwitcher({ value, onChange }) {
  const languages = getSupportedLanguages();

  return (
    <div className="admin-language-switcher" role="group" aria-label="Editing language">
      {languages.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          aria-pressed={value === code}
          className={value === code ? 'admin-language-switcher-active' : undefined}
        >
          {LANGUAGE_LABELS[code] ?? code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function AdminShell({ session, signOut, signingOut, error }) {
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [editingLanguage, setEditingLanguage] = useState('en');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => setActiveSection(getInitialSection());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) {
      contentRepository.loadContactMessages().then((msgs) => {
        if (Array.isArray(msgs)) {
          setUnreadCount(msgs.filter((m) => m.status === 'unread').length);
        }
      }).catch(() => {});
    }
  }, []);

  const handleMessagesUpdated = (msgs) => {
    if (Array.isArray(msgs)) {
      setUnreadCount(msgs.filter((m) => m.status === 'unread').length);
    }
  };

  const activeSectionData = useMemo(() => SECTIONS.find((section) => section.id === activeSection) ?? SECTIONS[0], [activeSection]);
  const ActiveComponent = activeSectionData.component;

  const selectSection = (sectionId) => (event) => {
    event.preventDefault();
    setActiveSection(sectionId);
    window.location.hash = sectionId;
    setIsMenuOpen(false);
  };

  return (
    <main className="admin-shell" aria-label="Pepegraphy content administration">
      <aside className="admin-sidebar" aria-label="Studio administration">
        <a className="admin-brand" href="/" aria-label="Pepegraphy public site">
          <span className="admin-brand-mark" aria-hidden="true">P</span>
          <span>
            <strong>Pepegraphy</strong>
            <small>Studio administration</small>
          </span>
        </a>

        <div className="admin-sidebar-controls">
          <LanguageSwitcher value={editingLanguage} onChange={setEditingLanguage} />

          <div className="admin-account">
            <span className="admin-account-avatar" aria-hidden="true">
              {(session.user?.email ?? 'A').charAt(0).toUpperCase()}
            </span>
            <span className="admin-account-copy">
              <strong>Administrator</strong>
              <small>{session.user?.email ?? 'Signed in'}</small>
            </span>
            <button type="button" className="admin-icon-button" onClick={signOut} disabled={signingOut} title="Sign out" aria-label={signingOut ? 'Signing out' : 'Sign out'}>
              <LogOut aria-hidden="true" size={18} />
              <span className="admin-visually-hidden">{signingOut ? 'Signing out…' : 'Sign out'}</span>
            </button>
          </div>

          <button
            type="button"
            className="admin-hamburger-button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav
          className={`admin-navigation ${isMenuOpen ? 'admin-navigation-open' : 'admin-navigation-closed'}`}
          aria-label="Admin sections"
        >
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={activeSection === section.id ? 'page' : undefined}
                onClick={selectSection(section.id)}
                className={activeSection === section.id ? 'admin-navigation-link-active' : undefined}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={1.7} />
                <span>{section.label}</span>
                {section.id === 'messages' && unreadCount > 0 && (
                  <span className="ml-auto bg-brand-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="admin-sidebar-spacer" />
      </aside>

      <div className="admin-workspace">
        <header className="admin-header">
          <div>
            <p className="admin-context">Pepegraphy studio</p>
            <h1>{activeSectionData.title}</h1>
            <p>{activeSectionData.description}</p>
          </div>
        </header>

        {error && <p className="admin-message" role="alert">{error}</p>}

        <section className="admin-panel admin-section-panel" id={activeSectionData.id} tabIndex="-1" aria-labelledby={`${activeSectionData.id}-title`}>
          <h2 className="admin-visually-hidden" id={`${activeSectionData.id}-title`}>{activeSectionData.title}</h2>
          <ActiveComponent
            editingLanguage={editingLanguage}
            onLanguageChange={setEditingLanguage}
            onMessagesUpdated={handleMessagesUpdated}
          />
        </section>
      </div>
    </main>
  );
}

function AdminApp() {
  const { refresh } = useContent();

  return (
    <ToastProvider>
      <AdminAuth onAuthenticated={refresh}>{(auth) => <AdminShell {...auth} />}</AdminAuth>
    </ToastProvider>
  );
}

export default AdminApp;
