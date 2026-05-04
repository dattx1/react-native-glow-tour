import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type LayoutRectangle,
  type ScaledSize,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type {
  GlowTourController,
  GlowTourProviderProps,
  GlowTourStep,
  ResolvedTooltipPosition,
} from './types';
import { DEFAULTS, ESTIMATED_TOOLTIP_HEIGHT } from './constants';
import { TargetRegistry, type RegisteredTarget } from './internal/registry';
import { SpotlightOverlay } from './spotlight-overlay';
import { DefaultTooltip } from './default-tooltip';

interface InternalContextValue extends GlowTourController {
  registry: TargetRegistry;
}

export const GlowTourContext = createContext<InternalContextValue | null>(null);

export function GlowTourProvider({
  children,
  theme,
  animation,
  renderTooltip,
  dismissOnBackdropPress = false,
  onStart,
  onStepChange,
  onComplete,
  onSkip,
}: GlowTourProviderProps) {
  const registry = useRef(new TargetRegistry()).current;

  const resolvedTheme = useMemo(
    () => ({
      overlayColor: theme?.overlayColor ?? DEFAULTS.overlayColor,
      spotlightBorderColor:
        theme?.spotlightBorderColor ?? DEFAULTS.spotlightBorderColor,
      spotlightBorderWidth:
        theme?.spotlightBorderWidth ?? DEFAULTS.spotlightBorderWidth,
      spotlightHaloWidth:
        theme?.spotlightHaloWidth ?? DEFAULTS.spotlightHaloWidth,
      tooltipBackground: theme?.tooltipBackground ?? DEFAULTS.tooltipBackground,
      tooltipTextColor: theme?.tooltipTextColor ?? DEFAULTS.tooltipTextColor,
      accentColor: theme?.accentColor ?? DEFAULTS.accentColor,
    }),
    [theme]
  );

  const transitionDuration =
    animation?.transitionDuration ?? DEFAULTS.transitionDuration;
  const fadeDuration = animation?.fadeDuration ?? DEFAULTS.fadeDuration;

  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<GlowTourStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [position, setPosition] = useState<ResolvedTooltipPosition>('bottom');
  const [tooltipLayout, setTooltipLayout] = useState<LayoutRectangle | null>(
    null
  );
  const [screen, setScreen] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { x: 0, y: 0, width, height };
  });

  // Reanimated shared values — drive the SVG overlay + tooltip transform
  const overlayOpacity = useSharedValue<number>(0);
  const spotlightX = useSharedValue<number>(0);
  const spotlightY = useSharedValue<number>(0);
  const spotlightWidth = useSharedValue<number>(0);
  const spotlightHeight = useSharedValue<number>(0);
  const spotlightRadius = useSharedValue<number>(DEFAULTS.spotlightRadius);
  const tooltipTop = useSharedValue<number>(0);

  // Refs to avoid stale closures when handlers are called from animations
  const stepsRef = useRef(steps);
  const indexRef = useRef(currentStepIndex);
  const isActiveRef = useRef(isActive);
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);
  useEffect(() => {
    indexRef.current = currentStepIndex;
  }, [currentStepIndex]);
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Track screen dimension changes (rotation, split-view)
  useEffect(() => {
    const sub = Dimensions.addEventListener(
      'change',
      ({ window }: { window: ScaledSize }) => {
        setScreen({ x: 0, y: 0, width: window.width, height: window.height });
      }
    );
    return () => sub.remove();
  }, []);

  const showStep = useCallback(
    async (step: GlowTourStep, isFirstShow: boolean, tooltipHeight: number) => {
      const target: RegisteredTarget | undefined = registry.get(step.id);
      if (!target) {
        if (__DEV__) {
          console.warn(
            `[react-native-glow-tour] No <GlowTarget /> registered for id "${step.id}". Skipping.`
          );
        }
        return;
      }

      const measure = await target.measure();
      if (!measure) {
        if (__DEV__) {
          console.warn(
            `[react-native-glow-tour] Failed to measure target "${step.id}". The view may have unmounted or never laid out.`
          );
        }
        return;
      }

      const padding = step.spotlightPadding ?? DEFAULTS.spotlightPadding;
      const radius = step.spotlightRadius ?? DEFAULTS.spotlightRadius;
      const gap = step.tooltipGap ?? DEFAULTS.tooltipGap;

      const baseW = step.spotlightOverrideWidth ?? measure.width;
      const baseH = step.spotlightOverrideHeight ?? measure.height;
      const centerX = measure.x + measure.width / 2;
      const centerY = measure.y + measure.height / 2;

      const cutoutX = centerX - baseW / 2 - padding;
      const cutoutY = centerY - baseH / 2 - padding;
      const cutoutW = baseW + padding * 2;
      const cutoutH = baseH + padding * 2;

      // Decide tooltip position
      const requested = step.tooltipPosition ?? 'auto';
      let resolved: ResolvedTooltipPosition;
      if (requested === 'top' || requested === 'bottom') {
        resolved = requested;
      } else {
        const spaceBelow = screen.height - (cutoutY + cutoutH);
        resolved = spaceBelow < tooltipHeight + gap + 24 ? 'top' : 'bottom';
      }

      const newTooltipTop =
        resolved === 'bottom'
          ? cutoutY + cutoutH + gap
          : cutoutY - gap - tooltipHeight;

      setPosition(resolved);

      if (isFirstShow) {
        // First step: snap into place, then fade overlay in
        spotlightX.value = cutoutX;
        spotlightY.value = cutoutY;
        spotlightWidth.value = cutoutW;
        spotlightHeight.value = cutoutH;
        spotlightRadius.value = radius;
        tooltipTop.value = newTooltipTop;
        overlayOpacity.value = withTiming(1, { duration: fadeDuration });
      } else {
        // Subsequent steps: animate position/size with cubic easing
        const config = {
          duration: transitionDuration,
          easing: Easing.out(Easing.cubic),
        };
        spotlightX.value = withTiming(cutoutX, config);
        spotlightY.value = withTiming(cutoutY, config);
        spotlightWidth.value = withTiming(cutoutW, config);
        spotlightHeight.value = withTiming(cutoutH, config);
        spotlightRadius.value = withTiming(radius, config);
        tooltipTop.value = withTiming(newTooltipTop, config);
      }
    },
    [
      registry,
      screen.height,
      overlayOpacity,
      spotlightX,
      spotlightY,
      spotlightWidth,
      spotlightHeight,
      spotlightRadius,
      tooltipTop,
      fadeDuration,
      transitionDuration,
    ]
  );

  const start = useCallback(
    (newSteps: GlowTourStep[]) => {
      if (newSteps.length === 0) {
        if (__DEV__) {
          console.warn(
            '[react-native-glow-tour] start() called with empty steps.'
          );
        }
        return;
      }
      setSteps(newSteps);
      setCurrentStepIndex(0);
      setIsActive(true);
      onStart?.(newSteps);
      // First showStep is triggered by the layout effect once tooltipLayout is known
    },
    [onStart]
  );

  const stop = useCallback(() => {
    if (!isActiveRef.current) return;
    overlayOpacity.value = withTiming(0, { duration: fadeDuration });
    setTimeout(() => {
      setIsActive(false);
      setSteps([]);
      setCurrentStepIndex(0);
      setTooltipLayout(null);
    }, fadeDuration);
  }, [overlayOpacity, fadeDuration]);

  const next = useCallback(() => {
    const idx = indexRef.current;
    const all = stepsRef.current;
    if (idx >= all.length - 1) {
      onComplete?.(all);
      stop();
      return;
    }
    const nextIdx = idx + 1;
    setCurrentStepIndex(nextIdx);
    onStepChange?.(all[nextIdx]!, nextIdx, 'next');
  }, [onComplete, onStepChange, stop]);

  const prev = useCallback(() => {
    const idx = indexRef.current;
    if (idx <= 0) return;
    const prevIdx = idx - 1;
    setCurrentStepIndex(prevIdx);
    onStepChange?.(stepsRef.current[prevIdx]!, prevIdx, 'prev');
  }, [onStepChange]);

  const goTo = useCallback(
    (index: number) => {
      const all = stepsRef.current;
      if (index < 0 || index >= all.length) return;
      setCurrentStepIndex(index);
      onStepChange?.(all[index]!, index, 'jump');
    },
    [onStepChange]
  );

  const handleSkip = useCallback(() => {
    const idx = indexRef.current;
    const all = stepsRef.current;
    if (all[idx]) onSkip?.(all[idx]!, idx);
    stop();
  }, [onSkip, stop]);

  // When isActive flips on, OR currentStepIndex changes, OR tooltip measures
  // → recompute and animate to current step.
  useEffect(() => {
    if (!isActive) return;
    const step = steps[currentStepIndex];
    if (!step) return;
    const tooltipHeight = tooltipLayout?.height ?? ESTIMATED_TOOLTIP_HEIGHT;
    const isFirstShow = overlayOpacity.value === 0;
    showStep(step, isFirstShow, tooltipHeight).catch(() => undefined);
  }, [
    isActive,
    currentStepIndex,
    steps,
    tooltipLayout,
    showStep,
    overlayOpacity,
  ]);

  const handleTooltipLayout = useCallback((e: LayoutChangeEvent) => {
    setTooltipLayout(e.nativeEvent.layout);
  }, []);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const tooltipAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: tooltipTop.value }],
  }));

  const currentStep = isActive ? (steps[currentStepIndex] ?? null) : null;
  const totalSteps = steps.length;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  const controllerValue: InternalContextValue = useMemo(
    () => ({
      registry,
      start,
      stop,
      next,
      prev,
      goTo,
      isActive,
      currentStep,
      currentStepIndex,
      totalSteps,
    }),
    [
      registry,
      start,
      stop,
      next,
      prev,
      goTo,
      isActive,
      currentStep,
      currentStepIndex,
      totalSteps,
    ]
  );

  const tooltipNode =
    currentStep != null ? (
      renderTooltip ? (
        renderTooltip({
          step: currentStep,
          stepIndex: currentStepIndex,
          totalSteps,
          isFirst,
          isLast,
          position,
          next,
          prev,
          stop: handleSkip,
        })
      ) : (
        <DefaultTooltip
          step={currentStep}
          stepIndex={currentStepIndex}
          totalSteps={totalSteps}
          isFirst={isFirst}
          isLast={isLast}
          position={position}
          next={next}
          prev={prev}
          stop={handleSkip}
          theme={resolvedTheme}
        />
      )
    ) : null;

  return (
    <GlowTourContext.Provider value={controllerValue}>
      {children}
      <Modal
        visible={isActive}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={handleSkip}
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, overlayAnimatedStyle]}
          pointerEvents="box-none"
        >
          {dismissOnBackdropPress ? (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={handleSkip}
              accessibilityLabel="Dismiss tour"
            />
          ) : (
            <View style={StyleSheet.absoluteFill} pointerEvents="auto" />
          )}

          <SpotlightOverlay
            screen={screen}
            spotlightX={spotlightX}
            spotlightY={spotlightY}
            spotlightWidth={spotlightWidth}
            spotlightHeight={spotlightHeight}
            spotlightRadius={spotlightRadius}
            theme={resolvedTheme}
          />

          {tooltipNode != null ? (
            <Animated.View
              style={[styles.tooltipContainer, tooltipAnimatedStyle]}
              onLayout={handleTooltipLayout}
              pointerEvents="box-none"
            >
              {tooltipNode}
            </Animated.View>
          ) : null}
        </Animated.View>
      </Modal>
    </GlowTourContext.Provider>
  );
}

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
});
