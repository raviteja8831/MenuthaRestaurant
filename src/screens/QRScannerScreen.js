import React, { useState, useEffect } from 'react';
import { CameraView as Camera, Camera as CameraModule } from 'expo-camera';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function QRScannerScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  // const [scannerAvailable, setScannerAvailable] = useState(null); // removed duplicate

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            QR scanning is only supported on mobile devices (Android/iOS). Please use the Expo Go app or a native build to scan QR codes.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  const [scannerAvailable, setScannerAvailable] = useState(null);


  useEffect(() => {
    (async () => {
      const { status } = await CameraModule.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      // Check if modern barcode scanner is available
      setScannerAvailable(Camera.isModernBarcodeScannerAvailable);
    })();
  }, []);


  const handleQRCodeScanned = (data) => {
    setScanned(true);
    setScannedData(data);
    // Optionally, navigate after a delay or on user action
    // router.push('/menu-list');
  };


  // Handler for QR code scanned event
  const handleBarCodeScanned = ({ type, data }) => {
    if (!scanned && type === 'org.iso.QRCode') {
      handleQRCodeScanned(data);
    }
  };

  const handleBackPress = () => {
    router.push('/customer-home');
  };



  // Render loading or error states after hooks

  // Launch modal scanner if available and not already scanned
  useEffect(() => {
    const handleOpenScanner = async () => {
      if (scannerAvailable && !scanned) {
        try {
          await Camera.launchScanner({ barcodeTypes: ['qr'] });
          // Listen for scan event
          Camera.onModernBarcodeScanned((event) => {
            if (event && event.data) {
              handleQRCodeScanned(event.data);
            }
          });
        } catch (_e) {
          // fallback or error
        }
      }
    };
    if (scannerAvailable) {
      handleOpenScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerAvailable]);
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
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
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


      {/* Scanner Area */}
      <View style={styles.scannerContainer}>
        <View style={styles.scannerFrame}>
          {hasPermission === null ? (
            <Text>Requesting camera permission...</Text>
          ) : hasPermission === false ? (
            <Text>No access to camera</Text>
          ) : (
            <>
              <Camera
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barCodeScannerSettings={{ barCodeTypes: ['qr'] }}
                ratio="16:9"
                facing="back"
                onMountError={console.warn}
              />
              {/* Fallback message if scanning is not supported */}
              {typeof Camera === 'undefined' && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, backgroundColor: 'rgba(0,0,0,0.7)', padding: 16, borderRadius: 8 }}>
                    QR scanning is not supported on this device.
                  </Text>
                </View>
              )}
              {/* Overlay message for scanning */}
              {!scanned && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 2 }} pointerEvents="none">
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 8 }}>
                    Show a QR code to the camera
                  </Text>
                </View>
              )}
            </>
          )}
          <View style={styles.scannerOverlay}>
            {/* Corner indicators */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Show scanned QR code info */}
        {scanned && scannedData && (
          <View style={{ marginTop: 20, backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>QR Code Scanned!</Text>
            <Text style={{ color: '#333', marginBottom: 8 }}>{scannedData}</Text>
            <Pressable onPress={() => router.push('/menu-list')} style={{ backgroundColor: '#4A90E2', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Continue</Text>
            </Pressable>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>Host Should Scan First</Text>
        </View>
          </View>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
      scannerFrame: {
        width: width * 0.8,
        height: width * 0.8,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        position: 'relative',
      },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
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
  demoScanButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  demoScanText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  friendsFamilyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  friendsFamilyText: {
    fontSize: 16,
    color: '#4A90E2',
    marginLeft: 8,
    fontWeight: '500',
  },
  chooseText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bottomIndicator: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  homeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#C0C0C0',
    borderRadius: 2,
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
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
})
