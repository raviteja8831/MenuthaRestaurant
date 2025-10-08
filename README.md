# MenuthaRestaurant — Maps Setup Notes

This project uses different map implementations depending on platform:

- Web and Expo Go: react-native-maps (works with react-native-web)
- Native standalone / dev-client / EAS builds (iOS & Android): expo-maps (native)

Why: `expo-maps` provides a modern native experience but its native runtime is not
included in Expo Go. For that reason the app falls back to `react-native-maps`
when running in Expo Go or on the web.

Quick steps to get maps working locally

1. Install packages (already present in package.json):

```
npx expo install expo-maps react-native-maps
```

2. For native testing (recommended): create a development client or build a
   development binary with EAS so `expo-maps` native code is available.

   - Install EAS CLI if you don't have it:

```
npm install -g eas-cli
```

   - Build a development client and install on device/emulator:

```
eas build --profile development --platform android
eas build --profile development --platform ios
```

   Or run `eas dev` / `expo run:android` after configuring native projects.

3. API keys for Google Maps (if you use geocoding or places):

   - Add your Google Maps API key to `app.json` under `android.config.googleMaps.apiKey`
     and `ios.config.googleMapsApiKey` (already present in this repo). Replace the
     placeholder keys with your own.

4. Running on Web or Expo Go:

   - `npm run web` or `expo start --web` will use `react-native-maps` on web.
   - `expo start` + Expo Go will fall back to `react-native-maps` if `expo-maps`
     isn't available.

Troubleshooting

- If you see "Map not available" on native builds, ensure you ran a dev-client / EAS
  build or are using a standalone app with `expo-maps` included.
- Check Metro/console logs for messages printed by `CustomerHomeScreen.js`:
  - `✅ expo-maps loaded` — native maps should work
  - `✅ react-native-maps loaded inside Expo Go` — running in Expo Go
  - `⚠️ expo-maps not available, falling back to react-native-maps` — fallback in use

If you want help producing an EAS dev-client build or wiring API keys, tell me your OS
and whether you prefer Android or iOS and I'll give exact commands.

Environment / API URL overrides

If the app can't reach the backend on Android devices (HTTP blocked), you can
override the API base URL used by the app in two ways:

- Expo runtime config (recommended for devices & EAS): add an `extra` field in
   `app.json` or `app.config.js`:

```json
"expo": {
   "extra": {
      "API_BASE_URL": "http://13.127.228.119:8090/api"
   }
}
```

- Environment variable (useful for web or bundler): set `API_BASE_URL` in your
   environment before starting Metro/EAS:

```
API_BASE_URL=http://13.127.228.119:8090/api npx expo start
```

Note: For Android devices, the native app includes a `network_security_config.xml`
that permits cleartext HTTP to the configured host. For production you should
use HTTPS and tighten network security configuration.