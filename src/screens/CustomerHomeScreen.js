import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList,
  Linking,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllRestaurants } from "../api/restaurantApi";
import FilterModal from "../Modals/FilterModal";

const CustomerHomeScreen = () => {
  const router = useRouter();
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [dataLoadingComplete, setDataLoadingComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 17.4375,
    longitude: 78.4456,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // ------------------------- UTILS -------------------------
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ------------------------- FETCH -------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        let loc;
        if (status === "granted") {
          const current = await Location.getCurrentPositionAsync({});
          loc = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          };
        } else {
          loc = { latitude: 17.4375, longitude: 78.4456 };
        }
        setUserLocation(loc);
        setMapRegion({
          ...loc,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        const data = await getAllRestaurants();
        const valid = Array.isArray(data)
          ? data.filter(
              (r) =>
                r &&
                Number(r.latitude) &&
                Number(r.longitude) &&
                r.latitude > 6 &&
                r.latitude < 37 &&
                r.longitude > 68 &&
                r.longitude < 98
            )
          : [];
        setRestaurants(valid);
        setDataLoadingComplete(true);
      } catch (err) {
        console.log("❌ init error", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ------------------------- FILTER -------------------------
  const filtered = useMemo(() => {
    if (!Array.isArray(restaurants)) return [];
    return restaurants.filter((r) => {
      if (searchQuery && !r.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [restaurants, searchQuery]);

  // ------------------------- MARKERS -------------------------
  useEffect(() => {
    if (!dataLoadingComplete) return;
    const m = filtered
      .filter((r) => r.latitude && r.longitude)
      .map((r, i) => ({
        id: r.id || i.toString(),
        coordinate: {
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
        },
        title: r.name,
        description: r.address,
        restaurant: r,
      }));
    setMarkers(m);
  }, [filtered, dataLoadingComplete]);

  // ------------------------- FIT MAP -------------------------
  useEffect(() => {
    if (!mapReady || !dataLoadingComplete || !mapRef.current) return;
    const coords = [];
    if (userLocation) coords.push(userLocation);
    markers.forEach((m) => {
      if (m.coordinate.latitude && m.coordinate.longitude) coords.push(m.coordinate);
    });
    if (coords.length > 0) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 100, bottom: 150, left: 100 },
        animated: true,
      });
    }
  }, [mapReady, markers, userLocation, dataLoadingComplete]);

  // ------------------------- UI ACTIONS -------------------------
  const handleMarkerPress = (restaurant) => {
    router.push({
      pathname: "/HotelDetails",
      params: {
        id: restaurant.id,
        name: restaurant.name,
      },
    });
  };

  // ------------------------- RENDER -------------------------
  if (Platform.OS === "web") return null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        showsUserLocation
        onMapReady={() => setMapReady(true)}
      >
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={3000}
              strokeColor="#3838FB"
              fillColor="#3838FB22"
              strokeWidth={2}
            />
            <Marker coordinate={userLocation} title="You" />
          </>
        )}

        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={m.coordinate}
            title={m.title}
            description={m.description}
            onPress={() => handleMarkerPress(m.restaurant)}
          >
            <View style={styles.markerContainer}>
              <Image
                source={require("../assets/images/marker-bg.png")}
                style={styles.markerBackground}
              />
              <Image
                source={require("../assets/menutha_original.png")}
                style={styles.markerLogo}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6B4EFF" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#444" },
  markerContainer: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  markerBackground: {
    width: 50,
    height: 50,
    position: "absolute",
  },
  markerLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default CustomerHomeScreen;
