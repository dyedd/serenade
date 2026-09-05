import { Outlet, useLocation } from 'react-router';
import { Nav } from '~/components/Nav';
import { Footer } from '~/components/Footer';
import { BackToTop } from '~/components/BackToTop';
import { Separator } from '~/components/ui/separator';
import { TooltipProvider } from '~/components/ui/tooltip';

export default function AppLayout() {
  const location = useLocation();
  return (
    <TooltipProvider>
      <script src="/iconfont.js" defer />
      <div className="grain-overlay" aria-hidden />
      <Nav />
      <main key={location.pathname} className="page-fade-in mx-auto max-w-5xl px-6 pt-8 pb-20">
        <Outlet />
      </main>
      <Separator />
      <Footer />
      <BackToTop />
    </TooltipProvider>
  );
}
