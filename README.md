# IronLog

An offline-first workout tracker for weightlifting. One HTML file, no dependencies, no accounts, no servers — your training data stays in your browser.

**[Open the app →](https://abdulwasaylodhi.github.io/ironlog/)**

---

## Why

Most gym apps want an account, a subscription, and a network connection. Gyms have bad signal and I didn't want to hand my training log to anyone. IronLog is a single self-contained page that installs to your home screen, works with the plane in airplane mode, and keeps every set on your own device.

## Features

**Workouts**
- Start empty, or load one of your saved routines
- Log sets with weight, reps and completion state
- Add, remove and reorder exercises mid-workout
- Automatic personal-record detection using estimated 1RM (Epley formula)
- Last-used weight and reps recalled per exercise, so repeat sets are one tap

**Rest timer**
- Countdown with a visual progress ring
- Survives a page reload — the timer keeps running if you switch apps or your phone locks
- Countdown mirrored into the browser tab title
- Persistent notification with **Skip** and **Complete** actions

**Exercise library**
- 409 built-in exercises across 17 categories: Chest, Back, Shoulders, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves, Core, Olympic, Cardio, Full Body, Traps, Neck, Legs
- Add your own custom exercises

**Routines**
- Build reusable routines with target weight, reps and rest per exercise
- Drag to reorder

**Progress**
- Total workouts and total volume lifted
- Current consecutive-day streak
- Bodyweight log
- Estimated 1RM tracking
- Calendar view of training frequency

**Feedback**
- Synthesized audio via the Web Audio API — a crisp tick on set completion, a fanfare on a new PR
- Haptic vibration patterns for set done, rest finished and workout end

**Settings**
- kg or lb
- Default rest duration
- Export and import your full data as a backup file

## Install

IronLog is a PWA, so it installs like an app without an app store.

- **iOS (Safari)** — open the app, tap Share, then *Add to Home Screen*
- **Android (Chrome)** — open the app, tap the menu, then *Install app*
- **Desktop (Chrome / Edge)** — click the install icon in the address bar

Once installed it runs full screen, launches offline, and can fire rest-timer notifications.

## Running it locally

There's no build step and nothing to install. But the service worker will not register over `file://`, so serve the folder over HTTP:

```bash
git clone https://github.com/abdulwasaylodhi/ironlog.git
cd ironlog

# any static server works
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

> **Note:** `manifest.json` sets `start_url` and `scope` to `/ironlog/` for GitHub Pages. Serving from a different path means the manifest scope won't match and the install prompt may not appear — the app itself still works. Change those two fields if you're hosting elsewhere.

## Your data

Everything lives in `localStorage` under a single key, `ironlog_v1`:

```js
{
  routines:         [{ id, name, exercises }],
  history:          [{ id, name, date, startedAt, duration, exercises }],
  bodyweight:       [{ date, weight }],
  customExercises:  [{ id, name, cat, custom }],
  settings:         { unit, restSeconds },
  activeWorkout:    { /* in-progress session */ }
}
```

Nothing is sent anywhere. There is no analytics, no tracking and no third-party request of any kind.

Two things worth knowing:

- **Back it up.** Clearing your browser's site data deletes your training history. Settings → Export writes a JSON file you can re-import later.
- **Corrupt data is preserved, not discarded.** On load, state is run through a `normalizeState()` pass. If the stored blob can't be read, it's copied to `ironlog_v1_unreadable_<timestamp>` before the app resets, so nothing is silently destroyed.

## Project structure

```
index.html      the entire app — markup, styles and logic, inline
sw.js           service worker: offline shell + notification actions
manifest.json   PWA manifest
icon-192.png
icon-512.png
```

## Technical notes

**No dependencies.** No framework, no bundler, no CDN, no external fonts. Styling is CSS custom properties on a dark palette (`--bg`, `--surface`, `--text`, `--accent`, `--gold`, `--success`) with a system font stack and a mobile-first 520px max width.

**Service worker** (`ironlog-v7`) precaches the app shell, `manifest.json` and both icons. Navigation requests are network-first with a cached-shell fallback; everything else is stale-while-revalidate. Notification clicks are handled for three cases — the `skip` action, the `complete` action, and a tap on the notification body — with action taps kept in the background and body taps bringing the app forward.

**Web platform APIs used:** localStorage, Web Audio, Vibration, Notifications, Service Workers.

## Browser support

Works in any modern browser. Two caveats:

- **iOS has no Vibration API**, so haptics are silently skipped there. Audio and notifications still work.
- **iOS requires the app to be installed to the home screen** before web notifications will fire (iOS 16.4+).

## Roadmap

- Per-exercise progress charts
- Plate calculator
- Supersets
- Richer workout history filtering

## Contributing

Issues and pull requests are welcome. Since the app is a single file, keep changes focused and describe what you changed and why.

## License

MIT
