import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Text, Button, useTheme, Divider } from 'react-native-paper';
import Header from '../components/Header';
import { getHeading } from '../constants/headings';

export default function OrderSummaryScreen() {
  const theme = useTheme();
  return (
    <>
      <Header title={getHeading('OrderSummaryScreen')} />
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <Title style={styles.title}>Your Order</Title>
        <Card style={styles.orderList}>
          <Card.Content>
            <OrderRow item="Tomato Soup" qty="4" price="₹80" />
            <OrderRow item="Roti Manchurian" qty="2" price="₹150" />
            <OrderRow item="Rice Platter" qty="1" price="₹250" />
            <OrderRow item="Curd Rice" qty="2" price="₹100" />
            <OrderRow item="Desserts" qty="5" price="₹250" />
          </Card.Content>
        </Card>
        <Paragraph style={styles.total}>Total: ₹830</Paragraph>
        <Paragraph style={styles.feedback}>Please Rate this Restaurant as a Feedback</Paragraph>
        <Paragraph style={styles.stars}>⭐⭐⭐⭐⭐</Paragraph>
        <Button mode="contained" style={styles.payButton} labelStyle={styles.payText} onPress={() => {}}>Pay</Button>
        <Paragraph style={styles.paid}>PAID</Paragraph>
        <Paragraph style={styles.thankyou}>Thank you!</Paragraph>
      </ScrollView>
    </>
  );
}

function OrderRow({ item, qty, price }) {
  return (
    <Card.Content style={styles.orderRow}>
      <Text>{item}</Text>
      <Text>{qty}</Text>
      <Text>{price}</Text>
    </Card.Content>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  orderList: { marginBottom: 20 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  total: { fontWeight: 'bold', fontSize: 18, textAlign: 'right', marginBottom: 20 },
  feedback: { textAlign: 'center', marginBottom: 5 },
  stars: { textAlign: 'center', fontSize: 22, marginBottom: 20 },
  payButton: {
    borderRadius: 8,
    marginBottom: 20,
    width: 120,
    alignSelf: 'center',
  },
  payText: { fontWeight: 'bold', fontSize: 18 },
  paid: { textAlign: 'center', color: 'red', fontWeight: 'bold', fontSize: 24, marginBottom: 10 },
  thankyou: { textAlign: 'center', fontSize: 20 },
});
