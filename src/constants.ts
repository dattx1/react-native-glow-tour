export const DEFAULTS = {
  spotlightPadding: 8,
  spotlightRadius: 12,
  tooltipGap: 12,
  transitionDuration: 300,
  fadeDuration: 200,
  overlayColor: 'rgba(0, 0, 0, 0.6)',
  spotlightBorderColor: '#82CECE',
  spotlightBorderWidth: 2,
  spotlightHaloWidth: 6,
  tooltipBackground: '#FFFFFF',
  tooltipTextColor: '#0F172A',
  accentColor: '#0F172A',
} as const;

/** Estimated tooltip height — used when deciding auto top/bottom placement. */
export const ESTIMATED_TOOLTIP_HEIGHT = 160;

/** Max number of measurement retries when a target hasn't laid out yet. */
export const MEASURE_MAX_RETRIES = 5;

/** Delay between measurement retries (ms). */
export const MEASURE_RETRY_DELAY = 50;
