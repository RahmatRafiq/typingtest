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

interface TooltipPos {
  top: number;
  left: number;
  width: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
  arrowLeft: number;
}

export default function TourOverlay() {
  const { currentStepIndex, nextStep, prevStep, skipTour } = useTourStore();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [stepKey, setStepKey] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(currentStepIndex);

  const step = TOUR_STEPS[currentStepIndex];
  const isCenter = step.placement === 'center' || !step.target;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Trigger transition animation on step change
  useEffect(() => {
    if (prevStepRef.current !== currentStepIndex) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setStepKey((k) => k + 1);
      }, 200);
      prevStepRef.current = currentStepIndex;
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex]);

  const computeTooltipPosition = useCallback((spotRect: Rect) => {
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const tooltipWidth = Math.min(320, viewW - 48);
    const tooltipEstHeight = 200;
    const gap = 16;

    const isMobile = viewW < 640;

    // Determine best placement
    let placement: 'top' | 'bottom' | 'left' | 'right';

    if (isMobile) {
      // On mobile: prefer bottom, use top if element is in bottom half
      const centerY = spotRect.top + spotRect.height / 2;
      placement = centerY > viewH * 0.5 ? 'top' : 'bottom';
    } else {
      // Desktop: use step's defined placement, but adjust if it would overflow
      placement = step.placement as 'top' | 'bottom' | 'left' | 'right';

      // Validate placement fits in viewport
      if (placement === 'bottom' && spotRect.top + spotRect.height + gap + tooltipEstHeight > viewH) {
        placement = 'top';
      } else if (placement === 'top' && spotRect.top - gap - tooltipEstHeight < 0) {
        placement = 'bottom';
      } else if (placement === 'right' && spotRect.left + spotRect.width + gap + tooltipWidth > viewW) {
        placement = 'bottom';
      } else if (placement === 'left' && spotRect.left - gap - tooltipWidth < 0) {
        placement = 'bottom';
      }
    }

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'bottom':
        top = spotRect.top + spotRect.height + gap;
        left = spotRect.left + spotRect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = spotRect.top - gap - tooltipEstHeight;
        left = spotRect.left + spotRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = spotRect.top + spotRect.height / 2 - tooltipEstHeight / 2;
        left = spotRect.left - gap - tooltipWidth;
        break;
      case 'right':
        top = spotRect.top + spotRect.height / 2 - tooltipEstHeight / 2;
        left = spotRect.left + spotRect.width + gap;
        break;
    }

    // Clamp to viewport with margin
    const margin = 16;
    left = Math.max(margin, Math.min(left, viewW - tooltipWidth - margin));
    top = Math.max(margin, Math.min(top, viewH - tooltipEstHeight - margin));

    // Calculate arrow position relative to tooltip
    const spotCenterX = spotRect.left + spotRect.width / 2;
    let arrowLeft = spotCenterX - left;
    arrowLeft = Math.max(24, Math.min(arrowLeft, tooltipWidth - 24));

    return { top, left, width: tooltipWidth, placement, arrowLeft };
  }, [step.placement]);

  const updatePosition = useCallback(() => {
    if (!step.target) {
      setTargetRect(null);
      setTooltipPos(null);
      return;
    }

    const el = document.querySelector(step.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const padding = step.highlightPadding ?? 10;

    const spotRect: Rect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
    setTargetRect(spotRect);
    setTooltipPos(computeTooltipPosition(spotRect));
  }, [step, computeTooltipPosition]);

  useEffect(() => {
    if (step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Delay to let scroll settle, then position
    const timer = setTimeout(updatePosition, 150);
    const resizeTimer = { current: 0 };

    const debouncedUpdate = () => {
      cancelAnimationFrame(resizeTimer.current);
      resizeTimer.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('scroll', debouncedUpdate, true);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(resizeTimer.current);
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('scroll', debouncedUpdate, true);
    };
  }, [step, updatePosition]);

  // Recompute when tooltip actually renders (for accurate height)
  useEffect(() => {
    if (tooltipRef.current && targetRect && !isCenter) {
      const actualHeight = tooltipRef.current.offsetHeight;
      const viewH = window.innerHeight;
      const gap = 16;

      // Re-check if tooltip is clipped at bottom
      if (tooltipPos && tooltipPos.top + actualHeight > viewH - 16) {
        const newTop = Math.max(16, targetRect.top - gap - actualHeight);
        setTooltipPos((prev) => prev ? { ...prev, top: newTop, placement: 'top' } : prev);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  const renderArrow = (pos: TooltipPos) => {
    const arrowStyle: React.CSSProperties = {
      left: `${pos.arrowLeft}px`,
      transform: 'translateX(-50%)',
    };

    if (pos.placement === 'bottom') {
      return (
        <div className="tour-arrow-anchor tour-arrow-pos-top" style={arrowStyle}>
          <svg width="24" height="14" viewBox="0 0 24 14" className="block">
            <path
              d="M2 13 Q 6 13, 12 2 Q 18 13, 22 13"
              stroke="var(--pencil)"
              strokeWidth="2"
              fill="var(--paper)"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
    }

    if (pos.placement === 'top') {
      return (
        <div className="tour-arrow-anchor tour-arrow-pos-bottom" style={arrowStyle}>
          <svg width="24" height="14" viewBox="0 0 24 14" className="block">
            <path
              d="M2 1 Q 6 1, 12 12 Q 18 1, 22 1"
              stroke="var(--pencil)"
              strokeWidth="2"
              fill="var(--paper)"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="tour-container" role="dialog" aria-modal="true" aria-label={step.title}>
      {/* Click-catcher backdrop */}
      <div className="fixed inset-0 z-[200] cursor-default" onClick={skipTour} />

      {/* Backdrop or spotlight */}
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

      {/* Welcome center card */}
      {isCenter && (
        <div
          className={`tour-welcome-card ${isTransitioning ? 'tour-fade-out' : 'tour-fade-in'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative pencil scribble */}
          <div className="tour-welcome-doodle">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <path
                d="M10 50 L40 20 L44 24 L14 54 L8 56 Z"
                stroke="var(--pencil)"
                strokeWidth="1.5"
                fill="var(--pencil-yellow)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M8 56 L10 50 L14 54 Z" fill="var(--paper-dark)" stroke="var(--pencil)" strokeWidth="1" />
              <path d="M40 20 L44 16 L48 20 L44 24 Z" fill="var(--pencil-red)" stroke="var(--pencil)" strokeWidth="1" />
              <path d="M15 45 Q 20 35, 30 30 Q 40 25, 50 15" stroke="var(--ink-blue)" strokeWidth="1.5" fill="none" strokeDasharray="3 3" opacity="0.5" />
            </svg>
          </div>

          <h2 className="tour-welcome-title">{step.title}</h2>
          <p className="tour-welcome-desc">{step.description}</p>

          <div className="tour-welcome-actions">
            <button onClick={skipTour} className="tour-btn-skip">
              Lewati
            </button>
            <button onClick={nextStep} className="tour-btn-primary">
              Mulai Tour
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Positioned tooltip for targeted steps */}
      {!isCenter && tooltipPos && (
        <div
          ref={tooltipRef}
          className={`tour-tooltip ${isTransitioning ? 'tour-fade-out' : 'tour-fade-in'}`}
          style={{
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            width: `${tooltipPos.width}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {renderArrow(tooltipPos)}

          {/* Step counter badge */}
          <div className="tour-step-badge">
            {currentStepIndex + 1}/{TOUR_STEPS.length}
          </div>

          {/* Title */}
          <h3 className="tour-tooltip-title">{step.title}</h3>

          {/* Description */}
          <p className="tour-tooltip-desc">{step.description}</p>

          {/* Progress bar */}
          <div className="tour-progress-bar">
            <div
              className="tour-progress-fill"
              style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Navigation */}
          <div className="tour-nav">
            <button onClick={skipTour} className="tour-btn-skip">
              Lewati
            </button>
            <div className="tour-nav-buttons">
              {!isFirstStep && (
                <button onClick={prevStep} className="tour-btn-secondary">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M13 8H3M7 4L3 8l4 4" />
                  </svg>
                  Kembali
                </button>
              )}
              <button onClick={nextStep} className="tour-btn-primary">
                {isLastStep ? 'Selesai!' : 'Lanjut'}
                {!isLastStep && (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
