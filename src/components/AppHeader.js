import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";
import { useAlert } from "../services/alertService";

export default function AppHeader({
  title = "Menutha",
  showLogo = true,
  rightMenu = null,
}) {
  const alert = useAlert();
  return (
    <View style={styles.headerContainer}>
      {/* {showLogo && (
        <Image source={require('./assets/images/icon.png')} style={styles.logo} />
      )} */}
      {/* <Text style={styles.headerTitle}>{title}</Text> */}
      {/* {rightMenu} */}
      {/* Snackbar for alerts */}
      {/* The Snackbar is rendered by AlertProvider globally, so no need to duplicate here */}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#8D8BEA",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingTop: 40,
    paddingBottom: 10,
    position: "relative",
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 10,
    resizeMode: "contain",
  },
  headerTitle: {
    fontFamily: "monospace", // Replace with your custom font if needed
    fontSize: 32,
    fontWeight: "bold",
    color: "#4b3c6e",
    letterSpacing: 2,
    flex: 1,
    textAlign: "center",
  },
});
