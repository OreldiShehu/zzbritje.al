import { useQuery } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import HeroSection from '../components/home/HeroSection';
import CategorySection from '../components/home/CategorySection';
import { DealGridSkeleton } from '../components/common/LoadingSpinner';

const FeaturedDeals = lazy(() => import('../components/home/FeaturedDeals'));
const FlashDeals = lazy(() => import('../components/home/FlashDeals'));
const HowItWorks = lazy(() => import('../components/home/HowItWorks'));
const Stats = lazy(() => import('../components/home/Stats'));
const Testimonials = lazy(() => import('../components/home/Testimonials'));
const Newsletter = lazy(() => import('../components/home/Newsletter'));
const TopBusinesses = lazy(() => import('../components/home/TopBusinesses'));
const CitySection = lazy(() => import('../components/home/CitySection'));

export default function Home() {
  const { t } = useTranslation();
  const { data: featuredDeals, isLoading: featuredLoading } = useQuery({
    queryKey: ['deals', 'featured'],
    queryFn: () => api.get('/deals/featured').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: flashDeals } = useQuery({
    queryKey: ['deals', 'flash'],
    queryFn: () => api.get('/deals/flash').then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories?featured=true').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  const { data: newDeals } = useQuery({
    queryKey: ['deals', 'newest'],
    queryFn: () => api.get('/deals?sort=newest&limit=8').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: topRated } = useQuery({
    queryKey: ['deals', 'top-rated'],
    queryFn: () => api.get('/deals?sort=best_rated&limit=8&minRating=4').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <HeroSection />

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="section-title">{t('home.browse_category')}</h2>
            <p className="section-subtitle mx-auto mt-3">{t('home.browse_subtitle')}</p>
          </div>
          <CategorySection categories={categories || []} />
        </div>
      </section>

      {/* Flash Deals */}
      {flashDeals?.length > 0 && (
        <Suspense fallback={<div className="py-16 bg-gray-900"><div className="container-custom"><DealGridSkeleton count={4} /></div></div>}>
          <FlashDeals deals={flashDeals} />
        </Suspense>
      )}

      {/* Featured Deals */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">{t('home.featured_label')}</span>
              <h2 className="section-title mt-1">{t('home.featured_title')}</h2>
              <p className="text-gray-500 mt-2">{t('home.featured_subtitle')}</p>
            </div>
            <a href="/search" className="hidden md:flex btn-secondary text-sm py-2">{t('home.see_all')}</a>
          </div>
          <Suspense fallback={<DealGridSkeleton count={8} />}>
            <FeaturedDeals deals={featuredDeals || []} isLoading={featuredLoading} />
          </Suspense>
        </div>
      </section>

      {/* Stats */}
      <Suspense fallback={null}>
        <Stats />
      </Suspense>

      {/* Newest Deals */}
      {newDeals?.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">{t('home.newest_label')}</span>
                <h2 className="section-title mt-1">{t('home.newest_title')}</h2>
              </div>
              <a href="/search?sort=newest" className="hidden md:flex btn-secondary text-sm py-2">{t('home.see_all')}</a>
            </div>
            <Suspense fallback={<DealGridSkeleton count={8} />}>
              <FeaturedDeals deals={newDeals} isLoading={false} />
            </Suspense>
          </div>
        </section>
      )}

      {/* Top Rated */}
      {topRated?.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">{t('home.top_rated_label')}</span>
                <h2 className="section-title mt-1">{t('home.top_rated_title')}</h2>
              </div>
              <a href="/search?sort=best_rated" className="hidden md:flex btn-secondary text-sm py-2">{t('home.see_all')}</a>
            </div>
            <Suspense fallback={<DealGridSkeleton count={4} />}>
              <FeaturedDeals deals={topRated} isLoading={false} />
            </Suspense>
          </div>
        </section>
      )}

      {/* Top Businesses */}
      <Suspense fallback={null}>
        <TopBusinesses />
      </Suspense>

      {/* Cities */}
      <Suspense fallback={null}>
        <CitySection />
      </Suspense>

      {/* How It Works */}
      <Suspense fallback={null}>
        <HowItWorks />
      </Suspense>

      {/* Testimonials */}
      <Suspense fallback={null}>
        <Testimonials />
      </Suspense>

      {/* Newsletter */}
      <Suspense fallback={null}>
        <Newsletter />
      </Suspense>
    </div>
  );
}
