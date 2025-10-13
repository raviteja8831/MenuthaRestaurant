// CustomerHomeScreen.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Image,
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList,
  Linking,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { getAllRestaurants } from "../api/restaurantApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FilterModal from "../Modals/FilterModal";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const GEOCODE_CACHE_KEY = "restaurant_geocode_cache";
const GOOGLE_GEOCODE_API_KEY = "AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ"; // kept as original

const DEFAULT_CENTER = {
  latitude: 17.4375,
  longitude: 78.4456,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const MAX_ACCEPTABLE_DISTANCE_KM = 500; // keep your lenient cutoff

const CustomerHomeScreen = () => {
  const router = useRouter();
  const searchInputRef = useRef(null);
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [navOptions, setNavOptions] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapRegion, setMapRegion] = useState(DEFAULT_CENTER);

  // --- Geocoding cache helpers ---
  const getGeocodingCache = async () => {
    try {
      const cache = await AsyncStorage.getItem(GEOCODE_CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch (error) {
      console.error("❌ Error reading geocoding cache:", error);
      return {};
    }
  };

  const saveGeocodingCache = async (cache) => {
    try {
      await AsyncStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error("❌ Error saving geocoding cache:", error);
    }
  };

  // --- Geocode single address (returns {latitude, longitude} or null) ---
  const geocodeAddress = async (address, cache) => {
    if (!address || typeof address !== "string") return null;
    const cleanAddress = address.trim();
    if (!cleanAddress) return null;

    if (cache[cleanAddress]) {
      console.log("📦 Using cached coordinates for:", cleanAddress);
      return cache[cleanAddress];
    }

    try {
      const encodedAddress = encodeURIComponent(cleanAddress);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_GEOCODE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const coordinates = { latitude: Number(location.lat), longitude: Number(location.lng) };
        cache[cleanAddress] = coordinates;
        console.log("✅ Geocoded:", cleanAddress, "→", coordinates);
        return coordinates;
      } else {
        console.warn("⚠️ Geocoding failed for:", cleanAddress, "Status:", data.status);
        return null;
      }
    } catch (error) {
      console.error("❌ Geocoding error for:", cleanAddress, error);
      return null;
    }
  };

  // --- Distance util (Haversine) ---
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
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

  // --- Calculate optimal region to fit user + restaurants ---
  const calculateOptimalRegion = (userLoc, restaurantList) => {
    if (!userLoc) return DEFAULT_CENTER;
    if (!restaurantList || restaurantList.length === 0) {
      return {
        latitude: userLoc.latitude,
        longitude: userLoc.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const validRestaurants = restaurantList.filter(
      (r) =>
        r &&
        r.latitude != null &&
        r.longitude != null &&
        !isNaN(Number(r.latitude)) &&
        !isNaN(Number(r.longitude))
    );

    if (validRestaurants.length === 0) {
      return {
        latitude: userLoc.latitude,
        longitude: userLoc.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const allLatitudes = [userLoc.latitude, ...validRestaurants.map((r) => Number(r.latitude))];
    const allLongitudes = [userLoc.longitude, ...validRestaurants.map((r) => Number(r.longitude))];

    const minLat = Math.min(...allLatitudes);
    const maxLat = Math.max(...allLatitudes);
    const minLng = Math.min(...allLongitudes);
    const maxLng = Math.max(...allLongitudes);

    const latDelta = (maxLat - minLat) * 1.4;
    const lngDelta = (maxLng - minLng) * 1.4;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  // --- Filtered restaurants (safe, with detailed logging) ---
  const filteredRestaurants = useMemo(() => {
    if (!Array.isArray(restaurants)) {
      console.warn("⚠️ Restaurants is not an array:", restaurants);
      return [];
    }

    console.log("🔍 Filtering restaurants:", {
      totalRestaurants: restaurants.length,
      searchQuery,
      selectedFilters: Array.isArray(selectedFilters) ? selectedFilters.map((f) => f?.name || "Unknown") : [],
      userLocation: userLocation ? "available" : "missing",
    });

    const filtered = restaurants.filter((r) => {
      if (!r || typeof r !== "object") return false;

      // Normalize coordinates to numbers
      const lat = Number(r.latitude);
      const lng = Number(r.longitude);

      if (r.latitude == null || r.longitude == null || isNaN(lat) || isNaN(lng)) {
        console.log("❌ Filtered out (invalid coords):", r.name, r.latitude, r.longitude);
        return false;
      }

      // Filter out suspicious coordinates > 500km away from user
      if (userLocation) {
        const distance = getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, lat, lng);
        if (distance > MAX_ACCEPTABLE_DISTANCE_KM) {
          console.log("🌍 Filtered out (too far):", r.name, "distance:", distance.toFixed(1), "km");
          return false;
        }
      }

      // Search
      if (searchQuery && searchQuery.trim() !== "") {
        const q = searchQuery.trim().toLowerCase();
        const name = (r.name || "").toLowerCase();
        const address = (r.address || "").toLowerCase();
        const type = (r.restaurantType || "").toLowerCase();
        if (!name.includes(q) && !address.includes(q) && !type.includes(q)) {
          return false;
        }
      }

      // Filters
      if (!Array.isArray(selectedFilters) || selectedFilters.length === 0) {
        return true;
      }

      const passesFilters = selectedFilters.every((f) => {
        if (!f || !f.name) return true;
        const fname = f.name;
        if (fname === "Near Me") {
          if (!userLocation) return false;
          const dist = getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, lat, lng);
          return dist <= 5;
        }
        if (fname === "Only Veg Restaurant") return r.enableVeg === true && r.enableNonveg === false;
        if (fname === "Only Non Veg Restaurant") return r.enableNonveg === true && r.enableVeg === false;
        if (fname === "Only Buffet") return r.enableBuffet === true;
        if (fname === "Only Table Service") return r.enableTableService === true;
        if (fname === "Only Self Service") return r.enableSelfService === true;
        if (fname === "3 Star Hotel") return r.restaurantType && r.restaurantType.toLowerCase().includes("3 star");
        if (fname === "5 Star Hotel") return r.restaurantType && r.restaurantType.toLowerCase().includes("5 star");
        if (fname === "5 Star Rating") return r.rating && r.rating >= 5;
        if (fname === "Only Bar & Restaurant") return r.restaurantType && r.restaurantType.toLowerCase().includes("bar");
        return true;
      });

      return passesFilters;
    });

    console.log("✅ Filtered result:", filtered.length, "restaurants out of", restaurants.length);
    return filtered;
  }, [restaurants, searchQuery, selectedFilters, userLocation]);

  // --- Helper: try to fit map to markers (safe retry) ---
  const tryFitToMarkers = (list) => {
    const coords = list
      .filter((r) => r && r.latitude != null && r.longitude != null)
      .map((r) => ({ latitude: Number(r.latitude), longitude: Number(r.longitude) }));
    // include user location for better framing
    if (userLocation) coords.push({ latitude: userLocation.latitude, longitude: userLocation.longitude });

    if (coords.length === 0) return;

    try {
      if (mapRef.current && typeof mapRef.current.fitToCoordinates === "function") {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 100, bottom: 150, left: 100 },
          animated: true,
        });
        console.log("🗺️ fitToCoordinates called with", coords.length, "points");
      } else if (mapRef.current && typeof mapRef.current.animateToRegion === "function") {
        const region = calculateOptimalRegion(userLocation || DEFAULT_CENTER, list);
        mapRef.current.animateToRegion(region, 1000);
        console.log("🗺️ animateToRegion called", region);
      }
    } catch (e) {
      console.warn("⚠️ Error fitting map to markers:", e);
    }
  };

  // --- Load user location + restaurants + geocoding (preserve original behavior) ---
  useEffect(() => {
    let cancelled = false;

    const initializeApp = async () => {
      try {
        console.log("🚀 Starting app initialization...");
        // Request location
        const locationPromise = (async () => {
          try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
              console.log("❌ Location permission denied - using default");
              return { latitude: DEFAULT_CENTER.latitude, longitude: DEFAULT_CENTER.longitude };
            }
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
              timeout: 10000,
            });
            return { latitude: location.coords.latitude, longitude: location.coords.longitude };
          } catch (locationError) {
            console.log("❌ Error getting location:", locationError);
            return { latitude: DEFAULT_CENTER.latitude, longitude: DEFAULT_CENTER.longitude };
          }
        })();

        // Fetch restaurants
        const restaurantsPromise = (async () => {
          try {
            const data = await getAllRestaurants();
            if (!Array.isArray(data)) {
              console.warn("⚠️ Restaurant API did not return an array - using []");
              return [];
            }
            return data;
          } catch (apiError) {
            console.error("❌ Failed to fetch restaurants:", apiError);
            return [];
          }
        })();

        const [userLoc, restaurantData] = await Promise.all([locationPromise, restaurantsPromise]);

        if (cancelled) return;

        console.log("📊 API Response received:", {
          userLocation: userLoc ? "available" : "null",
          restaurantCount: Array.isArray(restaurantData) ? restaurantData.length : "not array",
        });

        // set user location immediately
        if (userLoc) {
          setUserLocation(userLoc);
          setMapRegion({
            latitude: userLoc.latitude,
            longitude: userLoc.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          // try to animate if map is ready
          if (mapRef.current && mapReady) {
            try {
              mapRef.current.animateToRegion(
                {
                  latitude: userLoc.latitude,
                  longitude: userLoc.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                },
                800
              );
            } catch (e) {
              // ignore
            }
          }
        }

        // Load geocode cache
        const cache = await getGeocodingCache();

        // Separate restaurants with coordinates vs needing geocode
        const restaurantsWithCoords = [];
        const restaurantsNeedingGeocode = [];

        restaurantData.forEach((restaurant) => {
          if (!restaurant || typeof restaurant !== "object") {
            console.warn("⚠️ Invalid restaurant object:", restaurant);
            return;
          }

          // fix booleans possibly stored as numbers
          ["enableBuffet", "enableVeg", "enableNonveg", "enableTableService", "enableSelfService"].forEach((k) => {
            if (typeof restaurant[k] === "number") restaurant[k] = restaurant[k] === 1;
          });

          // try extract / normalize coordinates
          let lat = restaurant.latitude;
          let lng = restaurant.longitude;

          // if coordinates exist as strings, parse
          if (typeof lat === "string") lat = parseFloat(lat);
          if (typeof lng === "string") lng = parseFloat(lng);

          // fallback: maybe lat/lng accidentally in other numeric fields
          if ((!lat || !lng) && restaurant.logoImage && !isNaN(parseFloat(restaurant.logoImage))) {
            lat = parseFloat(restaurant.logoImage);
          }

          // assign back numeric if valid
          if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            restaurant.latitude = Number(lat);
            restaurant.longitude = Number(lng);
            restaurantsWithCoords.push(restaurant);
          } else {
            restaurantsNeedingGeocode.push(restaurant);
          }
        });

        console.log("✅ Restaurants with coordinates:", restaurantsWithCoords.length);
        console.log("🔍 Restaurants needing geocoding:", restaurantsNeedingGeocode.length);

        // Start with known coords
        let allRestaurants = [...restaurantsWithCoords];
        setRestaurants(allRestaurants);

        // Geocode the rest (preserve progress UI)
        if (restaurantsNeedingGeocode.length > 0) {
          console.log("🌍 Starting geocoding process...");
          for (let i = 0; i < restaurantsNeedingGeocode.length; i++) {
            if (cancelled) break;
            const restaurant = restaurantsNeedingGeocode[i];
            const progress = Math.round((i / restaurantsNeedingGeocode.length) * 100);
            setGeocodingProgress(progress);

            if (restaurant.address) {
              const coordinates = await geocodeAddress(restaurant.address, cache);
              if (coordinates) {
                const updatedRestaurant = { ...restaurant, ...coordinates };
                // ensure numeric
                updatedRestaurant.latitude = Number(updatedRestaurant.latitude);
                updatedRestaurant.longitude = Number(updatedRestaurant.longitude);
                allRestaurants.push(updatedRestaurant);
              } else {
                // still push original without coords (will be ignored by filters)
                allRestaurants.push(restaurant);
              }
            } else {
              allRestaurants.push(restaurant);
            }

            // small delay to avoid hitting API too fast (keep like original)
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Save updated cache
          await saveGeocodingCache(cache);
          setGeocodingProgress(100);
        }

        console.log("✅ Final restaurant count with coords (raw):", allRestaurants.length);

        // Final normalized list: ensure all coords numeric (only keep ones that look valid)
        const normalized = allRestaurants.map((r) => {
          const copy = { ...r };
          if (copy.latitude != null) copy.latitude = Number(copy.latitude);
          if (copy.longitude != null) copy.longitude = Number(copy.longitude);
          return copy;
        });
        setRestaurants(normalized);
      } catch (error) {
        console.error("❌ Error initializing app:", error);
      } finally {
        setLoading(false);
        setGeocodingProgress(0);
      }
    };

    initializeApp();

    return () => {
      cancelled = true;
    };
  }, []); // run once

  // --- When filteredRestaurants change, try to fit map (only if userLocation available or mapReady) ---
  useEffect(() => {
    if (filteredRestaurants && filteredRestaurants.length > 0) {
      // Small timeout so markers have a moment to mount – covers Android quirks
      const t = setTimeout(() => {
        tryFitToMarkers(filteredRestaurants);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [filteredRestaurants, userLocation, mapReady]);

  // --- Map onLayout: try to fit once layout is available (covers race conditions on Android) ---
  const onMapLayout = () => {
    // call a short delay to allow MapView internal layout, then fit
    setTimeout(() => {
      if (filteredRestaurants && filteredRestaurants.length > 0) tryFitToMarkers(filteredRestaurants);
    }, 300);
  };

  // --- Marker press navigation ---
  const handleMarkerPress = (restaurant) => {
    try {
      router.push({
        pathname: "/HotelDetails",
        params: {
          id: restaurant.id,
          name: restaurant.name || "Restaurant",
          address: restaurant.address || "",
          starRating: restaurant.rating || 0,
        },
      });
    } catch (routeError) {
      console.error("❌ Router error:", routeError);
    }
  };

  // --- Navigation (open Google Maps) ---
  const openGoogleMapsDirections = (restaurant) => {
    if (!restaurant || restaurant.latitude == null || restaurant.longitude == null) {
      Alert.alert("Error", "Restaurant location not available");
      return;
    }
    const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
    const latLng = `${restaurant.latitude},${restaurant.longitude}`;
    const label = restaurant.name || "Restaurant";
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url).catch(() => Alert.alert("Error", "Unable to open maps"));
  };

  // --- Filter handlers (preserve original behavior) ---
  const handleFilterPress = () => setShowFilter(true);

  const handleFilterSelect = (filter) => {
    if (!filter || !filter.name) {
      console.warn("⚠️ Invalid filter passed to handleFilterSelect:", filter);
      return;
    }
    setSearchQuery("");
    setSelectedFilters((prev) => {
      const exists = prev.find((f) => f?.name === filter.name);
      if (exists) return prev.filter((f) => f?.name !== filter.name);
      return [...prev, filter];
    });
  };

  const handleFilterModalClose = () => setShowFilter(false);

  // --- Search handlers ---
  const handleSearchQueryChange = (q) => {
    setSearchQuery(q);
    if (q && q.trim() !== "") setSelectedFilters([]);
  };

  const handleOpenSearch = () => {
    setSearchOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 100);
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  // --- Navigation modal handlers ---
  const handleNavigationPress = () => {
    if (!filteredRestaurants.length) {
      Alert.alert("No restaurants found", "No filtered restaurants to navigate to.");
      return;
    }
    if (filteredRestaurants.length === 1) {
      openGoogleMapsDirections(filteredRestaurants[0]);
      return;
    }
    setNavOptions(filteredRestaurants);
    setShowNavModal(true);
  };

  const handleNavSelect = (restaurant) => {
    setShowNavModal(false);
    openGoogleMapsDirections(restaurant);
  };

  // Debug rendering logs
  console.log("🎨 CustomerHomeScreen rendering:", {
    loading,
    mapReady,
    userLocation: userLocation ? "available" : "null",
    restaurantsCount: restaurants.length,
    filteredRestaurantsCount: filteredRestaurants.length,
    mapRegion,
  });

  // NO web rendering
  if (Platform.OS === "web") return null;

  // Temporary loading overlay condition (map shows but loading overlay until we have user location)
  const showLoadingOverlay = loading && !userLocation;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={false}
        loadingEnabled={true}
        onMapReady={() => {
          console.log("🗺️ Map ready!");
          setMapReady(true);
          // attempt fit again in case data already available
          if (filteredRestaurants && filteredRestaurants.length > 0) {
            setTimeout(() => tryFitToMarkers(filteredRestaurants), 400);
          }
        }}
        onLayout={onMapLayout}
        onRegionChangeComplete={(region) => {
          // placeholder: you had logging before
          // console.log('🗺️ Map region changed to:', region);
        }}
      >
        {/* User circle & marker */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={5000}
            strokeColor="#3838FB"
            fillColor="#3838FB22"
            strokeWidth={2}
          />
        )}
        {userLocation && (
          <Marker
            key="user-location"
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
            pinColor="blue"
            tracksViewChanges={false}
          />
        )}

        {/* Restaurant markers (render regardless of mapReady) */}
        {filteredRestaurants.map((restaurant, index) => {
          if (!restaurant || restaurant.latitude == null || restaurant.longitude == null) {
            console.log("❌ Skipping marker (missing coords):", restaurant?.name || "Unknown");
            return null;
          }

          const lat = Number(restaurant.latitude);
          const lng = Number(restaurant.longitude);
          if (isNaN(lat) || isNaN(lng)) {
            console.log("❌ Skipping marker (invalid coords):", restaurant.name, restaurant.latitude, restaurant.longitude);
            return null;
          }

          console.log("✅ Rendering marker for:", restaurant.name, "at", lat, lng);

          return (
            <Marker
              key={`restaurant-${restaurant.id || index}`}
              coordinate={{ latitude: lat, longitude: lng }}
              title={restaurant.name || "Restaurant"}
              description={restaurant.address || ""}
              onPress={() => handleMarkerPress(restaurant)}
              pinColor="red"
              tracksViewChanges={false}
            />
          );
        })}
      </MapView>

      {/* Loading overlay */}
      {showLoadingOverlay && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#6B4EFF" />
            <Text style={styles.loadingText}>Loading map and restaurants...</Text>
            {geocodingProgress > 0 && (
              <View style={styles.geocodingProgress}>
                <Text style={styles.geocodingText}>Getting restaurant locations: {geocodingProgress}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${geocodingProgress}%` }]} />
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Top Controls */}
      <View style={styles.topControls}>
        <Pressable style={styles.filterButton} onPress={handleFilterPress}>
          <Image source={require("../assets/images/filter-image.png")} style={styles.filterImage} />
        </Pressable>

        <View style={styles.searchContainer}>
          {!searchOpen ? (
            <Pressable style={styles.searchIconButton} onPress={handleOpenSearch}>
              <MaterialIcons name="search" size={28} color="#6B4EFF" />
            </Pressable>
          ) : (
            <View style={[styles.searchBar, searchOpen && styles.searchBarOpen]}>
              <MaterialIcons name="search" size={22} color="#6B4EFF" style={{ marginLeft: 10, marginRight: 4 }} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search restaurants..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={handleSearchQueryChange}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 ? (
                <Pressable onPress={() => setSearchQuery("")} style={styles.searchClear}>
                  <MaterialIcons name="close" size={20} color="#888" />
                </Pressable>
              ) : (
                <Pressable onPress={handleCloseSearch} style={styles.searchClose}>
                  <MaterialIcons name="close" size={24} color="#6B4EFF" />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Results Counter */}
      {!showFilter && (
        <View style={styles.resultsCounter}>
          <Text style={styles.resultsText}>
            {loading
              ? `Loading restaurants... (${geocodingProgress > 0 ? geocodingProgress + "% geocoded" : "fetching data"})`
              : `${filteredRestaurants.length} restaurant${filteredRestaurants.length !== 1 ? "s" : ""} found`}
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilter}
        onClose={handleFilterModalClose}
        onFilterSelect={handleFilterSelect}
        selectedFilters={selectedFilters}
        onClearAll={() => setSelectedFilters([])}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <Pressable style={styles.navButton} onPress={() => router.push("/user-profile")}>
          <MaterialIcons name="person" size={22} color="white" />
        </Pressable>

        <Pressable style={styles.navButtonCenter} onPress={() => router.push("/qr-scanner")}>
          <MaterialCommunityIcons name="qrcode-scan" size={36} color="white" />
        </Pressable>

        <Pressable style={styles.navButton} onPress={handleNavigationPress}>
          <MaterialIcons name="navigation" size={22} color="white" />
        </Pressable>
      </View>

      {/* Navigation Modal */}
      <Modal visible={showNavModal} transparent animationType="slide" onRequestClose={() => setShowNavModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Restaurant</Text>
            <FlatList
              data={navOptions}
              keyExtractor={(item) => item.id?.toString() || item.name}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleNavSelect(item)} style={styles.modalItem}>
                  <Text style={styles.modalItemName}>{item.name}</Text>
                  <Text style={styles.modalItemAddress}>{item.address}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setShowNavModal(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
