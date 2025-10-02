
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../api/imageApi';

export default function AddUserScreen({ navigation, onSave, onClose }) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [userImage, setUserImage] = useState(null);
  const [userImageUrl, setUserImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roleOptions = [
    { label: 'Chef', value: 'Chef' },
    { label: 'Manager', value: 'Manager' },
  ];

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUserImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!firstname || !password || !role || !phone) {
      Alert.alert('Validation', 'All fields except Last Name are required.');
      return;
    }
    setLoading(true);
    let imageUrl = userImageUrl;
    if (userImage && !userImageUrl) {
      setUploadingImage(true);
      try {
        const filename = userImage.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const typeMime = match ? `image/${match[1]}` : `image/jpeg`;
        const fileObj = {
          uri: userImage,
          name: filename,
          type: typeMime,
        };
        const data = await uploadImage(fileObj);
        imageUrl = data.url;
        setUserImageUrl(imageUrl);
      } catch (err) {
        Alert.alert('Image Upload Error', err.message || 'Failed to upload image');
        setUploadingImage(false);
        setLoading(false);
        return;
      }
      setUploadingImage(false);
    }
    try {
      await onSave({ firstname, lastname, password, role, phone, userImage: imageUrl });
      Alert.alert('Success', 'User added successfully!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add user');
    }
    setLoading(false);
  };

  // Save button is enabled only if all fields except lastname are filled and not loading
  const isSaveDisabled = !firstname || !password || !role || !phone || loading;

  return (
    <View style={styles.overlay}>
      <View style={styles.form}>
        <Text style={styles.title}>Add Profile</Text>
        {/* User Image Upload */}
        <Pressable
          style={{ alignItems: 'center', marginBottom: 16 }}
          onPress={handlePickImage}
          disabled={uploadingImage || loading}
        >
          {userImage ? (
            <Image source={{ uri: userImage }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 6 }} />
          ) : (
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              <Text style={{ color: '#888', fontSize: 32 }}>+</Text>
            </View>
          )}
          <Text style={{ color: '#7b6eea', fontWeight: 'bold' }}>Upload Photo</Text>
        </Pressable>
        <TextInput style={styles.input} placeholder="First Name" value={firstname} onChangeText={setFirstname} />
        <TextInput style={styles.input} placeholder="Last Name" value={lastname} onChangeText={setLastname} />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {/* Role Dropdown */}
        <View style={{ width: '100%', marginBottom: 15 }}>
          <Pressable
            style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderColor: '#e0e0e0' }]}
            onPress={() => setShowRoleDropdown(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={{ color: role ? '#222' : '#888', fontSize: 16 }}>
              {role || 'Select Role'}
            </Text>
            <Text style={{ color: '#888', fontSize: 18 }}>{showRoleDropdown ? '\u25B2' : '\u25BC'}</Text>
          </Pressable>
          {showRoleDropdown && (
            <View style={styles.dropdown}>
              {roleOptions.map(opt => (
                <Pressable
                  key={opt.value}
                  style={[styles.dropdownItem, role === opt.value && { backgroundColor: '#b7a7e9' }]}
                  onPress={() => { setRole(opt.value); setShowRoleDropdown(false); }}
                >
                  <Text style={[styles.dropdownItemText, role === opt.value && { color: '#fff', fontWeight: 'bold' }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
        <TextInput style={styles.input} placeholder="Phone No." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <Pressable style={[styles.button, { backgroundColor: '#aaa' }]} onPress={onClose} disabled={loading}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.button, isSaveDisabled && { backgroundColor: '#aaa' }]}
            onPress={handleSave}
            disabled={isSaveDisabled}
          >
            {loading || uploadingImage ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor:'#DAD6FE'
,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#DAD6FE',
    borderRadius: 20,
    padding: 30,
    width: 300,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: {
    width: '100%',
    height: 44,
    borderRadius: 8,
    marginBottom: 18,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    fontSize: 16,
    color: '#222',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#7b6eea',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Dropdown styles for Material look
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    color: '#222',
    fontSize: 16,
  },
});
