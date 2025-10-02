import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable, Text, Platform } from "react-native";
import * as Location from "expo-location";

// let MapView, Marker;
// if (Platform.OS !== 'web') {
//   const Maps = require('react-native-maps');
//   MapView = Maps.default;
//   Marker = Maps.Marker;
// }

// Mock restaurant data
const mockRestaurants = [
  {
    id: 1,
    name: "Spicy Bites",
    latitude: 37.78825,
    longitude: -122.4324,
  },
  {
    id: 2,
    name: "Green Garden",
    latitude: 37.78925,
    longitude: -122.4314,
  },
  {
    id: 3,
    name: "Urban Grill",
    latitude: 37.79025,
    longitude: -122.4334,
  },
];

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation({
          coords: {
            latitude: 37.78825,
            longitude: -122.4324,
          },
        }); // fallback
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setLoading(false);
    })();
  }, []);

  if (loading || !location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' ? (
        // Only render MapView on native platforms
        // <MapView
        //   style={styles.map}
        //   initialRegion={{
        //     latitude: location.coords.latitude,
        //     longitude: location.coords.longitude,
        //     latitudeDelta: 0.01,
        //     longitudeDelta: 0.01,
        //   }}
        //   showsUserLocation={true}
        // >
        //   {mockRestaurants.map((restaurant) => (
        //     <Marker
        //       key={restaurant.id}
        //       coordinate={{
        //         latitude: restaurant.latitude,
        //         longitude: restaurant.longitude,
        //       }}
        //       title={restaurant.name}
        //       onPress={() => navigation.navigate('RestaurantDetailScreen', { id: restaurant.id })}
        //     />
        //   ))}
        // </MapView>
              <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text>Map is not supported on web. Please use mobile app.</Text>
        </View>
      ) : (
        // Fallback for web
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text>Map is not supported on web. Please use mobile app.</Text>
        </View>
      )}
      <View style={styles.bottomBar}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Filter')}>
          Filter
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('OrderSummary')}>
          Order Summary
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}>
          Profile
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b6a6e7' },
  map: {
    flex: 1,
    margin: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#b6a6e7',
  },
  iconBtn: {
    backgroundColor: '#a18cd1',
    borderRadius: 50,
    padding: 15,
  },
  icon: { width: 30, height: 30 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
