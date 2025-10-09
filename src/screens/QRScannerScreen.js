import React, { useState, useEffect } from 'react';
import { CameraView as Camera, Camera as CameraModule } from 'expo-camera';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  SafeAreaView,
  Platform,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function QRScannerScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);

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

        setTimeout(() => {
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
        }, 1500); // Small delay to show scan confirmation
      } else {
        console.log('Invalid QR code format:', qrData);
      }
    } catch (error) {
      console.log('QR code is not in expected format:', data);
      // Handle plain text QR codes or other formats if needed
    }
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

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Scanner Frame with Camera */}
        <View style={styles.scannerFrame}>
          {hasPermission === null ? (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>Requesting camera permission...</Text>
            </View>
          ) : hasPermission === false ? (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>No access to camera</Text>
            </View>
          ) : (
            <>
              <Camera
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barCodeScannerSettings={{ barCodeTypes: ['qr'] }}
                ratio="1:1"
                facing="back"
                onMountError={console.warn}
              />
              {/* Fallback message if scanning is not supported */}
              {typeof Camera === 'undefined' && (
                <View style={styles.fallbackContainer}>
                  <Text style={styles.fallbackText}>
                    QR scanning is not supported on this device.
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

      {/* Show scanned QR code info */}
      {scanned && scannedData && (
        <View style={styles.scannedContainer}>
          <MaterialCommunityIcons name="check-circle" size={48} color="#4CAF50" />
          <Text style={styles.scannedTitle}>QR Code Scanned Successfully!</Text>
          <Text style={styles.scannedDescription}>
            {(() => {
              try {
                let qrData;
                if (scannedData.startsWith('menutha://order?data=')) {
                  const encodedData = scannedData.split('data=')[1];
                  qrData = JSON.parse(decodeURIComponent(encodedData));
                } else {
                  qrData = JSON.parse(scannedData);
                }

                if (qrData && qrData.type === 'table_order') {
                  return `Table: ${qrData.tableName}\nRedirecting to menu...`;
                }
                return 'Processing...';
              } catch {
                return 'Processing...';
              }
            })()}
          </Text>
          <Pressable
            onPress={() => setScanned(false)}
            style={styles.scanAgainButton}
          >
            <Text style={styles.scanAgainText}>Scan Another</Text>
          </Pressable>
        </View>
      )}
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
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  fallbackContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  fallbackText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 8,
    textAlign: 'center',
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
