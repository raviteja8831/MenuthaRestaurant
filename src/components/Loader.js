import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLoader } from './LoaderContext';

const Loader = () => {
  const { loading } = useLoader();
  if (!loading) return null;
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});

export default Loader;
