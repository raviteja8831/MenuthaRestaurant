import React from 'react';
import LoginScreen from '../src/screens/LoginScreen';
import { LoaderProvider } from '../src/components/LoaderContext';
import Loader from '../src/components/Loader';

export default function App() {
  return (
    <LoaderProvider>
      <LoginScreen />
      <Loader />
    </LoaderProvider>
  );
}