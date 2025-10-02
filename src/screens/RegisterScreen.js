import React from "react";
import { StyleSheet } from "react-native";
import { Button, Title, useTheme, Surface } from "react-native-paper";
import { router } from "expo-router";

export default function RegisterScreen() {
  const theme = useTheme();

  const handleCustomerRegister = () => {
    router.push("/customer-register");
  };

  const handleManagerRegister = () => {
    router.push("/manager-register");
  };

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Title style={styles.title}>Register As</Title>
      <Button
        mode="contained"
        style={styles.button}
        labelStyle={styles.buttonText}
        onPress={handleCustomerRegister}
      >
        Customer
      </Button>
      <Button
        mode="contained"
        style={styles.button}
        labelStyle={styles.buttonText}
        onPress={handleManagerRegister}
      >
        Manager
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    letterSpacing: 2,
    textAlign: "center",
  },
  button: {
    borderRadius: 8,
    marginTop: 20,
    width: 220,
    alignSelf: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 18,
  },
});
