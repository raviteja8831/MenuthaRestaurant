import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AlertProvider, useAlertWithStatic } from '../contexts/AlertContext';

// This component should wrap your main app content
const AppWithAlerts = ({ children }) => {
  return (
    <AlertProvider>
      <SafeAreaView style={styles.container}>
        <AlertInitializer />
        {children}
      </SafeAreaView>
    </AlertProvider>
  );
};

// This component initializes the static alert service
const AlertInitializer = () => {
  useAlertWithStatic(); // This sets up the static AlertService
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppWithAlerts;

// Example of how to integrate in your main App.js:
/*
import React from 'react';
import AppWithAlerts from './src/components/AppWithAlerts';
import YourMainApp from './YourMainApp';

export default function App() {
  return (
    <AppWithAlerts>
      <YourMainApp />
    </AppWithAlerts>
  );
}
*/