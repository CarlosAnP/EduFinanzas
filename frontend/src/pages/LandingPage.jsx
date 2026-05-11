import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import AboutUs from '../components/landing/AboutUs';
import Services from '../components/landing/Services';
import Stats from '../components/landing/Stats';
import Contact from '../components/landing/Contact';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <AboutUs />
        <Stats />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
