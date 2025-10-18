import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CustomerHome } from "../Mock/CustomerHome";

const { height } = Dimensions.get("window");

// Distance calculation helper
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
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

export default function FilterModal({ visible, onClose, onFilterSelect, selectedFilters = [], onClearAll, restaurants = [], userLocation = null }) {
  // Calculate filter counts from actual restaurant data
  const filterOptions = useMemo(() => {
    if (!Array.isArray(restaurants) || restaurants.length === 0) {
      return CustomerHome;
    }

    return CustomerHome.map(filter => {
      let count = 0;

      switch (filter.name) {
        case "Near Me":
          if (userLocation) {
            count = restaurants.filter(r => {
              if (!r.latitude || !r.longitude) return false;
              const dist = getDistanceFromLatLonInKm(
                userLocation.latitude,
                userLocation.longitude,
                r.latitude,
                r.longitude
              );
              return dist <= 10;
            }).length;
          }
          break;

        case "Only Veg Restaurant":
          count = restaurants.filter(r => r.enableVeg === true && r.enableNonveg === false).length;
          break;

        case "Only Non Veg Restaurant":
          count = restaurants.filter(r => r.enableNonveg === true && r.enableVeg === false).length;
          break;

        case "Only Buffet":
          count = restaurants.filter(r => r.enableBuffet === true).length;
          break;

        case "Only Table Service":
          count = restaurants.filter(r => r.enableTableService === true).length;
          break;

        case "Only Self Service":
          count = restaurants.filter(r => r.enableSelfService === true).length;
          break;

        case "3 Star Hotel":
          count = restaurants.filter(r => r.restaurantType && r.restaurantType.toLowerCase().includes("3 star")).length;
          break;

        case "5 Star Hotel":
          count = restaurants.filter(r => r.restaurantType && r.restaurantType.toLowerCase().includes("5 star")).length;
          break;

        case "5 Star Rating":
          count = restaurants.filter(r => r.rating && r.rating >= 5).length;
          break;

        case "Only Bar & Restaurant":
          count = restaurants.filter(r => r.restaurantType && r.restaurantType.toLowerCase().includes("bar")).length;
          break;

        default:
          count = 0;
      }

      return {
        name: filter.name,
        count: count
      };
    });
  }, [restaurants, userLocation]);

  const isSelected = (option) => selectedFilters.some(f => f.name === option.name);

  const handleFilterOptionPress = (option) => {
    onFilterSelect?.(option);
    // Do not close on each select; close only with Done/back
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* full background click area */}
      <Pressable style={styles.overlayTouch} onPress={onClose} />

      {/* popup */}
      <View style={styles.filterContent}>
        <View style={styles.filterHeaderRow}>
          <Text style={styles.filterTitle}>Filter</Text>
          <Pressable onPress={onClose} style={styles.backButton}>
            <Text style={{ fontWeight: 'bold', color: '#6B4EFF' }}>Done</Text>
          </Pressable>
        </View>
        {selectedFilters.length > 0 && (
          <Pressable
            onPress={() => {
              onClearAll?.();
              onClose?.();
            }}
            style={styles.clearAllTextButton}
            accessibilityLabel="Clear all filters"
          >
            <Text style={{ color: '#6B4EFF', fontWeight: 'bold', fontSize: 14, textAlign: 'right' }}>Clear Filters</Text>
          </Pressable>
        )}
        <ScrollView
          style={styles.filterList}
          showsVerticalScrollIndicator={false}
        >
          {filterOptions.map((option, index) => (
            <Pressable
              key={index}
              style={[styles.filterOption, isSelected(option) && { backgroundColor: '#ded7fa', borderRadius: 8 }]}
              onPress={() => handleFilterOptionPress(option)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.filterOptionText}>
                  {option.name} ({option.count})
                </Text>
                {isSelected(option) && (
                  <MaterialIcons name="check" size={18} color="#6B4EFF" style={{ marginLeft: 8 }} />
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clearAllIconButton: {
    backgroundColor: '#6B4EFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 70,
    backgroundColor: "#BBBAEF",
    borderRadius: 20,
    padding: 20,
    width: "50%",
    height: "40%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    left: 20,
  },
  clearAllTextButton: {
    alignSelf: 'flex-end',
    marginBottom: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  filterHeader: {
    flexDirection: "row",
    padding: 4,
  },
  filterHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  filterHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholder: {
    width: 28,
  },
  filterList: {
    flex: 1,
  },
  filterOption: {
    paddingVertical: 8,
    marginRight: 6,
    paddingHorizontal: 12,
maxHeight: height * 0.4 - 100,
},
  filterOptionText: {
    fontSize: 14,
    color: "#000",
    textAlign: "left",
  },
});
