import { Hero } from './components/sections/hero';
import { Benefits } from './components/sections/benefits';
import { FAQ } from './components/sections/faq';
import { Footer } from './components/sections/footer';
import { HowItWorks } from './components/sections/howItWoks';
import BibleIAForTest from './components/testUser/page';
import Planos from './components/sections/plans';

export default function Home() {

  return (
    <div className="">
      <Hero />
      <Benefits />
      <HowItWorks />
      <BibleIAForTest />
      <Planos/>
      <FAQ />
      <Footer />
    </div>
  );
}
