import React from 'react';
import { Stack } from 'expo-router';
import { LoaderProvider } from '../src/components/LoaderContext';
import Loader from '../src/components/Loader';

export default function RootLayout() {
  return (
    <LoaderProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="customer-home" />
        <Stack.Screen name="chef-home" />
        {/* Add other screens as needed */}
      </Stack>
      <Loader />
    </LoaderProvider>
  );
}