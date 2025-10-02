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
      icon: "book-outline",
      label: "Menu",
      route: "/menu-list",
    },
    {
      icon: "restaurant-outline",
      label: "Booking table\n(3 TA)",
      route: "/tableDining",
    },
    {
      icon: "time-outline",
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
      router.push({
        pathname: option.route,
        params: {
          // hotelName: hotelData.name,
          hotelId: hotelData.id,
          ishotel: true,
          // isbuffet: hotelData.enableBuffet,
        },
      });
    } else if (option.label.includes("Booking")) {
      Alert.alert("Booking", "Table booking feature coming soon!");
    }
  };
  return (
    <SafeAreaView style={hoteldetailsstyles.container}>
      <ScrollView>
        {/* Header Image */}
        {hotelData?.ambianceImage ? (
          <Image
            source={{ uri: `${IMG_BASE_URL}${hotelData?.ambianceImage}` }}
            style={hoteldetailsstyles.headerImage}
            defaultSource={require("../src/assets/images/logo.png")}
          />
        ) : (
          <View
            style={[hoteldetailsstyles.placeholderImage, { marginBottom: 50 }]}
          />
        )}

        {/* Header Top: Back arrow + floating icons */}
        <View
          style={[
            hoteldetailsstyles.headerTop,
            // { position: "absolute", top: 0, left: 0, right: 0, zIndex: 1 },
          ]}
        >
          <Pressable
            style={hoteldetailsstyles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="chevron-back" size={34} color="black" />
          </Pressable>
          <View style={hoteldetailsstyles.topIcons}>
            <Pressable style={hoteldetailsstyles.iconCircle}>
              <Ionicons name="heart-outline" size={24} color="black" />
            </Pressable>
            <Pressable style={hoteldetailsstyles.iconCircle}>
              <Ionicons name="share-social-outline" size={24} color="black" />
            </Pressable>
          </View>
        </View>

        {/* Hotel Info */}
        <View style={hoteldetailsstyles.card}>
          <Text style={hoteldetailsstyles.hotelName}>
            {hotelData?.name} ({hotelData?.starRating} Star Hotel)
          </Text>
          <Text style={hoteldetailsstyles.address}>{hotelData?.address}</Text>

          {/* Options */}
          <View style={hoteldetailsstyles.optionsRow}>
            {options?.map((opt, i) => (
              <Pressable
                key={i}
                style={hoteldetailsstyles.option}
                onPress={() => handleOptionPress(opt)}
              >
                <Ionicons name={opt.icon} size={28} color="black" />
                <Text style={hoteldetailsstyles.optionText}>{opt.label}</Text>
              </Pressable>
            )) || []}
          </View>

          {/* Hotel Star Rating */}
          <View style={hoteldetailsstyles.ratingRow}>
            {[...Array(hotelData?.starRating)].map((_, i) => (
              <FontAwesome key={i} name="star" size={28} color="#FFD700" />
            ))}
          </View>
        </View>

        <View style={hoteldetailsstyles.borderContainer}></View>

        {/* Reviews */}
        {hotelData?.restaurantReviews?.map((review, index) => (
          <View key={index} style={hoteldetailsstyles.reviewCard}>
            <View style={hoteldetailsstyles.reviewHeader}>
              <Ionicons name="person-circle" size={22} color="black" />
              <View style={hoteldetailsstyles.reviewStars}>
                {[...Array(review.rating || 0)].map((_, i) => (
                  <FontAwesome key={i} name="star" size={14} color="#FFD700" />
                ))}
              </View>
              {/* <Text style={hoteldetailsstyles.reviewText}>{review.review}</Text> */}
              {/*  <Text style={hoteldetailsstyles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text> */}
            </View>
            {review.review && (
              <View /* style={hoteldetailsstyles.reviewContent} */>
                <Text style={hoteldetailsstyles.reviewText}>
                  {review.review}
                </Text>
                <Text style={hoteldetailsstyles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
            {/*   {review.review && (
              <View style={hoteldetailsstyles.reviewContent}>
                <Text style={hoteldetailsstyles.reviewText}>
                  {review.review}
                </Text>
                <Text style={hoteldetailsstyles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )} */}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HotelDetails;
