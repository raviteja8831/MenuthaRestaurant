import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

export default function SearchModal({ visible, onClose, onSearch }) {
  const [searchText, setSearchText] = useState("");
  const [modalHeight, setModalHeight] = useState(200); // Initial height

  const [recentSearches] = useState([
    "Pizza near me",
    "Italian restaurants",
    "Coffee shops",
    "Fast food",
    "Vegetarian restaurants",
  ]);

  const [popularSearches] = useState([
    "McDonald's",
    "Starbucks",
    "KFC",
    "Domino's",
    "Subway",
    "Burger King",
  ]);

  // Calculate dynamic height based on content
  const calculateModalHeight = () => {
    const baseHeight = 120; // Header + input container height
    const itemHeight = 50; // Height per search item
    const maxHeight = height / 2; // Maximum height (half screen)

    let contentHeight = 0;

    if (searchText.length === 0) {
      // Show recent + popular searches
      contentHeight =
        (recentSearches.length + popularSearches.length + 2) * itemHeight; // +2 for section titles
    } else {
      // Show search results
      contentHeight = 2 * itemHeight; // 1 result + 1 section title
    }

    const totalHeight = baseHeight + contentHeight;
    return Math.min(totalHeight, maxHeight);
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      onSearch?.(searchText);
      onClose();
    }
  };

  const handleRecentSearchPress = (search) => {
    setSearchText(search);
    onSearch?.(search);
    onClose();
  };

  const handleSearchTextChange = (text) => {
    setSearchText(text);
    // Update modal height when search text changes
    const newHeight = calculateModalHeight();
    setModalHeight(newHeight);
  };

  // Initialize modal height when component mounts
  useEffect(() => {
    if (visible) {
      const initialHeight = calculateModalHeight();
      setModalHeight(initialHeight);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* Background overlay */}
      <Pressable style={styles.overlayTouch} onPress={onClose} />

      {/* Search Modal */}
      <View style={[styles.searchContent, { height: modalHeight }]}>
        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, food, or location"
            value={searchText}
            onChangeText={handleSearchTextChange}
            onSubmitEditing={handleSearch}
            autoFocus={true}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => handleSearchTextChange("")}>
              <MaterialIcons name="clear" size={20} color="#666" />
            </Pressable>
          )}
        </View>

        <ScrollView
          style={styles.searchResults}
          showsVerticalScrollIndicator={false}
        >
          {/* Recent Searches */}
          {/*  {searchText.length === 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {recentSearches.map((search, index) => (
                <Pressable
                  key={index}
                  style={styles.searchItem}
                  onPress={() => handleRecentSearchPress(search)}
                >
                  <MaterialIcons name="history" size={20} color="#666" />
                  <Text style={styles.searchItemText}>{search}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {searchText.length === 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular</Text>
              {popularSearches.map((search, index) => (
                <Pressable
                  key={index}
                  style={styles.searchItem}
                  onPress={() => handleRecentSearchPress(search)}
                >
                  <MaterialIcons name="trending-up" size={20} color="#666" />
                  <Text style={styles.searchItemText}>{search}</Text>
                </Pressable>
              ))}
            </View>
          )} */}

          {/* Search Results */}
          {searchText.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <Pressable
                style={styles.searchItem}
                onPress={handleSearch}
              >
                <MaterialIcons name="search" size={20} color="#666" />
                <Text style={styles.searchItemText}>
                  Search for "{searchText}"
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 3,
  },
  overlayTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchContent: {
    marginTop: 50,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    minHeight: 200,
    maxHeight: height / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  placeholder: {
    width: 32,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  searchResults: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  searchItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
});
