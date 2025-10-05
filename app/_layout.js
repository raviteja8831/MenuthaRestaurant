
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { LoaderProvider } from '../src/components/LoaderContext';
import Loader from '../src/components/Loader';

export default function RootLayout() {
  useEffect(() => {
    console.log('ROOT LAYOUT: mounted, attempting to hide splash (debug)');
    SplashScreen.hideAsync().catch((e) => console.warn('hideAsync failed', e));
  }, []);

  return (
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
  );
}