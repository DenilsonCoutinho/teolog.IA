import { Hero } from './components/sections/hero';
import { Benefits } from './components/sections/benefits';
import { FAQ } from './components/sections/faq';
import { Footer } from './components/sections/footer';
import { HowItWorks } from './components/sections/howItWoks';

export default function Home() {

  return (
    <div className="">
      <Hero />
      <Benefits />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
}
