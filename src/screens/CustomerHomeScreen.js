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
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [navOptions, setNavOptions] = useState([]);
  const [mapReady, setMapReady] = useState(false);

  const GEOCODE_CACHE_KEY = "restaurant_geocode_cache";

  const getGeocodingCache = async () => {
    try {
      const cache = await AsyncStorage.getItem(GEOCODE_CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch {
      return {};
    }
  };

  const saveGeocodingCache = async (cache) => {
    try {
      await AsyncStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
    } catch {}
  };

  const geocodeAddress = async (address, cache) => {
    if (!address) return null;
    const cleanAddress = address.trim();
    if (cache[cleanAddress]) return cache[cleanAddress];
    try {
      const apiKey = "AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ";
      const encoded = encodeURIComponent(cleanAddress);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const loc = data.results[0].geometry.location;
        const coords = { latitude: loc.lat, longitude: loc.lng };
        cache[cleanAddress] = coords;
        return coords;
      }
    } catch {}
    return null;
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateOptimalRegion = (userLoc, list) => {
    if (!userLoc) return { latitude: 17.4375, longitude: 78.4456, latitudeDelta: 0.1, longitudeDelta: 0.1 };
    const valid = list.filter((r) => r.latitude && r.longitude);
    if (!valid.length)
      return { latitude: userLoc.latitude, longitude: userLoc.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    const lats = [userLoc.latitude, ...valid.map((r) => r.latitude)];
    const lngs = [userLoc.longitude, ...valid.map((r) => r.longitude)];
    const minLat = Math.min(...lats),
      maxLat = Math.max(...lats),
      minLng = Math.min(...lngs),
      maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.01),
      longitudeDelta: Math.max((maxLng - minLng) * 1.4, 0.01),
    };
  };

  const handleMarkerPress = (restaurant) => {
    router.push({
      pathname: "/HotelDetails",
      params: { id: restaurant.id, name: restaurant.name || "Restaurant", address: restaurant.address || "" },
    });
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        let userLoc = { latitude: 17.4375, longitude: 78.4456 };
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          userLoc = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        }
        setUserLocation(userLoc);

        const data = await getAllRestaurants();
        const cache = await getGeocodingCache();
        let all = [];

        for (let r of data) {
          let lat = parseFloat(r.latitude);
          let lng = parseFloat(r.longitude);
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            if (r.address) {
              const c = await geocodeAddress(r.address, cache);
              if (c) {
                lat = c.latitude;
                lng = c.longitude;
              }
            }
          }
          if (lat && lng) all.push({ ...r, latitude: lat, longitude: lng });
        }
        await saveGeocodingCache(cache);

        const cleaned = all.filter((r) => r.latitude > 6 && r.latitude < 37 && r.longitude > 68 && r.longitude < 98);
        setRestaurants(cleaned);
        setFilteredRestaurants(cleaned);
      } catch (e) {
        console.log("❌ Error initializing app:", e);
      } finally {
        setLoading(false);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (mapReady && mapRef.current && filteredRestaurants.length > 0) {
      setTimeout(() => {
        mapRef.current.fitToCoordinates(filteredRestaurants, {
          edgePadding: { top: 100, bottom: 100, left: 100, right: 100 },
          animated: true,
        });
      }, 1500);
    }
  }, [filteredRestaurants, mapReady]);

  const openGoogleMaps = (restaurant) => {
    if (!restaurant.latitude || !restaurant.longitude) return;
    const latLng = `${restaurant.latitude},${restaurant.longitude}`;
    const label = restaurant.name || "Restaurant";
    const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url).catch(() => Alert.alert("Error", "Unable to open maps"));
  };

  const handleFilterPress = () => setShowFilter(true);
  const handleFilterModalClose = () => setShowFilter(false);
  const handleFilterSelect = (filter) => {
    if (!filter || !filter.name) return;
    setSearchQuery("");
    setSelectedFilters((prev) => {
      const exists = prev.find((f) => f.name === filter.name);
      return exists ? prev.filter((f) => f.name !== filter.name) : [...prev, filter];
    });
  };

  const handleSearchQueryChange = (q) => {
    setSearchQuery(q);
    if (q && q.trim() !== "") setSelectedFilters([]);
  };

  const handleNavigationPress = () => {
    if (!filteredRestaurants.length) {
      Alert.alert("No restaurants found");
      return;
    }
    if (filteredRestaurants.length === 1) openGoogleMaps(filteredRestaurants[0]);
    else {
      setNavOptions(filteredRestaurants);
      setShowNavModal(true);
    }
  };

  const handleNavSelect = (restaurant) => {
    setShowNavModal(false);
    openGoogleMaps(restaurant);
  };

  const handlePersonTabPress = () => router.push("/user-profile");
  const handleScanPress = () => router.push("/qr-scanner");

  if (Platform.OS === "web") return null;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        showsUserLocation={false}
        showsMyLocationButton={true}
        onMapReady={() => setMapReady(true)}
      >
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={5000}
              strokeColor="#3838FB"
              fillColor="#3838FB22"
              strokeWidth={2}
            />
            <Marker coordinate={userLocation} tracksViewChanges={false}>
              <Image
                source={require("../src/assets/menuva_original.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Marker>
          </>
        )}

        {filteredRestaurants.map((restaurant, index) => {
          const lat = parseFloat(restaurant.latitude);
          const lng = parseFloat(restaurant.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={`restaurant-${restaurant.id || index}`}
              coordinate={{ latitude: lat, longitude: lng }}
              tracksViewChanges={false}
              onPress={() => handleMarkerPress(restaurant)}
            >
              <Image
                source={require("../src/assets/menutha_original.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Marker>
          );
        })}
      </MapView>

      {loading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(255,255,255,0.9)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#6B4EFF" />
          <Text style={{ marginTop: 10 }}>Loading map...</Text>
        </View>
      )}

      <View
        style={{
          position: "absolute",
          top: 50,
          left: 20,
          right: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Pressable
          style={{ backgroundColor: "#fff", borderRadius: 20, padding: 8, elevation: 3 }}
          onPress={handleFilterPress}
        >
          <Image source={require("../assets/images/filter-image.png")} style={{ width: 36, height: 36 }} />
        </Pressable>

        <Pressable
          style={{ backgroundColor: "#3838FB", borderRadius: 24, padding: 10, elevation: 5 }}
          onPress={handleNavigationPress}
        >
          <MaterialIcons name="navigation" size={26} color="#fff" />
        </Pressable>
      </View>

      <FilterModal
        visible={showFilter}
        onClose={handleFilterModalClose}
        onFilterSelect={handleFilterSelect}
        selectedFilters={selectedFilters}
        onClearAll={() => setSelectedFilters([])}
      />

      <Modal visible={showNavModal} transparent animationType="slide" onRequestClose={() => setShowNavModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "80%" }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>Select Restaurant</Text>
            <FlatList
              data={navOptions}
              keyExtractor={(item) => item.id?.toString() || item.name}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleNavSelect(item)} style={{ paddingVertical: 10 }}>
                  <Text style={{ fontSize: 16 }}>{item.name}</Text>
                  <Text style={{ fontSize: 13, color: "#888" }}>{item.address}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setShowNavModal(false)} style={{ marginTop: 16, alignSelf: "flex-end" }}>
              <Text style={{ color: "#6B4EFF", fontWeight: "bold" }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View
        style={{
          position: "absolute",
          bottom: 40,
          left: 20,
          right: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={handlePersonTabPress}
          style={{
            backgroundColor: "#3838FB",
            borderRadius: 16,
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="person" size={22} color="white" />
        </Pressable>

        <Pressable
          onPress={handleScanPress}
          style={{
            backgroundColor: "#3838FB",
            borderRadius: 18,
            width: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "center",
            top: -16,
          }}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={36} color="white" />
        </Pressable>

        <Pressable
          onPress={handleNavigationPress}
          style={{
            backgroundColor: "#3838FB",
            borderRadius: 16,
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="navigation" size={22} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { ...StyleSheet.absoluteFillObject },
  topControls: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  filterButton: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterImage: { width: 36, height: 36, resizeMode: "contain" },
  searchContainer: { flexDirection: "row", alignItems: "center" },
  searchIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 48,
    paddingRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    width: 60,
  },
  searchBarOpen: { width: 280 },
  searchInput: { flex: 1, fontSize: 17, color: "#222", paddingHorizontal: 8, height: 48 },
  searchClear: { padding: 2, marginRight: 2 },
  searchClose: { padding: 2, marginLeft: 2 },
  resultsCounter: {
    position: "absolute",
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    zIndex: 1,
  },
  resultsText: { fontSize: 14, color: "#333", fontWeight: "500" },
  bottomNavigation: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1000,
  },
  navButton: {
    backgroundColor: "#3838FB",
    borderRadius: 16,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    shadowColor: "#3838FB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  navButtonCenter: {
    backgroundColor: "#3838FB",
    borderRadius: 18,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    shadowColor: "#3838FB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    top: -16,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "80%", maxHeight: "80%" },
  modalTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 12 },
  modalItem: { paddingVertical: 10, borderBottomWidth: 1, borderColor: "#eee" },
  modalItemName: { fontSize: 16 },
  modalItemAddress: { fontSize: 13, color: "#888" },
  modalCancel: { marginTop: 12, alignSelf: "flex-end" },
  modalCancelText: { color: "#6B4EFF", fontWeight: "bold" },
  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingContent: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: { marginTop: 10, color: "#666", fontSize: 16, fontWeight: "500" },
  geocodingProgress: { marginTop: 20, alignItems: "center", width: 240 },
  geocodingText: { color: "#666", marginBottom: 8, fontSize: 14 },
  progressBar: { width: "100%", height: 8, backgroundColor: "#E0E0E0", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#6B4EFF", borderRadius: 4 },
});

export default CustomerHomeScreen;
