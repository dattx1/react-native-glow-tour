import React, { useContext, useEffect, useRef } from 'react';
import { View, type ViewProps } from 'react-native';
import { GlowTourContext } from './walkthrough-provider';
import { measureViewInWindow } from './internal/measure';

type ViewElement = React.ElementRef<typeof View>;

export interface GlowTargetProps extends ViewProps {
  /** Unique id used in `step.id` to point a tour step at this view. */
  id: string;
  children: React.ReactNode;
}

/**
 * Wraps a view and registers it as a tour target with the surrounding
 * `<GlowTourProvider />`. The wrapper is a transparent passthrough — it
 * does not change layout or styling, only adds a measurement hook.
 *
 * Multiple targets with the same id will overwrite each other; the most
 * recently mounted wins.
 */
export function GlowTarget({ id, children, ...rest }: GlowTargetProps) {
  const context = useContext(GlowTourContext);
  const ref = useRef<ViewElement>(null);

  useEffect(() => {
    if (!context) {
      if (__DEV__) {
        console.warn(
          '[react-native-glow-tour] <GlowTarget /> rendered outside <GlowTourProvider />. The target will be ignored.'
        );
      }
      return;
    }
    context.registry.register({
      id,
      measure: () => measureViewInWindow(ref.current),
    });
    return () => {
      context.registry.unregister(id);
    };
  }, [id, context]);

  return (
    <View ref={ref} collapsable={false} {...rest}>
      {children}
    </View>
  );
}
