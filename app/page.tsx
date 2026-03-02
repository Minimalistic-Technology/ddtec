import { Suspense } from "react";
import Hero from "./_components/Hero";
import WhatWeOffer from "./_components/WhatWeOffer";
import WhoWeAre from "./_components/WhoWeAre";
import FeaturedProducts from "./_components/FeaturedProducts";
import Contact from "./_components/Contact";

export default function HomePage() {
  return (
    <main className="bg-slate-50 dark:bg-slate-950">
      <Hero />
      <div className="relative z-10">
        <WhoWeAre />
        <WhatWeOffer />
        <Suspense fallback={<div>Loading featured products...</div>}>
          <FeaturedProducts />
        </Suspense>
        <Contact />
      </div>
    </main>
  );
}
