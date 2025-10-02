import React from "react";
import { Modal, View, Pressable, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProfileModal({ visible, onClose, managerName = "Manager Name", phone = "9660435235" }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" }}>
        <View style={{ backgroundColor: "#ece9fa", borderRadius: 16, padding: 24, width: 300, alignItems: "center" }}>
          <Pressable
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 20 }}
            onPress={onClose}
          >
            <MaterialCommunityIcons name="close" size={28} color="#222" />
          </Pressable>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#d1c4e9", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <MaterialCommunityIcons name="account-circle" size={80} color="#7b6eea" />
          </View>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 4, color: "#6c63b5" }}>{managerName}</Text>
          <Text style={{ fontSize: 14, color: "#333", marginBottom: 16 }}>Ph no: {phone}</Text>
          <Pressable
            style={{ backgroundColor: "#a9a1e2", borderRadius: 8, padding: 10, flexDirection: "row", alignItems: "center", marginTop: 12 }}
            onPress={onClose}
          >
            <MaterialCommunityIcons name="power" size={28} color="#6c63b5" />
            <Text style={{ fontSize: 16, color: "#6c63b5", marginLeft: 8 }}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
