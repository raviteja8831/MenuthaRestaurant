
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

// Same mock data as MapScreen
const mockRestaurants = [
  {
    id: 1,
    name: "Spicy Bites",
    desc: "A spicy treat for your taste buds. Famous for Indian and Asian cuisine.",
    menu: ["Tomato Soup", "Roti Manchurian", "Rice Platter", "Curd Rice", "Desserts"],
    address: "123 Main Street, City",
    rating: 5,
  },
  {
    id: 2,
    name: "Green Garden",
    desc: "Fresh and healthy vegetarian options in a garden setting.",
    menu: ["Green Salad", "Paneer Tikka", "Veg Biryani", "Fruit Bowl"],
    address: "456 Park Avenue, City",
    rating: 4,
  },
  {
    id: 3,
    name: "Urban Grill",
    desc: "Modern grill house with the best BBQ in town.",
    menu: ["BBQ Chicken", "Grilled Veggies", "Steak", "Ice Cream"],
    address: "789 Downtown Road, City",
    rating: 4.5,
  },
];

export default function RestaurantDetailScreen() {
  const route = useRoute();
  const { id } = route.params || {};
  const restaurant = mockRestaurants.find(r => r.id === id) || mockRestaurants[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageBanner} />
      <View style={styles.infoSection}>
        <Text style={styles.title}>{restaurant.name}</Text>
        <Text style={styles.desc}>{restaurant.desc}</Text>
        <Text style={styles.rating}>{'⭐'.repeat(Math.round(restaurant.rating))}</Text>
        <Text style={styles.sectionTitle}>Menu</Text>
        <Text>{restaurant.menu.map(item => `- ${item}`).join('\n')}</Text>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text>{restaurant.address}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b6a6e7' },
  imageBanner: {
    height: 180,
    backgroundColor: '#a18cd1',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  infoSection: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  desc: { color: '#333', marginBottom: 10 },
  rating: { fontSize: 20, marginBottom: 10 },
  sectionTitle: { fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
});
