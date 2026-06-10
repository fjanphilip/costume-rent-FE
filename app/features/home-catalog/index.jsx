import { useLoaderData } from "@remix-run/react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { TrendingGrid } from "./components/TrendingGrid";

import { Footer } from "~/components/layout/Footer";

export default function HomeCatalogFeature() {
  const { user, costumes } = useLoaderData();

  return (
    <div className="flex flex-col min-h-screen bg-background text-left">
      <Navbar user={user} />
      
      <main className="flex-1">
        <Hero />
        <TrendingGrid costumes={costumes} />
      </main>

      <Footer />
    </div>
  );
}

