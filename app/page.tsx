import Hero from "./components/Hero";
import WhatWeOffer from "./components/WhatWeOffer/page";
import WhoWeAre from "./components/WhoWeAre/page";
import ShopSection from "./components/ShopSection";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <WhoWeAre />
      <WhatWeOffer />
      <ShopSection />
    </main>
  );
}
