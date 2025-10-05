import React from 'react';
import ChefHomeScreen from '../src/screens/ChefHomeScreen';
import SessionGuard from "../src/components/SessionGuard";
import { USER_TYPES } from "../src/services/authService";

export default function ProtectedChefHome() {
  return (
    <SessionGuard requiredUserType={USER_TYPES.RESTAURANT}>
      <ChefHomeScreen />
    </SessionGuard>
  );
}
