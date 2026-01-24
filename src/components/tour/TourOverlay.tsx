'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTourStore } from '@/store/tourStore';
import { TOUR_STEPS } from './tourSteps';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TourOverlay() {
  const { currentStepIndex, nextStep, prevStep, skipTour } = useTourStore();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowClass, setArrowClass] = useState('');
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStepIndex];
  const isCenter = step.placement === 'center' || !step.target;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const updatePosition = useCallback(() => {
    if (!step.target) {
      setTargetRect(null);
      setTooltipStyle({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      setArrowClass('');
      return;
    }

    const el = document.querySelector(step.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const padding = step.highlightPadding ?? 8;

    const spotRect: Rect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
    setTargetRect(spotRect);

    // Calculate tooltip position
    const tooltipWidth = Math.min(300, window.innerWidth - 32);
    const gap = 12;

    let top = 0;
    let left = 0;
    let arrow = '';

    const isMobile = window.innerWidth < 640;
    const placement = isMobile
      ? (spotRect.top > window.innerHeight / 2 ? 'top' : 'bottom')
      : step.placement;

    switch (placement) {
      case 'bottom':
        top = spotRect.top + spotRect.height + gap;
        left = spotRect.left + spotRect.width / 2 - tooltipWidth / 2;
        arrow = 'tour-arrow-top';
        break;
      case 'top':
        top = spotRect.top - gap;
        left = spotRect.left + spotRect.width / 2 - tooltipWidth / 2;
        arrow = 'tour-arrow-bottom';
        break;
      case 'left':
        top = spotRect.top + spotRect.height / 2;
        left = spotRect.left - tooltipWidth - gap;
        arrow = 'tour-arrow-right';
        break;
      case 'right':
        top = spotRect.top + spotRect.height / 2;
        left = spotRect.left + spotRect.width + gap;
        arrow = 'tour-arrow-left';
        break;
    }

    // Clamp to viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    if (top < 16) top = 16;

    const style: React.CSSProperties = {
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
    };

    if (placement === 'top') {
      style.transform = 'translateY(-100%)';
    }

    setTooltipStyle(style);
    setArrowClass(arrow);
  }, [step]);

  useEffect(() => {
    if (step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Small delay to let scroll finish
    const timer = setTimeout(updatePosition, 100);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [step, updatePosition]);

  return (
    <div className="tour-container" role="dialog" aria-modal="true" aria-label={step.title}>
      {/* Backdrop click catcher */}
      <div className="fixed inset-0 z-[200]" onClick={skipTour} />

      {/* Spotlight or full backdrop */}
      {isCenter ? (
        <div className="tour-backdrop" />
      ) : (
        targetRect && (
          <div
            className="tour-spotlight"
            style={{
              top: `${targetRect.top}px`,
              left: `${targetRect.left}px`,
              width: `${targetRect.width}px`,
              height: `${targetRect.height}px`,
            }}
          />
        )
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="tour-tooltip"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow */}
        {arrowClass && !isCenter && (
          <div className={`tour-arrow ${arrowClass}`}>
            <svg width="20" height="12" viewBox="0 0 20 12">
              <path
                d="M2 10 Q 5 10, 10 2 Q 15 10, 18 10"
                stroke="var(--pencil)"
                strokeWidth="2"
                fill="var(--paper)"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="text-lg font-bold text-[var(--ink-blue)]"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            {step.title}
          </h3>
          <button
            onClick={skipTour}
            className="text-[var(--pencil-light)] hover:text-[var(--pencil)] transition-colors p-1 -mt-1 -mr-1"
            aria-label="Tutup tour"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
              <path d="M3 3L13 13M13 3L3 13" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p
          className="text-sm text-[var(--pencil)] mb-4 leading-relaxed"
          style={{ fontFamily: 'var(--font-sketch-alt), cursive' }}
        >
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-3" aria-label={`Langkah ${currentStepIndex + 1} dari ${TOUR_STEPS.length}`}>
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`tour-dot ${
                i === currentStepIndex
                  ? 'tour-dot-active'
                  : i < currentStepIndex
                  ? 'tour-dot-completed'
                  : ''
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={skipTour}
            className="text-xs text-[var(--pencil-light)] hover:text-[var(--pencil)] transition-colors underline underline-offset-2"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Lewati
          </button>

          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={prevStep}
                className="px-3 py-1.5 text-sm border-2 border-[var(--pencil-light)] text-[var(--pencil)] hover:border-[var(--pencil)] transition-colors"
                style={{ fontFamily: 'var(--font-sketch), cursive' }}
              >
                Kembali
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-3 py-1.5 text-sm border-2 border-[var(--pencil)] bg-[var(--ink-blue)] text-[var(--paper)] hover:opacity-90 transition-opacity shadow-[2px_2px_0_var(--pencil)]"
              style={{ fontFamily: 'var(--font-sketch), cursive' }}
            >
              {isLastStep ? 'Selesai' : 'Lanjut'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
