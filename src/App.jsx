import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Portfolio from './components/Portfolio';
import Specialities from './components/Specialities';
import Booking from './components/Booking';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-brand-black min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Portfolio />
        <Specialities />
        <Booking />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
