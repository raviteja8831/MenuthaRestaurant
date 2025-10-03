import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
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