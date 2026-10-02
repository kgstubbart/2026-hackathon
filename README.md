# 2026-hackathon

A React Native app built with [Expo](https://expo.dev) (SDK 57) and [Expo Router](https://docs.expo.dev/router/introduction).

## Get started

Requires Node `^20.19.4`, `^22.13.0` or `>=24.3.0`.

```bash
npm install
npx expo start
```

From the dev server, press `i` for the iOS simulator, `a` for the Android emulator, `w` for web, or scan the QR code with [Expo Go](https://expo.dev/go).

## Scripts

- `npm run ios` / `npm run android` / `npm run web` — start on a specific platform
- `npm run lint` — lint with ESLint
- `npx tsc --noEmit` — typecheck
- `npm run reset-project` — move the starter screens to `app-example/` and start from a blank `src/app/`

## Structure

- `src/app/` — screens and layouts (file-based routing)
- `src/components/`, `src/hooks/`, `src/constants/` — shared code
- `assets/` — images and icons
