import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function AppScreenWrapper({ children }) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.fullWidth}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#8D8BEA',
  },
  container: {
    flexGrow: 1,
    minHeight: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
  },
  fullWidth: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
});
