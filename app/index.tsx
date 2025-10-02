import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to login screen as the initial route
  return <Redirect href="/login" />;
}