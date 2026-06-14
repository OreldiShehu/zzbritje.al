import { useQuery } from '@tanstack/react-query';
import { Suspense, lazy, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ArrowRight, MapPin } from 'lucide-react';
import api from '../api/axios';
import HeroSection from '../components/home/HeroSection';
import CategorySection from '../components/home/CategorySection';
import DealCard from '../components/common/DealCard';
import { DealGridSkeleton } from '../components/common/LoadingSpinner';
import { formatCurrency, getImageUrl } from '../utils/formatters';

const FeaturedDeals = lazy(() => import('../components/home/FeaturedDeals'));
const FlashDeals = lazy(() => import('../components/home/FlashDeals'));
const HowItWorks = lazy(() => import('../components/home/HowItWorks'));
const Stats = lazy(() => import('../components/home/Stats'));
const Testimonials = lazy(() => import('../components/home/Testimonials'));
const Newsletter = lazy(() => import('../components/home/Newsletter'));

function NewestCarousel({ deals }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
      {deals.map((deal) => (
        <div key={deal._id} className="flex-shrink-0 w-64 snap-start">
          <DealCard deal={deal} />
        </div>
      ))}
    </div>
  );
}

function TopRatedRow({ deal, rank }) {
  const stars = Math.round(deal.averageRating || 0);
  return (
    <Link to={`/deals/${deal.slug}`} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group">
      <span className={`text-2xl font-black flex-shrink-0 w-8 text-center ${rank <= 3 ? 'text-amber-500' : 'text-gray-300'}`}>
        {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : `#${rank}`}
      </span>
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {deal.images?.[0]?.url ? (
          <img src={getImageUrl(deal.images[0].url, 200)} alt={deal.title} className="w-full h-full object-cover" />
        ) : deal.business?.logo ? (
          <img src={getImageUrl(deal.business.logo, 200)} alt="" className="w-full h-full object-contain p-1" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-50">
            <span className="text-sm font-black text-brand-300">-{Math.round(deal.discountPercentage)}%</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-brand-700 transition-colors">{deal.title}</p>
        <p className="text-xs text-gray-400 truncate">{deal.business?.name}</p>
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className={i < stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
          ))}
          <span className="text-xs text-gray-500 ml-1">({deal.totalReviews || 0})</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-base font-black text-brand-700">{formatCurrency(deal.discountedPrice)}</p>
        <p className="text-xs text-red-500 font-semibold">-{Math.round(deal.discountPercentage)}%</p>
      </div>
    </Link>
  );
}

function NearbyDealsSection() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const { data: nearbyDeals, isLoading: nearbyLoading } = useQuery({
    queryKey: ['deals', 'nearby', userLocation?.lat, userLocation?.lng],
    queryFn: () => api.get(`/deals/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=5&limit=8`).then((r) => r.data.data),
    enabled: !!userLocation,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setLocationDenied(true);
        setLocationLoading(false);
      }
    );
  };

  if (locationDenied) return null;

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider flex items-center gap-1">
              <MapPin size={14} /> Pranë jush
            </span>
            <h2 className="section-title mt-1">Deals pranë jush</h2>
          </div>
          {userLocation && nearbyDeals?.length > 0 && (
            <Link to="/search?nearby=true" className="hidden md:flex items-center gap-1.5 btn-secondary text-sm py-2">
              Shiko të gjitha <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {!userLocation && (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <MapPin size={32} className="text-brand-400" />
            <div>
              <p className="font-semibold text-gray-900">Gjeni oferta pranë jush</p>
              <p className="text-sm text-gray-500 mt-1">Aktivizoni vendndodhjen për të parë deal-et më të afërta</p>
            </div>
            <button onClick={requestLocation} disabled={locationLoading} className="btn-primary flex items-center gap-2">
              {locationLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <MapPin size={16} />}
              {locationLoading ? 'Po gjendet vendndodhja...' : 'Aktivizo vendndodhjen'}
            </button>
          </div>
        )}

        {userLocation && nearbyLoading && <DealGridSkeleton count={4} />}

        {userLocation && !nearbyLoading && nearbyDeals?.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            Nuk u gjetën deal-e brenda 5km. Shiko <Link to="/search" className="text-brand-600 underline">të gjitha deal-et</Link>.
          </p>
        )}

        {nearbyDeals?.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
            {nearbyDeals.map((deal) => (
              <div key={deal._id} className="flex-shrink-0 w-64 snap-start">
                <DealCard deal={deal} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

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

  const { data: newDealsRaw } = useQuery({
    queryKey: ['deals', 'newest'],
    queryFn: () => api.get('/deals?sort=newest&limit=12').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: topRatedRaw } = useQuery({
    queryKey: ['deals', 'top-rated'],
    queryFn: () => api.get('/deals?sort=best_rated&limit=12&minRating=4').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  // Deduplicate: each deal only appears in the first section it qualifies for
  const featuredIds = new Set((featuredDeals || []).map((d) => d._id));

  const uniqueNewDeals = (newDealsRaw || []).filter((d) => !featuredIds.has(d._id));
  const shownIds = new Set([...featuredIds, ...uniqueNewDeals.map((d) => d._id)]);

  const uniqueTopRated = (topRatedRaw || []).filter((d) => !shownIds.has(d._id));

  const showNewest = uniqueNewDeals.length >= 4;
  const showTopRated = uniqueTopRated.length >= 4;

  return (
    <div className="overflow-hidden">
      <HeroSection />

      {/* Nearby Deals */}
      <NearbyDealsSection />

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

      {/* Featured Deals — grid */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">{t('home.featured_label')}</span>
              <h2 className="section-title mt-1">{t('home.featured_title')}</h2>
              <p className="text-gray-500 mt-2">{t('home.featured_subtitle')}</p>
            </div>
            <Link to="/search" className="hidden md:flex items-center gap-1.5 btn-secondary text-sm py-2">
              {t('home.see_all')} <ArrowRight size={14} />
            </Link>
          </div>
          <Suspense fallback={<DealGridSkeleton count={8} />}>
            <FeaturedDeals deals={featuredDeals || []} isLoading={featuredLoading} />
          </Suspense>
        </div>
      </section>

      {/* Stats */}
      <Suspense fallback={null}><Stats /></Suspense>

      {/* Newest Deals — horizontal carousel */}
      {showNewest && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">{t('home.newest_label')}</span>
                <h2 className="section-title mt-1">{t('home.newest_title')}</h2>
              </div>
              <Link to="/search?sort=newest" className="hidden md:flex items-center gap-1.5 btn-secondary text-sm py-2">
                {t('home.see_all')} <ArrowRight size={14} />
              </Link>
            </div>
            <NewestCarousel deals={uniqueNewDeals} />
          </div>
        </section>
      )}

      {/* Top Rated — ranked list */}
      {showTopRated && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">{t('home.top_rated_label')}</span>
                <h2 className="section-title mt-1">{t('home.top_rated_title')}</h2>
              </div>
              <Link to="/search?sort=best_rated" className="hidden md:flex items-center gap-1.5 btn-secondary text-sm py-2">
                {t('home.see_all')} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {uniqueTopRated.slice(0, 8).map((deal, i) => (
                <TopRatedRow key={deal._id} deal={deal} rank={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <Suspense fallback={null}><HowItWorks /></Suspense>

      {/* Testimonials */}
      <Suspense fallback={null}><Testimonials /></Suspense>

      {/* Newsletter */}
      <Suspense fallback={null}><Newsletter /></Suspense>
    </div>
  );
}
