import React from 'react';
import CustomerHomeScreen from "../src/screens/CustomerHomeScreen";
import SessionGuard from "../src/components/SessionGuard";
import { USER_TYPES } from "../src/services/authService";

export default function ProtectedCustomerHome() {
  return (
    <SessionGuard requiredUserType={USER_TYPES.CUSTOMER}>
      <CustomerHomeScreen />
    </SessionGuard>
  );
}
