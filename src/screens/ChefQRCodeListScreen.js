import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, Button, useTheme, Title, Card, IconButton } from 'react-native-paper';

const qrCodes = [
  { name: 'Table Hall South Main', code: 'QR1' },
  { name: 'Table Hall North', code: 'QR2' },
];

export default function ChefQRCodeListScreen() {
  const theme = useTheme();
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Title style={styles.title}>QR Code Generator / Statistics</Title>
      {qrCodes.map((qr, i) => (
        <Card key={i} style={styles.qrCard}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Surface style={styles.qrBox} />
            <Text style={styles.qrName}>{qr.name}</Text>
            <IconButton
              icon="download"
              style={styles.downloadBtn}
              color="#fff"
              size={24}
              onPress={() => {}}
            />
          </Card.Content>
        </Card>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  qrCard: { borderRadius: 15, padding: 15, marginBottom: 15, alignItems: 'center' },
  qrBox: { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 },
  qrName: { fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  downloadBtn: { backgroundColor: '#7b6eea', borderRadius: 8, padding: 0, marginTop: 5 },
});
