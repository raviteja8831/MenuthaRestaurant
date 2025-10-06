# Enhanced Snackbar Alert System

## Overview
The new alert system provides beautiful snackbar-style notifications with proper positioning, animations, and modern styling. It replaces the basic React Native alerts with a more user-friendly experience.

## Features
- ✅ Modern snackbar design with smooth animations
- ✅ Positioned at the top of the screen (below status bar)
- ✅ Different colors for success, error, warning, and info alerts
- ✅ Icons for each alert type
- ✅ Auto-dismiss with configurable duration
- ✅ Manual dismiss with close button
- ✅ Proper shadows and elevation
- ✅ Responsive design
- ✅ Backward compatibility with existing code

## Setup

### 1. Wrap your app with AlertProvider

In your main App.js or root component:

```jsx
import React from 'react';
import { AlertProvider } from './src/contexts/AlertContext';
import YourAppContent from './YourAppContent';

export default function App() {
  return (
    <AlertProvider>
      <YourAppContent />
    </AlertProvider>
  );
}
```

### 2. Use in Components (Hook Method)

```jsx
import React from 'react';
import { View, Button } from 'react-native';
import { useAlert } from '../contexts/AlertContext';

export default function MyComponent() {
  const alert = useAlert();

  const handleSuccess = () => {
    alert.success('Operation completed successfully!', 'Success');
  };

  const handleError = () => {
    alert.error('Something went wrong', 'Error');
  };

  const handleWarning = () => {
    alert.warning('Please check your input', 'Warning');
  };

  const handleInfo = () => {
    alert.info('Here is some information', 'Info');
  };

  return (
    <View>
      <Button title="Show Success" onPress={handleSuccess} />
      <Button title="Show Error" onPress={handleError} />
      <Button title="Show Warning" onPress={handleWarning} />
      <Button title="Show Info" onPress={handleInfo} />
    </View>
  );
}
```

### 3. Use Anywhere (Static Method)

```jsx
import { AlertService } from '../contexts/AlertContext';

// Can be used anywhere in your app, even outside components
AlertService.success('Payment completed!');
AlertService.error('Network error occurred');
AlertService.warning('Please verify your input');
AlertService.info('New update available');
```

## API Reference

### useAlert Hook

```jsx
const alert = useAlert();

// Methods available:
alert.success(message, title?, duration?);
alert.error(message, title?, duration?);
alert.warning(message, title?, duration?);
alert.info(message, title?, duration?);
alert.hide(); // Manual dismiss
```

### AlertService Static Methods

```jsx
AlertService.success(message, title?, duration?);
AlertService.error(message, title?, duration?);
AlertService.warning(message, title?, duration?);
AlertService.info(message, title?, duration?);
```

### Parameters

- `message` (string): The main message to display
- `title` (string, optional): Optional title for the alert
- `duration` (number, optional): Auto-dismiss duration in milliseconds
  - Default: 4000ms for most, 5000ms for errors

## Styling

The snackbar uses these color schemes:

- **Success**: Green background (#4CAF50) with white text/icons
- **Error**: Red background (#F44336) with white text/icons
- **Warning**: Orange background (#FF9800) with white text/icons
- **Info**: Blue background (#2196F3) with white text/icons

Each snackbar includes:
- Colored left border
- Appropriate icon
- Shadow/elevation for depth
- Smooth slide-in animation from top
- Close button for manual dismiss

## Migration from Old AlertService

The new system is backward compatible. Your existing code using the old AlertService will automatically use the new snackbar alerts when the AlertProvider is set up.

```jsx
// This will now show a beautiful snackbar instead of a basic alert
AlertService.error('Something went wrong');
```

## Advanced Usage

### Custom Duration

```jsx
alert.success('Quick message', 'Success', 2000); // 2 seconds
alert.error('Important error', 'Error', 8000); // 8 seconds
```

### Error Handling

```jsx
try {
  await someAsyncOperation();
  alert.success('Operation completed!');
} catch (error) {
  alert.error(error); // Automatically extracts error message
}
```

### With Async Operations

```jsx
const handleSubmit = async () => {
  try {
    await submitData();
    alert.success('Data submitted successfully!');
  } catch (error) {
    alert.error('Failed to submit data', 'Submission Error');
  }
};
```

## Notes

- Confirmation dialogs still use native React Native alerts for better UX
- Only one snackbar is shown at a time (newest replaces current)
- Snackbars are positioned to avoid status bar interference
- Animations are optimized for performance using native driver
- Component is memoized to prevent unnecessary re-renders