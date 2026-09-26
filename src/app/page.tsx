import { Navbar } from "~/components/Navbar";
import { Hero } from "~/components/Hero";
import { Categories } from "~/components/Categories";
import { BestSellers } from "~/components/BestSellers";
import { OurStory } from "~/components/OurStory";
import { Benefits } from "~/components/Benefits";
import { Recipes } from "~/components/Recipes";
import { Testimonials } from "~/components/Testimonials";
import { Newsletter } from "~/components/Newsletter";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <BestSellers />
        <OurStory />
        <Benefits />
        <Recipes />
        <Testimonials />
      </main>
      <Newsletter />
    </>
  );
}
