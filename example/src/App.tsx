import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  GlowTourProvider,
  GlowTarget,
  useGlowTour,
} from 'react-native-glow-tour';

const TOUR_STEPS = [
  {
    id: 'header',
    title: 'Welcome to Glow Tour',
    description:
      'A spotlight tour built with Reanimated v4 and Fabric in mind. Tap Next to see how it animates between targets.',
  },
  {
    id: 'card-stats',
    title: 'Stats card',
    description:
      'Spotlights flow smoothly between targets — position, size, and corner radius all animate.',
  },
  {
    id: 'card-actions',
    title: 'Action area',
    description:
      'You can place targets anywhere — inside scroll views, lists, even tab bars.',
    spotlightPadding: 12,
  },
  {
    id: 'fab',
    title: 'And we’re done!',
    description:
      'Tap Finish to dismiss. Hook in your own tooltip via the renderTooltip prop.',
    tooltipPosition: 'top' as const,
  },
];

function Demo() {
  const { start } = useGlowTour();

  return (
    <View style={styles.container}>
      <GlowTarget id="header" style={styles.header}>
        <Text style={styles.title}>react-native-glow-tour</Text>
        <Text style={styles.subtitle}>Spotlight demo</Text>
      </GlowTarget>

      <View style={styles.row}>
        <GlowTarget id="card-stats" style={[styles.card, styles.cardLeft]}>
          <Text style={styles.cardLabel}>Steps</Text>
          <Text style={styles.cardValue}>4</Text>
        </GlowTarget>

        <GlowTarget id="card-actions" style={[styles.card, styles.cardRight]}>
          <Text style={styles.cardLabel}>Reanimated</Text>
          <Text style={styles.cardValue}>v4</Text>
        </GlowTarget>
      </View>

      <View style={styles.spacer} />

      <Pressable
        accessibilityRole="button"
        onPress={() => start(TOUR_STEPS)}
        style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
      >
        <Text style={styles.startLabel}>Start tour</Text>
      </Pressable>

      <GlowTarget id="fab" style={styles.fab}>
        <Text style={styles.fabLabel}>+</Text>
      </GlowTarget>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <GlowTourProvider
        onStart={(steps) => console.log('[tour] start', steps.length, 'steps')}
        onStepChange={(_, idx, dir) => console.log('[tour] step', idx, dir)}
        onComplete={() => console.log('[tour] complete')}
        onSkip={(_, idx) => console.log('[tour] skipped at', idx)}
      >
        <Demo />
      </GlowTourProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#F4F4F5',
    paddingTop: 64,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLeft: {},
  cardRight: {},
  cardLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  spacer: { flex: 1 },
  startButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 80,
  },
  startLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: { opacity: 0.85 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 110,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#82CECE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabLabel: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 30,
  },
});
