import React from "react";
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

export default function FilterModal({ visible, onClose, onFilterSelect, selectedFilters = [], onClearAll }) {
  const filterOptions = CustomerHome;

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
