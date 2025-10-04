// Temporary instrumentation: log app start to help debug splash hang
console.log('APP INDEX: module loaded', new Date().toISOString());

import { AppRegistry } from 'react-native';
import LoginScreen from './../src/screens/LoginScreen';
import { name as appName } from '../app.json';

function IndexScreen() {
  console.log('APP INDEX: rendering IndexScreen');
  return <LoginScreen />;
}

// Register the root component with AppRegistry
AppRegistry.registerComponent(appName, () => IndexScreen);
