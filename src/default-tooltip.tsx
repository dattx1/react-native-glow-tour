import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GlowTourTheme, GlowTourTooltipProps } from './types';

interface DefaultTooltipProps extends GlowTourTooltipProps {
  theme: Required<GlowTourTheme>;
}

/**
 * Built-in tooltip used when the consumer doesn't supply `renderTooltip`.
 * Intentionally minimal — covers 90% of cases; swap it via `renderTooltip`
 * for branded designs.
 */
export function DefaultTooltip({
  step,
  stepIndex,
  totalSteps,
  isFirst,
  isLast,
  next,
  prev,
  stop,
  theme,
}: DefaultTooltipProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.tooltipBackground,
        },
      ]}
    >
      {step.title ? (
        <Text style={[styles.title, { color: theme.tooltipTextColor }]}>
          {step.title}
        </Text>
      ) : null}

      {step.description ? (
        <Text style={[styles.description, { color: theme.tooltipTextColor }]}>
          {step.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Text style={[styles.counter, { color: theme.tooltipTextColor }]}>
          {stepIndex + 1} / {totalSteps}
        </Text>

        <View style={styles.buttons}>
          {!isFirst ? (
            <Pressable
              accessibilityRole="button"
              onPress={prev}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.secondaryLabel,
                  { color: theme.tooltipTextColor },
                ]}
              >
                Back
              </Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={stop}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.secondaryLabel,
                  { color: theme.tooltipTextColor },
                ]}
              >
                Skip
              </Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={next}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.accentColor },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryLabel}>
              {isLast ? 'Finish' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    fontSize: 12,
    opacity: 0.6,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryLabel: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
