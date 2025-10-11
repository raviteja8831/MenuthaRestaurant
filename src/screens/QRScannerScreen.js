import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  SafeAreaView,
  Platform,
  Image,
  Linking
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function QRScannerScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const device = useCameraDevice('back');

  useEffect(() => {
    // Skip permission request on web
    if (Platform.OS === 'web') {
      return;
    }

    (async () => {
      try {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        setHasPermission(false);
      }
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (scanned || codes.length === 0) return;

      const code = codes[0];
      handleQRCodeScanned(code.value);
    },
  });

  // Early return for web platform - after all hooks
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            QR scanning is only supported on mobile devices (Android/iOS). Please use a native build to scan QR codes.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleQRCodeScanned = (data) => {
    setScanned(true);
    setScannedData(data);

    try {
      // Try to parse as JSON (our QR code format)
      let qrData;

      // Handle deep link format: menutha://order?data=...
      if (data.startsWith('menutha://order?data=')) {
        const encodedData = data.split('data=')[1];
        qrData = JSON.parse(decodeURIComponent(encodedData));
      } else {
        // Try direct JSON parse
        qrData = JSON.parse(data);
      }

      // Validate QR code data
      if (qrData && qrData.type === 'table_order' && qrData.restaurantId && qrData.tableId) {
        console.log('Valid table order QR code scanned:', qrData);

        // Navigate to menu with restaurant and table details, including ref URL
        const refUrl = `/menu-list?restaurantId=${qrData.restaurantId}&tableId=${qrData.tableId}&tableName=${encodeURIComponent(qrData.tableName || '')}&ishotel=false`;

        // Redirect immediately without showing details
        router.push({
          pathname: '/menu-list',
          params: {
            restaurantId: qrData.restaurantId,
            tableId: qrData.tableId,
            tableName: qrData.tableName,
            ishotel: 'false',
            refUrl: refUrl
          }
        });
      } else {
        console.log('Invalid QR code format:', qrData);
      }
    } catch (error) {
      console.log('QR code is not in expected format:', data);
      // Handle plain text QR codes or other formats if needed
    }
  };

  const handleBackPress = () => {
    router.push('/customer-home');
  };

  // Render loading or error states after hooks
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No access to camera</Text>
          <Text style={styles.errorSubText}>
            Please enable camera permissions in your device settings to scan QR codes.
          </Text>
          <Pressable style={styles.settingsButton} onPress={() => Linking.openSettings()}>
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </Pressable>
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </Pressable>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Scanner Frame with Camera */}
        <View style={styles.scannerFrame}>
          <Camera
            style={StyleSheet.absoluteFillObject}
            device={device}
            isActive={!scanned}
            codeScanner={codeScanner}
          />
          <View style={styles.scannerOverlay}>
            {/* Corner indicators */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instruction Text */}
        <Text style={styles.instructionText}>Host Should Scan First</Text>

        {/* Group Icon and Text */}
        <View style={styles.groupSection}>
          <Image
            source={require('../assets/images/group.png')}
            style={styles.groupIcon}
            resizeMode="contain"
          />
          <Text style={styles.friendsText}>Friends & Family</Text>
          <Text style={styles.chooseText}>Choose Before Scanning</Text>
        </View>
      </View>

      {/* QR code scanned - redirecting immediately, no UI needed */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BEBEBE', // Gray background to match design
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 10,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  scannerFrame: {
    width: width * 0.75,
    height: width * 0.75,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#4A90E2',
    borderWidth: 3,
  },
  topLeft: {
    top: 20,
    left: 20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 20,
    right: 20,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  groupSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  groupIcon: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  friendsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 5,
    textAlign: 'center',
  },
  chooseText: {
    fontSize: 14,
    color: '#4A90E2',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  scannedContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scannedTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#4CAF50',
  },
  scannedDescription: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  scanAgainButton: {
    backgroundColor: '#6B4EFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scanAgainText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingsButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
});
