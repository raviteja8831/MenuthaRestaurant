// Temporary instrumentation: log app start to help debug splash hang
console.log('APP INDEX: module loaded', new Date().toISOString());

import LoginScreen from './../src/screens/LoginScreen';

export default function IndexScreen() {
  console.log('APP INDEX: rendering IndexScreen');
  return <LoginScreen />;
}