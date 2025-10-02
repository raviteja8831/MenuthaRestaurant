import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, Button, TextInput, useTheme, Title } from 'react-native-paper';

export default function ChefQRCodeScreen() {
  const [qrValue, setQrValue] = useState('');

  const theme = useTheme();
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Title style={styles.title}>QR Code Generator / Statistics</Title>
      <Surface style={styles.qrBox} />
      <Button
        mode="contained"
        style={styles.addBtn}
        labelStyle={styles.addText}
        onPress={() => {}}
      >
        {"+\nNew QR Code"}
      </Button>
      <Surface style={styles.otpRow}>
        {[1,2,3,4,5].map((n) => (
          <TextInput
            key={n}
            style={styles.otpBox}
            maxLength={1}
            keyboardType="number-pad"
            mode="outlined"
          />
        ))}
      </Surface>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  qrBox: { width: 150, height: 150, backgroundColor: '#fff', borderRadius: 20, marginBottom: 20 },
  addBtn: { borderRadius: 8, marginBottom: 20, width: 180, alignSelf: 'center' },
  addText: { fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, backgroundColor: 'transparent', elevation: 0 },
  otpBox: { width: 40, height: 40, fontSize: 22, textAlign: 'center', borderRadius: 8, marginHorizontal: 5 },
});
