'use client';
import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={cn(
              'relative w-full bg-white rounded-xl shadow-xl transform transition-all',
              sizes[size]
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-6 border-b border-neutral-100">
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-xl font-semibold text-neutral-900">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="modal-description" className="mt-1 text-sm text-neutral-500">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-neutral-400 hover:text-neutral-600"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}