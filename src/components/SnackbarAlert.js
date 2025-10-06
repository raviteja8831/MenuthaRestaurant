import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  success: {
    background: '#4CAF50',
    border: '#45A049',
    icon: '#FFFFFF',
    text: '#FFFFFF',
  },
  error: {
    background: '#F44336',
    border: '#E53935',
    icon: '#FFFFFF',
    text: '#FFFFFF',
  },
  warning: {
    background: '#FF9800',
    border: '#F57C00',
    icon: '#FFFFFF',
    text: '#FFFFFF',
  },
  info: {
    background: '#2196F3',
    border: '#1976D2',
    icon: '#FFFFFF',
    text: '#FFFFFF',
  },
};

const ICONS = {
  success: 'check-circle',
  error: 'alert-circle',
  warning: 'alert',
  info: 'information',
};

export const SnackbarAlert = React.memo(({ alert, onDismiss }) => {
  const translateY = React.useRef(new Animated.Value(-200)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (alert.visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after duration
      const timeout = setTimeout(() => {
        hideSnackbar();
      }, alert.duration || 4000);

      return () => clearTimeout(timeout);
    } else {
      hideSnackbar();
    }
  }, [alert.visible]);

  const hideSnackbar = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!alert.visible) return null;

  const colors = COLORS[alert.type] || COLORS.info;
  const icon = ICONS[alert.type] || ICONS.info;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderLeftColor: colors.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={colors.icon}
          />
        </View>

        <View style={styles.textContainer}>
          {alert.title && (
            <Text style={[styles.title, { color: colors.text }]}>
              {alert.title}
            </Text>
          )}
          <Text style={[styles.message, { color: colors.text }]} numberOfLines={3}>
            {alert.message}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideSnackbar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={colors.icon}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50, // Below status bar
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: width - 32,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  message: {
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.95,
  },
  closeButton: {
    padding: 4,
    marginTop: -2,
  },
});

export default SnackbarAlert;