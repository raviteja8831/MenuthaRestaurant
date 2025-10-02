 
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
  useJsApiLoader,
} from "@react-google-maps/api";
import { getAllRestaurants } from "../api/restaurantApi";
// import { use } from "react";

function CustomerHomeScreen() {
  // Navigation modal state
  const [showNavModal, setShowNavModal] = useState(false);
  const [navOptions, setNavOptions] = useState([]);

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
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
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
        // For restaurants missing lat/lng, fetch from address
        const geocodeAddress = async (address) => {
          if (!address) return null;
          try {
            const apiKey = "AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ";
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
            const resp = await fetch(url);
            const json = await resp.json();
            if (json.status === "OK" && json.results.length > 0) {
              const loc = json.results[0].geometry.location;
              return { latitude: loc.lat, longitude: loc.lng };
            }
          } catch (err) {}
          return null;
        };
        // Map and update missing lat/lng
        const updated = await Promise.all(
          data.map(async (r) => {
            if (
              typeof r.latitude === "number" &&
              typeof r.longitude === "number" &&
              !isNaN(r.latitude) &&
              !isNaN(r.longitude)
            ) {
              return r;
            }
            const coords = await geocodeAddress(r.address);
            if (coords) {
              return { ...r, latitude: coords.latitude, longitude: coords.longitude };
            }
            return r;
          })
        );
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

  // Debug: log restaurants and filteredRestaurants after data load
  useEffect(() => {
    if (!loading) {
      console.log('restaurants:', restaurants);
      console.log('filteredRestaurants:', filteredRestaurants);
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
  if (Platform.OS === "web") {
    if (!isLoaded) {
      mapContent = <Text>Loading map...</Text>;
    } else {
      mapContent = (
        <GoogleMap
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
          center={cityCenter ? { lat: cityCenter.latitude, lng: cityCenter.longitude } : { lat: userLocation.latitude, lng: userLocation.longitude }}
          zoom={cityCenter ? cityZoom : 13}
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
            label="You"
          />
          {/* Restaurant markers */}
          {filteredRestaurants
            .filter(r => typeof r.latitude === "number" && typeof r.longitude === "number" && !isNaN(r.latitude) && !isNaN(r.longitude))
            .map((r) => (
              <Marker
                key={r.id}
                position={{ lat: r.latitude, lng: r.longitude }}
                label={r.name}
                onClick={() => setSelectedRestaurant(r)}
                icon={{
                  url: "../assets/images/restaurant-marker.jpeg",
                  scaledSize: new window.google.maps.Size(60, 60),
                }}
                opacity={
                  selectedRestaurant && selectedRestaurant.id === r.id ? 1 : 0.7
                }
              >
                {selectedRestaurant && selectedRestaurant.id === r.id && (
                  <InfoWindow
                    position={{ lat: r.latitude, lng: r.longitude }}
                    onCloseClick={() => setSelectedRestaurant(null)}
                  >
                    <div>
                      <h4>{r.name}</h4>
                      <p>{r.cuisine}</p>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
        </GoogleMap>
      );
    }
  } else {
    let MapView, NativeMarker;
    try {
      const maps = require("expo-maps");
      MapView = maps.MapView;
      NativeMarker = maps.Marker;
    } catch (_e) {
      MapView = null;
      NativeMarker = null;
    }
    mapContent = MapView ? (
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <NativeMarker
          coordinate={userLocation}
          title="You"
          pinColor="#6B4EFF"
        />
        {filteredRestaurants.map((r) => (
          <NativeMarker
            key={r.id}
            coordinate={{ latitude: r.latitude, longitude: r.longitude }}
            title={r.name}
            description={r.cuisine}
            pinColor={
              selectedRestaurant && selectedRestaurant.id === r.id
                ? "#6B4EFF"
                : "#43a047"
            }
            onPress={() => setSelectedRestaurant(r)}
          />
        ))}
      </MapView>
    ) : (
      <Text style={styles.mapText}>Map not available</Text>
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
      <View style={styles.mapWebContainer}>{mapContent}</View>

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
          style={styles.navButton}
          onPress={handlePersonTabPress}
        >
          <MaterialIcons name="person" size={24} color="white" />
        </Pressable>

        <Pressable
          style={[styles.navButton, styles.scanButton]}
          onPress={handleScanPress}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={28} color="white" />
        </Pressable>

        <Pressable style={styles.navButton} onPress={handleNavigationPress}>
          <MaterialIcons name="navigation" size={24} color="white" />
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 0,
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

  mapArea: {
    flex: 1,
    height: 300, // or whatever height you want
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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

  mapText: {
    fontSize: 18,
    color: "#666",
  },
  bottomNavigation: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    // backgroundColor: "#BBBAEF",
    backgroundColor: "#6682b6ff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  scanButton: {
    padding: 20,
    transform: [{ scale: 1.1 }],
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
});

export default CustomerHomeScreen;
