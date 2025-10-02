import React, { useState, useRef } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';


export default function QRCodeModal({ visible, onClose, onSave, loading, restaurantId }) {
  const [name, setName] = useState('');
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef();

  // Extract tableId from name (assume name is tableId or similar)
  const tableId = name.trim();
  // Generate QR code value with restaurantId and tableId as query params
  const qrValue = restaurantId && tableId ? `https://yourdomain.com/order?restaurantId=${restaurantId}&tableId=${encodeURIComponent(tableId)}` : '';

  const handleSave = () => {
    if (!name) return;
    onSave({ name });
    setShowQR(true);
    // Do not close modal or clear name
  };

  const handleDownload = async () => {
    try {
      console.log('Downloading QR code...');
      qrRef.current.toDataURL(async (data) => {
        const base64Data = data.replace('data:image/png;base64,', '');
        if (Platform.OS === 'web') {
          // Convert base64 to Blob and trigger download
          function base64ToBlob(base64, mime) {
            const byteChars = atob(base64);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
              byteNumbers[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            return new Blob([byteArray], { type: mime });
          }
          const blob = base64ToBlob(base64Data, 'image/png');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'qrcode.png';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          // Save to file and share
          const fileUri = FileSystem.cacheDirectory + 'qrcode.png';
          await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
          await Sharing.shareAsync(fileUri);
        }
      });
    } catch (_e) {
      alert('Failed to download QR code');
    }
  };

  // Clear state on close
  const handleClose = () => {
    setName('');
    setShowQR(false);
    onClose && onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Always show close icon at top right */}
          <View style={styles.topRightIcons}>
            <Pressable style={styles.iconBtn} onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={30} color="#19171d" />
            </Pressable>
            {showQR && (
              <Pressable style={styles.iconBtn} onPress={handleDownload} disabled={!showQR || !qrValue}>
                <MaterialCommunityIcons name="download" size={30} color={showQR && qrValue ? "#19171d" : "#bbb"} />
              </Pressable>
            )}
          </View>
          {showQR && (
            <View style={styles.qrRow}>
              {showQR && qrValue ? (
                <View style={styles.qrImgBox}>
                  <QRCode
                  value={qrValue}
                  size={120}
                  getRef={qrRef}
                />
              </View>
            ) : null}
          </View>
                      )}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Table No/ Room No"
              placeholderTextColor="#bbb"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!showQR}
            />
          </View>
          <View style={styles.btnRow}>
            {!showQR && (
              <Pressable style={styles.plusBtn} onPress={handleSave} disabled={loading}>
                <Text style={styles.plusBtnText}>+</Text>
              </Pressable>
            )}
          
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#E6E1FA',
    borderRadius: 18,
    padding: 24,
    width: 360,
    minHeight: 240,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#bdb6e6',
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  qrImgBox: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  topRightIcons: {
    position: 'absolute',
    top: 8,
    right: 12,
    flexDirection: 'row',
    zIndex: 10,
    gap: 8,
  },
  iconBtn: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 18,
    padding: 4,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
    marginTop: 50,
  },
  inputLabel: {
    color: '#19171d',
    fontWeight: 'bold',
    fontSize: 20,
    marginRight: 8,
    marginLeft: 2,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 20,
    borderWidth: 0,
    color: '#888',
    height: 48,
    fontStyle: 'italic',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 2,
  },
  plusBtn: {
    backgroundColor: '#A09CF7',
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  plusBtnText: { color: '#19171d', fontWeight: 'bold', fontSize: 38 },
});
