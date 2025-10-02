import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { List, Appbar } from "react-native-paper";
import { API_BASE_URL } from "../constants/api.constants";

export default function TrackingScreen() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/tracking`)
      .then((res) => res.json())
      .then(setData);
  }, []);
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Tracking" />
      </Appbar.Header>
      <FlatList
        data={data}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <List.Item title={item.name} />}
      />
    </>
  );
}
