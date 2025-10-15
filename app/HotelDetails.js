import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { AlertService } from "../src/services/alert.service";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getRestaurantById } from "../src/api/restaurantApi";
import { IMG_BASE_URL } from "../src/constants/api.constants";
import { getUserProfile } from "../src/services/authService";
import { addFavorite, removeFavorite, checkFavorite } from "../src/api/favoritesApi";

const { width } = Dimensions.get('window');

const HotelDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [hotelData, setHotelData] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  const handleBackPress = () => {
    router.push({ pathname: "/customer-home" });
  };

  // Mock reviews data to match screenshot
  const mockReviews = [
    {
      rating: 5,
      text: "One of the best Restaurant in Bangalore Highly Recommanded"
    },
    {
      rating: 5,
      text: "If you want to try Biriyani this the Best Place in Bangalore"
    },
    {
      rating: 4,
      text: "Best ambiance to chill out with friends and Family. And Food is Great."
    }
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get user profile
        const profile = await getUserProfile();
        setUserProfile(profile);

        if (params.id) {
          // Fetch restaurant data
          const data = await getRestaurantById(params.id);
          console.log("Fetched restaurant data:", data);
          setHotelData(data);

          // Check if restaurant is in favorites
          if (profile && profile.id) {
            try {
              const favoriteStatus = await checkFavorite(profile.id, params.id);
              setIsFavorite(favoriteStatus.isFavorite);
            } catch (error) {
              console.error("Error checking favorite status:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
        AlertService.error("Failed to load restaurant details", "Error");
      }
    };

    fetchInitialData();
  }, [params.id]);

  const handleFavoritePress = async () => {
    if (!userProfile || !userProfile.id || !hotelData || !hotelData.id) {
      AlertService.info("Please wait while data is loading", "Please wait");
      return;
    }

    if (isLoadingFavorite) return;

    setIsLoadingFavorite(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        await removeFavorite({
          userId: userProfile.id,
          restaurantId: hotelData.id,
        });
        setIsFavorite(false);
        AlertService.success("Removed from favorites", "Success");
      } else {
        // Add to favorites
        await addFavorite({
          userId: userProfile.id,
          restaurantId: hotelData.id,
        });
        setIsFavorite(true);
        AlertService.success("Added to favorites", "Success");
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      AlertService.error("Failed to update favorites", "Error");
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleOptionPress = (optionType) => {
    if (!hotelData || !hotelData.id) {
      AlertService.info("Hotel data is still loading. Try again in a moment.", "Please wait");
      return;
    }

    switch (optionType) {
      case 'menu':
        router.push({
          pathname: "/menu-list",
          params: {
            hotelId: String(hotelData.id),
            ishotel: "true",
            hotelName: hotelData.name,
          },
        });
        break;
      case 'booking':
        router.push({
          pathname: "/tableDining",
          params: {
            hotelId: String(hotelData.id),
            ishotel: "true",
            hotelName: hotelData.name,
          },
        });
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              hotelData?.ambianceImage
                ? { uri: `${IMG_BASE_URL}${hotelData.ambianceImage}` }
                : require("../src/assets/images/logo.png")
            }
            style={styles.headerImage}
          />

          {/* Back button */}
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </Pressable>

          {/* Heart icon */}
          <Pressable
            style={[styles.heartButton, isLoadingFavorite && { opacity: 0.6 }]}
            onPress={handleFavoritePress}
            disabled={isLoadingFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#FF0000" : "#000"}
            />
          </Pressable>
        </View>

        {/* Hotel Info */}
        <View style={styles.hotelInfoContainer}>
          <Text style={styles.hotelName}>
            {hotelData?.name || "Hotel sai"} ({hotelData?.starRating || "3"} star Hotel)
          </Text>
          <Text style={styles.address}>
            {hotelData?.address || "No 45 Brigade Plaza First floor Near VRL Bus Stand Opp Movieland cinema hall Bangalore 560088"}
          </Text>

          {/* Options Row */}
          <View style={styles.optionsContainer}>
            <Pressable style={styles.optionItem} onPress={() => handleOptionPress('menu')}>
              <MaterialIcons name="restaurant-menu" size={32} color="#4CAF50" />
              <Text style={styles.optionLabel}>Menu</Text>
            </Pressable>

            <Pressable style={styles.optionItem} onPress={() => handleOptionPress('booking')}>
              <MaterialIcons name="event-seat" size={32} color="#2196F3" />
              <Text style={styles.optionLabel}>Booking table</Text>
              <Text style={styles.optionSubLabel}>(3 TA)</Text>
            </Pressable>

            <View style={styles.optionItem}>
              <MaterialIcons name="access-time" size={32} color="#FF9800" />
              <Text style={styles.optionLabel}>Avg Waiting time</Text>
              <Text style={styles.optionSubLabel}>15Min</Text>
            </View>
          </View>

          {/* Star Rating */}
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesome
                key={star}
                name="star"
                size={32}
                color="#FFD700"
                style={styles.star}
              />
            ))}
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsContainer}>
          {mockReviews.map((review, index) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <MaterialIcons name="person" size={20} color="#000" />
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesome
                      key={star}
                      name={star <= review.rating ? "star" : "star-o"}
                      size={14}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}

          {/* Empty review cards to match screenshot */}
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={`empty-${item}`} style={styles.emptyReviewCard} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BBBAEF',
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  heartButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  hotelInfoContainer: {
    padding: 20,
    backgroundColor: '#BBBAEF',
  },
  hotelName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'left',
  },
  address: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  optionItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 10,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
    textAlign: 'center',
  },
  optionSubLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 2,
  },
  reviewsContainer: {
    paddingHorizontal: 0,
  },
  reviewCard: {
    backgroundColor: '#B9B6F6', // Light purple background matching screenshot
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewStars: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  reviewText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 18,
  },
  emptyReviewCard: {
    backgroundColor: '#B9B6F6', // Light purple background
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    height: 60,
    marginBottom: 0,
  },
});

export default HotelDetails;
