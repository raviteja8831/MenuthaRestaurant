import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { List, Appbar } from 'react-native-paper';
import { showApiError } from '../services/messagingService';
import api from "../api/api"
export default function BillingScreen() {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await api.get('/billing');
        setData(res.data);
      } catch (err) {
        showApiError(err);
      }
    };
    fetchBilling();
  }, []);
  return (
    <>
      <Appbar.Header><Appbar.Content title="Billing" /></Appbar.Header>
      <FlatList
        data={data}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <List.Item title={item.name} />
        )}
      />
    </>
  );
}
