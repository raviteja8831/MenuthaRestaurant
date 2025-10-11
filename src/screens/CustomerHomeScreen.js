 
import FilterModal from "../Modals/FilterModal";
import React, { useState, useEffect, useRef } from "react";
  
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
// import SearchModal from "../Modals/SearchModal";
import * as Location from "expo-location";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
  useJsApiLoader,
} from "@react-google-maps/api";
import MapView, { Marker as RNMarker, Circle as RNCircle, PROVIDER_GOOGLE } from "react-native-maps";
import { getAllRestaurants } from "../api/restaurantApi";
// import { use } from "react";

// Custom M Marker Component
const CustomMarker = ({ restaurant, isSelected, onPress }) => (
  <Pressable onPress={() => onPress(restaurant)} style={styles.markerContainer}>
    <View style={[styles.markerWrapper, isSelected && styles.markerSelected]}>
      <Text style={[styles.markerText, isSelected && styles.markerTextSelected]}>M</Text>
    </View>
  </Pressable>
);

// Restaurant Tooltip Component
const RestaurantTooltip = ({ restaurant, onClose }) => (
  <View style={styles.tooltip}>
    <Pressable style={styles.tooltipClose} onPress={onClose}>
      <MaterialCommunityIcons name="close" size={16} color="#666" />
    </Pressable>
    <Text style={styles.tooltipTitle}>{restaurant.name}</Text>
    <Text style={styles.tooltipAddress}>{restaurant.address}</Text>
    <Text style={styles.tooltipType}>{restaurant.restaurantType}</Text>
    {restaurant.rating && (
      <View style={styles.tooltipRating}>
        <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
        <Text style={styles.tooltipRatingText}>{restaurant.rating}</Text>
      </View>
    )}
  </View>
);

