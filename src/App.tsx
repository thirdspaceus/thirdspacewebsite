/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LogoTicker } from './components/LogoTicker';
import { FeaturedWork } from './components/FeaturedWork';
import { Services } from './components/Services';
import { AboutUs } from './components/AboutUs';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { QuoteModal } from './components/QuoteModal';

export default function App() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const openQuoteModal = () => setIsQuoteModalOpen(true);
  const closeQuoteModal = () => setIsQuoteModalOpen(false);

  return (
    <div className="w-full h-screen overflow-hidden bg-brand-beige p-3 md:p-5 selection:bg-brand-orange selection:text-white">
      <div className="w-full h-full bg-brand-dark rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-y-auto overflow-x-hidden relative scroll-smooth">
        <Navbar onOpenQuote={openQuoteModal} />
        <main>
          <Hero onOpenQuote={openQuoteModal} />
          <LogoTicker />
          <FeaturedWork />
          <Services />
          <AboutUs />
          <Testimonials />
          <Pricing onOpenQuote={openQuoteModal} />
          <CTA onOpenQuote={openQuoteModal} />
        </main>
        <Footer />
        <QuoteModal isOpen={isQuoteModalOpen} onClose={closeQuoteModal} />
      </div>
    </div>
  );
}
