
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { LoaderProvider } from '../src/components/LoaderContext';
import Loader from '../src/components/Loader';
import { AlertProvider } from '../src/contexts/AlertContext';
import BackButtonHandler from '../src/components/BackButtonHandler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    console.log('ROOT LAYOUT: mounted, hiding splash immediately');

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

    // Hide the splash screen immediately to show our custom loader
    SplashScreen.hideAsync().catch(e => {
      console.warn('Failed to hide splash screen', e);
    });
  }, []);

  return (
    <AlertProvider>
      <LoaderProvider>
        <StatusBar style="auto" />
        <Loader />
        <BackButtonHandler />
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