import React from 'react';
import { StyleSheet, type LayoutRectangle } from 'react-native';
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import type { GlowTourTheme } from './types';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface SpotlightOverlayProps {
  screen: LayoutRectangle;
  spotlightX: SharedValue<number>;
  spotlightY: SharedValue<number>;
  spotlightWidth: SharedValue<number>;
  spotlightHeight: SharedValue<number>;
  spotlightRadius: SharedValue<number>;
  theme: Required<GlowTourTheme>;
}

/**
 * Full-screen dimmed overlay with an animated rounded-rect cutout that
 * reveals the current target. Implementation uses an SVG mask: the white
 * outer rect is drawn with the overlay color; the black inner rect punches
 * a hole for the spotlight.
 *
 * A halo + crisp border are drawn on top to highlight the active target.
 */
export const SpotlightOverlay = React.memo(function SpotlightOverlay({
  screen,
  spotlightX,
  spotlightY,
  spotlightWidth,
  spotlightHeight,
  spotlightRadius,
  theme,
}: SpotlightOverlayProps) {
  const cutoutProps = useAnimatedProps(() => ({
    x: spotlightX.value,
    y: spotlightY.value,
    width: spotlightWidth.value,
    height: spotlightHeight.value,
    rx: spotlightRadius.value,
    ry: spotlightRadius.value,
  }));

  const haloProps = useAnimatedProps(() => ({
    x: spotlightX.value - theme.spotlightHaloWidth / 2,
    y: spotlightY.value - theme.spotlightHaloWidth / 2,
    width: spotlightWidth.value + theme.spotlightHaloWidth,
    height: spotlightHeight.value + theme.spotlightHaloWidth,
    rx: spotlightRadius.value + theme.spotlightHaloWidth / 2,
    ry: spotlightRadius.value + theme.spotlightHaloWidth / 2,
  }));

  const borderProps = useAnimatedProps(() => ({
    x: spotlightX.value,
    y: spotlightY.value,
    width: spotlightWidth.value,
    height: spotlightHeight.value,
    rx: spotlightRadius.value,
    ry: spotlightRadius.value,
  }));

  return (
    <Svg
      width={screen.width}
      height={screen.height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <Mask id="glow-tour-mask">
          <Rect
            x={0}
            y={0}
            width={screen.width}
            height={screen.height}
            fill="white"
          />
          <AnimatedRect animatedProps={cutoutProps} fill="black" />
        </Mask>
      </Defs>

      <Rect
        x={0}
        y={0}
        width={screen.width}
        height={screen.height}
        fill={theme.overlayColor}
        mask="url(#glow-tour-mask)"
      />

      <AnimatedRect
        animatedProps={haloProps}
        fill="none"
        stroke={theme.spotlightBorderColor}
        strokeOpacity={0.3}
        strokeWidth={theme.spotlightHaloWidth}
      />

      <AnimatedRect
        animatedProps={borderProps}
        fill="none"
        stroke={theme.spotlightBorderColor}
        strokeWidth={theme.spotlightBorderWidth}
      />
    </Svg>
  );
});
