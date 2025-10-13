import FilterModal from "../Modals/FilterModal";
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
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { getAllRestaurants } from "../api/restaurantApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CustomerHomeScreen = () => {
  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
  const router = useRouter();
  const searchInputRef = useRef(null);
  const mapRef = useRef(null);

  // State
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
  const [mapRegion, setMapRegion] = useState({
    latitude: 17.4375,
    longitude: 78.4456,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // Geocoding cache functions
  const GEOCODE_CACHE_KEY = 'restaurant_geocode_cache';

  const getGeocodingCache = async () => {
    try {
      const cache = await AsyncStorage.getItem(GEOCODE_CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch (error) {
      console.error('❌ Error reading geocoding cache:', error);
      return {};
    }
  };

  const saveGeocodingCache = async (cache) => {
    try {
      await AsyncStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('❌ Error saving geocoding cache:', error);
    }
  };

  // Geocode address to lat/lng
  const geocodeAddress = async (address, cache) => {
    if (!address || typeof address !== 'string') return null;

    const cleanAddress = address.trim();
    if (!cleanAddress) return null;

    // Check cache first
    if (cache[cleanAddress]) {
      console.log('📦 Using cached coordinates for:', cleanAddress);
      return cache[cleanAddress];
    }

    try {
      const apiKey = "AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ";
      const encodedAddress = encodeURIComponent(cleanAddress);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const coordinates = {
          latitude: location.lat,
          longitude: location.lng
        };

        // Cache the result
        cache[cleanAddress] = coordinates;
        console.log('✅ Geocoded:', cleanAddress, '→', coordinates);
        return coordinates;
      } else {
        console.log('⚠️ Geocoding failed for:', cleanAddress, 'Status:', data.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Geocoding error for:', cleanAddress, error);
      return null;
    }
  };

  // Distance calculation
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate optimal region to fit user and restaurants
  const calculateOptimalRegion = (userLoc, restaurantList) => {
    if (!userLoc) {
      return {
        latitude: 17.4375,
        longitude: 78.4456,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    if (!restaurantList || restaurantList.length === 0) {
      return {
        latitude: userLoc.latitude,
        longitude: userLoc.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    // Filter valid restaurant coordinates
    const validRestaurants = restaurantList.filter(
      r => r && r.latitude && r.longitude && !isNaN(r.latitude) && !isNaN(r.longitude)
    );

    if (validRestaurants.length === 0) {
      return {
        latitude: userLoc.latitude,
        longitude: userLoc.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    // Get all coordinates (user + restaurants)
    const allLatitudes = [userLoc.latitude, ...validRestaurants.map(r => r.latitude)];
    const allLongitudes = [userLoc.longitude, ...validRestaurants.map(r => r.longitude)];

    const minLat = Math.min(...allLatitudes);
    const maxLat = Math.max(...allLatitudes);
    const minLng = Math.min(...allLongitudes);
    const maxLng = Math.max(...allLongitudes);

    const latDelta = (maxLat - minLat) * 1.4; // Add padding
    const lngDelta = (maxLng - minLng) * 1.4;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01), // Minimum zoom level
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  // Filter restaurants with safe useMemo
  const filteredRestaurants = useMemo(() => {
    if (!Array.isArray(restaurants)) {
      console.warn('⚠️ Restaurants is not an array:', restaurants);
      return [];
    }

    console.log('🔍 Filtering restaurants:', {
      totalRestaurants: restaurants.length,
      searchQuery: searchQuery,
      selectedFilters: Array.isArray(selectedFilters) ? selectedFilters.map(f => f?.name || 'Unknown Filter') : [],
      userLocation: userLocation ? 'available' : 'missing'
    });

    const filtered = restaurants.filter((r) => {
      // Ensure restaurant is a valid object
      if (!r || typeof r !== 'object') {
        console.log('❌ Filtered out: Invalid object');
        return false;
      }

      // Ensure restaurant has valid coordinates
      const lat = parseFloat(r.latitude);
      const lng = parseFloat(r.longitude);

      if (!r.latitude || !r.longitude || isNaN(lat) || isNaN(lng)) {
        console.log('❌ Filtered out:', r.name, '- Invalid coordinates:', r.latitude, r.longitude);
        return false;
      }

      // Allow coordinates of 0,0 in case some restaurants have them
      // but warn about suspicious coordinates
      if (lat === 0 && lng === 0) {
        console.log('⚠️  Warning:', r.name, '- Has coordinates at 0,0');
      }

      // Filter out restaurants that are too far from user (likely bad data)
      if (userLocation) {
        const distance = getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          lat,
          lng
        );

        // Filter out restaurants more than 500km away (likely bad coordinates)
        // Increased from 200km to be more lenient
        if (distance > 500) {
          console.log('🌍 Filtered out:', r.name, '- Too far:', distance.toFixed(2), 'km');
          return false;
        }
      }

      // Search filter
      if (searchQuery && searchQuery.trim() !== "") {
        const q = searchQuery.trim().toLowerCase();
        const name = (r.name || "").toLowerCase();
        const address = (r.address || "").toLowerCase();
        const type = (r.restaurantType || "").toLowerCase();
        if (!name.includes(q) && !address.includes(q) && !type.includes(q)) {
          console.log('🔍 Filtered out:', r.name, '- Doesn\'t match search query:', q);
          return false;
        }
      }

      if (!Array.isArray(selectedFilters) || !selectedFilters.length) {
        console.log('✅ Including:', r.name, '- No filters applied');
        return true;
      }

      // Apply filters
      const passesFilters = selectedFilters.every((f) => {
        if (!f || !f.name) {
          console.warn('⚠️ Invalid filter object:', f);
          return true; // Skip invalid filters
        }
        const filterName = f.name;
        console.log('🔍 Applying filter:', filterName, 'to restaurant:', r.name);

        if (filterName === "Near Me") {
          if (!userLocation) return false;
          const dist = getDistanceFromLatLonInKm(
            userLocation.latitude,
            userLocation.longitude,
            r.latitude,
            r.longitude
          );
          console.log('📍 Distance to', r.name, ':', dist.toFixed(2), 'km');
          return dist <= 5;
        }
        if (filterName === "Only Veg Restaurant") return r.enableVeg === true && r.enableNonveg === false;
        if (filterName === "Only Non Veg Restaurant") return r.enableNonveg === true && r.enableVeg === false;
        if (filterName === "Only Buffet") return r.enableBuffet === true;
        if (filterName === "Only Table Service") return r.enableTableService === true;
        if (filterName === "Only Self Service") return r.enableSelfService === true;
        if (filterName === "3 Star Hotel") return r.restaurantType && r.restaurantType.toLowerCase().includes("3 star");
        if (filterName === "5 Star Hotel") return r.restaurantType && r.restaurantType.toLowerCase().includes("5 star");
        if (filterName === "5 Star Rating") return r.rating && r.rating >= 5;
        if (filterName === "Only Bar & Restaurant") return r.restaurantType && r.restaurantType.toLowerCase().includes("bar");
        return true;
      });

      if (passesFilters) {
        console.log('✅ Including:', r.name);
      } else {
        console.log('❌ Filtered out:', r.name, '- Didn\'t pass filters');
      }

      return passesFilters;
    });

    console.log('✅ Filtered result:', filtered.length, 'restaurants out of', restaurants.length);
    filtered.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} at [${r.latitude}, ${r.longitude}]`);
    });
    return filtered;
  }, [restaurants, searchQuery, selectedFilters, userLocation]);

  // Handle marker press - simplified
  const handleMarkerPress = (restaurant) => {
    console.log('🏪 Restaurant marker pressed:', restaurant.name);

    try {
      router.push({
        pathname: "/HotelDetails",
        params: {
          id: restaurant.id,
          name: restaurant.name || 'Restaurant',
          address: restaurant.address || '',
          starRating: restaurant.rating || 0,
        },
      });
    } catch (routeError) {
      console.error('❌ Router error:', routeError);
    }
  };

  // Get user location and restaurants - async loading
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');

        // Start both location and restaurant fetch in parallel
        const locationPromise = (async () => {
          try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
              console.log('❌ Location permission denied');
              // Use default location (Hyderabad) if permission denied
              return {
                latitude: 17.4375,
                longitude: 78.4456,
              };
            }

            let location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
              timeout: 10000, // 10 second timeout
            });

            return {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
          } catch (locationError) {
            console.log('❌ Error getting location:', locationError);
            // Use default location if GPS fails
            return {
              latitude: 17.4375,
              longitude: 78.4456,
            };
          }
        })();

        const restaurantsPromise = (async () => {
          try {
            const data = await getAllRestaurants();
            console.log('🏪 Restaurant API response type:', typeof data, Array.isArray(data) ? 'array' : 'not array');
            return data;
          } catch (apiError) {
            console.error('❌ Failed to fetch restaurants:', apiError);
            return []; // Return empty array on error
          }
        })();

        // Wait for both to complete
        const [userLoc, restaurantData] = await Promise.all([locationPromise, restaurantsPromise]);

        console.log('📊 API Response received:', {
          userLocation: userLoc ? 'available' : 'null',
          restaurantCount: Array.isArray(restaurantData) ? restaurantData.length : 'not array',
          restaurantDataType: typeof restaurantData,
          firstRestaurantSample: restaurantData?.[0] ? {
            name: restaurantData[0].name,
            latitude: restaurantData[0].latitude,
            longitude: restaurantData[0].longitude,
            hasCoordinates: !!(restaurantData[0].latitude && restaurantData[0].longitude)
          } : 'no restaurants'
        });

        // Set user location
        if (userLoc) {
          console.log('📍 User location:', userLoc);
          setUserLocation(userLoc);

          // Force immediate map centering on user location
          const userRegion = {
            latitude: userLoc.latitude,
            longitude: userLoc.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setMapRegion(userRegion);
          console.log('🗺️ Force centering map on user location immediately');

          if (mapRef.current) {
            mapRef.current.animateToRegion(userRegion, 1000);
          }
        }

        console.log('🏪 Fetched restaurants:', restaurantData.length);

        // Load geocoding cache
        const cache = await getGeocodingCache();

        // Separate restaurants that already have coordinates vs those that need geocoding
        const restaurantsWithCoords = [];
        const restaurantsNeedingGeocode = [];

        if (Array.isArray(restaurantData)) {
          restaurantData.forEach(restaurant => {
            // Add data validation to prevent crashes from corrupted data
            if (!restaurant || typeof restaurant !== 'object') {
              console.warn('⚠️ Invalid restaurant object:', restaurant);
              return;
            }

            // Fix corrupted boolean fields that come as numbers
            if (typeof restaurant.enableBuffet === 'number') {
              restaurant.enableBuffet = restaurant.enableBuffet === 1;
            }
            if (typeof restaurant.enableVeg === 'number') {
              restaurant.enableVeg = restaurant.enableVeg === 1;
            }
            if (typeof restaurant.enableNonveg === 'number') {
              restaurant.enableNonveg = restaurant.enableNonveg === 1;
            }
            if (typeof restaurant.enableTableService === 'number') {
              restaurant.enableTableService = restaurant.enableTableService === 1;
            }
            if (typeof restaurant.enableSelfService === 'number') {
              restaurant.enableSelfService = restaurant.enableSelfService === 1;
            }

            // Fix coordinates that might be in wrong fields or as strings
            let lat = restaurant.latitude;
            let lng = restaurant.longitude;

            // Check if coordinates are accidentally stored in other fields
            if (!lat && restaurant.logoImage && !isNaN(parseFloat(restaurant.logoImage))) {
              lat = parseFloat(restaurant.logoImage);
              console.log('📍 Found latitude in logoImage field:', lat);
            }

            // Convert string coordinates to numbers
            if (typeof lat === 'string') lat = parseFloat(lat);
            if (typeof lng === 'string') lng = parseFloat(lng);

            // Validate restaurant type field (fix corrupted dates)
            if (restaurant.restaurantType && restaurant.restaurantType.includes('2025')) {
              restaurant.restaurantType = 'Restaurant'; // Default fallback
              console.log('⚠️ Fixed corrupted restaurantType for:', restaurant.name);
            }

            if (lat && lng && typeof lat === 'number' && typeof lng === 'number' &&
                !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
              restaurant.latitude = lat;
              restaurant.longitude = lng;
              restaurantsWithCoords.push(restaurant);
            } else {
              restaurantsNeedingGeocode.push(restaurant);
            }
          });
        }

        console.log('✅ Restaurants with coordinates:', restaurantsWithCoords.length);
        console.log('🔍 Restaurants needing geocoding:', restaurantsNeedingGeocode.length);

        // Start with restaurants that already have coordinates
        let allRestaurants = [...restaurantsWithCoords];
        setRestaurants(allRestaurants);

        // Geocode restaurants that need it
        if (restaurantsNeedingGeocode.length > 0) {
          console.log('🌍 Starting geocoding process...');

          for (let i = 0; i < restaurantsNeedingGeocode.length; i++) {
            const restaurant = restaurantsNeedingGeocode[i];
            const progress = Math.round((i / restaurantsNeedingGeocode.length) * 100);
            setGeocodingProgress(progress);

            if (restaurant.address) {
              const coordinates = await geocodeAddress(restaurant.address, cache);
              if (coordinates) {
                const updatedRestaurant = { ...restaurant, ...coordinates };
                allRestaurants.push(updatedRestaurant);
              }
            }

            // Small delay to prevent API rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Save updated cache
          await saveGeocodingCache(cache);
          setGeocodingProgress(100);
        }

        console.log('✅ Final restaurant count with coordinates:', allRestaurants.length);

        // Set the final restaurants list only once at the end
        setRestaurants(allRestaurants);

      } catch (error) {
        console.error('❌ Error initializing app:', error);
      } finally {
        setLoading(false);
        setGeocodingProgress(0);
      }
    };

    initializeApp();
  }, []);

  // Update map region when data is ready and map is loaded
  useEffect(() => {
    if (mapReady && mapRef.current && userLocation) {
      // First center on user location
      const userRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      console.log('🗺️ Centering map on user location');
      mapRef.current.animateToRegion(userRegion, 1000);
    }
  }, [mapReady, userLocation]);

  // Update region when filtered restaurants change (but only if map is ready)
  useEffect(() => {
    if (mapReady && mapRef.current && userLocation && filteredRestaurants && filteredRestaurants.length > 0) {
      // Add a delay to let markers render first
      setTimeout(() => {
        const optimalRegion = calculateOptimalRegion(userLocation, filteredRestaurants);
        console.log('🗺️ Updating region for filtered restaurants:', {
          restaurantCount: filteredRestaurants.length,
          newRegion: optimalRegion
        });
        mapRef.current.animateToRegion(optimalRegion, 2000);
      }, 500);
    }
  }, [filteredRestaurants, mapReady, userLocation]);

  // Navigation functions
  const openGoogleMapsDirections = (restaurant) => {
    if (!restaurant || !restaurant.latitude || !restaurant.longitude) {
      Alert.alert("Error", "Restaurant location not available");
      return;
    }

    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q='
    });
    const latLng = `${restaurant.latitude},${restaurant.longitude}`;
    const label = restaurant.name || 'Restaurant';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open maps");
    });
  };

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

  // Filter handlers
  const handleFilterPress = () => setShowFilter(true);

  const handleFilterSelect = (filter) => {
    if (!filter || !filter.name) {
      console.warn('⚠️ Invalid filter passed to handleFilterSelect:', filter);
      return;
    }
    setSearchQuery("");
    setSelectedFilters((prev) => {
      const exists = prev.find((f) => f?.name === filter.name);
      if (exists) {
        return prev.filter((f) => f?.name !== filter.name);
      } else {
        return [...prev, filter];
      }
    });
  };

  const handleFilterModalClose = () => setShowFilter(false);

  // Search handlers
  const handleSearchQueryChange = (q) => {
    setSearchQuery(q);
    if (q && q.trim() !== "") setSelectedFilters([]);
  };

  const handleOpenSearch = () => {
    setSearchOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  // Navigation handlers
  const handlePersonTabPress = () => router.push("/user-profile");
  const handleScanPress = () => router.push("/qr-scanner");

  // ✅ Handle web rendering AFTER all hooks are called
  if (Platform.OS === 'web') {
    return null;
  }

  // Show map immediately with loading overlay instead of blank screen
  const showLoadingOverlay = loading && !userLocation;

  // Debug: Log when rendering
  console.log('🎨 CustomerHomeScreen rendering:', {
    loading,
    mapReady,
    userLocation: userLocation ? 'available' : 'null',
    restaurantsCount: restaurants.length,
    filteredRestaurantsCount: filteredRestaurants.length,
    mapRegion
  });

  return (
    <View style={styles.container}>
      {/* Map with Google Provider */}
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
          console.log('🗺️ Map ready! Current state:', {
            restaurantsCount: restaurants.length,
            filteredRestaurantsCount: filteredRestaurants.length,
            userLocation: userLocation ? 'available' : 'null'
          });
          setMapReady(true);
        }}
        onRegionChangeComplete={(region) => {
          console.log('🗺️ Map region changed to:', region);
        }}
      >
        {/* User Location Circle */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={5000}
            strokeColor="#3838FB"
            fillColor="#3838FB22"
            strokeWidth={2}
          />
        )}

        {/* User Location Marker - Default blue pin */}
        {userLocation && (
          <Marker
            key="user-location"
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
            pinColor="blue"
          />
        )}

        {/* Restaurant Markers - Simple default red pins */}
        {filteredRestaurants.map((restaurant, index) => {
          if (!restaurant || !restaurant.latitude || !restaurant.longitude) {
            console.log('❌ Skipping marker for restaurant:', restaurant?.name || 'Unknown', '- Missing coordinates');
            return null;
          }

          const lat = parseFloat(restaurant.latitude);
          const lng = parseFloat(restaurant.longitude);

          if (isNaN(lat) || isNaN(lng)) {
            console.log('❌ Skipping marker for restaurant:', restaurant.name, '- Invalid coordinates:', lat, lng);
            return null;
          }

          console.log('✅ Rendering marker for:', restaurant.name, 'at', lat, lng);

          return (
            <Marker
              key={`restaurant-${restaurant.id || index}`}
              coordinate={{
                latitude: lat,
                longitude: lng,
              }}
              title={restaurant.name || 'Restaurant'}
              description={restaurant.address || ''}
              onPress={() => handleMarkerPress(restaurant)}
              pinColor="red"
            />
          );
        })}
      </MapView>

      {/* Loading Overlay - Show on top of map */}
      {showLoadingOverlay && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#6B4EFF" />
            <Text style={styles.loadingText}>
              Loading map and restaurants...
            </Text>
            {geocodingProgress > 0 && (
              <View style={styles.geocodingProgress}>
                <Text style={styles.geocodingText}>
                  Getting restaurant locations: {geocodingProgress}%
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${geocodingProgress}%` }]}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Top Controls */}
      <View style={styles.topControls}>
        <Pressable style={styles.filterButton} onPress={handleFilterPress}>
          <Image
            source={require("../assets/images/filter-image.png")}
            style={styles.filterImage}
          />
        </Pressable>

        {/* Search Bar */}
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

      {/* Results Counter - Hidden when filter modal is open */}
      {!showFilter && (
        <View style={styles.resultsCounter}>
          <Text style={styles.resultsText}>
            {loading
              ? `Loading restaurants... (${geocodingProgress > 0 ? geocodingProgress + '% geocoded' : 'fetching data'})`
              : `${filteredRestaurants.length} restaurant${filteredRestaurants.length !== 1 ? 's' : ''} found`
            }
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
        <Pressable style={styles.navButton} onPress={handlePersonTabPress}>
          <MaterialIcons name="person" size={22} color="white" />
        </Pressable>

        <Pressable style={styles.navButtonCenter} onPress={handleScanPress}>
          <MaterialCommunityIcons name="qrcode-scan" size={36} color="white" />
        </Pressable>

        <Pressable style={styles.navButton} onPress={handleNavigationPress}>
          <MaterialIcons name="navigation" size={22} color="white" />
        </Pressable>
      </View>

      {/* Navigation Modal */}
      <Modal
        visible={showNavModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNavModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Restaurant</Text>
            <FlatList
              data={navOptions}
              keyExtractor={item => item.id?.toString() || item.name}
              renderItem={({item}) => (
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
  filterImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 48,
    paddingRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    width: 60,
  },
  searchBarOpen: {
    width: 280,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#222',
    paddingHorizontal: 8,
    height: 48,
  },
  searchClear: {
    padding: 2,
    marginRight: 2,
  },
  searchClose: {
    padding: 2,
    marginLeft: 2,
  },
  resultsCounter: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  resultsText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
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
    backgroundColor: '#3838FB',
    borderRadius: 16,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#3838FB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  navButtonCenter: {
    backgroundColor: '#3838FB',
    borderRadius: 18,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#3838FB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    top: -16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    maxHeight: '70%',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  modalItemName: {
    fontSize: 16,
  },
  modalItemAddress: {
    fontSize: 13,
    color: '#888',
  },
  modalCancel: {
    marginTop: 16,
    alignSelf: 'flex-end',
  },
  modalCancelText: {
    color: '#6B4EFF',
    fontWeight: 'bold',
  },
  // Loading overlay styles
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  // Geocoding progress styles
  geocodingProgress: {
    marginTop: 20,
    alignItems: 'center',
    width: 240,
  },
  geocodingText: {
    color: '#666',
    marginBottom: 8,
    fontSize: 14,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B4EFF',
    borderRadius: 4,
  },
});

export default CustomerHomeScreen;