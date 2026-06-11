import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import DealCard from '../components/common/DealCard';
import { DealGridSkeleton } from '../components/common/LoadingSpinner';
import { CITIES, SORT_OPTIONS } from '../utils/constants';

const useCategories = () => useQuery({
  queryKey: ['categories'],
  queryFn: () => api.get('/categories').then((r) => r.data.data),
  staleTime: 10 * 60 * 1000,
});

export default function Search() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    minDiscount: '',
    maxPrice: '',
    minRating: '',
  });

  const { data: categories } = useCategories();

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) queryParams.set(k, v); });
  queryParams.set('page', page.toString());
  queryParams.set('limit', '20');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['deals', 'search', queryParams.toString()],
    queryFn: () => api.get(`/deals?${queryParams}`).then((r) => r.data),
    keepPreviousData: true,
  });

  useEffect(() => {
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.city) params.city = filters.city;
    if (filters.category) params.category = filters.category;
    if (filters.sort !== 'newest') params.sort = filters.sort;
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [filters.q, filters.city, filters.category, filters.sort]);

  const updateFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const clearFilters = () => setFilters({ q: '', city: '', category: '', sort: 'newest', minDiscount: '', maxPrice: '', minRating: '' });
  const hasFilters = filters.city || filters.category || filters.minDiscount || filters.maxPrice || filters.minRating;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.q}
                onChange={(e) => updateFilter('q', e.target.value)}
                placeholder={t('search.placeholder')}
                className="input-field pl-11"
              />
            </div>
            <select value={filters.city} onChange={(e) => updateFilter('city', e.target.value)} className="input-field md:w-40">
              <option value="">{t('search.all_cities')}</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input-field md:w-48">
              {SORT_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${filtersOpen || hasFilters ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <SlidersHorizontal size={18} />
              {t('search.filters')} {hasFilters && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
            </button>
          </div>

          {/* Advanced Filters */}
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              className="overflow-hidden"
            >
              <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">{t('search.category')}</label>
                  <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="input-field text-sm py-2.5">
                    <option value="">{t('search.all_categories')}</option>
                    {categories?.map((c) => <option key={c._id} value={c._id}>{c.nameAl || c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">{t('search.min_discount')}</label>
                  <select value={filters.minDiscount} onChange={(e) => updateFilter('minDiscount', e.target.value)} className="input-field text-sm py-2.5">
                    <option value="">{t('search.any_discount')}</option>
                    {[10, 20, 30, 40, 50, 60, 70].map((v) => <option key={v} value={v}>{v}%+</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">{t('search.max_price')}</label>
                  <select value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} className="input-field text-sm py-2.5">
                    <option value="">{t('search.any_price')}</option>
                    {[500, 1000, 2000, 5000, 10000, 20000].map((v) => <option key={v} value={v}>{v.toLocaleString()} L</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">{t('search.min_rating')}</label>
                  <select value={filters.minRating} onChange={(e) => updateFilter('minRating', e.target.value)} className="input-field text-sm py-2.5">
                    <option value="">{t('search.any_rating')}</option>
                    {[3, 3.5, 4, 4.5].map((v) => <option key={v} value={v}>{v}+ ⭐</option>)}
                  </select>
                </div>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                  <X size={14} />{t('search.clear_all')}
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {filters.q && <h1 className="text-xl font-bold text-gray-900">{t('search.results_for')} "<span className="text-brand-600">{filters.q}</span>"</h1>}
            <p className="text-gray-500 text-sm">
              {isFetching ? t('search.searching') : t('search.results_count', { count: data?.pagination?.total || 0 })}
            </p>
          </div>
        </div>

        {isLoading ? <DealGridSkeleton count={20} /> : (
          <>
            {!data?.data?.length ? (
              <div className="text-center py-24">
                <SearchIcon size={48} className="text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">{t('search.no_results')}</h3>
                <p className="text-gray-400 mb-6">{t('search.try_different')}</p>
                <button onClick={clearFilters} className="btn-primary">{t('search.clear_filters')}</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.data.map((deal, i) => (
                  <motion.div key={deal._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (i % 8) * 0.05 }}>
                    <DealCard deal={deal} />
                  </motion.div>
                ))}
              </div>
            )}

            {data?.pagination?.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!data.pagination.hasPrev}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">{t('search.prev')}</button>
                {Array.from({ length: Math.min(7, data.pagination.pages) }, (_, i) => {
                  const pg = data.pagination.page > 4 ? data.pagination.page - 3 + i : i + 1;
                  return pg <= data.pagination.pages ? (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium ${pg === data.pagination.page ? 'bg-brand-600 text-white shadow-brand' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                      {pg}
                    </button>
                  ) : null;
                })}
                <button onClick={() => setPage((p) => p + 1)} disabled={!data.pagination.hasNext}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">{t('search.next')}</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
