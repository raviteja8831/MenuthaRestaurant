import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, Circle } from 'react-native-maps';

const CustomerHomeScreen = () => {
  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
  const router = useRouter();
  const mapRef = useRef(null);

  // State
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 17.4375,
    longitude: 78.4456,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // Default markers to show immediately while data loads
  const defaultUserLocation = { latitude: 17.4375, longitude: 78.4456 };
  const defaultRestaurants = [
    {
      id: 'default-1',
      name: 'Loading Restaurant 1...',
      latitude: 17.4475,
      longitude: 78.4556,
      address: 'Loading address...',
      rating: 0,
    },
    {
      id: 'default-2',
      name: 'Loading Restaurant 2...',
      latitude: 17.4275,
      longitude: 78.4356,
      address: 'Loading address...',
      rating: 0,
    },
    {
      id: 'default-3',
      name: 'Loading Restaurant 3...',
      latitude: 17.4575,
      longitude: 78.4656,
      address: 'Loading address...',
      rating: 0,
    },
  ];

  // Simple initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting simplified app initialization...');

        // Get user location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log('❌ Location permission denied');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const userLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        console.log('📍 User location:', userLoc);
        setUserLocation(userLoc);

        // Set map region
        const userRegion = {
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setMapRegion(userRegion);

      } catch (error) {
        console.error('❌ Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // ✅ Handle web rendering AFTER all hooks are called
  if (Platform.OS === 'web') {
    return null;
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6B4EFF" />
        <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>
          Loading simplified map...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={false}
        loadingEnabled={true}
        onMapReady={() => {
          console.log('🗺️ Map ready!');
          setMapReady(true);
        }}
        onRegionChangeComplete={(region) => {
          console.log('🗺️ Map region changed to:', region);
        }}
      >
        {/* User Location Circle */}
        <Circle
          center={userLocation || defaultUserLocation}
          radius={5000}
          strokeColor="#3838FB"
          fillColor="#3838FB22"
          strokeWidth={2}
        />

        {/* User Location Marker */}
        <Marker
          identifier="user-location"
          coordinate={userLocation || defaultUserLocation}
          title={userLocation ? "Your Location" : "Loading Your Location..."}
          description={userLocation ? "This is where you are" : "Getting your current location"}
          pinColor={userLocation ? "blue" : "orange"}
        />

        {/* Default Restaurant Markers */}
        {defaultRestaurants.map((restaurant, index) => {
          return (
            <Marker
              key={`restaurant-${restaurant.id}-${index}`}
              identifier={`restaurant-${restaurant.id}`}
              coordinate={{
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
              }}
              title={restaurant.name}
              description={restaurant.address}
              pinColor="yellow"
              onPress={() => {
                console.log('🏪 Default marker pressed:', restaurant.name);
              }}
            />
          );
        })}
      </MapView>

      {/* Simple Status */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          Simplified Map - {defaultRestaurants.length} default markers
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  statusBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default CustomerHomeScreen;