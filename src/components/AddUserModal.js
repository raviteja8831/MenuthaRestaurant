import React from "react";
import { Modal, View, Pressable, Text, TextInput, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AddUserModal({
  visible,
  onClose,
  form,
  setForm,
  loading,
  onSave
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" }}>
        <View style={{ backgroundColor: "#e3dbff", borderRadius: 24, padding: 24, width: 300, alignItems: "center", alignSelf: "center", marginTop: 80, elevation: 8 }}>
          <Pressable
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 20 }}
            onPress={onClose}
          >
            <MaterialCommunityIcons name="close" size={28} color="#222" />
          </Pressable>
          <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: 16, color: "#6c63b5", textAlign: "center" }}>New Profile</Text>
          {/* Name Row */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: "#222", fontSize: 15, width: 80 }}>Name:</Text>
            <TextInput
              style={{ backgroundColor: "#fff", flex: 1, marginBottom: 0, borderRadius: 6, paddingHorizontal: 10, fontSize: 15, borderWidth: 0, color: "#222" }}
              value={form.name}
              onChangeText={text => setForm({ ...form, name: text })}
              placeholder="Enter name"
              placeholderTextColor="#888"
            />
          </View>
          {/* Password Row */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: "#222", fontSize: 15, width: 80 }}>Password:</Text>
            <TextInput
              style={{ backgroundColor: "#fff", flex: 1, marginBottom: 0, borderRadius: 6, paddingHorizontal: 10, fontSize: 15, borderWidth: 0, color: "#222" }}
              value={form.password}
              onChangeText={text => setForm({ ...form, password: text })}
              placeholder="Enter password"
              placeholderTextColor="#888"
              secureTextEntry
            />
          </View>
          {/* Role Row */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: "#222", fontSize: 15, width: 80 }}>Role:</Text>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <View style={{ backgroundColor: "#fff", borderRadius: 6, height: 40, justifyContent: "center" }}>
                <Pressable
                  style={{ paddingHorizontal: 10, height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                  onPress={() => setForm({ ...form, showRoleDropdown: !form.showRoleDropdown })}
                >
                  <Text style={{ color: "#222", fontSize: 15 }}>{form.role}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#222" />
                </Pressable>
                {form.showRoleDropdown && (
                  <View style={{ backgroundColor: "#fff", borderRadius: 6, position: "absolute", top: 40, left: 0, right: 0, zIndex: 10, elevation: 10 }}>
                    {["Chef", "Manager"].map(role => (
                      <Pressable
                        key={role}
                        style={{ padding: 10 }}
                        onPress={() => setForm({ ...form, role, showRoleDropdown: false })}
                      >
                        <Text style={{ color: "#222", fontSize: 15 }}>{role}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
          {/* Phone Row */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
            <Text style={{ color: "#222", fontSize: 15, width: 80 }}>Phone No:</Text>
            <TextInput
              style={{ backgroundColor: "#fff", flex: 1, marginBottom: 0, borderRadius: 6, paddingHorizontal: 10, fontSize: 15, borderWidth: 0, color: "#222" }}
              value={form.phone}
              onChangeText={text => setForm({ ...form, phone: text })}
              placeholder="Enter phone number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
            />
          </View>
          {/* Save Button */}
          <Pressable
            style={{ backgroundColor: "#bcb3f7", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 28, marginTop: 8, alignItems: "center", width: 80, alignSelf: "flex-start" }}
            onPress={onSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>Save</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