function CustomerHomeScreen() {
  // Navigation modal state
  const [showNavModal, setShowNavModal] = useState(false);
  const [navOptions, setNavOptions] = useState([]);

  // Map library availability - using react-native-maps directly

  // Tooltip state
  const [selectedRestaurantTooltip, setSelectedRestaurantTooltip] = useState(null);
  // Show all tooltips on load
  const [showAllTooltips, setShowAllTooltips] = useState(true);

  // Helper to open Google Maps directions
  const openGoogleMapsDirections = (restaurant) => {
    if (!restaurant || !userLocation) return;
    const origin = `${userLocation.latitude},${userLocation.longitude}`;
    const dest = `${restaurant.latitude},${restaurant.longitude}`;
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open Google Maps");
    });
  };


  const router = useRouter();
  const [userLocation, setUserLocation] = useState({
    latitude: 17.4375,
    longitude: 78.4456,
  });
  // Search bar animation and focus state
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [cityCenter, setCityCenter] = useState(null);
  const [cityZoom, setCityZoom] = useState(13);
  const [showFilter, setShowFilter] = useState(false);
  // const [showSearch, setShowSearch] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]); // Multi-select
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 17.4375,
    longitude: 78.4456,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Function to calculate optimal map region
  const calculateMapRegion = (userLoc, restaurantList) => {
    // Validate user location
    const hasValidUserLoc = userLoc &&
      typeof userLoc.latitude === 'number' &&
      typeof userLoc.longitude === 'number' &&
      !isNaN(userLoc.latitude) &&
      !isNaN(userLoc.longitude);

    if (!hasValidUserLoc || !restaurantList.length) {
      return {
        latitude: hasValidUserLoc ? userLoc.latitude : 17.4375,
        longitude: hasValidUserLoc ? userLoc.longitude : 78.4456,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    // Filter restaurants with valid coordinates
    const validRestaurants = restaurantList.filter(r =>
      typeof r.latitude === "number" &&
      typeof r.longitude === "number" &&
      !isNaN(r.latitude) &&
      !isNaN(r.longitude)
    );

    if (validRestaurants.length === 0) {
      return {
        latitude: userLoc.latitude,
        longitude: userLoc.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    // Get all coordinates including user location
    const allLatitudes = [userLoc.latitude, ...validRestaurants.map(r => r.latitude)];
    const allLongitudes = [userLoc.longitude, ...validRestaurants.map(r => r.longitude)];

    const minLat = Math.min(...allLatitudes);
    const maxLat = Math.max(...allLatitudes);
    const minLng = Math.min(...allLongitudes);
    const maxLng = Math.max(...allLongitudes);

    const latDelta = (maxLat - minLat) * 1.5; // Add 50% padding
    const lngDelta = (maxLng - minLng) * 1.5; // Add 50% padding

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01), // Minimum zoom level
      longitudeDelta: Math.max(lngDelta, 0.01), // Minimum zoom level
    };
  };

  // Using react-native-maps directly - no dynamic loading needed


  // Only for web: load Google Maps API
  const { isLoaded } =
    Platform.OS === "web"
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useJsApiLoader({
          googleMapsApiKey: "AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ",
        })
      : { isLoaded: true };
  // Navigation button handler (must be after filteredRestaurants is defined)
  const handleNavigationPress = () => {
    if (!filteredRestaurants.length) {
      Alert.alert("No restaurants found", "No filtered restaurants to navigate to.");
      return;
    }
    if (filteredRestaurants.length === 1) {
      openGoogleMapsDirections(filteredRestaurants[0]);
      return;
    }
    // Multiple: show modal to pick
    setNavOptions(filteredRestaurants);
    setShowNavModal(true);
  };

  // Handler for selecting a restaurant in nav modal
  const handleNavSelect = (restaurant) => {
    setShowNavModal(false);
    openGoogleMapsDirections(restaurant);
  };
  // Get user location and fetch restaurants on mount
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        const newUserLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        console.log('📍 Got user location:', newUserLocation);
        setUserLocation(newUserLocation);
        // Reverse geocode to get city and center
        try {
          const apiKey = "AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ";
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${apiKey}`;
          const resp = await fetch(url);
          const json = await resp.json();
          if (json.status === "OK" && json.results.length > 0) {
            const cityComp = json.results[0].address_components.find((c) => c.types.includes("locality"));
            const city = cityComp ? cityComp.long_name : null;
            if (city) {
              // Get city center by geocoding city name
              const cityUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`;
              const cityResp = await fetch(cityUrl);
              const cityJson = await cityResp.json();
              if (cityJson.status === "OK" && cityJson.results.length > 0) {
                const loc = cityJson.results[0].geometry.location;
                setCityCenter({ latitude: loc.lat, longitude: loc.lng });
                setCityZoom(12); // City-level zoom
              }
            }
          }
        } catch (_e) {}
      } catch (_e) {
        // Use default location
      }
      try {
        let data = await getAllRestaurants();
        console.log('🍽️ Fetched restaurants from API:', data.length);
        if (data.length > 0) {
          console.log('🍽️ Sample restaurant data:', {
            name: data[0].name,
            lat: data[0].lat,
            lng: data[0].lng,
            latitude: data[0].latitude,
            longitude: data[0].longitude,
            address: data[0].address
          });
        }
        // For restaurants missing lat/lng, fetch from address
        const geocodeAddress = async (address) => {
          if (!address) {
            console.log('⚠️ No address provided for geocoding');
            return null;
          }
          try {
            const apiKey = "AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ";
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
            console.log('🌍 Geocoding address:', address);
            const resp = await fetch(url);
            const json = await resp.json();
            console.log('🌍 Geocoding response status:', json.status);
            if (json.status === "OK" && json.results.length > 0) {
              const loc = json.results[0].geometry.location;
              console.log('✅ Geocoded successfully:', { address, lat: loc.lat, lng: loc.lng });
              return { latitude: loc.lat, longitude: loc.lng };
            } else if (json.status === "OVER_QUERY_LIMIT") {
              console.error('❌ Google Maps API quota exceeded');
            } else if (json.status === "ZERO_RESULTS") {
              console.warn('⚠️ No results found for address:', address);
            } else {
              console.warn('⚠️ Geocoding failed:', json.status, 'for address:', address);
            }
          } catch (err) {
            console.error('❌ Geocoding error:', err.message);
          }
          return null;
        };
        // Map and update missing lat/lng
        const updated = await Promise.all(
          data.map(async (r) => {
            // Check if restaurant has valid coordinates (either as latitude/longitude OR lat/lng)
            let hasValidCoords = false;
            let restaurantData = { ...r };

            // First, check if lat/lng exists and convert to latitude/longitude
            if (typeof r.lat === "number" && typeof r.lng === "number" && r.lat !== 0 && r.lng !== 0) {
              restaurantData.latitude = r.lat;
              restaurantData.longitude = r.lng;
              hasValidCoords = true;
            }
            // Check if latitude/longitude already exists
            else if (
              typeof r.latitude === "number" &&
              typeof r.longitude === "number" &&
              !isNaN(r.latitude) &&
              !isNaN(r.longitude) &&
              r.latitude !== 0 &&
              r.longitude !== 0
            ) {
              hasValidCoords = true;
            }

            // If no valid coords, try geocoding the address
            if (!hasValidCoords) {
              const coords = await geocodeAddress(r.address);
              if (coords) {
                restaurantData.latitude = coords.latitude;
                restaurantData.longitude = coords.longitude;
              }
            }

            return restaurantData;
          })
        );
        console.log('🍽️ Updated restaurants after geocoding:', updated.length);
        const withCoords = updated.filter(r => r.latitude && r.longitude && r.latitude !== 0 && r.longitude !== 0);
        console.log('🍽️ Restaurants with valid coordinates after processing:', withCoords.length);
        if (withCoords.length > 0) {
          console.log('🍽️ Sample updated restaurant:', {
            name: withCoords[0].name,
            latitude: withCoords[0].latitude,
            longitude: withCoords[0].longitude
          });
        }
        setRestaurants(updated);


      } catch (_e) {
        setRestaurants([]);
      }
      setLoading(false);
    })();
  }, []);

  // Advanced filtering logic
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    if (
      typeof lat1 !== "number" ||
      typeof lon1 !== "number" ||
      typeof lat2 !== "number" ||
      typeof lon2 !== "number"
    )
      return Infinity;
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  const filteredRestaurants = restaurants.filter((r) => {
    // Only include restaurants with valid lat/lng for 'Near Me' and distance-based filters
    const hasValidLatLng =
      typeof r.latitude === "number" &&
      typeof r.longitude === "number" &&
      !isNaN(r.latitude) &&
      !isNaN(r.longitude);

    // Search filter (case-insensitive, matches name/address/restaurantType)
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
    // All selected filters must match (AND logic)
    return selectedFilters.every((f) => {
      const filterName = f.name;
      if (filterName === "Near Me") {
        if (!hasValidLatLng) return false;
        // Show within 5km radius
        const dist = getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          r.latitude,
          r.longitude
        );
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
      // fallback: show all
      return true;
    });
  });

  // Update map region when user city center changes (prefer city, fallback to user)
  useEffect(() => {
    let region;
    if (cityCenter && typeof cityCenter.latitude === 'number' && typeof cityCenter.longitude === 'number') {
      region = {
        latitude: cityCenter.latitude,
        longitude: cityCenter.longitude,
        latitudeDelta: 0.18, // city-level zoom
        longitudeDelta: 0.18,
      };
      setMapRegion(region);
      console.log('🗺️ Updated map region centered on city:', region);
    } else if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
      region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(region);
      console.log('🗺️ Updated map region centered on user:', region);
    } else {
      region = {
        latitude: 17.4375,
        longitude: 78.4456,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(region);
      console.log('🗺️ Using default map region:', region);
    }
  }, [cityCenter, userLocation]);

  // Debug: log map-related data after restaurants are loaded
  useEffect(() => {
    if (!loading) {
      const validRestaurants = restaurants.filter(r =>
        typeof r.latitude === "number" &&
        typeof r.longitude === "number" &&
        !isNaN(r.latitude) &&
        !isNaN(r.longitude)
      );
      console.log('🗺️ Total restaurants loaded:', restaurants.length);
      console.log('🗺️ Restaurants with valid coordinates:', validRestaurants.length);
      console.log('🗺️ Filtered restaurants (after search/filter):', filteredRestaurants.length);

      if (validRestaurants.length > 0) {
        console.log('🗺️ Sample restaurant coordinates:', {
          name: validRestaurants[0].name,
          lat: validRestaurants[0].latitude,
          lng: validRestaurants[0].longitude
        });
      }
    }
  }, [loading, restaurants, filteredRestaurants]);
  // Handlers
  const handleFilterPress = () => setShowFilter(true);
  // const handleSearchPress = () => setShowSearch(true);
  const handleFilterSelect = (filter) => {
    setSearchQuery(""); // Reset search on filter
    setSelectedFilters((prev) => {
      const exists = prev.find((f) => f.name === filter.name);
      if (exists) {
        // Remove if already selected
        return prev.filter((f) => f.name !== filter.name);
      } else {
        // Add new filter
        return [...prev, filter];
      }
    });
  };

  // When filter modal closes, just close
  const handleFilterModalClose = () => {
    setShowFilter(false);
  };

  // When search is typed, reset filters
  const handleSearchQueryChange = (q) => {
    setSearchQuery(q);
    if (q && q.trim() !== "") setSelectedFilters([]);
  };

  // Open search bar and focus input
  const handleOpenSearch = () => {
    setSearchOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // Close search bar and clear input
  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };
  // const handleSearch = (query) => {
  //   setSearchQuery(query);
  //   setShowSearch(false);
  // };

  const handlePersonTabPress = () => router.push("/user-profile");
  const handleScanPress = () => router.push("/qr-scanner");
  useEffect(() => {
    console.log("Selected Restaurant:", selectedRestaurant);
    if (selectedRestaurant && selectedRestaurant?.id) {
      router.push({
        pathname: "/menu-list",
        params: {
          restaurantId: selectedRestaurant ? selectedRestaurant.id : null,
          ishotel: "false",
        },
      });

    }
  },
 [selectedRestaurant, router]);

  // Platform-specific map rendering
  let mapContent = null;
  // Set customer location as center, city restaurants as around him
  let centerForCircle = userLocation;
  let radiusMeters = 3000;
  if (cityCenter && userLocation) {
    // Calculate max distance from user to any restaurant in the city
    const cityRestaurants = restaurants.filter(r =>
      typeof r.latitude === 'number' && typeof r.longitude === 'number' && !isNaN(r.latitude) && !isNaN(r.longitude)
    );
    let maxDist = 0;
    cityRestaurants.forEach(r => {
      const toRad = deg => deg * Math.PI / 180;
      const R = 6371000; // meters
      const dLat = toRad(r.latitude - userLocation.latitude);
      const dLon = toRad(r.longitude - userLocation.longitude);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRad(userLocation.latitude)) * Math.cos(toRad(r.latitude)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const dist = R * c;
      if (dist > maxDist) maxDist = dist;
    });
    radiusMeters = Math.max(3000, maxDist * 1.2); // 1.2x for padding
  } else if (userLocation) {
    centerForCircle = userLocation;
    radiusMeters = 3000;
  } else if (cityCenter) {
    centerForCircle = cityCenter;
    radiusMeters = 6000;
  }

  if (Platform.OS === "web") {
    if (!isLoaded) {
      mapContent = <Text>Loading map...</Text>;
    } else {
      const currentRegion = mapRegion || {
        latitude: userLocation?.latitude || 17.4375,
        longitude: userLocation?.longitude || 78.4456,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      const zoomLevel = Math.max(10, 15 - Math.log2(currentRegion.latitudeDelta * 100));

      mapContent = (
        <GoogleMap
          key={`${currentRegion.latitude}-${currentRegion.longitude}`}
          mapContainerStyle={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: 0,
            borderRadius: 0,
            overflow: "hidden",
          }}
          center={{ lat: currentRegion.latitude, lng: currentRegion.longitude }}
          zoom={zoomLevel}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: false,
          }}
        >
          {/* User marker */}
          <Marker
            position={{
              lat: userLocation.latitude,
              lng: userLocation.longitude,
            }}
            label={"You"}
            icon={{
              url: `data:image/svg+xml,${encodeURIComponent(`
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" fill="#fff" stroke="#6B4EFF" stroke-width="2"/>
                  <circle cx="24" cy="20" r="10" fill="#6B4EFF"/>
                  <ellipse cx="24" cy="36" rx="12" ry="5" fill="#E0E7FF"/>
                  <text x="24" y="25" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="13" font-weight="bold">You</text>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(48, 48),
              anchor: new window.google.maps.Point(24, 24),
            }}
          />
          {/* Dynamic perimeter/circle */}
          <Circle
            center={{
              lat: (centerForCircle && centerForCircle.latitude) || userLocation.latitude,
              lng: (centerForCircle && centerForCircle.longitude) || userLocation.longitude,
            }}
            radius={radiusMeters}
            options={{
              fillColor: '#3838FB22',
              strokeColor: '#3838FB',
              strokeOpacity: 0.7,
              strokeWeight: 2,
            }}
          />
          {/* Restaurant markers and tooltips */}
          {filteredRestaurants
            .filter(r => typeof r.latitude === "number" && typeof r.longitude === "number" && !isNaN(r.latitude) && !isNaN(r.longitude))
            .map((r) => (
              <Marker
                key={r.id}
                position={{ lat: r.latitude, lng: r.longitude }}
                onClick={() => {
                  router.push({
                    pathname: "/HotelDetails",
                    params: {
                      id: r.id,
                      name: r.name,
                      address: r.address,
                      starRating: r.rating || 0,
                    },
                  });
                }}
                icon={{
                  url: `data:image/svg+xml,${encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#6854FF" stroke="#ffffff" stroke-width="2"/>
                      <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">M</text>
                    </svg>
                  `)}`,
                  scaledSize: new window.google.maps.Size(40, 40),
                  anchor: new window.google.maps.Point(20, 20),
                }}
              >
                {(showAllTooltips || (selectedRestaurantTooltip && selectedRestaurantTooltip.id === r.id)) && (
                  <InfoWindow
                    position={{ lat: r.latitude, lng: r.longitude }}
                    onCloseClick={() => {
                      setSelectedRestaurant(null);
                      setSelectedRestaurantTooltip(null);
                      setShowAllTooltips(false);
                    }}
                  >
                    <div style={{ padding: '8px', minWidth: '200px' }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{r.name}</h3>
                      <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>{r.address}</p>
                      <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>{r.restaurantType}</p>
                      {r.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0' }}>
                          <span style={{ color: '#FFD700', marginRight: '4px' }}>⭐</span>
                          <span style={{ color: '#333', fontSize: '14px' }}>{r.rating}</span>
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
        </GoogleMap>
      );
    }
  } else {
  // Use react-native-maps on native platforms (Android/iOS); web uses @react-google-maps/api
    const currentRegion = mapRegion || {
      latitude: userLocation?.latitude || 17.4375,
      longitude: userLocation?.longitude || 78.4456,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    console.log('🗺️ MAP DEBUG - Platform:', Platform.OS);
    console.log('🗺️ MAP DEBUG - Map region:', JSON.stringify(currentRegion));
    console.log('🗺️ MAP DEBUG - User location:', JSON.stringify(userLocation));
    console.log('🗺️ MAP DEBUG - Total restaurants:', restaurants.length);
    console.log('🗺️ MAP DEBUG - Filtered restaurants:', filteredRestaurants.length);
    const validRestaurantsForMap = filteredRestaurants.filter(r =>
      typeof r.latitude === "number" &&
      typeof r.longitude === "number" &&
      !isNaN(r.latitude) &&
      !isNaN(r.longitude)
    );
    console.log('🗺️ MAP DEBUG - Valid restaurants with coordinates:', validRestaurantsForMap.length);
    console.log('🗺️ MAP DEBUG - PROVIDER_GOOGLE:', PROVIDER_GOOGLE);
    if (validRestaurantsForMap.length > 0) {
      console.log('🗺️ MAP DEBUG - First restaurant sample:', {
        name: validRestaurantsForMap[0].name,
        lat: validRestaurantsForMap[0].latitude,
        lng: validRestaurantsForMap[0].longitude
      });
    }

    mapContent = (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={currentRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        loadingEnabled={true}
        loadingIndicatorColor="#6B4EFF"
        loadingBackgroundColor="#ffffff"
        onMapReady={() => console.log("🗺️ react-native-maps ready")}
        onError={(error) => console.error("🗺️ Map error:", error)}
        onMapLoaded={() => console.log("🗺️ Map loaded successfully")}
      >
          {/* User marker / center marker */}
          <RNMarker
            coordinate={centerForCircle}
            title={cityCenter ? "City" : "You"}
            pinColor={cityCenter ? "#6B4EFF" : "#6B4EFF"}
          >
            {!cityCenter && (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#fff',
                  borderWidth: 2,
                  borderColor: '#6B4EFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 4,
                }}>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#6B4EFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>You</Text>
                  </View>
                  <View style={{
                    position: 'absolute',
                    bottom: 6,
                    left: 4,
                    right: 4,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#E0E7FF',
                    opacity: 0.7,
                  }} />
                </View>
              </View>
            )}
          </RNMarker>

          {/* Circle */}
          <RNCircle
            center={centerForCircle}
            radius={radiusMeters}
            strokeColor="#3838FB"
            fillColor="#3838FB22"
            strokeWidth={2}
          />

          {/* Restaurant markers */}
          {filteredRestaurants
            .filter(r => typeof r.latitude === "number" && typeof r.longitude === "number" && !isNaN(r.latitude) && !isNaN(r.longitude))
            .map((r) => (
              <RNMarker
                key={r.id}
                coordinate={{ latitude: r.latitude, longitude: r.longitude }}
                title={r.name}
                description={`${r.restaurantType || ''} ${r.rating ? `⭐ ${r.rating}` : ''}`}
                onPress={() => {
                  router.push({ pathname: "/HotelDetails", params: { id: r.id, name: r.name, address: r.address, starRating: r.rating || 0 } });
                }}
              >
                <CustomMarker
                  restaurant={r}
                  isSelected={selectedRestaurant && selectedRestaurant.id === r.id}
                  onPress={(restaurant) => {
                    setSelectedRestaurant(restaurant);
                    setSelectedRestaurantTooltip(restaurant);
                    setShowAllTooltips(false);
                  }}
                />
                {(showAllTooltips || (selectedRestaurantTooltip && selectedRestaurantTooltip.id === r.id)) && (
                  <View style={{ position: 'absolute', top: -90, left: -60, width: 180 }}>
                    <RestaurantTooltip
                      restaurant={r}
                      onClose={() => {
                        setSelectedRestaurant(null);
                        setSelectedRestaurantTooltip(null);
                        setShowAllTooltips(false);
                      }}
                    />
                  </View>
                )}
              </RNMarker>
            ))}
      </MapView>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  return (
    <View
      style={Platform.OS === "web" ? styles.fullScreenWeb : styles.container}
    >
      {/* Top Controls */}
      <View style={styles.topControls}>
        <Pressable
          style={styles.gpsIndicator}
          onPress={handleFilterPress}
        >
          <Image
            source={require("../assets/images/filter-image.png")}
            style={styles.filterImage}
          />
        </Pressable>
        {/* Animated Search Bar */}
        <View style={styles.animatedSearchBarContainer}>
          {!searchOpen ? (
            <Pressable style={styles.searchIconButton} onPress={handleOpenSearch}>
              <MaterialIcons name="search" size={28} color="#6B4EFF" />
            </Pressable>
          ) : (
            <View style={[styles.animatedSearchBar, searchOpen && styles.animatedSearchBarOpen]}>
              <MaterialIcons name="search" size={22} color="#6B4EFF" style={{ marginLeft: 10, marginRight: 4 }} />
              <TextInput
                ref={searchInputRef}
                style={styles.animatedSearchInput}
                placeholder="Search your city, area or restaurant"
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={handleSearchQueryChange}
                autoCorrect={false}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
              />
              {searchQuery.length > 0 ? (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  style={styles.animatedSearchClear}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons name="close" size={20} color="#888" />
                </Pressable>
              ) : (
                <Pressable onPress={handleCloseSearch} style={styles.animatedSearchClose}>
                  <MaterialIcons name="close" size={24} color="#6B4EFF" />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Map Area */}
      <View style={styles.mapWebContainer}>
        {mapContent}

        {/* Restaurant Tooltip Overlay for Native Maps */}
        {Platform.OS !== 'web' && selectedRestaurantTooltip && (
          <View style={styles.tooltipOverlay}>
            <RestaurantTooltip
              restaurant={selectedRestaurantTooltip}
              onClose={() => {
                setSelectedRestaurant(null);
                setSelectedRestaurantTooltip(null);
              }}
            />
          </View>
        )}
      </View>

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
        <Pressable
          style={styles.navIconButton}
          onPress={handlePersonTabPress}
        >
          <MaterialIcons name="person" size={22} color="white" />
        </Pressable>

        <Pressable
          style={styles.navIconButtonCenter}
          onPress={handleScanPress}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={36} color="white" />
        </Pressable>

        <Pressable
          style={styles.navIconButton}
          onPress={handleNavigationPress}
        >
          <MaterialIcons name="navigation" size={22} color="white" />
        </Pressable>

        {/* Navigation Modal for multiple restaurants */}
        <Modal
          visible={showNavModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowNavModal(false)}
        >
          <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center' }}>
            <View style={{ backgroundColor:'#fff', borderRadius:12, padding:20, minWidth:280, maxHeight:'70%' }}>
              <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:12 }}>Select Restaurant</Text>
              <FlatList
                data={navOptions}
                keyExtractor={item => item.id?.toString() || item.name}
                renderItem={({item}) => (
                  <Pressable onPress={() => handleNavSelect(item)} style={{ paddingVertical:10, borderBottomWidth:1, borderColor:'#eee' }}>
                    <Text style={{ fontSize:16 }}>{item.name}</Text>
                    <Text style={{ fontSize:13, color:'#888' }}>{item.address}</Text>
                  </Pressable>
                )}
              />
              <Pressable onPress={() => setShowNavModal(false)} style={{ marginTop:16, alignSelf:'flex-end' }}>
                <Text style={{ color:'#6B4EFF', fontWeight:'bold' }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  restaurantListContainer: {
    position: "absolute",
    top: 90,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    padding: 10,
    zIndex: 2,
    maxHeight: 260,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  restaurantListItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  restaurantCuisine: {
    fontSize: 14,
    color: "#666",
  },
  noRestaurantsText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    paddingVertical: 12,
  },
  mapWebContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  fullScreenWeb: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    backgroundColor: "#fff",
    zIndex: 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  mapArea: {
    flex: 1,
    height: 300, // or whatever height you want
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  topControls: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  gpsIndicator: {
    // backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
    /*   shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, */
  },
  filterImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
    fontSize: 36,
  },
  searchButton: {
    display: 'none',
  },
  animatedSearchBarContainer: {
    position: 'absolute',
    top: 10,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'flex-end',
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
  animatedSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 60,
    width: 0,
    height: 48,
    paddingRight: 8,
    paddingLeft: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    transitionProperty: 'width',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'ease',
  },
  animatedSearchBarOpen: {
    width: 340,
    paddingLeft: 8,
  },
  animatedSearchInput: {
    flex: 1,
    fontSize: 17,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 0,
    height: 48,
    outlineStyle: 'none',
  },
  animatedSearchClear: {
    marginRight: 2,
    marginLeft: 2,
    padding: 2,
  },
  animatedSearchClose: {
    marginLeft: 2,
    padding: 2,
  },

  mapNotAvailable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  mapText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  mapSubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  mapSubTextSmall: {
    fontSize: 12,
    color: "#bbb",
    textAlign: "center",
    marginTop: 4,
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
    elevation: 1000,
  },
  navIconButton: {
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
  navIconButtonCenter: {
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
  filterBar: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterInput: {
    fontSize: 16,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f7f7ff",
  },
  bottomNav: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(107, 78, 255, 0.08)",
    paddingVertical: 10,
    borderRadius: 24,
    marginHorizontal: 24,
  },
  navBtn: {
    backgroundColor: "#eae6ff",
    borderRadius: 18,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  navIcon: {
    fontSize: 28,
    color: "#6B4EFF",
    fontWeight: "bold",
  },
  // Custom marker styles
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6854FF',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerSelected: {
    transform: [{ scale: 1.2 }],
    backgroundColor: '#5a47d9',
  },
  markerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  markerTextSelected: {
    fontSize: 18,
  },
  // Tooltip styles
  tooltip: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tooltipClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 1,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    marginRight: 24,
  },
  tooltipAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  tooltipType: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  tooltipRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltipRatingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  tooltipOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});

export default CustomerHomeScreen;
