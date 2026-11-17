# Example mini-app — template

Copy this folder to start a new mini-app. It is a complete, working app (counter +
persisted note) that follows every rule the shell expects.

```
miniapps/example/   ->   miniapps/<your-id>/
  ExampleApp.tsx        YourApp.tsx  (rename the export too)
  manifest.json         manifest.json (new id, name, colors)
  README.md             (you can delete this in the copy)
```

## 1. The contract (all required)

| Rule | Why | Where to see it |
|---|---|---|
| Export a component named `<Your>App` with props `{ keyboardOffset: number }` | The sheet passes its Y offset so `KeyboardAvoidingView` can lift inputs above the keyboard | `ExampleApp.tsx` top |
| Fill `flex: 1` and render your own background | Apps stay mounted side-by-side and are hidden with `display: none` — a missing background leaks the previous app through | `styles.fill` |
| Use `ScrollView` from `@/components/ScrollView` for vertical scrolling | It reports its offset to the sheet; a plain `RN ScrollView` blocks sheet drags | `ExampleApp.tsx` import |
| Use `useSafeAreaInsets()` and pad the bottom (`insets.bottom + 24`) | Content must clear the home indicator in the sheet | `contentContainerStyle` |
| Namespace storage keys (`@<your-id>/…-v1`) | All apps share one AsyncStorage; collisions overwrite each other | `STORAGE_KEY` |
| Add `testID`s (`<your-id>-app`, buttons, inputs) | Headless / dev testing opens apps via `superapp://<id>` deep links | `testID="example-app"` etc. |

`keyboardOffset` comes from the sheet — pass it straight through:

```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  keyboardVerticalOffset={keyboardOffset}
>
```

## 2. `manifest.json` fields

| Field | Required | What it does |
|---|---|---|
| `id` | yes | Lowercase, `a-z0-9-`. Must match the folder and the `MiniApp.id` you register. |
| `name` | yes | Label under the icon (1 line, ~10 chars max looks best). |
| `version` | yes | Semver string. The loader shows it in the install preview. |
| `entry` | yes | Component export name (e.g. `ExampleApp`). |
| `description` | no | Shown in the GitHub-URL install preview. |
| `colors` | no | `[start, end]` gradient fallback when there is no icon file. |
| `glyph` | no | 1–2 character fallback drawn on the gradient. |
| `icon` | no | Relative path to a PNG in the repo (e.g. `assets/icon.png`), resolved against the repo + branch. |
| `permissions` | no | String list your app documents (network, storage…). The loader displays it; enforcement is a future step. |

## 3. Register a built-in app (local, bundled)

Built-ins are bundled at compile time — 3 edits:

1. **`data/apps.ts`** — append to `ALL_APPS`, `INITIAL_TOP_ROW_IDS`, `GRID_APP_IDS`:
   ```ts
   {
     id: 'example',
     name: 'Example',
     kind: 'brand',
     colors: ['#3D7BF7', '#1D3C9E'],
     glyph: '✺',
     // or: imageAsset: require('../assets/icons/example_icon.png'),
   },
   ```
2. **`components/MiniAppContent.tsx`** — import + mount (stays alive across switches):
   ```tsx
   import { ExampleApp } from '@/miniapps/example/ExampleApp';
   const isExample = activeApp.id === 'example';
   // add to isImplemented, then:
   <View style={[styles.fill, !isExample && styles.hidden]}>
     <ExampleApp keyboardOffset={keyboardOffset} />
   </View>
   ```
3. **`components/AppContentSheet.tsx`** — add `'example'` to its `isImplemented` check so the
   sheet renders the masked app frame (with drag handle) instead of the placeholder label.

Run `npx expo lint` and `npx tsc --noEmit` before declaring done.

## 4. Publish for the in-app "Add" loader (GitHub URL install)

The minimized grid ends with an **Add** (`+`) slot. Pasting a GitHub URL installs the app
without a code change — but the repo must expose a manifest at its root:

1. Copy `manifest.json` below to your repo root as **`miniapp.json`**
   (keep `miniapps/example/manifest.json` too if you like — the loader checks both).
2. Push to GitHub, e.g. `https://github.com/<you>/<repo>`.
3. In the app: minimize → tap **Add** (bottom-right slot) → paste the URL → **Install**.
4. The loader fetches `https://raw.githubusercontent.com/<you>/<repo>/main/miniapp.json`
   (falls back to `master`), validates `id` + `name`, resolves `icon` relative to the repo,
   and persists the install in AsyncStorage (`superapp.custom-apps.v1`).

Supported URL shapes:

```
https://github.com/<owner>/<repo>
https://github.com/<owner>/<repo>.git
https://github.com/<owner>/<repo>/tree/<branch>/path/to/app
```

### Current limits (v1, honest)

- The loader installs the **manifest** (icon, name, colors, repo link) and renders a
  manifest-driven detail screen with an "Open repo" button. It does **not** execute remote
  JS — React Native bundles can't `import()` arbitrary URLs at runtime.
- Upgrade paths, in increasing power/complexity:
  1. **WebView runtime** — ship the mini-app as a mobile web app (`index.html` in the repo),
     point `manifest.json` at it, render with `react-native-webview`. No native code, works in Expo Go.
  2. **OTA bundles** — publish each mini-app with EAS Update / `expo-updates` and load the
     update manifest per app id. Real native components, needs a dev build + hosting.
  3. **Full dynamic native modules** — custom Metro/Babel packing + code-signing. Out of scope.

## 5. Checklist before PR / publish

- [ ] Folder + component + manifest `id` all agree (`<your-id>`)
- [ ] No hardcoded screen sizes — uses `flex`, insets, and the shared `ScrollView`
- [ ] Storage keys namespaced, no unused imports, `testID`s present
- [ ] Registered in `apps.ts` + `MiniAppContent.tsx` + `AppContentSheet.tsx` (built-in path)
       **or** `miniapp.json` at repo root validates via the Add flow (remote path)
- [ ] `npx expo lint` and `npx tsc --noEmit` clean
