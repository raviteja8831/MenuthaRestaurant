import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getHeading } from '../constants/headings';
import { showApiError } from '../services/messagingService';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchReviews } from '../api/reviewsApi';

export default function RatingsScreen() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const getReviews = async () => {
      try {
        const data = await fetchReviews();
        setReviews(data.reviews || []);
      } catch (error) {
        showApiError(error);
      }
    };
    getReviews();
  }, []);

  return (
    <>
      <Header title={getHeading('RatingsScreen')} />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="filter-variant" size={28} color="#6c63b5" style={{marginLeft: 10}} />
          <Text style={styles.header}>Reviews and Ratings</Text>
        </View>
        <View style={styles.starBox}>
          <MaterialCommunityIcons name="star" size={120} color="#ffd700" />
        </View>
        <ScrollView style={styles.scroll}>
          {reviews.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.cardLeft}>
                <MaterialCommunityIcons name="star" size={32} color="#ffd700" />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.hotelName}>{r.name}</Text>
                <Text style={styles.reviewComment}>{r.comment}</Text>
                <View style={styles.ratingRow}>
                  {[...Array(r.rating)].map((_, idx) => (
                    <MaterialCommunityIcons key={idx} name="star" size={20} color="#ffd700" />
                  ))}
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.status}>{r.status}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.bottomNav}>
          <MaterialCommunityIcons name="home" size={36} color="#6c63b5" />
          <MaterialCommunityIcons name="account" size={36} color="#6c63b5" />
          <MaterialCommunityIcons name="star" size={36} color="#6c63b5" />
          <MaterialCommunityIcons name="bell" size={36} color="#6c63b5" />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a9a1e2', paddingTop: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
  starBox: { alignItems: 'center', marginBottom: 10 },
  scroll: { flex: 1 },
  reviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ece9fa', borderRadius: 12, marginHorizontal: 12, marginVertical: 6, padding: 12 },
  cardLeft: { marginRight: 10 },
  cardBody: { flex: 1 },
  hotelName: { fontWeight: 'bold', fontSize: 16, color: '#6c63b5' },
  ratingRow: { flexDirection: 'row', marginTop: 2 },
  cardRight: { marginLeft: 10 },
  status: { color: '#6c63b5', fontWeight: 'bold', fontSize: 13 },
  reviewComment: { color: '#333', fontSize: 13, marginVertical: 2 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#a9a1e2', padding: 10, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8, marginTop: 8 },
});
