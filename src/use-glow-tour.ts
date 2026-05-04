import { useContext } from 'react';
import { GlowTourContext } from './walkthrough-provider';
import type { GlowTourController } from './types';

/**
 * Returns the imperative controller for the surrounding `<GlowTourProvider />`.
 *
 * @throws if called outside a `<GlowTourProvider />`.
 */
export function useGlowTour(): GlowTourController {
  const context = useContext(GlowTourContext);
  if (!context) {
    throw new Error(
      'useGlowTour must be used inside a <GlowTourProvider />.'
    );
  }
  // Strip the internal registry from the public surface
  const { registry: _registry, ...controller } = context;
  return controller;
}
