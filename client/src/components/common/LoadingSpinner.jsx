import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function LoadingSpinner({ size = 'md', text, className }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3', xl: 'w-16 h-16 border-4' };
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <div className={clsx('rounded-full border-gray-200 border-t-brand-600 animate-spin', sizes[size])} />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-brand animate-float">
          <span className="text-white font-black text-3xl">Z</span>
        </div>
        <div className="w-8 h-8 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm mt-3">Duke ngarkuar...</p>
      </motion.div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="flex justify-between items-center">
          <div className="skeleton h-6 w-24 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

export function DealGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
