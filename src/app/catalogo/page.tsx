'use client';
import { Suspense } from 'react';
import CatalogContent from './content';
import { Spinner } from '@/components/ui/Spinner';

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}