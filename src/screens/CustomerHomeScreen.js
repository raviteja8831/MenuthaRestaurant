import FilterModal from "../Modals/FilterModal";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import MapView, { Marker, Circle } from 'react-native-maps';
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
      const apiKey = "AIzaSyB5P-PTRn7E0xkRlkiHWkjadh3nbT7yu7U";
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

  // Distance calculation (move before useEffect to ensure consistent order)
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
      r => r.latitude && r.longitude && !isNaN(r.latitude) && !isNaN(r.longitude)
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

  // Filter restaurants (useMemo hook)
  const filteredRestaurants = useMemo(() => {
    console.log('🔍 Filtering restaurants:', {
      totalRestaurants: restaurants.length,
      searchQuery: searchQuery,
      selectedFilters: selectedFilters.map(f => f.name),
      userLocation: userLocation ? 'available' : 'missing'
    });

    const filtered = restaurants.filter((r) => {
      // Ensure restaurant has valid coordinates
      if (!r.latitude || !r.longitude || isNaN(r.latitude) || isNaN(r.longitude)) {
        return false;
      }

      // ✅ CRITICAL: Filter out restaurants that are too far from user (likely bad data)
      if (userLocation) {
        const distance = getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          r.latitude,
          r.longitude
        );

        // Filter out restaurants more than 200km away (likely bad coordinates)
        if (distance > 200) {
          console.log('🌍 Excluding distant restaurant:', r.name, 'Distance:', distance.toFixed(2), 'km');
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
          return false;
        }
      }

      if (!selectedFilters.length) return true;

      // Apply filters
      return selectedFilters.every((f) => {
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
    });

    console.log('✅ Filtered result:', filtered.length, 'restaurants');
    return filtered;
  }, [restaurants, searchQuery, selectedFilters, userLocation]);

  // Get user location and restaurants
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');

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

        // Get restaurants
        const restaurantData = await getAllRestaurants();
        console.log('🏪 Fetched restaurants:', restaurantData.length);

        // Load geocoding cache
        const cache = await getGeocodingCache();

        // Separate restaurants that already have coordinates vs those that need geocoding
        const restaurantsWithCoords = [];
        const restaurantsNeedingGeocode = [];

        restaurantData.forEach(restaurant => {
          // ✅ CRITICAL: Add data validation to prevent crashes from corrupted data
          if (!restaurant || typeof restaurant !== 'object') {
            console.warn('⚠️ Invalid restaurant object:', restaurant);
            return;
          }

          // ✅ Fix corrupted boolean fields that come as numbers
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

          // ✅ Fix coordinates that might be in wrong fields or as strings
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

          // ✅ Validate restaurant type field (fix corrupted dates)
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
                // Don't update state incrementally - wait for the end
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
    setSearchQuery("");
    setSelectedFilters((prev) => {
      const exists = prev.find((f) => f.name === filter.name);
      if (exists) {
        return prev.filter((f) => f.name !== filter.name);
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

  // Custom marker component for restaurants
  const CustomRestaurantMarker = ({ restaurant }) => {
    const getMarkerColor = (type) => {
      const lowerType = (type || '').toLowerCase();
      if (lowerType.includes('5 star')) return '#FFD700'; // Gold for 5 star
      if (lowerType.includes('3 star')) return '#C0C0C0'; // Silver for 3 star
      if (lowerType.includes('bar')) return '#8B4513'; // Brown for bars
      if (lowerType.includes('hotel')) return '#FF6B6B'; // Red for hotels
      if (lowerType.includes('restaurant')) return '#4ECDC4'; // Teal for restaurants
      return '#6B4EFF'; // Default purple
    };

    const getMarkerIcon = (type) => {
      const lowerType = (type || '').toLowerCase();
      if (lowerType.includes('hotel')) return '🏨';
      if (lowerType.includes('bar')) return '🍺';
      if (lowerType.includes('restaurant')) return '🍽️';
      return '🏪'; // Default
    };

    const markerColor = getMarkerColor(restaurant.restaurantType);
    const markerIcon = getMarkerIcon(restaurant.restaurantType);

    return (
      <View style={styles.customMarkerContainer}>
        <View style={[styles.customMarker, { backgroundColor: markerColor }]}>
          <Text style={styles.customMarkerIcon}>{markerIcon}</Text>
        </View>
        <View style={[styles.markerShadow, { backgroundColor: markerColor + '30' }]} />
      </View>
    );
  };

  // ✅ Handle web rendering AFTER all hooks are called
  if (Platform.OS === 'web') {
    return null;
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6B4EFF" />
        <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>
          Loading map and restaurants...
        </Text>
        {geocodingProgress > 0 && (
          <View style={styles.geocodingProgress}>
            <Text style={{ color: '#666', marginBottom: 8 }}>
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
        {(userLocation || loading) && (
          <Circle
            center={userLocation || defaultUserLocation}
            radius={5000}
            strokeColor="#3838FB"
            fillColor="#3838FB22"
            strokeWidth={2}
          />
        )}

        {/* User Location Marker - Show default initially, then real location */}
        <Marker
          identifier="user-location"
          coordinate={userLocation || defaultUserLocation}
          title={userLocation ? "Your Location" : "Loading Your Location..."}
          description={userLocation ? "This is where you are" : "Getting your current location"}
          pinColor={userLocation ? "blue" : "orange"}
        />

        {/* Restaurant Markers - Show default markers while loading, then real data */}
        {(loading ? defaultRestaurants : filteredRestaurants).map((restaurant, index) => {
          // ✅ CRITICAL: Add safety checks to prevent crashes
          if (!restaurant || !restaurant.id) {
            console.warn('⚠️ Invalid restaurant in markers:', restaurant);
            return null;
          }

          const lat = parseFloat(restaurant.latitude);
          const lng = parseFloat(restaurant.longitude);

          if (isNaN(lat) || isNaN(lng)) {
            console.warn('⚠️ Invalid coordinates for restaurant:', restaurant.name, lat, lng);
            return null;
          }

          const isDefaultMarker = restaurant.id.startsWith('default-');
          console.log(`🏪 Rendering ${isDefaultMarker ? 'default' : 'real'} marker ${index + 1}:`, restaurant.name, lat, lng);

          return (
            <Marker
              key={`restaurant-${restaurant.id}-${index}`}
              identifier={`restaurant-${restaurant.id}`}
              coordinate={{
                latitude: lat,
                longitude: lng,
              }}
              title={restaurant.name || 'Restaurant'}
              description={restaurant.address || 'Restaurant location'}
              pinColor={isDefaultMarker ? "yellow" : "red"}
              onPress={() => {
                console.log('🏪 Restaurant marker pressed:', restaurant.name);
                if (isDefaultMarker) {
                  console.log('⏳ Default marker pressed - data still loading');
                  return;
                }
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
              }}
            />
          );
        }).filter(Boolean)}

        {/* Debug: Show total markers count - only when not loading and no results */}
        {!loading && filteredRestaurants.length === 0 && (
          <Marker
            coordinate={userLocation || { latitude: 17.4375, longitude: 78.4456 }}
            title="No Restaurants Found"
            description="Try adjusting your filters"
          >
            <View style={styles.debugMarker}>
              <Text style={styles.debugText}>❌</Text>
            </View>
          </Marker>
        )}
      </MapView>

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
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    backgroundColor: '#6B4EFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    fontSize: 16,
    color: 'white',
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
  // Geocoding progress styles
  geocodingProgress: {
    marginTop: 20,
    alignItems: 'center',
    width: '80%',
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
  // Custom marker styles
  customMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  customMarkerIcon: {
    fontSize: 20,
    textAlign: 'center',
  },
  markerShadow: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.3,
  },
  // Simple marker styles for debugging
  simpleMarker: {
    backgroundColor: '#FF4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  simpleMarkerText: {
    fontSize: 16,
    color: 'white',
  },
  debugMarker: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  debugText: {
    fontSize: 20,
    color: 'white',
  },
});

export default CustomerHomeScreen;