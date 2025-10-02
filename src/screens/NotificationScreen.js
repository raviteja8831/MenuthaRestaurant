import React from 'react';
import { ScrollView } from 'react-native';

export default function NotificationScreen(props) {
  // All notification/review UI and logic here
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* ...notification/review content... */}
    </ScrollView>
  );
}
