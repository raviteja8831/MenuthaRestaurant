import React, { useEffect, useState } from "react";

import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TabBar from "./TabBarScreen";

import { fetchReviews } from '../services/reviewService';

export default function NotificationsTabScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  // TODO: Replace with actual restaurantId from context or props
  const restaurantId = 1;

  useEffect(() => {
    fetchReviews(restaurantId)
      .then(data => setReviews(data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  return (
    <View style={styles.container}>
  <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.reviewsContainer}>
          <View style={styles.reviewsHeader}>
            <Pressable style={styles.filterIcon}>
              <MaterialCommunityIcons
                name="filter-variant"
                size={24}
                color="#6c63b5"
              />
            </Pressable>
            <Text style={styles.reviewsTitle}>Reviews and Ratings</Text>
          </View>

          {/* Main Star */}
          <View style={styles.mainStarContainer}>
            <MaterialCommunityIcons
              name="star"
              size={80}
              color="#FFD700"
              style={styles.mainStar}
            />
          </View>

          {/* Reviews List */}
          <View style={styles.reviewsList}>
            {loading ? (
              <Text style={{ color: '#222', textAlign: 'center', marginTop: 16 }}>Loading...</Text>
            ) : reviews.length === 0 ? (
              <Text style={{ color: '#222', textAlign: 'center', marginTop: 16 }}>No reviews found.</Text>
            ) : (
              reviews.map((review, index) => (
                <View key={index} style={styles.reviewCard}>
                  {/* Left: Large Star */}
                  <View style={styles.reviewLeft}>
                    <MaterialCommunityIcons
                      name="star"
                      size={36}
                      color="#FFD700"
                      style={styles.cardStar}
                    />
                  </View>
                  {/* Center: Hotel Name & Description */}
                  <View style={styles.reviewContent}>
                    <Text style={styles.reviewHotelName}>{review.restaurant || review.hotelName}</Text>
                    <Text style={styles.reviewDescription} numberOfLines={1} ellipsizeMode="tail">
                      {review.review || review.description}
                    </Text>
                    <View style={styles.reviewFooter}>
                      <View style={styles.reviewStars}>
                        {[...Array(review.rating)].map((_, i) => (
                          <MaterialCommunityIcons
                            key={i}
                            name="star"
                            size={16}
                            color="#FFD700"
                          />
                        ))}
                      </View>
                      <Text style={styles.reviewStatus}>{review.status || (review.rating >= 4 ? 'Excellent' : review.rating === 3 ? 'Good' : 'Average')}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <TabBar></TabBar>
      </View>
  );
}

  const styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#8D8BEA',
          paddingTop: 0,
          paddingBottom: 0,
        },
        reviewsContainer: {
          flex: 1,
          paddingHorizontal: 0,
          paddingTop: 0,
          backgroundColor: 'transparent',
        },
        reviewsHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 32,
          marginBottom: 12,
        },
        filterIcon: {
          position: 'absolute',
          left: 24,
          top: 0,
          padding: 8,
          zIndex: 2,
        },
        reviewsTitle: {
          fontSize: 28,
          fontWeight: 'bold',
          color: '#fff',
          textAlign: 'center',
          textShadowColor: '#888',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        },
        mainStarContainer: {
          alignItems: 'center',
          marginBottom: 12,
        },
        mainStar: {
          textShadowColor: '#888',
          textShadowOffset: { width: 4, height: 6 },
          textShadowRadius: 8,
        },
        reviewsList: {
          width: '100%',
          flex: 1,
        },
        reviewCard: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderRadius: 12,
          marginBottom: 16,
          marginHorizontal: 8,
          paddingVertical: 16,
          paddingHorizontal: 12,
          minHeight: 90,
          shadowColor: '#888',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        },
        reviewLeft: {
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
          width: 48,
        },
        cardStar: {
          textShadowColor: '#888',
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 4,
        },
        reviewContent: {
          flex: 1,
          justifyContent: 'center',
        },
        reviewHotelName: {
          fontSize: 17,
          fontWeight: 'bold',
          color: '#222',
          marginBottom: 2,
        },
        reviewDescription: {
          fontSize: 13,
          color: '#222',
          marginBottom: 4,
          lineHeight: 17,
        },
        reviewFooter: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 2,
        },
        reviewStars: {
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 8,
          marginTop: 2,
        },
        reviewStatus: {
          fontSize: 14,
          color: '#222',
          fontWeight: 'bold',
          marginLeft: 'auto',
        },
      });
