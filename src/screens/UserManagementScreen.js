import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Avatar, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { addUserByManager } from "../api/managerApi";
import { showApiError } from "../services/messagingService";

const users = [
  { id: 1, name: "Mohan", role: "Manager" },
  { id: 2, name: "Kiran", role: "Chef" },
  { id: 3, name: "Anil", role: "Chef" },
  { id: 4, name: "Anoop", role: "Chef" },
  { id: 5, name: "Vishal", role: "Chef" },
  { id: 6, name: "Anthony", role: "Chef" },
];

export default function UserManagementScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    password: "",
    role: "",
    phone: "",
  });

  const handleAddUser = async () => {
    try {
      const payload = {
        name: form.name,
        // password: form.password,
        role: form.role,
        phone: form.phone,
      };
      const res = await addUserByManager(payload);
      Alert.alert("Success", res.message || "User added successfully");
      setModalVisible(false);
      setForm({ name: "", password: "", role: "", phone: "" });
      // Optionally refresh user list here
    } catch (err) {
      showApiError(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Users</Text>
      <FlatList
        horizontal
        data={users}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.userList}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Avatar.Icon size={54} icon="account" style={styles.avatar} />
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userRole}>{item.role}</Text>
          </View>
        )}
        ListFooterComponent={
          <Pressable
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={54}
              color="#7b6eea"
            />
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        }
      />
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={form.name}
              onChangeText={(name) => setForm({ ...form, name })}
            />
            {/*  <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={form.password}
              onChangeText={password => setForm({ ...form, password })}
            /> */}
            <TextInput
              style={styles.input}
              placeholder="Role"
              value={form.role}
              onChangeText={(role) => setForm({ ...form, role })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone No"
              keyboardType="phone-pad"
              value={form.phone}
              // onChangeText={(phone) => setForm({ ...form, phone })}
              onChangeText={(value) => {
                const numericValue = value.replace(/\D/g, "");
                // setPhone(numericValue);
                setForm({ ...form, phone: numericValue });
              }}
            />
            <Button
              mode="contained"
              style={styles.saveBtn}
              onPress={handleAddUser}
            >
              Save
            </Button>
          </View>
        </View>
      </Modal>
      {/* ...existing dashboard and user details UI... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#8D8BEA", paddingTop: 0 },
  header: { fontSize: 28, fontWeight: "bold", margin: 16, color: "#fff" },
  userList: { alignItems: "center", paddingHorizontal: 8 },
  userItem: { alignItems: "center", marginHorizontal: 8 },
  avatar: { backgroundColor: "#d1c4e9" },
  userName: { fontWeight: "bold", color: "#333", marginTop: 4 },
  userRole: { color: "#7b6eea", fontSize: 13 },
  addBtn: { alignItems: "center", marginHorizontal: 8 },
  addText: { color: "#7b6eea", fontWeight: "bold", marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: 300,
    alignItems: "center",
  },
  modalTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 16 },
  input: {
    width: "100%",
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#eae6ff",
    padding: 10,
  },
  saveBtn: { marginTop: 8, backgroundColor: "#7b6eea", width: "100%" },
});
