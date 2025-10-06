import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useUserData } from "../services/getUserData";
import { getUserProfile } from "../api/profileApi";
import { AlertService } from "../services/alert.service";

const { width, height } = Dimensions.get("window");

export default function CustomerProfileViewScreen() {
  const router = useRouter();
  const { userId, error } = useUserData();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile(userId);
      setUserData(response.data.user || {});
    } catch (error) {
      console.error("Error fetching profile:", error);
      AlertService.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error loading user data. Please try again.</Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={['#C4B5FD', '#A78BFA']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color="#000" />
          </Pressable>

          <Pressable style={styles.translateButton}>
            <MaterialCommunityIcons name="translate" size={28} color="#000" />
          </Pressable>
        </View>

        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          {userData.profileImage ? (
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <MaterialCommunityIcons name="account-circle" size={120} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Profile Information */}
        <View style={styles.profileInfo}>
          <Text style={styles.infoText}>
            First Name: {userData.firstName || 'Praveen'}
          </Text>

          <Text style={styles.infoText}>
            Last Name: {userData.lastName || 'Jadhav'}
          </Text>

          <Text style={styles.infoText}>
            Phone Number: {userData.phoneNumber || '9660845632'}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  translateButton: {
    padding: 8,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E5E7EB',
  },
  profileImagePlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  infoRow: {
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});