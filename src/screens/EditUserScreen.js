
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Modal, ScrollView, SafeAreaView } from 'react-native';
import { useAlert } from '../services/alertService';
import { FormInput, useFormValidation } from '../components/formHelper';
import { Surface } from 'react-native-paper';

export default function EditUserScreen({ user, onSave, onClose, visible }) {
  const alert = useAlert();

  // Form validation function
  const validateForm = (values) => {
    const errors = {};
    if (!values.firstname?.trim()) errors.firstname = "First name is required";
    if (!values.lastname?.trim()) errors.lastname = "Last name is required";
    if (!values.phone?.trim()) errors.phone = "Phone number is required";
    if (values.phone && !/^\d{10}$/.test(values.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = "Phone number must be 10 digits";
    }
    if (!values.role?.toString()) errors.role = "Role is required";
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
    phone: "",
    password: "",
    role: "",
  }, validateForm);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      let roleValue = '';
      // Accept both role_id (number) and role (string/number)
      if (user.role_id) {
        roleValue = user.role_id.toString();
      } else if (user.role && (user.role === 1 || user.role === 2)) {
        roleValue = user.role.toString();
      } else if (user.role && typeof user.role === 'string') {
        roleValue = user.role === 'Manager' ? '1' : user.role === 'Chef' ? '2' : '';
      }

      setForm({
        firstname: user.firstname || user.name?.split(' ')[0] || '',
        lastname: user.lastname || user.name?.split(' ')[1] || '',
        phone: user.phone || '',
        password: '',
        role: roleValue,
      });
    }
  }, [user, setForm]);

  const roleOptions = [
    { label: 'Chef', value: '2' },
    { label: 'Manager', value: '1' },
  ];

  const handleSave = async () => {
    // Validate form before saving
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      alert.error('Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: user.id,
        firstname: form.firstname,
        lastname: form.lastname,
        phone: form.phone,
        password: form.password || undefined,
        role_id: parseInt(form.role)
      });
      alert.success('User updated successfully!');
    } catch (err) {
      alert.error(err.message || 'Failed to update user');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.overlay}>
      <View style={styles.modalContainer}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Surface style={styles.form}>
            <Text style={styles.title}>Edit Profile</Text>

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

            <FormInput
              label="New Password (optional)"
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

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </Surface>
        </ScrollView>
      </View>
    </SafeAreaView>
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
    padding: 24,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
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
    backgroundColor: '#ccc',
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