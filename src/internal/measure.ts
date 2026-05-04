import type { TargetMeasure } from '../types';
import { MEASURE_MAX_RETRIES, MEASURE_RETRY_DELAY } from '../constants';

/** Minimal shape of a host view exposing `measureInWindow`. */
interface MeasurableView {
  measureInWindow?: (
    callback: (x: number, y: number, width: number, height: number) => void
  ) => void;
}

/**
 * Measure a view in window coordinates, retrying on Fabric where the layout
 * commit can lag a frame behind the React commit.
 *
 * Strategy: double `requestAnimationFrame` to gate on the next paint, then
 * call `measureInWindow`. If the result is invalid (zero size or NaN), retry
 * up to `MEASURE_MAX_RETRIES` times with a short delay.
 */
export function measureViewInWindow(
  view: MeasurableView | null
): Promise<TargetMeasure | null> {
  return new Promise((resolve) => {
    if (!view) {
      resolve(null);
      return;
    }

    let attempts = 0;

    const attempt = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (typeof view.measureInWindow !== 'function') {
            resolve(null);
            return;
          }

          view.measureInWindow((x: number, y: number, width: number, height: number) => {
            const valid =
              Number.isFinite(x) &&
              Number.isFinite(y) &&
              Number.isFinite(width) &&
              Number.isFinite(height) &&
              width > 0 &&
              height > 0;

            if (valid) {
              resolve({ x, y, width, height });
              return;
            }

            attempts += 1;
            if (attempts >= MEASURE_MAX_RETRIES) {
              resolve(null);
              return;
            }

            setTimeout(attempt, MEASURE_RETRY_DELAY);
          });
        });
      });
    };

    attempt();
  });
}
