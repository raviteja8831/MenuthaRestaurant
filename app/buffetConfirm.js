import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";

const BuffetConfirm = () => {
  const navigation = useNavigation();

  const params = useLocalSearchParams();
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Your buffet reservation has been confirmed!
      </Text>
      <Pressable
        style={styles.backButton}
        onPress={() =>
          router.push({
            pathname: "/BuffetTime",
            params: {
              hotelName: params.hotelName,
              hotelId: params.hotelId,
              ishotel: params.ishotel,
            },
          })
        }
      >
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  message: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 30,
    color: "#2c3e50",
  },
  backButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default BuffetConfirm;
