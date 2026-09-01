// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React from 'react';
import { AdminAuth } from './AdminAuth';
import { ContentEditor } from './ContentEditor';
import './admin.css';

function AdminShell({ session, signOut, signingOut, error }) {
  return (
    <main className="admin-shell" aria-label="Pepegraphy content administration">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Pepegraphy</p>
          <h1>Content administration</h1>
        </div>
        <div className="admin-account">
          <span>{session.user?.email ?? 'Signed-in administrator'}</span>
          <button type="button" className="admin-button-secondary" onClick={signOut} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      <nav className="admin-navigation" aria-label="Admin sections">
        <a href="#content">Content</a>
        <a href="#hero-carousel">Hero carousel</a>
        <a href="#gallery">Gallery</a>
      </nav>

      {error && <p className="admin-message" role="alert">{error}</p>}

      <section className="admin-panel" id="content" tabIndex="-1" aria-labelledby="content-title">
        <h2 id="content-title">Content</h2>
        <p>Edit the site text and calls to action here.</p>
        <ContentEditor />
      </section>
      <section className="admin-panel" id="hero-carousel" tabIndex="-1" aria-labelledby="hero-carousel-title">
        <h2 id="hero-carousel-title">Hero carousel</h2>
        <p>Manage the studio images and captions shown first on the public site.</p>
      </section>
      <section className="admin-panel" id="gallery" tabIndex="-1" aria-labelledby="gallery-title">
        <h2 id="gallery-title">Gallery</h2>
        <p>Organise portfolio categories and photographs.</p>
      </section>
    </main>
  );
}

function AdminApp() {
  return <AdminAuth>{(auth) => <AdminShell {...auth} />}</AdminAuth>;
}

export default AdminApp;
