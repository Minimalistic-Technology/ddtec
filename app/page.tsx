import Hero from "./_components/Hero";
import WhatWeOffer from "./_components/WhatWeOffer";
import WhoWeAre from "./_components/WhoWeAre";
import ShopSection from "./_components/ShopSection";
import Contact from "./_components/Contact";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <WhoWeAre />
      <WhatWeOffer />
      <ShopSection />
      <Contact />
    </main>
  );
}
