'use client';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 px-3 rounded-lg border bg-white text-sm',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'transition-colors',
            error ? 'border-destructive' : 'border-neutral-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };