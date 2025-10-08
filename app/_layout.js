
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { LoaderProvider } from '../src/components/LoaderContext';
import Loader from '../src/components/Loader';
import { AlertProvider } from '../src/contexts/AlertContext';

export default function RootLayout() {
  useEffect(() => {
    console.log('ROOT LAYOUT: mounted, attempting to hide splash (debug)');

    // Install a global error handler so release JS errors are visible in native logs
    try {
      if (global && typeof global.ErrorUtils !== 'undefined' && global.ErrorUtils.setGlobalHandler) {
        global.ErrorUtils.setGlobalHandler((error, isFatal) => {
          console.error('Global JS error caught:', error, 'isFatal=', isFatal);
        });
      }
      // Also listen for unhandledrejection if available
      if (typeof globalThis !== 'undefined' && globalThis.addEventListener) {
        globalThis.addEventListener('unhandledrejection', (ev) => {
          console.error('Unhandled promise rejection:', ev);
        });
      }
    } catch (e) {
      console.warn('Failed to install global error handlers', e);
    }

    // Try to hide the splash screen safely. Some modules call preventAutoHideAsync()
    // — if hideAsync fails immediately we retry a couple of times with delays.
    const tryHide = async (attempt = 1) => {
      try {
        await SplashScreen.hideAsync();
        console.log('Splash hidden successfully');
      } catch (e) {
        console.warn(`hideAsync attempt ${attempt} failed`, e);
        if (attempt < 3) {
          setTimeout(() => tryHide(attempt + 1), 500 * attempt);
        }
      }
    };

    tryHide();
  }, []);

  return (
    <AlertProvider>
      <LoaderProvider>
        <StatusBar style="auto" />
        <Loader />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="Customer-Login" />
          <Stack.Screen name="chef-login" />
          <Stack.Screen name="customer-home" />
          <Stack.Screen name="chef-home" />
          <Stack.Screen name="dashboard" />
        </Stack>
      </LoaderProvider>
    </AlertProvider>
  );
}