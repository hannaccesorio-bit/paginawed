'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  className?: string;
}

export function Image({ src, alt, fill, priority, placeholder = 'empty', className, ...props }: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn('bg-neutral-100 flex items-center justify-center text-neutral-400', className)}
        style={fill ? { position: 'absolute', inset: 0 } : undefined}
        {...(fill ? { 'aria-hidden': 'true' } : {})}
      >
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={fill ? { position: 'relative', width: '100%', height: '100%' } : undefined}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          fill ? 'absolute inset-0 w-full h-full object-cover' : 'w-full h-auto'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => { setHasError(true); setIsLoading(false); }}
        {...props}
      />
      {isLoading && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-neutral-100 animate-pulse" aria-hidden="true" />
      )}
    </div>
  );
}