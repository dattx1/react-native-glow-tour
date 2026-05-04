import type { ReactNode } from 'react';

/**
 * A single step in a walkthrough tour.
 *
 * The tour library is intentionally agnostic to where this data comes from —
 * build it from a server response, hard-code it, or generate it dynamically.
 */
export interface GlowTourStep {
  /** Must match the `id` on a mounted `<GlowTarget />`. */
  id: string;
  /** Title shown in the default tooltip. Ignored when `renderTooltip` is provided. */
  title?: string;
  /** Body text shown in the default tooltip. */
  description?: string;
  /** Padding (px) added around the target's bounds when computing the spotlight cutout. Default: `8`. */
  spotlightPadding?: number;
  /** Corner radius (px) of the spotlight cutout. Default: `12`. */
  spotlightRadius?: number;
  /** Force a tooltip side. `'auto'` (default) flips based on available screen space. */
  tooltipPosition?: 'auto' | 'top' | 'bottom';
  /** Pixel gap between the spotlight edge and the tooltip. Default: `12`. */
  tooltipGap?: number;
  /** Override the spotlight width. Useful for tab-bar icons whose visual is smaller than the touch area. */
  spotlightOverrideWidth?: number;
  /** Override the spotlight height. */
  spotlightOverrideHeight?: number;
  /** Free-form payload — passed back to `renderTooltip` and event callbacks. */
  data?: Record<string, unknown>;
}

/** Resolved tooltip position after the auto/top/bottom decision. */
export type ResolvedTooltipPosition = 'top' | 'bottom';

/** Geometry of a measured target in window coordinates. */
export interface TargetMeasure {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Props injected into a custom tooltip component (`renderTooltip`).
 *
 * Implement these on your own tooltip to control the look while keeping the
 * tour state machine intact.
 */
export interface GlowTourTooltipProps {
  step: GlowTourStep;
  stepIndex: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  position: ResolvedTooltipPosition;
  next: () => void;
  prev: () => void;
  stop: () => void;
}

export interface GlowTourTheme {
  /** Color of the dimmed area outside the spotlight. Default: `'rgba(0,0,0,0.6)'`. */
  overlayColor?: string;
  /** Color of the spotlight border ring. Default: `'#82CECE'`. */
  spotlightBorderColor?: string;
  /** Width of the spotlight border ring (px). Default: `2`. */
  spotlightBorderWidth?: number;
  /** Width of the soft halo drawn behind the border (px). Default: `6`. */
  spotlightHaloWidth?: number;
  /** Tooltip background color. Default: `'#FFFFFF'`. */
  tooltipBackground?: string;
  /** Tooltip text color. Default: `'#0F172A'`. */
  tooltipTextColor?: string;
  /** Accent color used for primary buttons. Default: `'#0F172A'`. */
  accentColor?: string;
}

export interface GlowTourAnimationConfig {
  /** Spotlight transition duration (ms). Default: `300`. */
  transitionDuration?: number;
  /** Overlay fade-in/out duration (ms). Default: `200`. */
  fadeDuration?: number;
}

export interface GlowTourEventHandlers {
  /** Fired when a tour begins. */
  onStart?: (steps: GlowTourStep[]) => void;
  /** Fired after each step transition (next/prev). `direction` is `'next' | 'prev' | 'jump'`. */
  onStepChange?: (
    step: GlowTourStep,
    index: number,
    direction: 'next' | 'prev' | 'jump'
  ) => void;
  /** Fired when the user reaches the end of the tour and presses Finish. */
  onComplete?: (steps: GlowTourStep[]) => void;
  /** Fired when the user dismisses the tour mid-flow (Skip / outside tap if enabled). */
  onSkip?: (step: GlowTourStep, index: number) => void;
}

export interface GlowTourProviderProps extends GlowTourEventHandlers {
  children: ReactNode;
  theme?: GlowTourTheme;
  animation?: GlowTourAnimationConfig;
  /** Custom tooltip renderer. Receives state + handlers; returns any React node. */
  renderTooltip?: (props: GlowTourTooltipProps) => ReactNode;
  /** If `true`, tapping outside the spotlight stops the tour. Default: `false`. */
  dismissOnBackdropPress?: boolean;
}

export interface GlowTourController {
  /** Begin a tour with the supplied steps. Replaces any in-progress tour. */
  start: (steps: GlowTourStep[]) => void;
  /** Stop the active tour without firing `onComplete`. */
  stop: () => void;
  /** Move to the next step. Calls `onComplete` if already on the last step. */
  next: () => void;
  /** Move to the previous step. No-op on the first step. */
  prev: () => void;
  /** Jump to an arbitrary step index. */
  goTo: (index: number) => void;
  /** `true` while a tour is active. */
  isActive: boolean;
  /** The current step (or `null` when inactive). */
  currentStep: GlowTourStep | null;
  /** Index of the current step in the active tour. */
  currentStepIndex: number;
  /** Total steps in the active tour. */
  totalSteps: number;
}
