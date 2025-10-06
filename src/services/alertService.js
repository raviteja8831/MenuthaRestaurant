// This file is deprecated. Please use the new AlertContext from contexts/AlertContext.js
// Keeping this for backward compatibility

import React from 'react';

// Re-export the new alert service for backward compatibility
export { AlertProvider, useAlert, AlertService } from '../contexts/AlertContext';

// Legacy exports for compatibility
export const AlertContext = React.createContext();

// Legacy provider - redirects to new implementation
export function LegacyAlertProvider({ children }) {
  console.warn('LegacyAlertProvider is deprecated. Please use AlertProvider from contexts/AlertContext.js');
  const { AlertProvider: NewAlertProvider } = require('../contexts/AlertContext');
  return React.createElement(NewAlertProvider, null, children);
}
