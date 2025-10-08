import React, { createContext, useContext, useState, useCallback } from 'react';
import SnackbarAlert from '../components/SnackbarAlert';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    duration: 4000,
  });

  const showAlert = useCallback((type, message, title = '', duration = 4000) => {
    setAlert({
      visible: true,
      type,
      title,
      message,
      duration,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, visible: false }));
  }, []);

  const success = useCallback((message, title = 'Success', duration = 4000) => {
    showAlert('success', message, title, duration);
  }, [showAlert]);

  const error = useCallback((message, title = 'Error', duration = 5000) => {
    const errorMessage = typeof message === 'string'
      ? message
      : message?.message || 'Something went wrong';
    showAlert('error', errorMessage, title, duration);
  }, [showAlert]);

  const warning = useCallback((message, title = 'Warning', duration = 4000) => {
    showAlert('warning', message, title, duration);
  }, [showAlert]);

  const info = useCallback((message, title = 'Info', duration = 4000) => {
    showAlert('info', message, title, duration);
  }, [showAlert]);

  const contextValue = {
    success,
    error,
    warning,
    info,
    hide: hideAlert,
  };

  // Auto-register this instance with AlertService for static access
  React.useEffect(() => {
    AlertService.setInstance(contextValue);
    return () => {
      AlertService.setInstance(null);
    };
  }, [contextValue]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <SnackbarAlert alert={alert} onDismiss={hideAlert} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Static methods for use without hooks
export const AlertService = {
  _instance: null,

  setInstance(instance) {
    this._instance = instance;
  },

  success(message, title = 'Success', duration = 4000) {
    if (this._instance) {
      this._instance.success(message, title, duration);
    }
  },

  error(message, title = 'Error', duration = 5000) {
    if (this._instance) {
      this._instance.error(message, title, duration);
    }
  },

  warning(message, title = 'Warning', duration = 4000) {
    if (this._instance) {
      this._instance.warning(message, title, duration);
    }
  },

  info(message, title = 'Info', duration = 4000) {
    if (this._instance) {
      this._instance.info(message, title, duration);
    }
  },
};

// Enhanced hook that also sets the static instance
export const useAlertWithStatic = () => {
  const alert = useAlert();

  React.useEffect(() => {
    AlertService.setInstance(alert);
    return () => AlertService.setInstance(null);
  }, [alert]);

  return alert;
};

export default AlertProvider;