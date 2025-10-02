
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Image, ScrollView, SafeAreaView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../api/imageApi';
import { FormInput, useFormValidation } from '../components/formHelper';
import { useAlert } from '../services/alertService';

export default function AddUserScreen({ navigation, onSave, onClose, visible }) {
  const alert = useAlert();
  const [userImage, setUserImage] = useState(null);
  const [userImageUrl, setUserImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form validation function
  const validateForm = (values) => {
    const errors = {};
    if (!values.firstname?.trim()) errors.firstname = "First name is required";
    if (!values.lastname?.trim()) errors.lastname = "Last name is required";
    if (!values.password?.trim()) errors.password = "Password is required";
    if (values.password && values.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!values.role?.trim()) errors.role = "Role is required";
    if (!values.phone?.trim()) errors.phone = "Phone number is required";
    if (values.phone && !/^\d{10}$/.test(values.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = "Phone number must be 10 digits";
    }
    return errors;
  };

  // Use form validation hook
  const {
    values: form,
    setValues: setForm,
    errors,
    touched,
    handleChange,
    handleBlur,
  } = useFormValidation({
    firstname: "",
    lastname: "",
    password: "",
    role: "",
    phone: "",
  }, validateForm);

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
    // Validate form
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      alert.error('Please fill in all required fields correctly.');
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
        alert.error(err.message || 'Failed to upload image');
        setUploadingImage(false);
        setLoading(false);
        return;
      }
      setUploadingImage(false);
    }

    try {
      await onSave({ ...form, userImage: imageUrl });
      // Reset form after successful save
      setForm({
        firstname: "",
        lastname: "",
        password: "",
        role: "",
        phone: "",
      });
      setUserImage(null);
      setUserImageUrl('');
      alert.success('User added successfully!');
    } catch (err) {
      alert.error(err.message || 'Failed to add user');
    }
    setLoading(false);
  };

  // Save button is enabled only if all required fields are filled and not loading
  const isSaveDisabled = Object.keys(validateForm(form)).length > 0 || loading;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.form}>
            <Text style={styles.title}>Add Profile</Text>

            {/* User Image Upload */}
            <Pressable
              style={styles.imageUploadContainer}
              onPress={handlePickImage}
              disabled={uploadingImage || loading}
            >
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>+</Text>
                </View>
              )}
              <Text style={styles.uploadText}>Upload Photo</Text>
            </Pressable>

            <FormInput
              label="First Name *"
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.firstname}
              touched={touched.firstname}
              type="text"
            />

            <FormInput
              label="Last Name *"
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.lastname}
              touched={touched.lastname}
              type="text"
            />

            <FormInput
              label="Password *"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
              type="password"
            />

            <FormInput
              label="Role *"
              name="role"
              value={form.role}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.role}
              touched={touched.role}
              type="select"
              options={roleOptions}
              placeholder="Select Role"
            />

            <FormInput
              label="Phone Number *"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              touched={touched.phone}
              type="text"
              keyboardType="phone-pad"
            />

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton, isSaveDisabled && styles.disabledButton]}
                onPress={handleSave}
                disabled={isSaveDisabled}
              >
                {loading || uploadingImage ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </Pressable>
            </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  scrollView: {
    maxHeight: '90%',
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  form: {
    backgroundColor: '#8D8BEA',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  imageUploadContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadedImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: '#8D8BEA',
    fontSize: 32,
    fontWeight: 'bold',
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#6c6cf2',

  },
  saveButton: {
    backgroundColor: '#6c6cf2',
  },
  disabledButton: {
    backgroundColor: '#aaa',
    borderColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cancelButtonText: {
    color: '#fff',
  },
});
