import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Portfolio from './components/Portfolio';
import Specialities from './components/Specialities';
import Booking from './components/Booking';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { useContent } from './context/ContentContext';
import { buildPublicContent } from './lib/publicContent';

function App() {
  const { content } = useContent();
  const publicContent = buildPublicContent(content);

  return (
    <div className="bg-brand-black min-h-screen overflow-x-hidden">
      <Navbar navigation={publicContent.navigation} />
      <main>
        <Hero hero={publicContent.hero} />
        <About about={publicContent.about} />
        <Portfolio portfolio={publicContent.portfolio} />
        <Specialities specialities={publicContent.specialities} />
        <Booking booking={publicContent.booking} />
        <Contact contact={publicContent.contact} categories={publicContent.portfolio.categories} />
      </main>
      <Footer footer={publicContent.footer} />
    </div>
  );
}

export default App;
