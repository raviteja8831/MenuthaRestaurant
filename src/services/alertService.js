import React from 'react';
import { Snackbar, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  info: '#1976d2',
  success: '#388e3c',
  error: '#d32f2f',
};
const ICONS = {
  info: 'info',
  success: 'check-circle',
  error: 'error',
};

export const AlertContext = React.createContext();

export function AlertProvider({ children }) {
  const [alert, setAlert] = React.useState({ visible: false, message: '', type: 'info' });

  const show = (type, message) => {
    setAlert({ visible: true, message, type });
  };
  const info = (message) => show('info', message);
  const success = (message) => show('success', message);
  const error = (message) => show('error', message);
  const dismiss = () => setAlert((a) => ({ ...a, visible: false }));

  return (
    <AlertContext.Provider value={{ info, success, error, dismiss }}>
      {children}
      <Snackbar
        visible={alert.visible}
        onDismiss={dismiss}
        duration={2000}
        style={{ backgroundColor: COLORS[alert.type], flexDirection: 'row', alignItems: 'center' }}
      >
        <MaterialIcons name={ICONS[alert.type]} size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={{ color: '#fff' }}>{alert.message}</Text>
      </Snackbar>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return React.useContext(AlertContext);
}
