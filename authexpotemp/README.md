# React Native Expo Tailwind Template

A clean starter template for building mobile apps with Expo Router, React Native, TypeScript, and Tailwind styling through NativeWind.

## Tech Stack

- Expo 54 with Expo Router
- React Native 0.81
- React 19
- TypeScript
- NativeWind and Tailwind CSS
- Safe area support for modern devices

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

Run on a target platform:

```bash
npm run android
npm run ios
npm run web
```

## Project Structure

```text
app/
  _layout.tsx      App router layout
  index.tsx        Home screen
global.css         Tailwind entry file
tailwind.config.js Tailwind and NativeWind config
babel.config.js    NativeWind Babel setup
metro.config.js    NativeWind Metro setup
```

## Tailwind Usage

Use Tailwind classes directly with `className` on React Native components:

```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-2xl font-bold text-slate-900">Hello Expo</Text>
</View>
```

Tailwind scans these paths:

```js
content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"]
```

## Useful Scripts

- `npm start` - start Expo
- `npm run android` - open on Android
- `npm run ios` - open on iOS
- `npm run web` - open on web
- `npm run lint` - run Expo linting

## Notes

This template is intentionally minimal. Start building from `app/index.tsx`, add shared UI in a `components/` folder, and extend colors or fonts in `tailwind.config.js` as your app grows.
