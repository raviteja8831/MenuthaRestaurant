import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

export default function RootLayout() {
  useEffect(() => {
    console.log('ROOT LAYOUT: mounted, attempting to hide splash (debug)');
    // Temporary: force-hide the splash screen to check if splash is the blocker
    SplashScreen.hideAsync().catch((e) => console.warn('hideAsync failed', e));
  }, []);

  return (
    <>
      <StatusBar style="auto" />
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
    </>
  );
}