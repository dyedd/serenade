import { Outlet, useLocation } from 'react-router';
import { Nav } from '~/components/Nav';
import { Footer } from '~/components/Footer';
import { BackToTop } from '~/components/BackToTop';
import { ImageLightbox } from '~/components/ImageLightbox';
import { TooltipProvider } from '~/components/ui/tooltip';

export default function AppLayout() {
  const location = useLocation();
  return (
    <TooltipProvider>
      <div className="site-grid" aria-hidden="true" />
      <Nav />
      <main key={location.pathname} className="page-fade-in relative z-10 mx-auto min-h-[60vh] min-w-0 max-w-4xl break-words px-6 pt-10 pb-20">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
      <ImageLightbox />
    </TooltipProvider>
  );
}
