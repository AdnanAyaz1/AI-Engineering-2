import { HomeHeader, HomeHero, HomeFeatureGrid } from '@/components/home';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#0d9488]/20 selection:text-[#0d9488]">
      <HomeHeader />
      <main className="flex-1">
        <HomeHero />
        <HomeFeatureGrid />
      </main>
    </div>
  );
}
