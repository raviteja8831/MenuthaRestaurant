import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
// import Tooltip from "react-native-walkthrough-tooltip";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { hotelDetailsData } from "../src/Mock/CustomerHome";
import { hoteldetailsstyles, responsiveStyles } from "../src/styles/responsive";
import { useEffect } from "react";
import { getRestaurantById } from "../src/api/restaurantApi";
import { IMG_BASE_URL } from "../src/constants/api.constants";

const HotelDetails = () => {
  const router = useRouter();
  const [tooltipVisible, setTooltipVisible] = useState(-1);
  const params = useLocalSearchParams();
  const [hotelData, setHotelData] = useState(null);
  const handleBackPress = () => {
    router.push({ pathname: "/customer-home" });
  };
  const options = [
    {
      image: require("../src/assets/images/hotel-menu.png"),
      label: "Menu",
      route: "/menu-list",
    },
    {
      image: require("../src/assets/images/book-table.png"),
      label: "Booking table\n(3 TA)",
      route: "/tableDining",
    },
    {
      image: require("../src/assets/images/wait.png"),
      label: "Avg Waiting time.\n15Min",
    },
  ];
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        if (params.id) {
          const data = await getRestaurantById(params.id);
          console.log("Fetched restaurant data:", data);
          setHotelData(data);
        }
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
        Alert.alert("Error", "Failed to load restaurant details");
      }
    };

    fetchRestaurantData();
  }, [params.id]);

  // Using the first hotel from mock data
  // const hotelData = hotelDetailsData[0];

  const handleOptionPress = (option) => {
    if (option.route) {
      // Only navigate if hotelData is loaded and has an id
      if (!hotelData || !hotelData.id) {
        Alert.alert("Please wait", "Hotel data is still loading. Try again in a moment.");
        return;
      }
      router.push({
        pathname: option.route,
        params: {
          hotelId: String(hotelData.id),
          ishotel: "true",
          hotelName: hotelData.name,
          // isbuffet: hotelData.enableBuffet,
        },
      });
    } 
  };
  return (
    <SafeAreaView style={[hoteldetailsstyles.container, { backgroundColor: '#b9b6f6' }]}> 
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header Image with overlay icons */}
        <View style={{ position: 'relative' }}>
          {hotelData?.ambianceImage ? (
            <Image
              source={{ uri: `${IMG_BASE_URL}/assets/images/1759388758320-8ff69799-ba0e-4034-995e-41a029364440.jpeg` }}
              style={[hoteldetailsstyles.headerImage, { borderTopLeftRadius: 40, borderTopRightRadius: 40 }]}
              defaultSource={require("../src/assets/images/logo.png")}
            />
          ) : (
            <View style={[hoteldetailsstyles.placeholderImage, { marginBottom: 50 }]} />
          )}
          {/* Back button and share/fav icons on image */}
          <Pressable
            style={{ position: 'absolute', top: 18, left: 18, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: 4 }}
            onPress={handleBackPress}
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </Pressable>
          <View style={{ position: 'absolute', top: 18, right: 18, flexDirection: 'row', zIndex: 2, gap: 12 }}>
            <Pressable style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: 6, marginRight: 8 }}>
              <Ionicons name="heart-outline" size={22} color="black" />
            </Pressable>
            <Pressable style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: 6 }}>
              <Ionicons name="share-social-outline" size={22} color="black" />
            </Pressable>
          </View>
        </View>

        {/* Hotel Info Card */}
        <View style={[hoteldetailsstyles.card, { backgroundColor: 'transparent', marginTop: 0, paddingTop: 18, paddingBottom: 8 }]}> 
          <Text style={[hoteldetailsstyles.hotelName, { fontSize: 28, marginBottom: 6 }]}>
            {hotelData?.name} ({hotelData?.starRating} star Hotel)
          </Text>
          <Text style={[hoteldetailsstyles.address, { fontSize: 15, marginBottom: 12 }]}>{hotelData?.address}</Text>
          {/* Options */}
          <View style={[hoteldetailsstyles.optionsRow, { marginVertical: 10, gap: 10 }]}> 
            {options?.map((opt, i) => (
              <Pressable
                key={i}
                style={[hoteldetailsstyles.option, { minWidth: 80, alignItems: 'center', gap: 2 }]}
                onPress={() => handleOptionPress(opt)}
              >
                <Image
                  source={opt.image}
                  style={{ width: 44, height: 44, marginBottom: 2, resizeMode: 'contain' }}
                />
                <Text style={[hoteldetailsstyles.optionText, { fontSize: 13, color: '#222' }]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
          {/* Hotel Star Rating */}
          <View style={[hoteldetailsstyles.ratingRow, { marginVertical: 10, gap: 2 }]}> 
            {[...Array(hotelData?.starRating)].map((_, i) => (
              <FontAwesome key={i} name="star" size={32} color="#FFD700" style={{ marginHorizontal: 1 }} />
            ))}
          </View>
        </View>

        <View style={[hoteldetailsstyles.borderContainer, { marginVertical: 8 }]}></View>

        {/* Reviews */}
        {hotelData?.restaurantReviews?.map((review, index) => (
          <View key={index} style={[hoteldetailsstyles.reviewCard, { backgroundColor: '#b9b6f6', borderRadius: 0, borderWidth: 1, borderColor: 'black', marginBottom: 0, marginHorizontal: 0, paddingVertical: 12, paddingHorizontal: 10 }]}> 
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="person-circle" size={22} color="black" />
              <View style={{ flexDirection: 'row', marginLeft: 8, gap: 2 }}>
                {[...Array(review.rating || 0)].map((_, i) => (
                  <FontAwesome key={i} name="star" size={16} color="#FFD700" />
                ))}
              </View>
            </View>
            {review.review && (
              <View>
                <Text style={{ fontSize: 15, color: '#222', lineHeight: 20, marginBottom: 2 }}>{review.review}</Text>
                {/* <Text style={hoteldetailsstyles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text> */}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HotelDetails;
