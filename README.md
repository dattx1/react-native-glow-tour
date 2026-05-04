# react-native-glow-tour

> Beautiful spotlight tour for React Native — built on **Reanimated v4**, **Fabric / New Architecture ready**, **works with Expo**, and **zero coupling to your data layer**.

[![npm version](https://img.shields.io/npm/v/react-native-glow-tour.svg)](https://www.npmjs.com/package/react-native-glow-tour)
[![license](https://img.shields.io/npm/l/react-native-glow-tour.svg)](LICENSE)
[![reanimated](https://img.shields.io/badge/reanimated-v4-blueviolet)](https://docs.swmansion.com/react-native-reanimated/)
[![new arch](https://img.shields.io/badge/Fabric-ready-success)](https://reactnative.dev/architecture/landing-page)

A small, focused library for building product tours, onboarding spotlights, and feature coachmarks. The core idea: **you bring the UI, we handle the spotlight + animation**.

- 🎯 **SVG mask spotlight** — smooth animated cutout, configurable padding & radius
- ⚡ **Reanimated v4** — all transitions run on the UI thread
- 🧱 **Fabric / New Architecture** — uses double-`requestAnimationFrame` for safe layout reads
- 📦 **No state-management peer dep** — no MobX, no Redux, no Zustand required
- 🪝 **Zero data coupling** — pass steps as plain objects; no GraphQL or REST baked in
- 🎨 **Headless tooltip** — use the built-in default or render your own
- 📱 **Expo-friendly** — pure JS, no native modules; works in Expo dev builds

---

## Installation

```sh
# expo
npx expo install react-native-glow-tour react-native-reanimated react-native-svg

# bare
npm install react-native-glow-tour react-native-reanimated react-native-svg
# or
yarn add react-native-glow-tour react-native-reanimated react-native-svg
```

> Make sure you've followed [Reanimated's installation steps](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started) (Babel plugin or worklets plugin for v4).

---

## Quick start

```tsx
import { GlowTourProvider, GlowTarget, useGlowTour } from 'react-native-glow-tour';

function App() {
  return (
    <GlowTourProvider>
      <Home />
    </GlowTourProvider>
  );
}

function Home() {
  const { start } = useGlowTour();

  return (
    <View>
      <GlowTarget id="welcome">
        <WelcomeCard />
      </GlowTarget>

      <GlowTarget id="settings">
        <SettingsButton />
      </GlowTarget>

      <Button
        title="Show tour"
        onPress={() =>
          start([
            { id: 'welcome', title: 'Welcome', description: 'This is your dashboard.' },
            { id: 'settings', title: 'Settings', description: 'Tap here to customize.' },
          ])
        }
      />
    </View>
  );
}
```

That's it. The library measures each target with Fabric-safe timing, animates the spotlight, and fades in a tooltip.

---

## API

### `<GlowTourProvider />`

Wrap your app (or the subtree that should host tours).

| Prop | Type | Default | Description |
|---|---|---|---|
| `theme` | `GlowTourTheme` | sensible defaults | Override colors, border widths, halo, tooltip palette. |
| `animation` | `GlowTourAnimationConfig` | 300ms transition / 200ms fade | Tune timings. |
| `renderTooltip` | `(props: GlowTourTooltipProps) => ReactNode` | built-in `<DefaultTooltip />` | Provide your own tooltip UI. |
| `dismissOnBackdropPress` | `boolean` | `false` | Tap outside the spotlight to skip. |
| `onStart` | `(steps) => void` | — | Fired when a tour begins. |
| `onStepChange` | `(step, index, direction) => void` | — | Fired on next/prev/jump. `direction: 'next' \| 'prev' \| 'jump'`. |
| `onComplete` | `(steps) => void` | — | Fired when the user presses Finish on the last step. |
| `onSkip` | `(step, index) => void` | — | Fired when the user dismisses mid-tour. |

### `<GlowTarget />`

Marks a view as a tour target. Renders a transparent `<View>` wrapper with `collapsable={false}`.

```tsx
<GlowTarget id="welcome">
  <WelcomeCard />
</GlowTarget>
```

| Prop | Type | Description |
|---|---|---|
| `id` | `string` | **Required.** Match against `step.id`. |
| `children` | `ReactNode` | The view to spotlight. |
| `...ViewProps` | — | All standard `<View>` props pass through. |

### `useGlowTour()`

Returns the imperative controller. Must be called inside a `<GlowTourProvider />`.

```ts
const { start, stop, next, prev, goTo, isActive, currentStep, currentStepIndex, totalSteps } = useGlowTour();
```

### `GlowTourStep`

```ts
interface GlowTourStep {
  id: string;
  title?: string;
  description?: string;
  spotlightPadding?: number;       // default 8
  spotlightRadius?: number;        // default 12
  tooltipPosition?: 'auto' | 'top' | 'bottom';  // default 'auto'
  tooltipGap?: number;             // default 12
  spotlightOverrideWidth?: number; // for tab-bar icons etc.
  spotlightOverrideHeight?: number;
  data?: Record<string, unknown>;  // free-form payload echoed in callbacks
}
```

---

## Custom tooltip

```tsx
<GlowTourProvider
  renderTooltip={({ step, isLast, next, prev, stop, isFirst }) => (
    <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12 }}>
      <Text>{step.title}</Text>
      <Text>{step.description}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {!isFirst && <Button title="Back" onPress={prev} />}
        <Button title="Skip" onPress={stop} />
        <Button title={isLast ? 'Finish' : 'Next'} onPress={next} />
      </View>
    </View>
  )}
>
  ...
</GlowTourProvider>
```

The library only owns the spotlight + positioning. Your tooltip can be anything — branded, animated, multi-step form, video — whatever the design calls for.

---

## Theming

```tsx
<GlowTourProvider
  theme={{
    overlayColor: 'rgba(15, 23, 42, 0.7)',
    spotlightBorderColor: '#10B981',
    spotlightBorderWidth: 2,
    spotlightHaloWidth: 8,
    accentColor: '#10B981',
  }}
>
```

---

## Why "zero data coupling"?

Most tour libraries assume your steps come from React state or a fetch. This works — until your tours need to live in a CMS, A/B test framework, or feature-flag service.

`react-native-glow-tour` takes `start(steps)` as plain JS data. Build the steps array however you want:

```ts
// from a fetch
const steps = await fetch('/api/tours/onboarding').then((r) => r.json());
start(steps);

// from a feature flag service
const steps = featureFlags.getRollout('home-tour-v2').steps;
start(steps);

// hardcoded
start(LOCAL_TOUR_STEPS);
```

The library never imports anything to "load" your tours — it just runs them.

---

## New Architecture (Fabric) notes

The library uses two patterns to play well with Fabric:

1. **Double-`requestAnimationFrame` before `measureInWindow`** — Fabric commits layout asynchronously; reading position one frame after React commit can give stale or zero values. Two rAFs guarantee the next paint has happened.
2. **Bounded retry on bad measurements** — if a measurement returns `0×0` or `NaN` (target not yet laid out), the library retries up to 5 times with a small delay before giving up.

No native modules, no Codegen, no platform setup. Pure JS + reanimated worklets.

---

## Roadmap

- [ ] Auto-scroll target into view (when nested in a `<ScrollView>` / `FlatList`)
- [ ] Arrow on tooltip
- [ ] Programmatic tooltip width control
- [ ] Multi-target spotlight (highlight several views in one step)
- [ ] Test-mode / Storybook addon

---

## Example app

```sh
git clone https://github.com/dattx1/react-native-glow-tour.git
cd react-native-glow-tour
yarn
yarn example start    # Expo dev server
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

[MIT](LICENSE) © Tran Xuan Dat

---

Built with [create-react-native-library](https://github.com/callstack/react-native-builder-bob).
