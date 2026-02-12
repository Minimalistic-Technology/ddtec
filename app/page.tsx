import { Suspense } from "react";
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
      <Suspense fallback={<div>Loading products...</div>}>
        <ShopSection />
      </Suspense>
      <Contact />
    </main>
  );
}
